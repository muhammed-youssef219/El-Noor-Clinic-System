import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CalendarDays, Plus } from "lucide-react";
import Avatar from "../ui/Avatar";
import SpecialtyTag from "../ui/SpecialtyTag";
import { SkeletonCards } from "../ui/Skeleton";
import { useDoctors } from "../../hooks/useDoctors";
import { useAuth } from "../../context/AuthContext";
import { SPECIALTIES, specialtyByKey } from "../../data/specialties";

export default function DoctorsSection() {
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const router = useRouter();
  const { role } = useAuth();
  const { data: doctors, loading } = useDoctors();
  const list = filterSpecialty ? (doctors || []).filter(d => d.specialtyKey === filterSpecialty) : (doctors || []);

  function handleBook(doctorId) {
    if (role === "patient") router.push(`/patient/book?doctorId=${doctorId}`);
    else router.push("/login");
  }

  if (loading) {
    return (
      <section id="doctors" className="landing-section">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px" }}>الدكاترة</h2>
          <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: 0 }}>نخبة من الأطباء المتخصصين في خدمتك</p>
        </div>
        <SkeletonCards count={3} />
      </section>
    );
  }

  return (
    <section id="doctors" className="landing-section">
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px" }}>الدكاترة</h2>
        <p style={{ color: "var(--ink-faint)", fontSize: 13.5, margin: 0 }}>نخبة من الأطباء المتخصصين في خدمتك</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <button className={!filterSpecialty ? "btn btn-primary" : "btn btn-outline"} onClick={() => setFilterSpecialty("")}>الكل</button>
        {SPECIALTIES.map(s => (
          <button key={s.id} className={filterSpecialty === s.key ? "btn btn-primary" : "btn btn-outline"} onClick={() => setFilterSpecialty(s.key)}>{s.name}</button>
        ))}
      </div>
      <div className="card-grid-3">
        {list.map(d => {
          const spec = specialtyByKey(d.specialtyKey);
          return (
            <div key={d.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar name={d.name} src={d.photo} size={40} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{d.name}</div>
                  <SpecialtyTag specialtyKey={d.specialtyKey} name={spec?.name} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 6 }}>
                <Star size={12} fill="var(--gold)" color="var(--gold)" style={{ verticalAlign: -2 }} /> {d.rating} · كشف {d.price} ج.م
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 11.5, color: "var(--ink-faint)", marginBottom: 12, lineHeight: 1.6 }}>
                <CalendarDays size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>{Object.keys(d.schedule).join("، ")}</span>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleBook(d.id)}>
                <Plus size={14} /> احجز مع الدكتور
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
