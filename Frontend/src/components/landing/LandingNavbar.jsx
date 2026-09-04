import { useRouter } from "next/navigation";
import { Building2, LogIn, LayoutDashboard } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { NAV } from "../../lib/constants";

const LINKS = [
  { href: "#specialties", label: "التخصصات" },
  { href: "#doctors", label: "الدكاترة" },
  { href: "#services", label: "الخدمات" },
];

export default function LandingNavbar() {
  const router = useRouter();
  const { role, userLabel } = useAuth();
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar name={userLabel} size={28} />
              <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{userLabel}</span>
            </div>
            <button className="btn btn-primary" onClick={() => router.push(`/${role}/${NAV[role][0].id}`)}>
              <LayoutDashboard size={15} /> لوحة التحكم
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => router.push("/login")}>
            <LogIn size={15} /> دخول / حجز موعد
          </button>
        )}
      </div>
    </header>
  );
}
