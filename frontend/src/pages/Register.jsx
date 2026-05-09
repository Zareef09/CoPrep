import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const s = {
  page: { maxWidth: 400, margin: "6rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" },
  h1: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" },
  sub: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "2rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: { display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.3rem", color: "#374151" },
  input: { width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" },
  btn: { padding: "0.75rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  error: { color: "#dc2626", fontSize: "0.875rem" },
  link: { color: "#2563eb", textDecoration: "none" },
  footer: { marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" },
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await api.post("/auth/register", { email, password });
      login(data.access_token);
      navigate("/interview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Create account</h1>
      <p style={s.sub}>Free. No credit card. Start practising in 30 seconds.</p>
      <form onSubmit={handleSubmit} style={s.form}>
        <div>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div>
          <label style={s.label}>Password <span style={{ fontWeight: 400, color: "#9ca3af" }}>(min 8 chars)</span></label>
          <input style={s.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={s.error}>{error}</p>}
        <button style={{ ...s.btn, opacity: loading ? 0.55 : 1 }} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p style={s.footer}>
        Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
      </p>
    </div>
  );
}
