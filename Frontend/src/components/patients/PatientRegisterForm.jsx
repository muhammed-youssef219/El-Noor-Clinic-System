"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { registerPatient } from "../../services/patientsService";
import { login } from "../../services/authService";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export default function PatientRegisterForm({ onRegistered, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", dob: "", gender: "ذكر", phone: "", nationalId: "", address: "", blood: "O+", allergies: "", chronic: "", emergency: "" });
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const canSave = form.name.trim() && form.email && form.password.length >= 8 && form.dob && form.phone.trim() && consent && !saving;

  async function submit(event) {
    event.preventDefault();
    if (!canSave) return;
    setError(""); setSaving(true);
    try {
      await registerPatient({ ...form, consent });
      onRegistered(await login(form.email, form.password, "patient"), null);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return <div className="card" style={{ padding: 20 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><span style={{ fontWeight: 800, fontSize: 14 }}>تسجيل مريض جديد</span><button className="btn btn-ghost" onClick={onBack}>رجوع</button></div>
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div><label>الاسم الكامل *</label><input value={form.name} onChange={event => update("name", event.target.value)} /></div>
      <div className="split-grid" style={{ gap: 12 }}><div><label>البريد الإلكتروني *</label><input type="email" value={form.email} onChange={event => update("email", event.target.value)} autoComplete="email" /></div><div><label>كلمة المرور *</label><input type="password" value={form.password} onChange={event => update("password", event.target.value)} minLength="8" autoComplete="new-password" /></div></div>
      <div className="split-grid" style={{ gap: 12 }}><div><label>تاريخ الميلاد *</label><input type="date" value={form.dob} onChange={event => update("dob", event.target.value)} /></div><div><label>النوع</label><select value={form.gender} onChange={event => update("gender", event.target.value)}><option>ذكر</option><option>أنثى</option></select></div></div>
      <div className="split-grid" style={{ gap: 12 }}><div><label>رقم الهاتف *</label><input value={form.phone} onChange={event => update("phone", event.target.value)} /></div><div><label>الرقم القومي</label><input value={form.nationalId} onChange={event => update("nationalId", event.target.value)} /></div></div>
      <div><label>العنوان</label><input value={form.address} onChange={event => update("address", event.target.value)} /></div>
      <div className="split-grid" style={{ gap: 12 }}><div><label>فصيلة الدم</label><select value={form.blood} onChange={event => update("blood", event.target.value)}>{BLOOD_TYPES.map(type => <option key={type}>{type}</option>)}</select></div><div><label>جهة اتصال للطوارئ</label><input value={form.emergency} onChange={event => update("emergency", event.target.value)} /></div></div>
      <div className="split-grid" style={{ gap: 12 }}><div><label>الحساسية</label><input value={form.allergies} onChange={event => update("allergies", event.target.value)} /></div><div><label>الأمراض المزمنة</label><input value={form.chronic} onChange={event => update("chronic", event.target.value)} /></div></div>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontWeight: 400 }}><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} style={{ width: "auto", marginTop: 3 }} /><span>أوافق على <Link href="/privacy" target="_blank">سياسة الخصوصية</Link> وتخزين بياناتي لأغراض العلاج والحجز.</span></label>
      {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ alignSelf: "flex-start" }}><Check size={15} /> {saving ? "جارٍ التسجيل…" : "تسجيل ومتابعة الحجز"}</button>
    </form>
  </div>;
}
