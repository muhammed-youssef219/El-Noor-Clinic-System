"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, UserRound, Stethoscope, Users, Building2, UserPlus, LogIn, Info, Home } from "lucide-react";
import { NAV } from "../lib/constants";
import PatientRegisterForm from "../components/patients/PatientRegisterForm";
import DoctorLoginForm from "../components/auth/DoctorLoginForm";
import StaffLoginForm from "../components/auth/StaffLoginForm";
import { useAuth } from "../context/AuthContext";
import { login as loginRequest } from "../services/authService";
import ThemeToggle from "../components/ui/ThemeToggle";
import LoginBackground from "../components/auth/LoginBackground";

const ROLES = [
  { id: "admin", label: "أدمن / صاحب العيادة", icon: SlidersHorizontal, desc: "إدارة مالية، تقارير، إعدادات" },
  { id: "reception", label: "الاستقبال", icon: UserRound, desc: "حجز المواعيد وإدارة المرضى" },
  { id: "doctor", label: "دكتور", icon: Stethoscope, desc: "جدول الكشف وملفات المرضى" },
  { id: "patient", label: "مريض", icon: Users, desc: "حجز المواعيد ومتابعة ملفي الطبي" },
];

export default function LoginScreen() {
  const [step, setStep] = useState("role");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const idleLogout = useSearchParams().get("reason") === "idle";

  function handleLogin(user) {
    login(user);
    router.replace(`/${user.role}/${NAV[user.role][0].id}`);
  }

  async function handlePatientLogin(event) {
    event.preventDefault();
    if (!patientEmail || !patientPassword || submitting) return;
    setError(""); setSubmitting(true);
    try { handleLogin(await loginRequest(patientEmail, patientPassword, "patient")); }
    catch (requestError) { setError(requestError.message); setSubmitting(false); }
  }

  return <div className="login-shell" style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
    <LoginBackground />
    <div style={{ position: "absolute", top: 20, left: 20, zIndex: 1, display: "flex", gap: 8 }}><Link href="/" className="btn btn-outline"><Home size={14} /> الصفحة الرئيسية</Link><ThemeToggle /></div>
    <div style={{ width: "100%", maxWidth: 640, position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}><div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Building2 size={28} color="#fff" /></div><h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>عيادات النور التخصصية</h1></div>
      {idleLogout && <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--info-soft)", color: "var(--info)", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, marginBottom: 20 }}><Info size={15} /> تم تسجيل خروجك لعدم النشاط. سجّل الدخول مرة أخرى.</div>}
      {step === "role" && <div className="role-grid">{ROLES.map(role => <button key={role.id} className="card" onClick={() => setStep(`${role.id}-login`)} style={{ textAlign: "right", padding: 20, cursor: "pointer", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10, background: "var(--card)" }}><div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><role.icon size={19} color="var(--primary)" /></div><div><div style={{ fontWeight: 800, fontSize: 17 }}>{role.label}</div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-soft)", marginTop: 4 }}>{role.desc}</div></div></button>)}</div>}
      {step === "doctor-login" && <DoctorLoginForm onBack={() => setStep("role")} onSuccess={handleLogin} />}
      {["admin-login", "reception-login"].includes(step) && <StaffLoginForm role={step.replace("-login", "")} onBack={() => setStep("role")} onSuccess={handleLogin} />}
      {step === "patient-login" && <div className="card" style={{ padding: 20 }}><button className="btn btn-ghost" onClick={() => setStep("patient-register")}><UserPlus size={14} /> مريض جديد</button><form onSubmit={handlePatientLogin} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}><input type="email" value={patientEmail} onChange={event => setPatientEmail(event.target.value)} placeholder="البريد الإلكتروني" autoComplete="email" /><input type="password" value={patientPassword} onChange={event => setPatientPassword(event.target.value)} placeholder="كلمة المرور" autoComplete="current-password" />{error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}<button className="btn btn-primary" type="submit" disabled={submitting}><LogIn size={15} /> {submitting ? "جارٍ تسجيل الدخول…" : "دخول"}</button></form></div>}
      {step === "patient-register" && <PatientRegisterForm onBack={() => setStep("patient-login")} onRegistered={(user, doctorId) => { login(user); router.replace(doctorId ? `/patient/book?doctorId=${doctorId}` : "/patient/book"); }} />}
    </div>
  </div>;
}
