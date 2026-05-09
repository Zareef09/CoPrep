import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Interview from "./pages/Interview.jsx";
import History from "./pages/History.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const navStyle = {
  display: "flex", alignItems: "center", gap: "1.5rem",
  padding: "0.85rem 2rem", borderBottom: "1px solid #e5e7eb",
  fontFamily: "system-ui, sans-serif",
};
const linkStyle = { textDecoration: "none", fontSize: "0.9rem", color: "#2563eb" };
const logoStyle = { fontWeight: 700, color: "#111", textDecoration: "none", fontSize: "1rem" };

function Nav() {
  const { isAuthed, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>CoPrepare</Link>
      {isAuthed ? (
        <>
          <Link to="/interview" style={linkStyle}>Practice</Link>
          <Link to="/history" style={linkStyle}>History</Link>
          <span style={{ ...linkStyle, cursor: "pointer", marginLeft: "auto" }} onClick={handleLogout}>Sign out</span>
        </>
      ) : (
        <>
          <Link to="/login" style={{ ...linkStyle, marginLeft: "auto" }}>Sign in</Link>
          <Link to="/register" style={{ ...linkStyle, background: "#2563eb", color: "#fff", padding: "0.4rem 0.9rem", borderRadius: 7, fontWeight: 600 }}>Get started</Link>
        </>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
