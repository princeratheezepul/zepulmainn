import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { getApiUrl } from "../config/config";

const CandidateInterview = () => {
  const navigate = useNavigate();

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState(null); // null = not finished, [] = finished
  const [analysis, setAnalysis] = useState(null);

  const vapiRef = useRef(null);
  const transcriptRef = useRef([]); // [{ role, text }]
  const callIdRef = useRef(null);
  const endingRef = useRef(false);

  // Require a candidate session; allow the interview only once (server is the
  // source of truth so it can't be bypassed or leak between candidates).
  useEffect(() => {
    if (!candidate?._id) {
      navigate("/candidate/login", { replace: true });
      return;
    }
    const init = async () => {
      try {
        setLoading(true);

        // Already interviewed once? Send them back to the dashboard.
        const latestRes = await fetch(
          getApiUrl(`/api/candidate-interview/candidate/${candidate._id}/latest`)
        );
        const latest = await latestRes.json().catch(() => ({}));
        if (latest?.hasInterviewed) {
          navigate("/candidate/dashboard", { replace: true });
          return;
        }

        // Otherwise create a fresh interview session
        const res = await fetch(getApiUrl(`/api/candidate-interview`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: candidate._id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to initialize interview");
        }
        const data = await res.json();
        setSessionId(data.sessionId);
      } catch (err) {
        setError(err.message || "Unable to initialize interview");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const buildTranscript = () =>
    transcriptRef.current
      .map((l) => `${l.role === "assistant" ? "Interviewer" : "Candidate"}: ${l.text}`)
      .join("\n");

  const startInterview = async () => {
    if (!sessionId || starting || isConnected) return;
    setError("");
    setStarting(true);
    transcriptRef.current = [];
    callIdRef.current = null;

    try {
      const res = await fetch(getApiUrl(`/api/candidate-interview/${sessionId}/start`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to start interview");
      }
      const { joinConfig } = await res.json();
      if (!joinConfig?.publicApiKey || !joinConfig?.assistantId || joinConfig?.mock) {
        throw new Error(
          joinConfig?.mock
            ? "Voice agent is not configured on the server."
            : "Invalid interview configuration"
        );
      }

      const vapi = new Vapi(joinConfig.publicApiKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setStarting(false);
        setIsConnected(true);
      });

      vapi.on("call-end", () => {
        setIsConnected(false);
        setIsSpeaking(false);
        // Auto-finish if the AI ended the call itself
        if (!endingRef.current) finishInterview();
      });

      vapi.on("speech-start", () => setIsSpeaking(true));
      vapi.on("speech-end", () => setIsSpeaking(false));

      vapi.on("message", (msg) => {
        if (
          msg?.type === "transcript" &&
          msg?.transcriptType === "final" &&
          msg?.transcript
        ) {
          transcriptRef.current.push({ role: msg.role, text: msg.transcript });
        }
      });

      vapi.on("error", (e) => {
        if (e?.error?.type === "ejected" && e?.error?.msg === "Meeting has ended") return;
        console.error("Vapi error:", e);
      });

      const call = await vapi.start(joinConfig.assistantId);
      if (call?.id) callIdRef.current = call.id;
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to start interview");
      setStarting(false);
    }
  };

  const finishInterview = async () => {
    if (endingRef.current) return;
    endingRef.current = true;

    try {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (_) {}
      }
      setIsConnected(false);
      setIsSpeaking(false);
      setAnalyzing(true);

      const res = await fetch(getApiUrl(`/api/candidate-interview/${sessionId}/end`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: buildTranscript(),
          callId: callIdRef.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to analyze interview");

      const found = Array.isArray(data.matches) ? data.matches : [];
      setAnalysis(data.analysis || null);
      setMatches(found);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not analyze the interview");
      setMatches([]); // show results screen with empty state
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={S.center}>
        <div style={S.spinner} />
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (matches !== null) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
        <div style={S.resultHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/assets/logo.png" alt="Zepul" style={{ height: 28 }} />
            <span style={{ fontWeight: 700, color: "#111" }}>Your Matched Jobs</span>
          </div>
          <button style={S.linkBtn} onClick={() => navigate("/candidate/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 48px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "8px 0" }}>
            {matches.length
              ? `We found ${matches.length} role${matches.length > 1 ? "s" : ""} for you`
              : "No close matches yet"}
          </h1>
          {analysis?.summary && (
            <p style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>{analysis.summary}</p>
          )}
          {!!(analysis?.desiredRoles?.length || analysis?.skills?.length) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {[...(analysis.desiredRoles || []), ...(analysis.skills || [])]
                .slice(0, 10)
                .map((t, i) => (
                  <span key={i} style={S.chip}>
                    {t}
                  </span>
                ))}
            </div>
          )}

          {matches.length === 0 ? (
            <div style={S.emptyCard}>
              We couldn't find strong matches in the current openings. New roles are added
              regularly — check back soon, or browse all jobs from your dashboard.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {matches.map((job) => (
                <div key={job._id} style={S.jobCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                          {job.jobtitle}
                        </span>
                        {typeof job.matchScore === "number" && job.matchScore > 0 && (
                          <span style={S.scoreBadge}>{job.matchScore}% match</span>
                        )}
                      </div>
                      {job.description && (
                        <p style={S.jobDesc}>{job.description}</p>
                      )}
                      <div style={S.metaRow}>
                        {job.company && <span style={{ fontWeight: 600, color: "#333" }}>{job.company}</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.type && <span style={{ textTransform: "capitalize" }}>{job.type}</span>}
                        {job.employmentType && <span>{job.employmentType}</span>}
                        {typeof job.experience === "number" && <span>{job.experience}+ yrs</span>}
                      </div>
                      {!!job.matchReasons?.length && (
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {job.matchReasons.map((r, i) => (
                            <span key={i} style={S.reason}>✓ {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button style={S.applyBtn}>Apply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Analyzing ────────────────────────────────────────────────────────────
  if (analyzing) {
    return (
      <div style={S.center}>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...S.spinner, margin: "0 auto 18px" }} />
          <div style={{ color: "#111827", fontSize: 16, fontWeight: 600 }}>
            Analyzing your interview…
          </div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
            Matching you with the best roles in our database.
          </div>
        </div>
      </div>
    );
  }

  // ── Interview / call view ────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.headerInner}>
          <img src="/assets/logo.png" alt="Zepul" style={{ height: 32 }} />
          <div>
            <div style={S.headerTitle}>AI Career Interview</div>
            <div style={S.headerSub}>Tell Zeus about your dream role — up to 30 minutes</div>
          </div>
        </div>
        {isConnected && (
          <div style={S.liveBadge}>
            <span style={S.liveDot} /> LIVE
          </div>
        )}
      </header>

      <main style={S.main}>
        <div style={S.panel}>
          <div style={S.panelHeader}>
            <span>🤖 Zeus — AI Interviewer</span>
            {isConnected && (
              <span
                style={{
                  ...S.speakingBadge,
                  background: isSpeaking ? "#22c55e" : "#6b7280",
                }}
              >
                {isSpeaking ? "Speaking…" : "Listening"}
              </span>
            )}
          </div>

          <div style={S.avatarWrap}>
            <div
              style={{
                ...S.avatar,
                background: isSpeaking
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "linear-gradient(135deg, #374151, #1f2937)",
                boxShadow: isSpeaking
                  ? "0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(139,92,246,0.3)"
                  : "0 8px 24px rgba(0,0,0,0.3)",
                transform: isSpeaking ? "scale(1.06)" : "scale(1)",
              }}
            >
              <WaveIcon />
            </div>
            <p style={S.avatarLabel}>
              {isSpeaking
                ? "Zeus is speaking…"
                : isConnected
                ? "Listening — speak naturally"
                : "Ready to discover your ideal role"}
            </p>
          </div>

          <div style={S.infoBox}>
            {!isConnected ? (
              <>
                <p style={S.infoTitle}>How it works</p>
                <ul style={S.infoList}>
                  <li>Click <strong>Start Interview</strong> and allow microphone access</li>
                  <li>Zeus will ask about the role you want, your skills & preferences</li>
                  <li>Speak naturally and go in depth — it can take up to 30 minutes; after 30 minutes all further iterations will be manual</li>
                  <li>When you're done, we'll analyze it and show jobs that fit you</li>
                </ul>
              </>
            ) : (
              <p style={S.infoConnectedText}>
                🎙️ <strong>Interview in progress.</strong> Answer each question naturally and in
                detail. When you've covered everything, click <strong>End & See Matches</strong>.
              </p>
            )}
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          <div style={S.buttonRow}>
            {!isConnected ? (
              <button
                style={{
                  ...S.btnPrimary,
                  opacity: starting ? 0.7 : 1,
                  cursor: starting ? "not-allowed" : "pointer",
                }}
                onClick={startInterview}
                disabled={starting}
              >
                {starting ? (
                  <>
                    <span style={S.btnSpinner} /> Connecting…
                  </>
                ) : (
                  "🎙️  Start Interview"
                )}
              </button>
            ) : (
              <button style={S.btnDanger} onClick={finishInterview}>
                ⏹  End & See Matches
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const WaveIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const S = {
  page: {
    minHeight: "100vh",
    background: "#f8f9fc",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#111827",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e8e8ee",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInner: { display: "flex", alignItems: "center", gap: 16 },
  headerTitle: { fontWeight: 700, fontSize: 18, color: "#111827" },
  headerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  liveBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
    borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
    color: "#ef4444", letterSpacing: "0.08em",
  },
  liveDot: { width: 8, height: 8, borderRadius: "50%", background: "#ef4444" },
  main: {
    flex: 1, display: "flex", justifyContent: "center",
    padding: "32px", maxWidth: 640, margin: "0 auto", width: "100%", boxSizing: "border-box",
  },
  panel: {
    flex: 1, background: "#fff", borderRadius: 16,
    border: "1px solid #e8e8ee", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  panelHeader: {
    padding: "16px 20px", borderBottom: "1px solid #eee",
    fontWeight: 600, fontSize: 14, color: "#374151",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  avatarWrap: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "32px 20px", gap: 16,
  },
  avatar: {
    width: 120, height: 120, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center",
    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
  },
  avatarLabel: { fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0 },
  speakingBadge: {
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
    color: "#fff", letterSpacing: "0.04em",
  },
  infoBox: {
    margin: "0 20px 16px", padding: 16, background: "#eef2ff",
    border: "1px solid #e0e7ff", borderRadius: 12,
  },
  infoTitle: { fontSize: 13, fontWeight: 600, color: "#4338ca", margin: "0 0 8px 0" },
  infoList: { margin: 0, paddingLeft: 18, fontSize: 13, color: "#4b5563", lineHeight: 1.7 },
  infoConnectedText: { fontSize: 13, color: "#4b5563", margin: 0, lineHeight: 1.6 },
  errorBox: {
    margin: "0 20px 12px", padding: "10px 14px", background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, color: "#fca5a5", fontSize: 13,
  },
  buttonRow: { padding: "0 20px 20px" },
  btnPrimary: {
    width: "100%", padding: "14px 20px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
    border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  btnDanger: {
    width: "100%", padding: "14px 20px", background: "rgba(239,68,68,0.15)",
    color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12,
    fontSize: 16, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  btnSpinner: {
    display: "inline-block", width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  center: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f8f9fc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  spinner: {
    width: 40, height: 40, border: "3px solid #e5e7eb",
    borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  // Results
  resultHeader: {
    background: "#fff", borderBottom: "1px solid #eee", padding: "14px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 10,
  },
  linkBtn: {
    background: "none", border: "none", color: "#2563eb", fontWeight: 600,
    fontSize: 14, cursor: "pointer",
  },
  chip: {
    fontSize: 12, background: "#eef2ff", color: "#4338ca", borderRadius: 999,
    padding: "4px 10px", fontWeight: 600,
  },
  emptyCard: {
    background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24,
    color: "#555", fontSize: 14, lineHeight: 1.6,
  },
  jobCard: {
    background: "#fff", border: "1px solid #e8e8ee", borderRadius: 12, padding: 16,
  },
  jobDesc: {
    fontSize: 13, color: "#555", margin: "0 0 8px 0", lineHeight: 1.5,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  metaRow: {
    display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#777",
  },
  scoreBadge: {
    fontSize: 11, fontWeight: 700, color: "#047857", background: "#d1fae5",
    borderRadius: 999, padding: "2px 8px",
  },
  reason: {
    fontSize: 11, color: "#3730a3", background: "#eef2ff", borderRadius: 6, padding: "3px 8px",
  },
  applyBtn: {
    alignSelf: "flex-start", background: "#2563eb", color: "#fff", border: "none",
    borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    whiteSpace: "nowrap", height: "fit-content",
  },
};

export default CandidateInterview;
