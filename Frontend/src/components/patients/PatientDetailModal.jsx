import { useState } from "react";
import { Phone, MapPin, ShieldAlert, Droplet, Pencil, Trash2, X as XIcon, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { SkeletonRows } from "../ui/Skeleton";
import PatientFormModal from "./PatientFormModal";
import { useMedicalRecords } from "../../hooks/useMedicalRecords";
import { useAppointments } from "../../hooks/useAppointments";
import { useInvoices } from "../../hooks/useInvoices";
import { useDoctors } from "../../hooks/useDoctors";
import { useAuth } from "../../context/AuthContext";
import { deletePatient } from "../../services/patientsService";
import { ageFromDob, fmtDate } from "../../lib/date";

export default function PatientDetailModal({ patient, actor, onClose, onChanged, onDeleted }) {
  const { role } = useAuth();
  const canViewRecords = role === "admin" || role === "doctor";
  const { data: records, loading: recordsLoading } = useMedicalRecords({ patientId: patient.id });
  const { data: appts, loading: apptsLoading } = useAppointments({ patientId: patient.id });
  const { data: invoices, loading: invoicesLoading } = useInvoices({ patientId: patient.id });
  const { data: doctors } = useDoctors();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function doctorName(id) {
    return doctors?.find(d => d.id === id)?.name || "";
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePatient(patient.id, actor);
      onDeleted();
    } catch {
      setDeleteError("حدث خطأ أثناء حذف المريض، حاول مرة أخرى");
    } finally {
      setDeleting(false);
    }
  }

  const sortedAppts = appts ? [...appts].sort((a, b) => b.date.localeCompare(a.date)) : [];

  if (editing) {
    return (
      <PatientFormModal
        patient={patient}
        actor={actor}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); onChanged(); onClose(); }}
      />
    );
  }

  return (
    <Modal title="ملف المريض" onClose={onClose} width={620}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar name={patient.name} size={54} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{patient.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{ageFromDob(patient.dob)} سنة · {patient.gender} · فصيلة {patient.blood}</div>
        </div>
      </div>
      <div className="split-grid" style={{ gap: 10, marginBottom: 16, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}><Phone size={13} />{patient.phone}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}><MapPin size={13} />{patient.address}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--danger)" }}><ShieldAlert size={13} />حساسية: {patient.allergies}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-soft)" }}><Droplet size={13} />أمراض مزمنة: {patient.chronic}</div>
      </div>

      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>سجل الزيارات</div>
      {!canViewRecords ? (
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 14 }}>تفاصيل الكشف الطبي مقصورة على الأدمن والدكتور المعالج.</div>
      ) : recordsLoading ? <SkeletonRows rows={1} cols={2} /> : records.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 14 }}>لا توجد كشوفات سابقة مسجلة.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {records.map(r => (
            <div key={r.id} className="card" style={{ padding: 12, background: "var(--card-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
                <span>{fmtDate(r.date)}</span>
                <span>{doctorName(r.doctorId)}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.diagnosis}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>الشكوى: {r.complaint}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>المواعيد ({apptsLoading ? "…" : sortedAppts.length})</div>
      {apptsLoading ? <SkeletonRows rows={2} cols={2} /> : sortedAppts.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 16 }}>لا توجد مواعيد مسجلة.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {sortedAppts.slice(0, 4).map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 10px", background: "var(--card-2)", borderRadius: 8 }}>
              <span>{fmtDate(a.date)} · {a.time} · {doctorName(a.doctorId)}</span>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      )}

      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>الفواتير</div>
      {invoicesLoading ? <SkeletonRows rows={1} cols={2} /> : invoices.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>لا توجد فواتير.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {invoices.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 10px", background: "var(--card-2)", borderRadius: 8 }}>
              <span className="mono">{i.total} ج.م — {i.method}</span>
              <Badge status={i.status} />
            </div>
          ))}
        </div>
      )}

      {onDeleted && (
        !confirming ? (
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <button className="btn btn-outline" onClick={() => setEditing(true)}>
              <Pencil size={14} /> تعديل البيانات
            </button>
            <button className="btn btn-outline" style={{ color: "var(--danger)" }} onClick={() => setConfirming(true)}>
              <Trash2 size={14} /> حذف المريض
            </button>
          </div>
        ) : (
          <div style={{ background: "var(--danger-soft)", borderRadius: 10, padding: "12px 14px", marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: "var(--danger)" }}>
                متأكد إنك عايز تحذف <strong>{patient.name}</strong>؟ ده إجراء لا يمكن التراجع عنه.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ background: "var(--danger)" }} disabled={deleting} onClick={handleDelete}>
                <Trash2 size={14} /> {deleting ? "جاري الحذف…" : "تأكيد الحذف"}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirming(false)}><XIcon size={14} /> إلغاء</button>
            </div>
            {deleteError && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 8 }}>{deleteError}</div>}
          </div>
        )
      )}
    </Modal>
  );
}
