/**
 * License Partners.
 *
 * A License Partner is a manager account that runs its own hiring on Zepul in
 * parallel with Zepul's internal team. Its jobs and its recruiters form a closed
 * pool: its recruiters work only its jobs, its jobs are worked only by its
 * recruiters, and neither side sees the other's jobs.
 *
 * Jobs and recruiters carry the owning partner in `licensePartnerId` (null for
 * Zepul's own), so pairing a recruiter with a job is allowed only when the two
 * values match.
 */

import Recruiter from "../models/recruiter.model.js";

// Zepul managers allowed to create and list License Partner accounts.
export const LICENSE_PARTNER_ADMIN_EMAILS = ["reenasumera@zepul.com"];

export const canManageLicensePartners = (user) =>
    LICENSE_PARTNER_ADMIN_EMAILS.includes(String(user?.email || "").trim().toLowerCase());

/** Filter matching only Zepul's own documents, excluding every License Partner's. */
export const NOT_LICENSE_PARTNER = { licensePartnerId: null };

const partnerKey = (value) => (value ? String(value) : "");

/**
 * The recruiters in `recruiterIds` that belong to a different pool from the
 * job, as {_id, fullname, email}. An empty result means the assignment is allowed.
 */
export const findCrossPartnerRecruiters = async (job, recruiterIds) => {
    const ids = (recruiterIds || []).map((r) => (r && r._id ? r._id : r)).filter(Boolean);
    if (!ids.length) return [];

    const recruiters = await Recruiter.find({ _id: { $in: ids } }).select("fullname email licensePartnerId");
    return recruiters.filter((r) => partnerKey(r.licensePartnerId) !== partnerKey(job.licensePartnerId));
};

/** Whether this manager may touch the job, given which pool each belongs to. */
export const managerSharesPool = (manager, job) =>
    partnerKey(manager?.isLicensePartner ? manager._id : null) === partnerKey(job?.licensePartnerId);

export const CROSS_PARTNER_MESSAGE =
    "License Partner jobs and recruiters are separate from Zepul's. A recruiter can only be assigned to jobs from their own organisation.";
