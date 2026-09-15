import React, { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { getApiUrl } from "../config/config";

/**
 * Voice agent that walks the user through describing a role.
 *
 * Used standalone at /describeJob and in the /register-first-job onboarding
 * flow. When embedded (e.g. the manager dashboard's Create Job), pass `onBack`
 * to show a back control and `onDone` to return the user to the host screen
 * once the session is captured.
 */
const DescribeJob = ({ onBack, onDone }) => {
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const vapiRef = useRef(null);

    // Auto-create a session on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                setLoading(true);
                const res = await fetch(getApiUrl(`/api/job-description-sessions`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to initialize session");
                }
                const data = await res.json();
                setSessionId(data.sessionId);
            } catch (err) {
                console.error(err);
                setError(err.message || "Unable to initialize session");
            } finally {
                setLoading(false);
            }
        };

        initSession();
    }, []);

    // Setup webcam
    useEffect(() => {
        const enableCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
                mediaStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Unable to access camera:", err);
            }
        };

        enableCamera();

        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
        };
    }, []);

    const startDescription = async () => {
        if (!sessionId || starting || isConnected) return;
        setError("");
        setStarting(true);

        try {
            const res = await fetch(getApiUrl(`/api/job-description-sessions/${sessionId}/start`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to start session");
            }

            const data = await res.json();
            const { joinConfig } = data;

            if (!joinConfig?.publicApiKey || !joinConfig?.assistantId) {
                throw new Error("Invalid session configuration");
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
                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                }
            });

            vapi.on("speech-start", () => setIsSpeaking(true));
            vapi.on("speech-end", () => setIsSpeaking(false));

            vapi.on("error", (e) => {
                if (e?.error?.type === "ejected" && e?.error?.msg === "Meeting has ended") {
                    console.log("Session ended (expected):", e.error.msg);
                    return;
                }
                console.error("Vapi error:", e);
                if (isConnected) {
                    setError("An error occurred. Please try refreshing the page.");
                }
            });

            vapi.start(joinConfig.assistantId);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to start description");
            setStarting(false);
        }
    };

    const endDescription = async () => {
        if (!vapiRef.current) return;

        try {
            vapiRef.current.stop();

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            }

            await fetch(getApiUrl(`/api/job-description-sessions/${sessionId}/end`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }).catch((err) => console.error("Failed to notify backend of session end:", err));

            setIsConnected(false);
            setIsSpeaking(false);
            setIsCompleted(true);
        } catch (err) {
            console.error("Error ending description:", err);
            setIsConnected(false);
            setIsSpeaking(false);
            setIsCompleted(true);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={styles.center}>
                <div style={styles.spinner} />
            </div>
        );
    }

    // ── Error / Session unavailable ────────────────────────────────────────────
    if (error && !isConnected) {
        return (
            <div style={styles.center}>
                <div style={styles.card}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                    <h2 style={styles.cardTitle}>Session Unavailable</h2>
                    <p style={styles.cardSubtitle}>{error}</p>
                </div>
            </div>
        );
    }

    // ── Completed ──────────────────────────────────────────────────────────────
    if (isCompleted) {
        return (
            <div style={styles.center}>
                <div style={styles.card}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                    <h2 style={styles.cardTitle}>Job Description Captured!</h2>
                    <p style={styles.cardSubtitle}>
                        Your job description has been recorded and saved. The Zepul team will
                        process your responses and structure the job posting.
                    </p>
                    {typeof onDone === "function" ? (
                        <button style={styles.btnPrimary} onClick={onDone}>
                            Back to Jobs
                        </button>
                    ) : (
                        <div style={styles.successNote}>
                            You can close this window.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Main layout ────────────────────────────────────────────────────────────
    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerInner}>
                    {typeof onBack === "function" && (
                        <button style={styles.btnBack} onClick={onBack} aria-label="Back">
                            ←
                        </button>
                    )}
                    <img src="/assets/logo.png" alt="Zepul" style={styles.logo} />
                    <div>
                        <div style={styles.headerTitle}>Zeus — AI Job Description Assistant</div>
                        <div style={styles.headerSub}>Describe your role — we'll handle the rest</div>
                    </div>
                </div>
                {isConnected && (
                    <div style={styles.liveBadge}>
                        <span style={styles.liveDot} />
                        LIVE
                    </div>
                )}
            </header>

            {/* Body */}
            <main style={styles.main}>
                {/* Camera Panel */}
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>📷 Your Camera</div>
                    <div style={styles.videoWrap}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={styles.video}
                        />
                    </div>
                </div>

                {/* AI Panel */}
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <span>🤖 Zeus — AI Assistant</span>
                        {isConnected && (
                            <span
                                style={{
                                    ...styles.speakingBadge,
                                    background: isSpeaking ? "#16A34A" : "#94A3B8",
                                }}
                            >
                                {isSpeaking ? "Speaking..." : "Listening"}
                            </span>
                        )}
                    </div>

                    {/* AI Avatar */}
                    <div style={styles.avatarWrap}>
                        <div
                            style={{
                                ...styles.avatar,
                                background: isSpeaking
                                    ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                                    : "linear-gradient(135deg, #94A3B8, #64748B)",
                                boxShadow: isSpeaking
                                    ? "0 0 0 10px rgba(37,99,235,0.12), 0 8px 24px rgba(37,99,235,0.28)"
                                    : "0 4px 14px rgba(16,24,40,0.12)",
                                transform: isSpeaking ? "scale(1.06)" : "scale(1)",
                            }}
                        >
                            <WaveIcon speaking={isSpeaking} />
                        </div>
                        <p style={styles.avatarLabel}>
                            {isSpeaking
                                ? "Zeus is speaking..."
                                : isConnected
                                    ? "Listening to you — speak naturally"
                                    : "Ready to help you describe your job"}
                        </p>
                    </div>

                    {/* Info / Status text */}
                    <div style={styles.infoBox}>
                        {!isConnected ? (
                            <>
                                <p style={styles.infoTitle}>How it works</p>
                                <ul style={styles.infoList}>
                                    <li>Click <strong>Start Description</strong> below</li>
                                    <li>Zeus will greet you and ask about your role</li>
                                    <li>Speak naturally — cover skills, responsibilities, team, salary & more</li>
                                    <li>Click <strong>End Description</strong> whenever you're done</li>
                                </ul>
                            </>
                        ) : (
                            <p style={styles.infoConnectedText}>
                                🎙️ <strong>Session in progress.</strong> Answer each question naturally.
                                Take your time — there's no rush. Click <strong>End Description</strong> when finished.
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    <div style={styles.buttonRow}>
                        {!isConnected ? (
                            <button
                                style={{
                                    ...styles.btnPrimary,
                                    opacity: starting ? 0.7 : 1,
                                    cursor: starting ? "not-allowed" : "pointer",
                                }}
                                onClick={startDescription}
                                disabled={starting}
                            >
                                {starting ? (
                                    <>
                                        <span style={styles.btnSpinner} /> Connecting...
                                    </>
                                ) : (
                                    "🎙️  Start Description"
                                )}
                            </button>
                        ) : (
                            <button style={styles.btnDanger} onClick={endDescription}>
                                ⏹  End Description
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ── Mic wave icon ─────────────────────────────────────────────────────────────
const WaveIcon = ({ speaking }) => (
    <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "all 0.3s ease" }}
    >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        background: "#F7F8FA",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: "#111827",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerInner: {
        display: "flex",
        alignItems: "center",
        gap: 16,
    },
    logo: {
        height: 40,
        width: 112,
        objectFit: "contain",
    },
    btnBack: {
        background: "#fff",
        border: "1px solid #E5E7EB",
        color: "#4B5563",
        borderRadius: 10,
        width: 36,
        height: 36,
        fontSize: 18,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    headerTitle: {
        fontWeight: 700,
        fontSize: 18,
        color: "#111827",
    },
    headerSub: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
    liveBadge: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: 20,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 700,
        color: "#DC2626",
        letterSpacing: "0.08em",
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#DC2626",
        animation: "pulse 1.5s infinite",
    },
    main: {
        flex: 1,
        display: "flex",
        gap: 24,
        padding: "32px",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        alignItems: "stretch",
    },
    panel: {
        flex: 1,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    panelHeader: {
        padding: "16px 20px",
        borderBottom: "1px solid #E5E7EB",
        fontWeight: 600,
        fontSize: 14,
        color: "#374151",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    videoWrap: {
        flex: 1,
        background: "#E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 280,
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    avatarWrap: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        gap: 16,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
    },
    avatarLabel: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        margin: 0,
    },
    speakingBadge: {
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        color: "#fff",
        transition: "background 0.3s",
        letterSpacing: "0.04em",
    },
    infoBox: {
        margin: "0 20px 20px",
        padding: 16,
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: 600,
        color: "#1D4ED8",
        margin: "0 0 8px 0",
    },
    infoList: {
        margin: 0,
        paddingLeft: 18,
        fontSize: 13,
        color: "#4B5563",
        lineHeight: 1.7,
    },
    infoConnectedText: {
        fontSize: 13,
        color: "#4B5563",
        margin: 0,
        lineHeight: 1.6,
    },
    buttonRow: {
        padding: "0 20px 20px",
    },
    btnPrimary: {
        width: "100%",
        padding: "14px 20px",
        background: "#2563EB",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.2s, transform 0.2s",
        letterSpacing: "0.02em",
        boxShadow: "0 4px 12px rgba(37,99,235,0.24)",
    },
    btnDanger: {
        width: "100%",
        padding: "14px 20px",
        background: "#FEF2F2",
        color: "#DC2626",
        border: "1px solid #FECACA",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background 0.2s",
    },
    btnSpinner: {
        display: "inline-block",
        width: 16,
        height: 16,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    center: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F8FA",
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    card: {
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 20,
        padding: "48px 40px",
        maxWidth: 480,
        width: "90%",
        textAlign: "center",
        boxShadow: "0 8px 28px rgba(16,24,40,0.08)",
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: "#111827",
        margin: "0 0 12px 0",
    },
    cardSubtitle: {
        fontSize: 15,
        color: "#6B7280",
        margin: "0 0 20px 0",
        lineHeight: 1.6,
    },
    successNote: {
        fontSize: 13,
        color: "#6B7280",
        padding: "10px 16px",
        background: "#F3F4F6",
        borderRadius: 8,
    },
    spinner: {
        width: 40,
        height: 40,
        border: "3px solid #E5E7EB",
        borderTopColor: "#2563EB",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
};

export default DescribeJob;
