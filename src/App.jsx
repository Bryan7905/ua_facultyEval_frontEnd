import React from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./lib/auth.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import StudentPage from "./pages/StudentPage.jsx";
import FacultyPage from "./pages/FacultyPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function Protected({ children }) {
  const { me, loading } = useAuth();
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;
  return children;
}

function HomeRedirect() {
  const { me, loading } = useAuth();
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;

  const role = me?.profile?.role;
  if (role === "STUDENT") return <Navigate to="/student" replace />;
  if (role === "FACULTY") return <Navigate to="/faculty" replace />;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;

  return <div style={{ padding: 16 }}>Unknown role.</div>;
}

export default function App() {
  const { me, logout } = useAuth();

  return (
    <div>
      <header style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        {me && <span style={{ marginLeft: "auto" }}>{me.email} ({me.profile?.role})</span>}
        {me && <button onClick={logout}>Logout</button>}
      </header>

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/student" element={<Protected><StudentPage /></Protected>} />
        <Route path="/faculty" element={<Protected><FacultyPage /></Protected>} />
        <Route path="/admin" element={<Protected><AdminPage /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}