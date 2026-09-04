import { ClipboardList, Activity, CalendarClock, PlusCircle, Pencil, Download } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAuditLog } from "../../hooks/useAuditLog";
import { exportToCsv } from "../../lib/csv";
import { todayISO } from "../../lib/date";

const ACTION_LABEL = { create: "إنشاء", update: "تعديل", delete: "حذف" };
const ENTITY_LABEL = { patient: "مريض", appointment: "موعد", medicalRecord: "كشف طبي", invoice: "فاتورة", doctor: "دكتور", user: "حساب مستخدم", leave: "إجازة", settings: "إعدادات العيادة" };

export default function AuditLog() {
  const { data: log, loading } = useAuditLog();

  const todayStr = new Date().toDateString();
  const todayCount = loading ? 0 : log.filter(e => new Date(e.ts).toDateString() === todayStr).length;
  const createCount = loading ? 0 : log.filter(e => e.action === "create").length;
  const updateCount = loading ? 0 : log.filter(e => e.action === "update").length;

  function handleExport() {
    exportToCsv(
      `سجل-العمليات-${todayISO(0)}.csv`,
      ["الوقت", "المستخدم", "العملية", "النوع", "التفاصيل"],
      log.map(e => [new Date(e.ts).toLocaleString("ar-EG"), e.actor, ACTION_LABEL[e.action] || e.action, ENTITY_LABEL[e.entity] || e.entity, e.summary])
    );
  }

  return (
    <div>
      <SectionHeader
        title="سجل العمليات" sub="سجل كل التعديلات على البيانات الطبية والمالية داخل النظام"
        action={!loading && log.length > 0 && <button className="btn btn-outline" onClick={handleExport}><Download size={15} /> تصدير CSV</button>}
      />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Activity} label="إجمالي العمليات" value={log.length} color="primary" />
          <StatCard icon={CalendarClock} label="عمليات اليوم" value={todayCount} color="info" />
          <StatCard icon={PlusCircle} label="عمليات إنشاء" value={createCount} color="success" />
          <StatCard icon={Pencil} label="عمليات تعديل" value={updateCount} color="gold" />
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={5} cols={4} /></div>
      ) : log.length === 0 ? (
        <EmptyState icon={ClipboardList} title="لا يوجد عمليات مسجلة بعد" sub="سيظهر هنا كل حجز أو كشف أو تحصيل فاتورة يتم تنفيذه" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 640 }}>
            <thead><tr><th>الوقت</th><th>المستخدم</th><th>العملية</th><th>النوع</th><th>التفاصيل</th></tr></thead>
            <tbody>
              {log.map(entry => (
                <tr key={entry.id}>
                  <td className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>{new Date(entry.ts).toLocaleString("ar-EG")}</td>
                  <td>{entry.actor}</td>
                  <td>{ACTION_LABEL[entry.action] || entry.action}</td>
                  <td>{ENTITY_LABEL[entry.entity] || entry.entity}</td>
                  <td style={{ color: "var(--ink-soft)" }}>{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
