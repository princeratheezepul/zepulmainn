// Shared helpers for proctoring: capture periodic webcam frames and upload them.
// Used by both the coding test (CandidateAssessmentPage) and the AI interview (Meeting).
//
// Design notes:
// - Frames are small JPEGs (downscaled to ~640px, quality 0.7) → tens of KB each.
// - Uploads are multipart/form-data (field name "file") and are BEST-EFFORT: a failed
//   upload (e.g. AWS not yet configured, transient network) is swallowed so it can never
//   break or block the candidate's session.

// How often to capture a frame during a proctored session (ms).
export const CAPTURE_INTERVAL_MS = 30 * 1000;

// Request the webcam. Resolves to a MediaStream, or throws if denied/unavailable.
export const requestCamera = () =>
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });

// Stop all tracks on a stream (idempotent, null-safe).
export const stopStream = (stream) => {
  try {
    stream?.getTracks?.().forEach((t) => t.stop());
  } catch {
    /* ignore */
  }
};

// Draw the current <video> frame to an offscreen <canvas> and return a JPEG Blob
// (or null if the video isn't ready). Never throws.
export const captureFrameBlob = (videoEl, canvasEl, { maxWidth = 640, quality = 0.7 } = {}) =>
  new Promise((resolve) => {
    try {
      if (!videoEl || !canvasEl || !videoEl.videoWidth) return resolve(null);
      const scale = Math.min(1, maxWidth / videoEl.videoWidth);
      const w = Math.max(1, Math.round(videoEl.videoWidth * scale));
      const h = Math.max(1, Math.round(videoEl.videoHeight * scale));
      canvasEl.width = w;
      canvasEl.height = h;
      const ctx = canvasEl.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, w, h);
      canvasEl.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    } catch {
      resolve(null);
    }
  });

// POST one frame to an upload endpoint. Best-effort — resolves even on failure.
export const uploadFrame = async (url, blob, consent) => {
  if (!blob) return;
  try {
    const form = new FormData();
    form.append("file", blob, "frame.jpg");
    if (consent) form.append("consent", consent);
    await fetch(url, { method: "POST", body: form });
  } catch (e) {
    // Swallow: proctoring upload must never break the candidate's session.
    console.debug("[proctoring] frame upload failed:", e?.message);
  }
};

// Convenience: capture the current frame and upload it in one call.
export const captureAndUpload = async (videoEl, canvasEl, url, consent) => {
  const blob = await captureFrameBlob(videoEl, canvasEl);
  await uploadFrame(url, blob, consent);
};
