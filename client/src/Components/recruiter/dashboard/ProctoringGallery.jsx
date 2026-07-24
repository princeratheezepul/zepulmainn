import React, { useEffect, useState } from "react";
import { Camera, CameraOff, X } from "lucide-react";
import { getApiUrl } from "../../../config/config";
import { getAuthHeaders } from "../../../utils/authUtils";

/**
 * Displays the proctoring webcam snapshots captured during a coding test or interview.
 * Fetches presigned image URLs from `endpoint` (a recruiter-authenticated API path such as
 * `/api/assessment/:id/screenshots` or `/api/meetings/:id/screenshots`).
 *
 * Self-hiding: renders nothing when there are no snapshots and no consent record, so it's
 * safe to drop into a result view regardless of whether the candidate has taken the session.
 */
const ProctoringGallery = ({ endpoint, title = "Proctoring Snapshots" }) => {
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState([]);
  const [consent, setConsent] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { url, capturedAt } | null

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!endpoint) return;
      setLoading(true);
      try {
        const res = await fetch(getApiUrl(endpoint), {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setScreenshots(Array.isArray(data.screenshots) ? data.screenshots : []);
        setConsent(data.consent || null);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load proctoring snapshots:", err?.message);
          setScreenshots([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const fmt = (d) => {
    try {
      return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
        <Camera size={16} /> Loading proctoring snapshots…
      </div>
    );
  }

  // Nothing captured and no consent recorded → nothing meaningful to show.
  if (!screenshots.length && consent !== "denied") return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Camera size={18} className="text-blue-600" /> {title}
          {screenshots.length > 0 && (
            <span className="text-xs font-normal text-gray-500">({screenshots.length})</span>
          )}
        </h4>
        {consent === "denied" && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">
            <CameraOff size={14} /> Camera blocked by candidate
          </span>
        )}
      </div>

      {screenshots.length === 0 ? (
        <p className="text-sm text-gray-500">
          No snapshots were captured — the candidate did not grant camera access.
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">
            Captured periodically during the session for identity verification. Click any image to enlarge.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {screenshots.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightbox(s)}
                className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={fmt(s.capturedAt)}
              >
                <img
                  src={s.url}
                  alt={`Snapshot ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-20 object-cover bg-gray-100"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {fmt(s.capturedAt)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg text-gray-700 hover:text-gray-900"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <img src={lightbox.url} alt="Snapshot" className="w-full rounded-lg" />
            <div className="text-center text-white text-sm mt-2">Captured at {fmt(lightbox.capturedAt)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringGallery;
