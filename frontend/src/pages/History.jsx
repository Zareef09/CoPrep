import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

const s = {
  page: { maxWidth: 720, margin: "0 auto", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
  h1: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" },
  sub: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "2rem" },
  empty: { color: "#9ca3af", textAlign: "center", padding: "3rem 0" },
  list: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", border: "1px solid #e5e7eb", borderRadius: 10, cursor: "pointer", background: "#fff" },
  cardLeft: { display: "flex", flexDirection: "column", gap: "0.2rem" },
  role: { fontWeight: 600, fontSize: "0.95rem" },
  meta: { fontSize: "0.8rem", color: "#6b7280" },
  badge: (complete) => ({
    fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 99,
    background: complete ? "#dcfce7" : "#fef9c3",
    color: complete ? "#15803d" : "#854d0e",
  }),
};

function fmt(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/interview/history")
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Past interviews</h1>
      <p style={s.sub}>Your full practice history, most recent first.</p>
      {loading && <p style={s.empty}>Loading…</p>}
      {!loading && sessions.length === 0 && (
        <p style={s.empty}>No interviews yet. <span style={{ color: "#2563eb", cursor: "pointer" }} onClick={() => navigate("/interview")}>Start one →</span></p>
      )}
      <div style={s.list}>
        {sessions.map((s_) => (
          <div key={s_.session_id} style={s.card} onClick={() => navigate("/interview")}>
            <div style={s.cardLeft}>
              <span style={s.role}>{s_.role}{s_.company ? ` · ${s_.company}` : ""}</span>
              <span style={s.meta}>{s_.num_questions} questions · {fmt(s_.created_at)}</span>
            </div>
            <span style={s.badge(s_.is_complete)}>{s_.is_complete ? "Complete" : "In progress"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
