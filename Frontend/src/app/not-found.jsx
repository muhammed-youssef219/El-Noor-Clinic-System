import Link from "next/link";
import { Building2, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
      <div>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Building2 size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 900, margin: "0 0 8px", color: "var(--primary)" }}>404</h1>
        <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>الصفحة اللي بتدوّر عليها مش موجودة</p>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: "0 0 24px" }}>ممكن يكون الرابط اتغيّر أو الصفحة اتشالت.</p>
        <Link href="/" className="btn btn-primary">
          <Home size={15} /> الرجوع للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
