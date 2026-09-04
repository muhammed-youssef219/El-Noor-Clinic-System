import { Stethoscope, Sparkles, Smile, Venus, Baby, Bone, Heart, Eye } from "lucide-react";
import { SPECIALTIES } from "../../data/specialties";
import { useDoctors } from "../../hooks/useDoctors";

const SPECIALTY_ICONS = {
  general: Stethoscope,
  dermatology: Sparkles,
  dental: Smile,
  obgyn: Venus,
  pediatrics: Baby,
  orthopedics: Bone,
  cardiology: Heart,
  ophthalmology: Eye,
};

export default function SpecialtiesSection() {
  const { data: doctors } = useDoctors();

  return (
    <section id="specialties" className="landing-section">
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px" }}>التخصصات الطبية</h2>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: 0 }}>تخصصات متنوعة تغطي احتياجاتك الطبية وأسرتك</p>
      </div>
      <div className="card-grid-4">
        {SPECIALTIES.map(s => {
          const Icon = SPECIALTY_ICONS[s.key] || Stethoscope;
          const doctorsCount = (doctors || []).filter(d => d.specialtyKey === s.key).length;
          return (
            <div key={s.id} className="card" style={{ padding: 18, textAlign: "center" }}>
              <div
                className="specialty-tag"
                data-specialty={s.key}
                style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}
              >
                <Icon size={20} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{doctorsCount} دكتور</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
