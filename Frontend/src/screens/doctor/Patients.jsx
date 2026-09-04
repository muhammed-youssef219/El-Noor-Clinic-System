import { useState } from "react";
import { Users, CalendarDays, TrendingUp } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import PatientDetailModal from "../../components/patients/PatientDetailModal";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { usePatients } from "../../hooks/usePatients";
import { useMedicalRecords } from "../../hooks/useMedicalRecords";
import { ageFromDob } from "../../lib/date";

export default function DoctorPatients() {
  const { doctorId } = useAuth();
  const [selected, setSelected] = useState(null);

  const { data: appointments, loading: apptsLoading } = useAppointments({ doctorId });
  const { data: allPatients, loading: patientsLoading } = usePatients();
  const { data: records, loading: recordsLoading } = useMedicalRecords({ doctorId });

  const loading = apptsLoading || patientsLoading || recordsLoading;
  const patientIds = [...new Set((appointments || []).map(a => a.patientId))];
  const myPatients = (allPatients || []).filter(p => patientIds.includes(p.id));

  function visitsCount(patientId) {
    return (appointments || []).filter(a => a.patientId === patientId).length;
  }
  function lastDiagnosis(patientId) {
    const mine = (records || []).filter(r => r.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
    return mine[0]?.diagnosis;
  }

  const totalVisits = (appointments || []).length;
  const avgVisits = myPatients.length ? (totalVisits / myPatients.length).toFixed(1) : 0;

  return (
    <div>
      <SectionHeader title="مرضاي" sub={loading ? "جاري التحميل…" : `${myPatients.length} مريض تابعوا معك من قبل`} />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={3} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 3, marginBottom: 20 }}>
          <StatCard icon={Users} label="إجمالي المرضى" value={myPatients.length} color="primary" />
          <StatCard icon={CalendarDays} label="إجمالي الزيارات" value={totalVisits} color="info" />
          <StatCard icon={TrendingUp} label="متوسط الزيارات لكل مريض" value={avgVisits} color="accent" />
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={4} cols={4} /></div>
      ) : myPatients.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد مرضى بعد" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 520 }}>
            <thead><tr><th>المريض</th><th>السن</th><th>عدد الزيارات</th><th>آخر تشخيص</th></tr></thead>
            <tbody>
              {myPatients.map(p => (
                <tr key={p.id} className="row-hover" onClick={() => setSelected(p)}>
                  <td style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={p.name} size={26} />{p.name}</td>
                  <td>{ageFromDob(p.dob)} سنة</td>
                  <td>{visitsCount(p.id)}</td>
                  <td style={{ color: "var(--ink-soft)" }}>{lastDiagnosis(p.id) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && <PatientDetailModal patient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
