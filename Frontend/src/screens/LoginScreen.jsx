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
  const searchParams = useSearchParams();
  const idleLogout = searchParams.get("reason") === "idle";
  const initialRole = searchParams.get("role");
  const doctorIdParam = searchParams.get("doctorId");
  const stepParam = searchParams.get("step");

  const [step, setStep] = useState(
    stepParam === "register"
      ? "patient-register"
      : initialRole === "patient" || doctorIdParam
      ? "patient-login"
      : "role"
  );
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  function handleLogin(user) {
    login(user);
    if (user.role === "patient" && doctorIdParam) {
      router.replace(`/patient/book?doctorId=${doctorIdParam}`);
    } else {
      router.replace(`/${user.role}/${NAV[user.role][0].id}`);
    }
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
      {step === "patient-login" && <div className="card" style={{ padding: 20 }}>
        {doctorIdParam && (
          <div style={{ background: "var(--primary-soft)", color: "var(--primary)", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Info size={16} />
            سجّل دخولك أو أنشئ حساباً لإتمام حجز كشفك
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>تسجيل دخول مريض</span>
          <button className="btn btn-ghost" onClick={() => setStep("patient-register")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}>
            <UserPlus size={14} /> مريض جديد؟ إنشاء حساب
          </button>
        </div>
        <form onSubmit={handlePatientLogin} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <input type="email" value={patientEmail} onChange={event => setPatientEmail(event.target.value)} placeholder="البريد الإلكتروني" autoComplete="email" />
          <input type="password" value={patientPassword} onChange={event => setPatientPassword(event.target.value)} placeholder="كلمة المرور" autoComplete="current-password" />
          {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={submitting}><LogIn size={15} /> {submitting ? "جارٍ تسجيل الدخول…" : "دخول ومتابعة الحجز"}</button>
        </form>
      </div>}
      {step === "patient-register" && (
        <div>
          {doctorIdParam && (
            <div style={{ background: "var(--primary-soft)", color: "var(--primary)", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={16} />
              أنشئ حسابك لإتمام حجز موعدك الطبي مع الطبيب المختار
            </div>
          )}
          <PatientRegisterForm
            onBack={() => setStep("patient-login")}
            onRegistered={(user, registeredDocId) => {
              login(user);
              const targetDoc = registeredDocId || doctorIdParam;
              router.replace(targetDoc ? `/patient/book?doctorId=${targetDoc}` : "/patient/book");
            }}
          />
        </div>
      )}
    </div>
  </div>;
}
