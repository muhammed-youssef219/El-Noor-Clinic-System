import { TrendingUp, AlertCircle, XCircle, Download } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAppointments } from "../../hooks/useAppointments";
import { useInvoices } from "../../hooks/useInvoices";
import { useDoctors } from "../../hooks/useDoctors";
import { STATUS_META } from "../../lib/constants";
import { exportToCsv } from "../../lib/csv";
import { todayISO } from "../../lib/date";

const STATUS_CHART_COLORS = {
  booked: "var(--info)",
  confirmed: "var(--success)",
  completed: "var(--primary)",
  cancelled: "var(--danger)",
  "no-show": "var(--gold)",
};

export default function Reports() {
  const { data: appointments, loading: apptsLoading } = useAppointments({});
  const { data: invoices, loading: invoicesLoading } = useInvoices();
  const { data: doctors, loading: doctorsLoading } = useDoctors();

  const loading = apptsLoading || invoicesLoading || doctorsLoading;

  if (loading) {
    return (
      <div>
        <SectionHeader title="التقارير" sub="أداء العيادة المالي والتشغيلي" />
        <div className="card"><SkeletonRows rows={5} cols={3} /></div>
      </div>
    );
  }

  const doctorPerf = doctors
    .map(d => ({ name: d.name.replace("د. ", ""), مواعيد: appointments.filter(a => a.doctorId === d.id && a.status !== "cancelled").length }))
    .sort((a, b) => b.مواعيد - a.مواعيد);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);
  const attendance = appointments.filter(a => a.status !== "booked" && a.status !== "confirmed");
  const noShowRate = attendance.length ? Math.round((attendance.filter(a => a.status === "no-show").length / attendance.length) * 100) : 0;

  const statusBreakdown = Object.keys(STATUS_CHART_COLORS)
    .map(status => ({ status, name: STATUS_META[status].label, value: appointments.filter(a => a.status === status).length }))
    .filter(s => s.value > 0);

  function handleExport() {
    exportToCsv(
      `تقرير-أداء-الدكاترة-${todayISO(0)}.csv`,
      ["الدكتور", "عدد المواعيد"],
      doctorPerf.map(d => [d.name, d.مواعيد])
    );
  }

  return (
    <div>
      <SectionHeader
        title="التقارير" sub="أداء العيادة المالي والتشغيلي"
        action={<button className="btn btn-outline" onClick={handleExport}><Download size={15} /> تصدير CSV</button>}
      />
      <div className="stat-grid" style={{ "--cols": 3, marginBottom: 18 }}>
        <StatCard icon={TrendingUp} label="إيرادات محصلة" value={totalRevenue.toLocaleString("ar-EG") + " ج.م"} color="accent" />
        <StatCard icon={AlertCircle} label="مستحقات معلقة" value={pendingRevenue.toLocaleString("ar-EG") + " ج.م"} color="gold" />
        <StatCard icon={XCircle} label="نسبة عدم الحضور" value={noShowRate + "%"} color="info" />
      </div>
      <div className="split-grid" style={{ "--split": "1.6fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>عدد المواعيد لكل دكتور</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={doctorPerf} layout="vertical" margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} stroke="var(--ink-faint)" />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fontFamily: "Tajawal", fill: "var(--ink-faint)" }} stroke="var(--ink-faint)" />
              <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)" }} />
              <Bar dataKey="مواعيد" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>توزيع حالات المواعيد</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} paddingAngle={2}>
                {statusBreakdown.map((s, i) => <Cell key={i} fill={STATUS_CHART_COLORS[s.status]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
