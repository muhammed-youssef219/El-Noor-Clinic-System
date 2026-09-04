import { FileText, Pill, Stethoscope, ClipboardList, Printer } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import PrescriptionPrintSheet from "../../components/print/PrescriptionPrintSheet";
import { usePatients } from "../../hooks/usePatients";
import { useMedicalRecords } from "../../hooks/useMedicalRecords";
import { useDoctors } from "../../hooks/useDoctors";
import { useAuth } from "../../context/AuthContext";
import { usePrint } from "../../hooks/usePrint";
import { specialtyByKey } from "../../data/specialties";
import { fmtDate } from "../../lib/date";

export default function PatientFile() {
  const { patientId } = useAuth();
  const { data: patients, loading: patientLoading } = usePatients();
  const { data: records, loading: recordsLoading } = useMedicalRecords({ patientId });
  const { data: doctors } = useDoctors();
  const [printRecord, setPrintRecord] = usePrint();

  const patient = (patients || []).find(p => p.id === patientId);
  const loading = patientLoading || recordsLoading;

  function doctorOf(id) {
    return (doctors || []).find(d => d.id === id);
  }

  return (
    <div>
      <SectionHeader title="ملفي الطبي" sub="بياناتي وتاريخي المرضي" />
      {patientLoading || !patient ? (
        <div className="card" style={{ marginBottom: 18, maxWidth: 560 }}><SkeletonRows rows={2} cols={2} /></div>
      ) : (
        <div className="card" style={{ padding: 18, marginBottom: 18, maxWidth: 560 }}>
          <div className="split-grid" style={{ gap: 12, fontSize: 13.5 }}>
            <div><span style={{ color: "var(--ink-faint)" }}>فصيلة الدم:</span> <strong className="mono">{patient.blood}</strong></div>
            <div><span style={{ color: "var(--ink-faint)" }}>الحساسية:</span> <strong>{patient.allergies}</strong></div>
            <div><span style={{ color: "var(--ink-faint)" }}>الأمراض المزمنة:</span> <strong>{patient.chronic}</strong></div>
            <div><span style={{ color: "var(--ink-faint)" }}>جهة الطوارئ:</span> <strong>{patient.emergency}</strong></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ marginBottom: 14, maxWidth: 560 }}><SkeletonRows rows={1} cols={3} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 3, marginBottom: 20, maxWidth: 560 }}>
          <StatCard icon={ClipboardList} label="عدد الكشوفات" value={records.length} color="primary" />
          <StatCard icon={Pill} label="أدوية موصوفة" value={records.reduce((s, r) => s + (r.medications?.length || 0), 0)} color="accent" />
          <StatCard icon={Stethoscope} label="أطباء تابعوا الحالة" value={new Set(records.map(r => r.doctorId)).size} color="info" />
        </div>
      )}

      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>سجل الكشوفات والروشتات</div>
      {loading ? (
        <div className="card"><SkeletonRows rows={2} cols={2} /></div>
      ) : records.length === 0 ? (
        <EmptyState icon={FileText} title="لا يوجد كشوفات مسجلة بعد" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {records.map(r => {
            const doc = doctorOf(r.doctorId);
            const spec = doc ? specialtyByKey(doc.specialtyKey) : null;
            return (
              <div key={r.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5 }}>{r.diagnosis}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{fmtDate(r.date)}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>{doc?.name} — {spec?.name}</div>
                {r.medications?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {r.medications.map((m, i) => (
                      <span key={i} className="badge" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                        <Pill size={11} /> {m.name} {m.dose}
                      </span>
                    ))}
                  </div>
                )}
                <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setPrintRecord(r)}>
                  <Printer size={13} /> طباعة الروشتة
                </button>
              </div>
            );
          })}
        </div>
      )}
      <PrescriptionPrintSheet record={printRecord} patient={patient} doctor={printRecord ? doctorOf(printRecord.doctorId) : null} />
    </div>
  );
}
