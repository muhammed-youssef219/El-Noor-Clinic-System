import { Building2 } from "lucide-react";

const LINKS = [
  { href: "#specialties", label: "التخصصات" },
  { href: "#doctors", label: "الدكاترة" },
  { href: "#services", label: "الخدمات" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

export default function LandingFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--card)", marginTop: 40 }}>
      <div className="landing-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 13.5 }}>عيادات النور التخصصية</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {LINKS.map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 12.5, color: "var(--ink-faint)", textDecoration: "none" }}>{l.label}</a>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--line-soft)", padding: "14px 28px", textAlign: "center", fontSize: 11.5, color: "var(--ink-faint)" }}>
        © {new Date().getFullYear()} عيادات النور التخصصية. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
