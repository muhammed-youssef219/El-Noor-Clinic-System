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
  const bookingTarget = role === "patient" ? "/patient/book" : "/login";

  return (
    <section className="landing-hero">
      {/* Right Column: Copy & Actions */}
      <div className="landing-hero-content">
        <div className="landing-hero-status-pill">
          <span className="live-dot" />
          <span>مواعيد الأسبوع الحالي متاحة الآن للحجز الفوري</span>
        </div>

        <h1 className="landing-hero-title">
          رعاية طبية متكاملة..
          <span className="landing-hero-title-highlight">تُدار بكل عناية واحتراف</span>
        </h1>

        <p className="landing-hero-desc">
          نخبة من كبار الأطباء والاستشاريين في 8 تخصصات دقيقة. نوفر لك ولأسرتك كشفاً طبياً دقيقاً، مع نظام حجز ذكي يضمن لك موعداً مؤكداً دون فترات انتظار.
        </p>

        <div className="landing-hero-actions">
          <button
            className="btn btn-primary landing-hero-btn-primary"
            onClick={() => router.push(bookingTarget)}
          >
            <CalendarPlus size={18} />
            <span>احجز موعدك الآن</span>
          </button>
          <a href="#doctors" className="btn btn-outline landing-hero-btn-secondary">
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

          {/* Floating Card 1: Verified Patient Rating */}
          <div className="landing-hero-floating-card floating-rating">
            <div className="floating-rating-stars">
              <Star size={14} fill="#b8862f" color="#b8862f" />
              <Star size={14} fill="#b8862f" color="#b8862f" />
              <Star size={14} fill="#b8862f" color="#b8862f" />
              <Star size={14} fill="#b8862f" color="#b8862f" />
              <Star size={14} fill="#b8862f" color="#b8862f" />
              <span className="floating-rating-score">4.9</span>
            </div>
            <div className="floating-rating-text">أكثر من 1,200 تقييم معتمد</div>
          </div>

          {/* Floating Card 2: Confirmed Booking Toast */}
          <div className="landing-hero-floating-card floating-appointment">
            <div className="floating-appt-icon">
              <CheckCircle2 size={20} color="var(--success)" />
            </div>
            <div className="floating-appt-info">
              <div className="floating-appt-status">تم تأكيد الحجز بنجاح</div>
              <div className="floating-appt-doctor">د. نورا خالد • استشاري قلب</div>
              <div className="floating-appt-time">اليوم • 05:30 مساءً</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

