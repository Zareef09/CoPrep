import { useState, useRef, useEffect } from "react";
import { api } from "../api/client.js";

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  page: { maxWidth: 720, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
  h1: { fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.4rem" },
  sub: { color: "#6b7280", fontSize: "0.9rem", margin: "0 0 2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  label: { display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.3rem", color: "#374151" },
  input: { width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box", outline: "none" },
  rangeRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  btn: { padding: "0.75rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  btnDisabled: { opacity: 0.55, cursor: "not-allowed" },
  error: { color: "#dc2626", fontSize: "0.875rem" },

  // chat header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" },
  headerTitle: { fontWeight: 700, fontSize: "1rem", margin: 0 },
  progressWrap: { height: 6, background: "#e5e7eb", borderRadius: 3, marginBottom: "1rem" },
  progressBar: (pct) => ({ height: "100%", width: `${pct}%`, background: "#2563eb", borderRadius: 3, transition: "width 0.4s ease" }),

  // messages
  feed: { display: "flex", flexDirection: "column", gap: "0.9rem", minHeight: 320, maxHeight: 480, overflowY: "auto", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: "1rem" },
  row: (isUser) => ({ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }),
  bubble: (isUser) => ({
    maxWidth: "82%", padding: "0.7rem 1rem", lineHeight: 1.55, fontSize: "0.93rem", whiteSpace: "pre-wrap",
    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background: isUser ? "#2563eb" : "#f3f4f6",
    color: isUser ? "#fff" : "#111",
  }),
  thinking: { color: "#9ca3af", fontStyle: "italic", fontSize: "0.88rem" },

  // input
  inputRow: { display: "flex", gap: "0.5rem", alignItems: "flex-end" },
  textarea: { flex: 1, padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.93rem", resize: "vertical", minHeight: 72, fontFamily: "inherit", outline: "none" },
  sendBtn: { padding: "0.65rem 1.25rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", flexShrink: 0 },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function Interview() {
  const [phase, setPhase] = useState("setup"); // setup | active | complete

  // setup fields
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [numQ, setNumQ] = useState(5);

  // session state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // { from: "bot"|"user", text }
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  // input / loading
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const feedEnd = useRef(null);
  useEffect(() => { feedEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  async function handleStart(e) {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.post("/interview/start", {
        role: role.trim(),
        company: company.trim() || null,
        num_questions: numQ,
      });
      setSessionId(data.session_id);
      setMessages([{ from: "bot", text: data.message }]);
      setQuestionNumber(data.question_number);
      setTotalQuestions(data.total_questions);
      setPhase("active");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = answer.trim();
    if (!text || loading) return;
    setAnswer("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setLoading(true);
    setError(null);
    try {
      const data = await api.post("/interview/respond", { session_id: sessionId, answer: text });
      setMessages((prev) => [...prev, { from: "bot", text: data.message }]);
      setQuestionNumber(data.question_number);
      if (data.is_complete) setPhase("complete");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("setup");
    setMessages([]);
    setAnswer("");
    setSessionId(null);
    setError(null);
  }

  // ── Setup form ────────────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div style={s.page}>
        <h1 style={s.h1}>Practice Interview</h1>
        <p style={s.sub}>Answer questions like a real interview. Get feedback after each response.</p>
        <form onSubmit={handleStart} style={s.form}>
          <div>
            <label style={s.label}>Target role *</label>
            <input style={s.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer, Product Manager" required />
          </div>
          <div>
            <label style={s.label}>Company (optional)</label>
            <input style={s.input} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google, Stripe" />
          </div>
          <div>
            <div style={s.rangeRow}>
              <label style={{ ...s.label, marginBottom: 0 }}>Questions</label>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>{numQ}</span>
            </div>
            <input type="range" min={3} max={10} value={numQ} onChange={(e) => setNumQ(Number(e.target.value))} style={{ width: "100%", marginTop: "0.4rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af" }}>
              <span>3 (quick)</span><span>10 (full round)</span>
            </div>
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading}>
            {loading ? "Starting…" : "Start Interview →"}
          </button>
        </form>
      </div>
    );
  }

  // ── Chat ──────────────────────────────────────────────────────────────────────

  const pct = Math.round((questionNumber / totalQuestions) * 100);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.headerTitle}>{role}{company ? ` · ${company}` : ""}</p>
        <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>Q{questionNumber} of {totalQuestions}</span>
      </div>
      <div style={s.progressWrap}>
        <div style={s.progressBar(pct)} />
      </div>

      <div style={s.feed}>
        {messages.map((msg, i) => (
          <div key={i} style={s.row(msg.from === "user")}>
            <div style={s.bubble(msg.from === "user")}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={s.row(false)}>
            <div style={{ ...s.bubble(false), ...s.thinking }}>Thinking…</div>
          </div>
        )}
        <div ref={feedEnd} />
      </div>

      {error && <p style={{ ...s.error, marginBottom: "0.5rem" }}>{error}</p>}

      {phase === "complete" ? (
        <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Interview complete — review the feedback above.</p>
          <button style={s.btn} onClick={reset}>Start New Interview</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={s.inputRow}>
          <textarea
            style={s.textarea}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer… (⌘↵ to submit)"
            disabled={loading}
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleSubmit(e); }}
          />
          <button type="submit" style={{ ...s.sendBtn, ...(loading ? s.btnDisabled : {}) }} disabled={loading}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
