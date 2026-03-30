import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { loginWithGoogleIdToken } = useAuth();
  const btnRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Missing VITE_GOOGLE_CLIENT_ID in .env.local");
      return;
    }
    if (!window.google?.accounts?.id) {
      setError("Google Identity Services script not loaded. Check index.html.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          setError("");
          await loginWithGoogleIdToken(response.credential);
        } catch (e) {
          setError(e.message || "Login failed");
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 280,
    });
  }, [loginWithGoogleIdToken]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Login</h2>
      <p>Use your ua.edu Google Workspace account.</p>
      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
      <div ref={btnRef} />
    </div>
  );
}