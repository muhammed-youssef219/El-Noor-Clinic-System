import { useState } from "react";
import { Search, Users, UserPlus, UserRoundPlus, UserRound, Download } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import EmptyState from "../ui/EmptyState";
import Avatar from "../ui/Avatar";
import StatCard from "../ui/StatCard";
import { SkeletonRows } from "../ui/Skeleton";
import PatientDetailModal from "./PatientDetailModal";
import PatientFormModal from "./PatientFormModal";
import { usePatients } from "../../hooks/usePatients";
import { useAuth } from "../../context/AuthContext";
import { exportToCsv } from "../../lib/csv";
import { ageFromDob, fmtDate, todayISO } from "../../lib/date";

export default function PatientsListView() {
  const { userLabel } = useAuth();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const { data: patients, loading, reload } = usePatients(query);
  const { data: allPatients, loading: allLoading, reload: reloadAll } = usePatients();

  function handleSaved() {
    setAddOpen(false);
    reload();
    reloadAll();
  }

  const now = new Date();
  const newThisMonth = allLoading ? 0 : allPatients.filter(p => {
    const d = new Date(p.firstVisit);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const maleCount = allLoading ? 0 : allPatients.filter(p => p.gender === "ذكر").length;
  const femaleCount = allLoading ? 0 : allPatients.filter(p => p.gender === "أنثى").length;

  function handleExport() {
    exportToCsv(
      `المرضى-${todayISO(0)}.csv`,
      ["الاسم", "السن", "النوع", "التليفون", "فصيلة الدم", "الحساسية", "الأمراض المزمنة", "أول زيارة"],
      patients.map(p => [p.name, ageFromDob(p.dob), p.gender, p.phone, p.blood, p.allergies, p.chronic, fmtDate(p.firstVisit)])
    );
  }

  return (
    <div>
      <SectionHeader
        title="المرضى"
        sub={loading ? "جاري التحميل…" : `${patients.length} مريض مسجل`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            {!loading && patients.length > 0 && <button className="btn btn-outline" onClick={handleExport}><Download size={15} /> تصدير CSV</button>}
            <button className="btn btn-primary" onClick={() => setAddOpen(true)}><UserPlus size={15} /> تسجيل مريض جديد</button>
          </div>
        }
      />
      {allLoading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Users} label="إجمالي المرضى" value={allPatients.length} color="primary" />
          <StatCard icon={UserRoundPlus} label="مرضى جدد هذا الشهر" value={newThisMonth} color="accent" />
          <StatCard icon={UserRound} label="ذكور" value={maleCount} color="info" />
          <StatCard icon={UserRound} label="إناث" value={femaleCount} color="gold" />
        </div>
      )}
      <div style={{ position: "relative", maxWidth: 340, marginBottom: 16 }}>
        <Search size={15} style={{ position: "absolute", right: 12, top: 11, color: "var(--ink-faint)" }} />
        <input placeholder="ابحث بالاسم، التليفون، أو الرقم القومي" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingRight: 34 }} />
      </div>
      {loading ? (
        <div className="card"><SkeletonRows rows={5} cols={5} /></div>
      ) : patients.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد مرضى مطابقين" sub="جرّب كلمة بحث مختلفة" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 560 }}>
            <thead><tr><th>المريض</th><th>السن / النوع</th><th>التليفون</th><th>فصيلة الدم</th><th>أول زيارة</th></tr></thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="row-hover" onClick={() => setSelected(p)}>
                  <td style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={p.name} size={28} />{p.name}</td>
                  <td>{ageFromDob(p.dob)} سنة · {p.gender}</td>
                  <td className="mono">{p.phone}</td>
                  <td className="mono">{p.blood}</td>
                  <td>{fmtDate(p.firstVisit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <PatientDetailModal
          patient={selected}
          actor={userLabel}
          onClose={() => setSelected(null)}
          onChanged={() => { reload(); reloadAll(); }}
          onDeleted={() => { setSelected(null); reload(); reloadAll(); }}
        />
      )}
      {addOpen && <PatientFormModal actor={userLabel} onClose={() => setAddOpen(false)} onSaved={handleSaved} />}
    </div>
  );
}
