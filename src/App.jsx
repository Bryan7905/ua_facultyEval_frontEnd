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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold text-brand-500">UA FacultyEval</Link>
          <nav className="ml-4 space-x-3">
            <Link to="/student" className="text-sm text-gray-600 hover:text-gray-900">Student</Link>
            <Link to="/faculty" className="text-sm text-gray-600 hover:text-gray-900">Faculty</Link>
            <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {me ? (
              <>
                <div className="text-sm text-gray-700">{me.email} <span className="text-xs text-gray-500">({me.profile?.role})</span></div>
                <button onClick={logout} className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm">Logout</button>
              </>
            ) : (
              <Link to="/login" className="inline-block bg-brand-500 text-white px-3 py-1 rounded text-sm hover:bg-brand-600">Log in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/student" element={<Protected><StudentPage /></Protected>} />
          <Route path="/faculty" element={<Protected><FacultyPage /></Protected>} />
          <Route path="/admin" element={<Protected><AdminPage /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}