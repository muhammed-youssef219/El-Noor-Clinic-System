import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Star, CheckCircle2, CalendarDays } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import Avatar from "../../components/ui/Avatar";
import SpecialtyTag from "../../components/ui/SpecialtyTag";
import Modal from "../../components/ui/Modal";
import { SkeletonCards } from "../../components/ui/Skeleton";
import BookingModal from "../../components/booking/BookingModal";
import { useDoctors } from "../../hooks/useDoctors";
import { SPECIALTIES, specialtyByKey } from "../../data/specialties";
import { useAuth } from "../../context/AuthContext";

export default function PatientBook() {
  const [modal, setModal] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [booked, setBooked] = useState(false);
  const { patientId } = useAuth();
  const { data: doctors, loading } = useDoctors();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Coming straight from registration (or a landing-page doctor card) with a
  // doctor already picked there — open the booking modal for them instead of
  // making them search again.
  useEffect(() => {
    const presetDoctorId = searchParams.get("doctorId");
    if (presetDoctorId) {
      setModal(presetDoctorId);
      router.replace("/patient/book");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = (doctors || []).filter(d => !filterSpecialty || d.specialtyKey === filterSpecialty);

  return (
    <div>
      <SectionHeader title="حجز موعد جديد" sub="اختر التخصص والدكتور المناسب" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button className={!filterSpecialty ? "btn btn-primary" : "btn btn-outline"} onClick={() => setFilterSpecialty("")}>الكل</button>
        {SPECIALTIES.map(s => (
          <button key={s.id} className={filterSpecialty === s.key ? "btn btn-primary" : "btn btn-outline"} onClick={() => setFilterSpecialty(s.key)}>{s.name}</button>
        ))}
      </div>
      {loading ? (
        <SkeletonCards count={6} />
      ) : (
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
                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal(d.id)}>
                  <Plus size={14} /> احجز الآن
                </button>
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <BookingModal
          forPatientId={patientId}
          presetDoctorId={modal}
          actor="مريض"
          onClose={() => setModal(false)}
          onBooked={() => { setModal(false); setBooked(true); }}
        />
      )}
      {booked && (
        <Modal title="تم الحجز" onClose={() => setBooked(false)}>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 800, marginBottom: 6 }}>تم حجز موعدك بنجاح</div>
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>ستصلك رسالة تذكير قبل الموعد بيوم واحد.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
