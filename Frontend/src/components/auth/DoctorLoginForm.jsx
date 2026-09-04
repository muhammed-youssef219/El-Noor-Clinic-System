"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { loginDoctor } from "../../services/authService";

export default function DoctorLoginForm({ onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!email || !password || submitting) return;
    setError(""); setSubmitting(true);
    try { onSuccess(await loginDoctor(email, password)); }
    catch (requestError) { setError(requestError.message); setSubmitting(false); }
  }

  return <div className="card" style={{ padding: 20 }}>
    <button className="btn btn-ghost" onClick={onBack}>رجوع</button>
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="البريد الإلكتروني" autoComplete="email" />
      <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="كلمة المرور" autoComplete="current-password" />
      {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={submitting}><LogIn size={15} /> {submitting ? "جارٍ تسجيل الدخول…" : "دخول"}</button>
    </form>
  </div>;
}
