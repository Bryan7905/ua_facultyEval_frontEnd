import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, clearTokens, setTokens } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const user = await apiFetch("/api/auth/me/");
      setMe(user);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function loginWithGoogleIdToken(idToken) {
    const result = await apiFetch("/api/auth/google/", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    });

    setTokens({ access: result.access, refresh: result.refresh });
    await loadMe();
  }

  function logout() {
    clearTokens();
    setMe(null);
  }

  return (
    <AuthContext.Provider value={{ me, loading, loginWithGoogleIdToken, logout, reload: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}