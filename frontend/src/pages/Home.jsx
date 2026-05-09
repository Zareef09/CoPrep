import { useNavigate } from "react-router-dom";

const s = {
  page: { maxWidth: 720, margin: "0 auto", padding: "5rem 1rem", fontFamily: "system-ui, sans-serif", textAlign: "center" },
  h1: { fontSize: "2.25rem", fontWeight: 800, margin: "0 0 1rem", color: "#111" },
  sub: { fontSize: "1.1rem", color: "#6b7280", margin: "0 0 2.5rem", lineHeight: 1.6 },
  btn: { padding: "0.85rem 2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer" },
  features: { display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "3.5rem", flexWrap: "wrap" },
  card: { flex: "1 1 180px", maxWidth: 200, padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: 12, textAlign: "left" },
  cardTitle: { fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.95rem" },
  cardDesc: { color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Ace your next interview.</h1>
      <p style={s.sub}>
        Practice with an AI interviewer tailored to your role and company.
        <br />Get question-by-question feedback so you improve fast.
      </p>
      <button style={s.btn} onClick={() => navigate("/interview")}>
        Start Practising →
      </button>

      <div style={s.features}>
        {[
          { title: "Any role", desc: "Engineer, PM, designer — pick your target and go." },
          { title: "Real feedback", desc: "Specific, constructive notes after every answer." },
          { title: "Your pace", desc: "3 to 10 questions. Stop and restart anytime." },
        ].map((f) => (
          <div key={f.title} style={s.card}>
            <p style={s.cardTitle}>{f.title}</p>
            <p style={s.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
