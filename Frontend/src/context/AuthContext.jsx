"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { currentUser, logout as logoutRequest } from "../services/authService";

const AuthContext = createContext(null);
const ROLE_LABELS = { admin: "مدير النظام", reception: "الاستقبال", doctor: "طبيب", patient: "مريض" };

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    currentUser().then(user => { if (active) setAuth(user); }).catch(() => { if (active) setAuth(null); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  async function logout() {
    try { await logoutRequest(); } finally { setAuth(null); }
  }

  const value = useMemo(() => ({
    auth, ready, login: setAuth, logout,
    role: auth?.role ?? null,
    doctorId: auth?.doctorId ?? null,
    patientId: auth?.patientId ?? null,
    staffUserId: auth?.id ?? null,
    userLabel: auth?.name ?? "",
    roleLabel: auth ? ROLE_LABELS[auth.role] ?? auth.role : "",
  }), [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
