import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProPricingSelector from "../Components/ProPricingSelector";

const SYSTEM_PROMPT = `You are the "Zepul Job Registration Assistant", a professional, friendly, and highly efficient AI recruiter.
Your job is to collect details for a new job posting from a hiring manager step-by-step. 

You MUST collect the following 9 pieces of information in this exact logical order, ONE by ONE. 
Do NOT ask multiple questions at once. Always wait for the user to answer the current question before moving to the next.

1. Role / Job Title
2. Years of Experience required
3. Key Skills or Technologies
4. Budget or Salary Range
5. Location (e.g., Remote, On-site in NY, etc.)
6. Job Description (Ask them to write a brief overview. If they write less than 15-20 words, kindly ask them to expand it a bit.)
7. Key Responsibilities (Day-to-day work)
8. Required Qualifications (Degrees, certifications)
9. Additional Info (Company culture, perks, anything else to add)

Rules:
- Be conversational, empathetic, and professional. React naturally to what the user says.
- Keep your messages concise.
- If you have successfully collected all 9 items and the user has nothing more to add, say exactly: "[FINISHED] Thank you! I have collected everything needed. Generating your job posting now..."`;

const GEMINI_MODEL = "gemini-2.0-flash";

async function callGemini(apiKey, history) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: history }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export default function JobChatAgent() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const historyRef = useRef([
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I will follow those instructions exactly." }] }
    ]);
    const chatContainerRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initChat = async () => {
            try {
                const apiKey = import.meta.env.VITE_GEMINI_API;
                if (!apiKey) throw new Error("Gemini API key is missing");

                const openingPrompt = "Hello, please introduce yourself and ask for the very first item.";
                const tempHistory = [...historyRef.current, { role: "user", parts: [{ text: openingPrompt }] }];
                const botText = await callGemini(apiKey, tempHistory);

                historyRef.current = [...tempHistory, { role: "model", parts: [{ text: botText }] }];
                setMessages([{ sender: "bot", text: botText }]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                setMessages([{ sender: "bot", text: `Error: ${error.message}` }]);
            } finally {
                setIsTyping(false);
            }
        };

        if (user) initChat();
    }, [user]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, isTyping]);

    const extractAndCreateJob = async (history, apiKey) => {
        try {
            const extractionPrompt = `Based on the conversation above, extract the job posting details into a valid JSON object with exactly these keys:
"jobtitle" (string), "description" (string), "location" (string), "type" (must be exactly one of: remote, onsite, hybrid), "employmentType" (string: Full-time or Part-time or Contract), "salary" (object with min and max as numbers), "skills" (array of strings), "experience" (integer), "keyResponsibilities" (array of strings), "preferredQualifications" (array of strings), "openpositions" (integer default 1).
Output ONLY raw JSON. No markdown, no code fences, no extra text.`;

            const extractionHistory = [...history, { role: "user", parts: [{ text: extractionPrompt }] }];
            let rawJsonString = await callGemini(apiKey, extractionHistory);

            // Aggressively strip markdown
            rawJsonString = rawJsonString
                .replace(/^```json\s*/gi, '')
                .replace(/^```\s*/gi, '')
                .replace(/```\s*$/gi, '')
                .trim();

            console.log("Raw Gemini JSON:", rawJsonString);
            const jobData = JSON.parse(rawJsonString);
            console.log("Parsed job data:", jobData);

            const validTypes = ['remote', 'onsite', 'hybrid'];
            const sanitizedType = validTypes.includes(String(jobData.type || '').toLowerCase())
                ? String(jobData.type).toLowerCase()
                : 'onsite';

            const finalPayload = {
                jobtitle: String(jobData.jobtitle || "Untitled Role"),
                description: String(jobData.description || ""),
                location: String(jobData.location || ""),
                type: sanitizedType,
                employmentType: String(jobData.employmentType || "Full-time"),
                salary: {
                    min: Number(jobData.salary?.min) || 0,
                    max: Number(jobData.salary?.max) || 0,
                },
                skills: Array.isArray(jobData.skills) ? jobData.skills.map(String) : [],
                experience: Number(jobData.experience) || 0,
                keyResponsibilities: Array.isArray(jobData.keyResponsibilities) ? jobData.keyResponsibilities.map(String) : [],
                preferredQualifications: Array.isArray(jobData.preferredQualifications) ? jobData.preferredQualifications.map(String) : [],
                openpositions: Number(jobData.openpositions) || 1,
                managerId: user?._id,
                company: user?.companys?.[0]?.name || "Zepul Pro Company",
                priority: [],
                internalNotes: "Generated via AI Job Assistant",
                resumeAnalysisPoints: [],
            };

            console.log("Final payload to backend:", finalPayload);

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const res = await fetch(`${backendUrl}/api/manager/create-job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(finalPayload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server error ${res.status}`);
            }

            setMessages((prev) => [...prev, { sender: "bot", text: "✅ Your job has been created and published successfully! Loading your plan options..." }]);
            setTimeout(() => setShowPricing(true), 2000);

        } catch (error) {
            console.error("Job creation error:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: `❌ Error: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isTyping || isFinished) return;

        const userText = input.trim();
        setMessages((prev) => [...prev, { sender: "user", text: userText }]);
        setInput("");
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API;
            historyRef.current = [...historyRef.current, { role: "user", parts: [{ text: userText }] }];

            const botText = await callGemini(apiKey, historyRef.current);
            historyRef.current = [...historyRef.current, { role: "model", parts: [{ text: botText }] }];

            let displayText = botText;
            if (botText.includes("[FINISHED]")) {
                setIsFinished(true);
                displayText = botText.replace("[FINISHED]", "").trim();
                setIsTyping(true);
                extractAndCreateJob(historyRef.current, apiKey);
            }

            setMessages((prev) => [...prev, { sender: "bot", text: displayText }]);
            if (!botText.includes("[FINISHED]")) {
                setIsTyping(false);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "I encountered an error. Could you repeat that?" }]);
            setIsTyping(false);
        }
    };

    // Show pricing selector after job creation is complete
    if (showPricing) {
        return <ProPricingSelector />;
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden font-sans">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border border-white/30">
                    <span className="text-xl">🤖</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg leading-tight">AI Job Assistant</h3>
                    <p className="text-blue-100 text-xs font-medium flex items-center gap-1">
                        <span className={`w-2 h-2 ${isFinished ? 'bg-gray-400' : 'bg-green-400'} rounded-full inline-block ${!isFinished && 'animate-pulse'}`}></span>
                        {isFinished ? "Processing..." : "Online"}
                    </p>
                </div>
            </div>

            <div ref={chatContainerRef} className="flex-1 bg-[#F8FAFC] p-5 overflow-y-auto space-y-5">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.sender === "bot" && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-xl flex items-center justify-center mr-2 shadow-sm border border-blue-200 flex-shrink-0">
                                🤖
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-[4px]"
                            : msg.text.includes("✅")
                                ? "bg-green-50 border border-green-200 text-green-700 rounded-tl-[4px]"
                                : msg.text.includes("❌")
                                    ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-[4px]"
                                    : "bg-white border border-gray-200 text-gray-700 rounded-tl-[4px]"
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-xl flex items-center justify-center mr-2 shadow-sm border border-blue-200 flex-shrink-0">🤖</div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-[4px] px-4 py-4 shadow-sm flex gap-1.5 items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isFinished ? "Session complete! Processing..." : "Type your answer here..."}
                        disabled={isTyping || isFinished}
                        className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping || isFinished}
                        className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center justify-center transform active:scale-95"
                    >
                        <svg className="w-4 h-4 translate-x-[1px] translate-y-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
