import { useState } from "react";
import { Plus, Star, Stethoscope, Layers, Clock, Trash2, Pencil, AlertTriangle, X as XIcon } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import Avatar from "../../components/ui/Avatar";
import SpecialtyTag from "../../components/ui/SpecialtyTag";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { SkeletonCards, SkeletonRows } from "../../components/ui/Skeleton";
import AddDoctorModal from "../../components/doctors/AddDoctorModal";
import EditDoctorModal from "../../components/doctors/EditDoctorModal";
import { useDoctors } from "../../hooks/useDoctors";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../context/AuthContext";
import { deleteDoctor } from "../../services/doctorsService";
import { specialtyByKey } from "../../data/specialties";
import { SPECIALTIES } from "../../data/specialties";
import { DEFAULT_DOCTOR_PASSWORD } from "../../data/doctors";

export default function AdminDoctors() {
  const { userLabel } = useAuth();
  const { data: doctors, loading, reload } = useDoctors();
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  const specialtiesCovered = loading ? 0 : new Set(doctors.map(d => d.specialtyKey)).size;
  const avgRating = loading || doctors.length === 0 ? 0 : (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1);
  const avgExp = loading || doctors.length === 0 ? 0 : Math.round(doctors.reduce((s, d) => s + d.exp, 0) / doctors.length);

  function handleCreated(doctor) {
    setAddOpen(false);
    reload();
    setJustAdded(doctor);
  }

  function handleDeleted() {
    setSelected(null);
    reload();
  }

  return (
    <div>
      <SectionHeader
        title="الدكاترة"
        sub={loading ? "جاري التحميل…" : `${doctors.length} دكاترة عبر ${SPECIALTIES.length} تخصصات`}
        action={<button className="btn btn-primary" onClick={() => setAddOpen(true)}><Plus size={15} /> إضافة دكتور</button>}
      />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Stethoscope} label="إجمالي الدكاترة" value={doctors.length} color="primary" />
          <StatCard icon={Layers} label="التخصصات المغطاة" value={specialtiesCovered} sub={`من ${SPECIALTIES.length} تخصص`} color="info" />
          <StatCard icon={Star} label="متوسط التقييم" value={avgRating} color="gold" />
          <StatCard icon={Clock} label="متوسط سنوات الخبرة" value={avgExp} color="accent" />
        </div>
      )}
      {loading ? (
        <SkeletonCards count={6} />
      ) : (
        <div className="card-grid-3">
          {doctors.map(d => {
            const spec = specialtyByKey(d.specialtyKey);
            return (
              <div key={d.id} className="card" style={{ padding: 18, cursor: "pointer" }} onClick={() => setSelected(d)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar name={d.name} src={d.photo} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{d.name}</div>
                    <SpecialtyTag specialtyKey={d.specialtyKey} name={spec?.name} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink-faint)", marginBottom: 6 }}>
                  <Star size={13} fill="var(--gold)" color="var(--gold)" /> {d.rating} · {d.exp} سنة خبرة
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>سعر الكشف: <span className="mono" style={{ fontWeight: 700 }}>{d.price} ج.م</span></div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <DoctorDetailModal doctor={selected} actor={userLabel} onClose={() => setSelected(null)} onDeleted={handleDeleted} onReload={reload} />
      )}

      {addOpen && (
        <AddDoctorModal actor={userLabel} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
      )}

      {justAdded && (
        <Modal title="تمت إضافة الدكتور" onClose={() => setJustAdded(null)}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8 }}>
            <div style={{ marginBottom: 10 }}>تم إضافة <strong>{justAdded.name}</strong> بنجاح. بيانات الدخول الخاصة به:</div>
            <div style={{ background: "var(--card-2)", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
              <div>البريد الإلكتروني: <span className="mono" style={{ fontWeight: 700 }}>{justAdded.email}</span></div>
              <div>كلمة المرور الافتراضية: <span className="mono" style={{ fontWeight: 700 }}>{DEFAULT_DOCTOR_PASSWORD}</span></div>
            </div>
            <div style={{ color: "var(--ink-faint)", fontSize: 12 }}>يقدر يغيّرها بنفسه من صفحة "بياناتي الشخصية" بعد أول دخول.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DoctorDetailModal({ doctor, actor, onClose, onDeleted, onReload }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const { data: appointments } = useAppointments({ doctorId: doctor.id });
  const spec = specialtyByKey(doctor.specialtyKey);

  async function handleDelete() {
    setDeleting(true);
    await deleteDoctor(doctor.id, actor);
    setDeleting(false);
    onDeleted();
  }

  if (editing) {
    return (
      <EditDoctorModal
        doctor={doctor}
        actor={actor}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); onReload(); onClose(); }}
      />
    );
  }

  return (
    <Modal title={doctor.name} onClose={onClose} width={520}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar name={doctor.name} src={doctor.photo} size={54} />
        <div>
          <SpecialtyTag specialtyKey={doctor.specialtyKey} name={spec?.name} />
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 6 }}>رقم النقابة: <span className="mono">{doctor.license}</span> · {doctor.exp} سنة خبرة</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 2 }}>بريد الدخول: <span className="mono">{doctor.email}</span></div>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>{doctor.bio}</p>
      <div className="split-grid" style={{ margin: "14px 0" }}>
        <div className="card" style={{ padding: 12, background: "var(--card-2)" }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 700 }}>سعر الكشف الجديد</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{doctor.price} ج.م</div>
        </div>
        <div className="card" style={{ padding: 12, background: "var(--card-2)" }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontWeight: 700 }}>سعر المتابعة</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{doctor.followUp} ج.م</div>
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>جدول العمل الأسبوعي</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
        {Object.entries(doctor.schedule).map(([day, [from, to]]) => (
          <div key={day} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 10px", background: "var(--card-2)", borderRadius: 8 }}>
            <span style={{ fontWeight: 700 }}>{day}</span>
            <span className="mono" style={{ color: "var(--ink-soft)" }}>{from} - {to}</span>
          </div>
        ))}
      </div>

      {!confirming ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            <Pencil size={14} /> تعديل البيانات
          </button>
          <button className="btn btn-outline" style={{ color: "var(--danger)" }} onClick={() => setConfirming(true)}>
            <Trash2 size={14} /> حذف الدكتور
          </button>
        </div>
      ) : (
        <div style={{ background: "var(--danger-soft)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: "var(--danger)" }}>
              متأكد إنك عايز تحذف <strong>{doctor.name}</strong>؟ ده إجراء لا يمكن التراجع عنه.
              {appointments?.length > 0 && ` (${appointments.length} موعد مرتبط به هيفضل مسجل في السجل من غير دكتور مرتبط).`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ background: "var(--danger)" }} disabled={deleting} onClick={handleDelete}>
              <Trash2 size={14} /> {deleting ? "جاري الحذف…" : "تأكيد الحذف"}
            </button>
            <button className="btn btn-outline" onClick={() => setConfirming(false)}><XIcon size={14} /> إلغاء</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
