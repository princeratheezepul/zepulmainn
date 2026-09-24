import React, { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../../config/config";

const FINISHED = "[FINISHED]";

/**
 * Conversational job search. The agent asks the candidate about the role they
 * want a question at a time, then distils the whole conversation into one search
 * phrase and hands it to `onSearch` — the parent runs the same search a typed
 * query would, so there is one results path rather than two.
 */
export default function JobSearchChatAgent({ candidateId, onSearch, onCancel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState("");

  const historyRef = useRef([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  // A conversation the candidate has walked away from must not keep talking to
  // the model, or write its answer into a screen that has moved on.
  const abortRef = useRef(null);

  const call = async (mode) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch(
      getApiUrl(`/api/candidate-interview/candidate/${candidateId}/search/chat`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, history: historyRef.current }),
        signal: controller.signal,
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "The assistant is unavailable right now.");
    return data.content || "";
  };

  // Once the agent signals it has everything, turn the conversation into a
  // search phrase and hand it up.
  const finish = async () => {
    try {
      const raw = await call("extract");
      const parsed = JSON.parse(
        raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim()
      );
      const query = String(parsed.query || "").trim();
      if (!query) throw new Error("I couldn't turn that into a search. Try answering once more.");
      onSearch({
        query,
        summary: String(parsed.summary || "").trim(),
        role: String(parsed.role || "").trim(),
        skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations.map(String) : [],
        workType: String(parsed.workType || "").trim(),
        employmentType: String(parsed.employmentType || "").trim(),
        experience: String(parsed.experience || "").trim(),
        notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err.message || "Something went wrong building your search.");
      setIsFinished(false);
    } finally {
      setIsTyping(false);
    }
  };

  const send = async (text, { showUser = true } = {}) => {
    setError("");
    if (showUser) setMessages((prev) => [...prev, { from: "you", text }]);
    historyRef.current = [...historyRef.current, { role: "user", content: text }];
    setIsTyping(true);

    try {
      const reply = await call("chat");
      historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];
      const done = reply.includes(FINISHED);
      const shown = reply.replace(FINISHED, "").trim();
      setMessages((prev) => [...prev, { from: "agent", text: shown }]);

      if (done) {
        setIsFinished(true);
        await finish();
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err.message || "The assistant is unavailable right now.");
      setIsTyping(false);
    }
  };

  // Opening the chat starts a fresh conversation, and leaving it aborts whatever
  // is still in flight. Start and teardown live in one effect so a remount — which
  // React does on purpose in development — reliably restarts rather than leaving
  // the panel waiting on a request its own cleanup cancelled.
  useEffect(() => {
    if (!candidateId) return undefined;
    historyRef.current = [];
    setMessages([]);
    setError("");
    setIsFinished(false);
    send("Hi — introduce yourself in one line and ask me the first question.", { showUser: false });
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping && !isFinished) inputRef.current?.focus();
  }, [isTyping, isFinished]);

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping || isFinished) return;
    setInput("");
    send(text);
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden max-w-full">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-xs font-bold shrink-0">
            AI
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Search assistant</div>
            <div className="text-xs text-gray-500 truncate">
              Tell it what you want and it searches for you
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div ref={scrollRef} className="h-[340px] overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.from === "you"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-100 text-xs text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="flex gap-2 p-3 border-t border-gray-100">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isFinished}
          maxLength={500}
          placeholder={isFinished ? "Searching…" : "Type your answer…"}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping || isFinished}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
