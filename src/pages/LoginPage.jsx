import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { loginWithGoogleIdToken } = useAuth();
  const btnRef = useRef(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
          // after successful login and user load, redirect to home which will further redirect based on role
          navigate('/', { replace: true });
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
  }, [loginWithGoogleIdToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-2">Login</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-600">Sign in with your UA Google Workspace account.</p>
          <div ref={btnRef} />
        </div>
      </div>
    </div>
  );
}