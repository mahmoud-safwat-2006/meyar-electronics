import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000/api").replace(/\/$/, "");
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("safwa-admin-token");
    const savedUser = window.localStorage.getItem("safwa-admin-session");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        window.localStorage.removeItem("safwa-admin-token");
        window.localStorage.removeItem("safwa-admin-session");
      }
    }
    setReady(true);
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem("safwa-admin-token");
    window.localStorage.removeItem("safwa-admin-session");
    setToken("");
    setUser(null);
  }, []);

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) clearSession();
      const error = new Error(payload.message || payload.error || `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }, [clearSession, token]);

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Invalid email or password.");
    const nextUser = {
      id: payload._id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      image: payload.image,
      phone: payload.phone,
    };
    window.localStorage.setItem("safwa-admin-token", payload.token);
    window.localStorage.setItem("safwa-admin-session", JSON.stringify(nextUser));
    setToken(payload.token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = useMemo(() => ({ token, user, ready, api, login, logout: clearSession }), [api, clearSession, login, ready, token, user]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider.");
  return context;
}
