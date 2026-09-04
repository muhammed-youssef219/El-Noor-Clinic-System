import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1758448500688-3ababa93fd67?fm=jpg&q=90&w=2800&auto=format&fit=crop";

export default function HeroSection() {
  const router = useRouter();
  const { role } = useAuth();
  const bookingTarget = role === "patient" ? "/patient/book" : "/login";
  return (
    <section className="landing-hero">
      <div className="card landing-hero-visual" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
        <img
          src={HERO_IMAGE}
          alt="استقبال عيادة طبية حديثة"
          loading="eager"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span className="badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>عيادة متعددة التخصصات</span>
        </div>
        <h1 className="landing-hero-title" style={{ fontWeight: 900, margin: "0 0 14px", lineHeight: 1.3 }}>عيادات النور التخصصية</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.9, margin: "0 0 24px", maxWidth: 480 }}>
          نقدّم رعاية طبية متكاملة في تخصصات متعددة، مع نظام حجز إلكتروني سهل يوصلك بالدكتور المناسب في الوقت المناسب.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ padding: "11px 20px" }} onClick={() => router.push(bookingTarget)}>
            <CalendarPlus size={16} /> احجز موعدك الآن
          </button>
          <a href="#doctors" className="btn btn-outline" style={{ padding: "11px 20px" }}>تصفح الدكاترة</a>
        </div>
      </div>
    </section>
  );
}
