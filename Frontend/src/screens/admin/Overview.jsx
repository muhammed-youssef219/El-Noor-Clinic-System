import { Calendar, Wallet, Users, Stethoscope } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAppointments } from "../../hooks/useAppointments";
import { useInvoices } from "../../hooks/useInvoices";
import { usePatients } from "../../hooks/usePatients";
import { useDoctors } from "../../hooks/useDoctors";
import { SPECIALTIES } from "../../data/specialties";
import { REVENUE_TREND } from "../../data/revenueTrend";
import { todayISO } from "../../lib/date";

export default function AdminOverview() {
  const today = todayISO(0);
  const { data: todaysAppts, loading: apptsLoading } = useAppointments({ date: today });
  const { data: allAppts } = useAppointments({});
  const { data: invoices, loading: invoicesLoading } = useInvoices();
  const { data: patients, loading: patientsLoading } = usePatients();
  const { data: doctors, loading: doctorsLoading } = useDoctors();

  const loading = apptsLoading || invoicesLoading || patientsLoading || doctorsLoading;

  function patientOf(id) {
    return (patients || []).find(p => p.id === id);
  }
  function doctorOf(id) {
    return (doctors || []).find(d => d.id === id);
  }

  const revenueToday = (invoices || []).filter(i => i.date === today && i.status === "paid").reduce((s, i) => s + i.total, 0);
  const specialtyData = SPECIALTIES.map(s => ({
    key: s.key,
    name: s.name,
    value: (doctors || [])
      .filter(d => d.specialtyKey === s.key)
      .reduce((sum, d) => sum + (allAppts || []).filter(a => a.doctorId === d.id && a.status !== "cancelled").length, 0),
  })).filter(s => s.value > 0);

  return (
    <div>
      <SectionHeader title="نظرة عامة" sub="أداء العيادة اليوم" />
      {loading ? (
        <div className="card"><SkeletonRows rows={4} cols={4} /></div>
      ) : (
        <>
          <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
            <StatCard icon={Calendar} label="مواعيد اليوم" value={todaysAppts.length} sub={`${todaysAppts.filter(a => a.status === "completed").length} تم الكشف عليهم`} color="primary" />
            <StatCard icon={Wallet} label="إيراد اليوم" value={revenueToday.toLocaleString("ar-EG") + " ج.م"} sub="مدفوعات مؤكدة" color="accent" />
            <StatCard icon={Users} label="إجمالي المرضى" value={patients.length} sub="مسجلين في النظام" color="info" />
            <StatCard icon={Stethoscope} label="الدكاترة النشطون" value={doctors.length} sub={SPECIALTIES.length + " تخصصات"} color="gold" />
          </div>
          <div className="split-grid" style={{ "--split": "1.6fr 1fr" }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>الإيراد الشهري (آخر 6 أشهر)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={REVENUE_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11.5, fontFamily: "Tajawal", fill: "var(--ink-faint)" }} stroke="var(--ink-faint)" />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} stroke="var(--ink-faint)" />
                  <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)" }} formatter={v => v.toLocaleString("ar-EG") + " ج.م"} />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>توزيع الحجوزات حسب التخصص</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={specialtyData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {specialtyData.map((s, i) => <Cell key={i} fill={`var(--spec-${s.key}-c)`} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14, padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", fontWeight: 800, fontSize: 14 }}>مواعيد اليوم</div>
            {todaysAppts.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>لا يوجد مواعيد اليوم</div>
            ) : (
              <div className="table-scroll">
                <table style={{ minWidth: 520 }}>
                  <thead><tr><th>الوقت</th><th>المريض</th><th>الدكتور</th><th>النوع</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {todaysAppts.slice(0, 6).map(a => (
                      <tr key={a.id}>
                        <td className="mono">{a.time}</td>
                        <td>{patientOf(a.patientId)?.name}</td>
                        <td>{doctorOf(a.doctorId)?.name}</td>
                        <td>{a.type}</td>
                        <td><Badge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
