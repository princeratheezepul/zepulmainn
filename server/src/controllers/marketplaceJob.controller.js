/**
 * The ProRecruiter marketplace.
 *
 * A Zepul manager publishes an ordinary job to the marketplace; every
 * ProRecruiter sees it and can pick it up. Picking does not transfer ownership —
 * the job stays the publishing manager's — it adds the ProRecruiter to the
 * listing's `pickedBy`, which is what makes the job appear in their own jobs
 * list. From there it is an ordinary job to them: assign recruiters, upload
 * candidates, run the pipeline.
 *
 * A listing stays open after a pick, so several ProRecruiters can work the same
 * requirement.
 */

import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

const POPULATE = [
  { path: "managerId", select: "fullname username email" },
  { path: "assignedRecruiters", select: "fullname email status" },
  { path: "marketplace.listedBy", select: "fullname username email" },
];

const isOpen = (job) =>
  !job.isClosed && (!job.hiringDeadline || new Date(job.hiringDeadline) >= new Date());

/** Jobs this ProRecruiter has already picked, as a set of job id strings. */
const pickedIdsFor = (jobs, userId) =>
  new Set(
    jobs
      .filter((j) => (j.marketplace?.pickedBy || []).some((p) => String(p.userId) === String(userId)))
      .map((j) => String(j._id))
  );

// ─── GET /api/manager/marketplace/available ─────────────────────────────────
// Every open listing, with a flag for the ones the caller already picked so the
// UI can show "Picked" instead of offering it again.
export const getAvailableMarketplaceJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobs = await Job.find({ "marketplace.isListed": true }).populate(POPULATE).sort({ "marketplace.listedAt": -1 });

    const open = jobs.filter(isOpen);
    const picked = pickedIdsFor(open, userId);

    return res.status(200).json({
      message: "Marketplace jobs fetched successfully.",
      success: true,
      jobs: open.map((job) => ({
        ...job.toObject(),
        alreadyPicked: picked.has(String(job._id)),
        pickedCount: job.marketplace?.pickedBy?.length || 0,
      })),
    });
  } catch (error) {
    console.error("getAvailableMarketplaceJobs error:", error);
    return res.status(500).json({ message: "Error fetching marketplace jobs.", success: false });
  }
};

// ─── POST /api/manager/marketplace/:jobId/pick ──────────────────────────────
export const pickMarketplaceJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id", success: false });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found.", success: false });
    if (!job.marketplace?.isListed) {
      return res.status(400).json({ message: "This job is not on the marketplace.", success: false });
    }
    if (!isOpen(job)) {
      return res.status(400).json({ message: "This job is no longer open.", success: false });
    }

    const already = (job.marketplace.pickedBy || []).some((p) => String(p.userId) === String(userId));
    if (already) {
      return res.status(200).json({
        message: "You have already picked this job.",
        success: true,
        alreadyPicked: true,
      });
    }

    job.marketplace.pickedBy.push({ userId, pickedAt: new Date() });
    await job.save();

    // Mirror onto the user so their own jobs list can find it without scanning
    // every listing on the platform.
    await User.findByIdAndUpdate(userId, { $addToSet: { pickedJobs: job._id } });

    return res.status(200).json({
      message: "Job picked. It's now in your jobs.",
      success: true,
      job,
    });
  } catch (error) {
    console.error("pickMarketplaceJob error:", error);
    return res.status(500).json({ message: "Error picking the job.", success: false });
  }
};

// ─── POST /api/manager/marketplace/:jobId/release ───────────────────────────
// Undo a pick — the job leaves the ProRecruiter's list and stays on the
// marketplace for anyone else.
export const releaseMarketplaceJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id", success: false });
    }

    await Job.findByIdAndUpdate(jobId, {
      $pull: { "marketplace.pickedBy": { userId } },
    });
    await User.findByIdAndUpdate(userId, { $pull: { pickedJobs: jobId } });

    return res.status(200).json({ message: "Job released.", success: true });
  } catch (error) {
    console.error("releaseMarketplaceJob error:", error);
    return res.status(500).json({ message: "Error releasing the job.", success: false });
  }
};

// ─── PATCH /api/manager/marketplace/:jobId/listing ──────────────────────────
// Publish or unpublish a job the manager owns.
export const updateMarketplaceListing = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { isListed, commissionRate } = req.body || {};
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id", success: false });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found.", success: false });
    if (String(job.managerId) !== String(userId)) {
      return res.status(403).json({ message: "This isn't your job to list.", success: false });
    }

    job.marketplace = job.marketplace || {};
    if (typeof isListed === "boolean") {
      job.marketplace.isListed = isListed;
      job.marketplace.listedAt = isListed ? new Date() : null;
      job.marketplace.listedBy = isListed ? userId : null;
    }
    if (commissionRate !== undefined) {
      const rate = Number(commissionRate);
      job.marketplace.commissionRate = Number.isFinite(rate) ? rate : null;
    }
    await job.save();

    return res.status(200).json({ message: "Listing updated.", success: true, job });
  } catch (error) {
    console.error("updateMarketplaceListing error:", error);
    return res.status(500).json({ message: "Error updating the listing.", success: false });
  }
};
