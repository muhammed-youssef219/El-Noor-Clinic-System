import { useRouter } from "next/navigation";
import { Building2, LogIn, UserPlus, LayoutDashboard, Calendar, LogOut } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { NAV } from "../../lib/constants";

const LINKS = [
  { href: "#specialties", label: "التخصصات" },
  { href: "#doctors", label: "الدكاترة" },
  { href: "#services", label: "الخدمات والأسعار" },
];

export default function LandingNavbar() {
  const router = useRouter();
  const { role, userLabel, logout } = useAuth();
  const isLoggedIn = Boolean(role);

  return (
    <header
      className="landing-navbar"
      style={{
        position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--line)", background: "var(--card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: 900, fontSize: 16, whiteSpace: "nowrap" }}>عيادات النور التخصصية</span>
      </div>

      <nav className="landing-nav-links">
        {LINKS.map(l => (
          <a key={l.href} href={l.href} style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", textDecoration: "none" }}>
            {l.label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle />
        {isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginInlineEnd: 4 }}>
              <Avatar name={userLabel} size={28} />
              <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{userLabel}</span>
            </div>
            {role === "patient" ? (
              <button
                className="btn btn-primary"
                onClick={() => router.push("/patient/appointments")}
                style={{ fontSize: 13, padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Calendar size={14} /> مواعيدي وحسابي
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => router.push(`/${role}/${NAV[role][0].id}`)}
                style={{ fontSize: 13, padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <LayoutDashboard size={14} /> لوحة التحكم
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={logout}
              title="تسجيل الخروج"
              style={{ padding: "7px 10px", color: "var(--ink-faint)" }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="btn btn-outline"
              onClick={() => router.push("/login?role=patient")}
              style={{ fontSize: 13, padding: "7px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <LogIn size={14} /> تسجيل الدخول
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/login?role=patient&step=register")}
              style={{ fontSize: 13, padding: "7px 14px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <UserPlus size={14} /> إنشاء حساب جديد
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

