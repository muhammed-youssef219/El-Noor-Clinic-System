import { useState } from "react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAppointments } from "../../hooks/useAppointments";
import { useDoctors } from "../../hooks/useDoctors";
import { useAuth } from "../../context/AuthContext";
import { updateAppointmentStatus } from "../../services/appointmentsService";
import { createBookingStatusNotification } from "../../services/notificationsService";
import { todayISO, fmtDate } from "../../lib/date";
import { CalendarClock, ClipboardList, CalendarCheck2, History, XCircle, AlertTriangle } from "lucide-react";

export default function PatientAppointments() {
  const { patientId, userLabel } = useAuth();
  const { data: appointments, loading: apptsLoading, reload } = useAppointments({ patientId });
  const { data: doctors, loading: doctorsLoading } = useDoctors();
  const loading = apptsLoading || doctorsLoading;
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  function doctorOf(id) {
    return (doctors || []).find(d => d.id === id);
  }

  async function handleCancel(appt) {
    setCancelling(true);
    setError("");
    try {
      await updateAppointmentStatus(appt.id, "cancelled", userLabel);
      const d = doctorOf(appt.doctorId);
      await createBookingStatusNotification({
        appointmentId: appt.id,
        recipientId: null,
        outcome: "cancelled-by-patient",
        title: "المريض ألغى الموعد",
        body: `${userLabel} ألغى موعده مع ${d?.name || "الدكتور"} يوم ${fmtDate(appt.date)} الساعة ${appt.time}`,
      });
      setConfirmingId(null);
      reload();
    } catch {
      setError("حدث خطأ أثناء إلغاء الموعد، حاول مرة أخرى");
    } finally {
      setCancelling(false);
    }
  }

  const mine = (appointments || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = mine.filter(a => a.date >= todayISO(0) && a.status !== "cancelled" && a.status !== "completed");
  const past = mine.filter(a => a.date < todayISO(0) || a.status === "completed");
  const lastVisit = past[0];

  return (
    <div>
      <SectionHeader title="مواعيدي" sub="مواعيدك القادمة والسابقة" />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={3} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 3, marginBottom: 20 }}>
          <StatCard icon={CalendarCheck2} label="مواعيد قادمة" value={upcoming.length} color="primary" />
          <StatCard icon={History} label="زيارات سابقة" value={past.length} color="info" />
          <StatCard icon={CalendarClock} label="آخر زيارة" value={lastVisit ? fmtDate(lastVisit.date) : "—"} color="accent" />
        </div>
      )}
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>القادمة</div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginBottom: 12 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}
      {loading ? (
        <div className="card" style={{ marginBottom: 24 }}><SkeletonRows rows={2} cols={3} /></div>
      ) : upcoming.length === 0 ? (
        <EmptyState icon={CalendarClock} title="لا يوجد مواعيد قادمة" sub="احجز موعدًا جديدًا من صفحة الحجز" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {upcoming.map(a => {
            const d = doctorOf(a.doctorId);
            const canCancel = a.status === "booked" || a.status === "confirmed";
            return (
              <div key={a.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={d?.name} src={d?.photo} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{d?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{fmtDate(a.date)} · <span className="mono">{a.time}</span> · {a.type}</div>
                  </div>
                  <Badge status={a.status} />
                  {canCancel && confirmingId !== a.id && (
                    <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12, color: "var(--danger)" }} onClick={() => setConfirmingId(a.id)}>
                      <XCircle size={13} /> إلغاء
                    </button>
                  )}
                </div>
                {confirmingId === a.id && (
                  <div style={{ marginTop: 10, background: "var(--danger-soft)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12.5, color: "var(--danger)", marginBottom: 8 }}>متأكد إنك عايز تلغي الموعد ده؟</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" style={{ background: "var(--danger)" }} disabled={cancelling} onClick={() => handleCancel(a)}>
                        {cancelling ? "جاري الإلغاء…" : "تأكيد الإلغاء"}
                      </button>
                      <button className="btn btn-outline" onClick={() => setConfirmingId(null)}>تراجع</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>السابقة</div>
      {loading ? (
        <div className="card"><SkeletonRows rows={2} cols={4} /></div>
      ) : past.length === 0 ? (
        <EmptyState icon={ClipboardList} title="لا يوجد زيارات سابقة" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 460 }}>
            <thead><tr><th>التاريخ</th><th>الدكتور</th><th>النوع</th><th>الحالة</th></tr></thead>
            <tbody>
              {past.map(a => (
                <tr key={a.id}><td>{fmtDate(a.date)}</td><td>{doctorOf(a.doctorId)?.name}</td><td>{a.type}</td><td><Badge status={a.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
