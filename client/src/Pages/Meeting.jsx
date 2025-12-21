import React, { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { getApiUrl } from "../config/config";

const Meeting = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  const [timeWarning, setTimeWarning] = useState(null); // '10min', '5min', '2min', '1min', 'grace'
  const [gracePeriodActive, setGracePeriodActive] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const vapiRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const gracePeriodRef = useRef(null);
  const warningsShownRef = useRef(new Set()); // Track which warnings have been shown

  // Load meeting metadata
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/meetings/${token}`), {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load meeting");
        }
        const data = await res.json();
        setMeeting(data.meeting);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load meeting");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadMeeting();
    }
  }, [token]);

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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (gracePeriodRef.current) {
        clearInterval(gracePeriodRef.current);
      }
    };
  }, []);

  // Timer countdown effect with progressive warnings
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && isConnected && !gracePeriodActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            // Time reached 0 - start grace period instead of ending immediately
            setGracePeriodActive(true);
            setTimeWarning("grace");
            return 0;
          }
          
          const minutesRemaining = Math.floor(prev / 60000);
          const secondsRemaining = Math.floor((prev % 60000) / 1000);
          
          // Progressive warnings
          if (minutesRemaining === 10 && !warningsShownRef.current.has("10min")) {
            setTimeWarning("10min");
            warningsShownRef.current.add("10min");
          } else if (minutesRemaining === 5 && !warningsShownRef.current.has("5min")) {
            setTimeWarning("5min");
            warningsShownRef.current.add("5min");
          } else if (minutesRemaining === 2 && !warningsShownRef.current.has("2min")) {
            setTimeWarning("2min");
            warningsShownRef.current.add("2min");
          } else if (minutesRemaining === 1 && secondsRemaining === 0 && !warningsShownRef.current.has("1min")) {
            setTimeWarning("1min");
            warningsShownRef.current.add("1min");
          } else if (minutesRemaining < 1 && secondsRemaining <= 30 && !warningsShownRef.current.has("30sec")) {
            setTimeWarning("30sec");
            warningsShownRef.current.add("30sec");
          }
          
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timeRemaining, isConnected, gracePeriodActive]);

  // Grace period countdown (2 minutes after main time expires)
  useEffect(() => {
    if (gracePeriodActive && isConnected) {
      let graceTimeRemaining = 2 * 60 * 1000; // 2 minutes grace period
      
      gracePeriodRef.current = setInterval(() => {
        graceTimeRemaining -= 1000;
        
        if (graceTimeRemaining <= 0) {
          // Grace period expired - now end the interview
          const autoEndInterview = async () => {
            // Mark as ending to prevent error handlers from showing errors
            setIsConnected(false);
            
            if (vapiRef.current) {
              try {
                vapiRef.current.stop();
              } catch (err) {
                console.log("Vapi stop called during auto-end (may show expected error):", err);
              }
            }
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            
            // Notify backend
            try {
              await fetch(getApiUrl(`/api/meetings/${token}/end`), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              }).catch((err) => {
                console.error("Failed to notify backend of auto-end:", err);
              });
            } catch (err) {
              console.error("Error notifying backend:", err);
            }
            
            setIsSpeaking(false);
            setTimeRemaining(null);
            setInterviewStartTime(null);
            setGracePeriodActive(false);
            setTimeWarning(null);
            setError("Interview time has ended. Thank you for your participation.");
          };
          autoEndInterview();
          
          if (gracePeriodRef.current) {
            clearInterval(gracePeriodRef.current);
            gracePeriodRef.current = null;
          }
        }
      }, 1000);

      return () => {
        if (gracePeriodRef.current) {
          clearInterval(gracePeriodRef.current);
        }
      };
    }
  }, [gracePeriodActive, isConnected, token]);

  const startInterview = async () => {
    if (!token || starting || isConnected) return;
    setError("");
    setStarting(true);
    try {
      const res = await fetch(getApiUrl(`/api/meetings/${token}/start`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to start meeting");
      }
      const data = await res.json();
      const { joinConfig } = data;

      if (!joinConfig?.publicApiKey || !joinConfig?.assistantId) {
        throw new Error("Invalid meeting configuration");
      }

      const vapi = new Vapi(joinConfig.publicApiKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setIsConnected(true);
        setInterviewStartTime(new Date());
        // Start timer
        const durationMs = (meeting?.durationMinutes || 40) * 60 * 1000;
        setTimeRemaining(durationMs);
      });

      vapi.on("call-end", () => {
        setIsConnected(false);
        setIsSpeaking(false);
        setTimeRemaining(null);
        setInterviewStartTime(null);
        setGracePeriodActive(false);
        setTimeWarning(null);
        warningsShownRef.current.clear();
        // Stop camera
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        // Clear timers
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        if (gracePeriodRef.current) {
          clearInterval(gracePeriodRef.current);
          gracePeriodRef.current = null;
        }
      });

      vapi.on("speech-start", () => setIsSpeaking(true));
      vapi.on("speech-end", () => setIsSpeaking(false));

      vapi.on("error", (e) => {
        // Ignore expected errors when meeting is intentionally ended
        if (e?.error?.type === "ejected" && e?.error?.msg === "Meeting has ended") {
          console.log("Meeting ended (expected):", e.error.msg);
          // Don't show this as an error to the user - it's expected when ending
          return;
        }
        // Only show unexpected errors
        console.error("Vapi error:", e);
        // Only set error if we're still connected (unexpected error)
        if (isConnected) {
          setError("Call error occurred. Please try refreshing the page.");
        }
      });

      vapi.start(joinConfig.assistantId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to start interview");
    } finally {
      setStarting(false);
    }
  };

  const endInterview = async () => {
    if (!vapiRef.current) return;
    
    try {
      // Stop the Vapi call
      vapiRef.current.stop();
      
      // Stop camera
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      
      // Clear timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (gracePeriodRef.current) {
        clearInterval(gracePeriodRef.current);
        gracePeriodRef.current = null;
      }
      
      setGracePeriodActive(false);
      setTimeWarning(null);
      warningsShownRef.current.clear();
      
      // Notify backend that meeting was ended
      await fetch(getApiUrl(`/api/meetings/${token}/end`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        console.error("Failed to notify backend of meeting end:", err);
        // Don't show error to user, call is already stopped
      });
      
      setIsConnected(false);
      setIsSpeaking(false);
      setTimeRemaining(null);
      setInterviewStartTime(null);
      setGracePeriodActive(false);
      setTimeWarning(null);
      warningsShownRef.current.clear();
      setError("Interview ended. Thank you for your time.");
    } catch (err) {
      console.error("Error ending interview:", err);
      // Still stop the call even if backend call fails
      setIsConnected(false);
      setIsSpeaking(false);
      setTimeRemaining(null);
      setInterviewStartTime(null);
      setGracePeriodActive(false);
      setTimeWarning(null);
      warningsShownRef.current.clear();
    }
  };

  const formatTime = (milliseconds) => {
    if (milliseconds === null || milliseconds === undefined) return "00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h5 className="mb-2">Interview Unavailable</h5>
          <p className="text-muted mb-3">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Your Camera</h5>
              </div>
              <div className="card-body d-flex justify-content-center align-items-center bg-dark" style={{ minHeight: 260 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxHeight: 320,
                    borderRadius: "0.5rem",
                    objectFit: "cover",
                    backgroundColor: "#000",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100 d-flex flex-column">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">AI Interviewer</h5>
                  <small className="text-muted">
                    {meeting?.context?.job?.title || "Technical Interview"}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {/* Timer */}
                  {isConnected && timeRemaining !== null && (
                    <div
                      className={`px-3 py-1 rounded-pill d-flex align-items-center gap-2 ${
                        timeRemaining < 300000
                          ? "bg-danger text-white"
                          : timeRemaining < 600000
                          ? "bg-warning text-dark"
                          : "bg-info text-white"
                      }`}
                      style={{ fontSize: "14px", fontWeight: "600" }}
                    >
                      <Clock size={16} />
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      isSpeaking ? "bg-success" : "bg-secondary"
                    }`}
                    style={{
                      width: 48,
                      height: 48,
                      color: "#fff",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: 12 }}>
                      {isSpeaking ? "Speaking" : "Idle"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body d-flex justify-content-center align-items-center bg-gradient-to-br from-blue-50 to-indigo-50" style={{ minHeight: 260, flex: 1 }}>
                {/* AI Agent Avatar */}
                <div className="text-center">
                  <div
                    className={`rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center ${
                      isSpeaking ? "bg-primary shadow-lg" : "bg-secondary"
                    }`}
                    style={{
                      width: 120,
                      height: 120,
                      transition: "all 0.3s ease",
                      boxShadow: isSpeaking 
                        ? "0 0 20px rgba(13, 110, 253, 0.5)" 
                        : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {isSpeaking ? (
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    )}
                  </div>
                  <p className="text-muted mb-0 small">
                    {isSpeaking ? "AI is speaking..." : "Waiting to start"}
                  </p>
                </div>
              </div>
              <div className="card-body d-flex flex-column" style={{ paddingTop: "1rem" }}>
                {!isConnected && (
                  <>
                    <p className="text-muted">
                      When you start, our AI interviewer will speak with you using
                      your microphone and guide you through a 30–40 minute
                      interview based on the job description and your resume.
                    </p>
                    <ul className="small text-muted mb-3">
                      <li>Ensure you are in a quiet environment.</li>
                      <li>Use headphones if possible.</li>
                      <li>Keep your browser tab active during the interview.</li>
                    </ul>
                  </>
                )}
                {isConnected && (
                  <div className={`alert mb-3 ${
                    gracePeriodActive
                      ? "alert-danger"
                      : timeWarning === "1min" || timeWarning === "30sec"
                      ? "alert-warning"
                      : "alert-info"
                  }`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>
                        {gracePeriodActive
                          ? "Grace Period - Interview Ending Soon"
                          : "Interview in progress"}
                      </strong>
                      {!gracePeriodActive && timeRemaining !== null && (
                        <span className="badge bg-primary">
                          {formatTime(timeRemaining)} remaining
                        </span>
                      )}
                    </div>
                    {gracePeriodActive ? (
                      <p className="mb-0 small">
                        <strong>The scheduled interview time has ended.</strong> You have 2 minutes to wrap up your current response. The interview will end automatically after this grace period.
                      </p>
                    ) : timeWarning === "1min" ? (
                      <p className="mb-0 small text-warning mt-2">
                        <strong>⚠️ Less than 1 minute remaining!</strong> Please wrap up your current response.
                      </p>
                    ) : timeWarning === "30sec" ? (
                      <p className="mb-0 small text-danger mt-2">
                        <strong>⚠️ Less than 30 seconds remaining!</strong> Please finish your response quickly.
                      </p>
                    ) : timeWarning === "2min" ? (
                      <p className="mb-0 small text-warning mt-2">
                        <strong>⚠️ 2 minutes remaining!</strong> The interview will enter a grace period after the time expires.
                      </p>
                    ) : timeWarning === "5min" ? (
                      <p className="mb-0 small text-warning mt-2">
                        <strong>⏰ 5 minutes remaining!</strong> Please be mindful of the time.
                      </p>
                    ) : timeWarning === "10min" ? (
                      <p className="mb-0 small text-info mt-2">
                        <strong>⏰ 10 minutes remaining.</strong> The interview is progressing well.
                      </p>
                    ) : (
                      <p className="mb-0 small">The AI interviewer is conducting your interview. Speak clearly and answer the questions.</p>
                    )}
                  </div>
                )}
                <div className="mt-auto d-flex gap-2">
                  {!isConnected ? (
                    <button
                      className="btn btn-primary flex-grow-1"
                      onClick={startInterview}
                      disabled={starting}
                    >
                      {starting ? "Starting..." : "Start Interview"}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-danger flex-grow-1"
                      onClick={endInterview}
                    >
                      End Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;


