import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Stethoscope,
  Star,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const HERO_IMAGE = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=85";

export default function HeroSection() {
  const router = useRouter();
  const { role } = useAuth();

  function handleBookingClick(e) {
    if (role === "patient") {
      router.push("/patient/book");
    } else {
      router.push("/login?role=patient&step=register");
    }
  }

  function handleDoctorsScroll(e) {
    e?.preventDefault();
    const el = document.getElementById("doctors");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("#doctors");
    }
  }

  return (
    <section className="landing-hero">
      {/* Right Column: Copy & Actions */}
      <div className="landing-hero-content">
        <h1 className="landing-hero-title">
          رعاية طبية متكاملة
          <span className="landing-hero-title-highlight">تُدار بكل عناية واحتراف</span>
        </h1>

        <p className="landing-hero-desc">
          نخبة من كبار الأطباء والاستشاريين في 8 تخصصات دقيقة. نوفر لك ولأسرتك كشفاً طبياً دقيقاً، مع نظام حجز ذكي يضمن لك موعداً مؤكداً دون فترات انتظار.
        </p>

        <div className="landing-hero-actions">
          <button
            className="btn btn-primary landing-hero-btn-primary"
            onClick={handleBookingClick}
          >
            <CalendarPlus size={18} />
            <span>احجز موعدك الآن</span>
          </button>
          <a
            href="#doctors"
            className="btn btn-outline landing-hero-btn-secondary"
            onClick={handleDoctorsScroll}
          >
            <Stethoscope size={18} />
            <span>تصفح الأطباء والاستشاريين</span>
          </a>
        </div>

        <div className="landing-hero-features">
          <div className="landing-hero-feature-item">
            <CheckCircle2 size={16} color="var(--primary)" />
            <span>كشف بموعد محدد ودقيق</span>
          </div>
          <div className="landing-hero-feature-item">
            <ShieldCheck size={16} color="var(--primary)" />
            <span>استشاريون معتمدون ومرخصون</span>
          </div>
          <div className="landing-hero-feature-item">
            <Clock size={16} color="var(--primary)" />
            <span>تأكيد فوري للحجز إلكترونياً</span>
          </div>
        </div>

        <div className="landing-hero-stats">
          <div className="landing-hero-stat-item">
            <div className="landing-hero-stat-number">+15</div>
            <div className="landing-hero-stat-label">طبيب واستشاري متخصص</div>
          </div>
          <div className="landing-hero-stat-item">
            <div className="landing-hero-stat-number">+12,000</div>
            <div className="landing-hero-stat-label">كشف واستشارة ناجحة</div>
          </div>
          <div className="landing-hero-stat-item">
            <div className="landing-hero-stat-number">4.9 / 5</div>
            <div className="landing-hero-stat-label">تقييم رضا المرضى</div>
          </div>
        </div>
      </div>

      {/* Left Column: Authentic Medical Visual with Floating Badges */}
      <div className="landing-hero-visual-col">
        <div className="landing-hero-visual-frame">
          <div className="landing-hero-visual-card">
            <img
              src={HERO_IMAGE}
              alt="طبيب استشاري في عيادات النور التخصصية"
              loading="eager"
              className="landing-hero-img"
            />
          </div>





        </div>
      </div>
    </section>
  );
}

