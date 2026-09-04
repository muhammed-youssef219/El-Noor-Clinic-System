import { useState } from "react";
import { Plus, ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle2, XCircle, CalendarClock, XOctagon, AlertTriangle } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import BookingModal from "../../components/booking/BookingModal";
import { useDoctors } from "../../hooks/useDoctors";
import { useAppointments } from "../../hooks/useAppointments";
import { usePatients } from "../../hooks/usePatients";
import { useLeaves } from "../../hooks/useLeaves";
import { useScheduleExceptions } from "../../hooks/useScheduleExceptions";
import { useAuth } from "../../context/AuthContext";
import { updateAppointmentStatus } from "../../services/appointmentsService";
import { isOnLeave } from "../../services/leavesService";
import { todayISO, fmtDate, weekdayAr, shiftISO } from "../../lib/date";
import { scheduleSlotsForDate } from "../../lib/availability";
import { TIME_SLOTS } from "../../lib/constants";
import { specialtyByKey } from "../../data/specialties";

export default function ReceptionCalendar() {
  const { userLabel } = useAuth();
  const [date, setDate] = useState(todayISO(0));
  const [modal, setModal] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const weekday = weekdayAr(date);

  const { data: doctors, loading: doctorsLoading } = useDoctors();
  const { data: appointments, loading: apptsLoading, reload } = useAppointments({ date });
  const { data: patients } = usePatients();
  const { data: leaves, loading: leavesLoading } = useLeaves();
  const { data: exceptions, loading: exceptionsLoading } = useScheduleExceptions();

  const loading = doctorsLoading || apptsLoading || leavesLoading || exceptionsLoading;

  function hasExceptionToday(doctorId) {
    return (exceptions || []).some(e => e.doctorId === doctorId && e.date === date);
  }
  function worksToday(d) {
    if (hasExceptionToday(d.id)) return scheduleSlotsForDate(d, date, exceptions).length > 0;
    return Boolean(d.schedule[weekday]) && !isOnLeave(leaves, d.id, date);
  }

  const workingDoctors = (doctors || []).filter(worksToday);
  const onLeaveCount = (doctors || []).filter(d => !hasExceptionToday(d.id) && d.schedule[weekday] && isOnLeave(leaves, d.id, date)).length;

  function slotAppt(doctorId, time) {
    return (appointments || []).find(a => a.doctorId === doctorId && a.time === time && a.status !== "cancelled");
  }
  function inWorkingHours(doctor, time) {
    return scheduleSlotsForDate(doctor, date, exceptions).includes(time);
  }
  function patientOf(id) {
    return (patients || []).find(p => p.id === id);
  }
  function doctorOf(id) {
    return (doctors || []).find(d => d.id === id);
  }

  async function handleStatusChange(id, status) {
    setStatusBusy(true);
    setStatusError("");
    try {
      await updateAppointmentStatus(id, status, userLabel);
      reload();
      setModal(null);
    } catch {
      setStatusError("حدث خطأ أثناء تحديث حالة الموعد، حاول مرة أخرى");
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div>
      <SectionHeader title="جدول المواعيد" sub={fmtDate(date)}
        action={<button className="btn btn-primary" onClick={() => setModal({})}><Plus size={15} /> حجز موعد</button>} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button className="btn btn-outline" style={{ padding: 8 }} onClick={() => setDate(shiftISO(date, -1))}><ChevronRight size={16} /></button>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: 170 }} />
        <button className="btn btn-outline" style={{ padding: 8 }} onClick={() => setDate(shiftISO(date, 1))}><ChevronLeft size={16} /></button>
        <button className="btn btn-ghost" onClick={() => setDate(todayISO(0))}>اليوم</button>
        {!loading && onLeaveCount > 0 && (
          <span className="badge" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
            {onLeaveCount} دكتور في إجازة اليوم
          </span>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={CalendarClock} label="إجمالي مواعيد اليوم" value={(appointments || []).filter(a => a.status !== "cancelled").length} color="primary" />
          <StatCard icon={CheckCircle2} label="مؤكدة" value={(appointments || []).filter(a => a.status === "confirmed").length} color="success" />
          <StatCard icon={CheckCircle2} label="تم الحضور" value={(appointments || []).filter(a => a.status === "completed").length} color="info" />
          <StatCard icon={XOctagon} label="ملغاة" value={(appointments || []).filter(a => a.status === "cancelled").length} color="danger" />
        </div>
      )}

      {loading ? (
        <div className="card"><SkeletonRows rows={6} cols={4} /></div>
      ) : workingDoctors.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="لا يوجد دكاترة يعملون في هذا اليوم"
          sub={onLeaveCount > 0 ? "كل الدكاترة المتاحين في هذا اليوم في إجازة" : "جرّب اختيار تاريخ آخر"}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ minWidth: workingDoctors.length * 170 + 70 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>الوقت</th>
                {workingDoctors.map(d => {
                  const spec = specialtyByKey(d.specialtyKey);
                  return (
                    <th key={d.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={d.name} src={d.photo} size={22} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12 }}>{d.name}</div>
                          <div className="specialty-tag" data-specialty={d.specialtyKey} style={{ fontSize: 10, padding: "1px 6px", background: "transparent" }}>{spec?.name}</div>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time}>
                  <td className="mono" style={{ color: "var(--ink-faint)", fontSize: 11.5 }}>{time}</td>
                  {workingDoctors.map(d => {
                    const appt = slotAppt(d.id, time);
                    const open = inWorkingHours(d, time);
                    if (!open) return <td key={d.id} style={{ background: "var(--card-2)" }}></td>;
                    if (appt) {
                      const p = patientOf(appt.patientId);
                      return (
                        <td key={d.id} style={{ padding: 4 }}>
                          <div
                            className="row-hover specialty-tag"
                            data-specialty={d.specialtyKey}
                            onClick={() => { setStatusError(""); setModal({ view: appt }); }}
                            style={{ display: "block", borderRadius: 8, padding: "6px 8px", borderRight: "3px solid currentColor" }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{p?.name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                              <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{appt.type}</span>
                              <Badge status={appt.status} />
                            </div>
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={d.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => setModal({ doctorId: d.id, time })}>
                        <div style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center" }}>+ حجز</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && !modal.view && (
        <BookingModal
          presetDoctorId={modal.doctorId}
          presetTime={modal.time}
          presetDate={date}
          actor="الاستقبال"
          onClose={() => setModal(null)}
          onBooked={() => { reload(); setModal(null); }}
        />
      )}

      {modal && modal.view && (() => {
        const a = modal.view;
        const p = patientOf(a.patientId);
        const d = doctorOf(a.doctorId);
        return (
          <Modal title="تفاصيل الموعد" onClose={() => setModal(null)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={p?.name} size={40} />
                <div><div style={{ fontWeight: 800 }}>{p?.name}</div><div className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>{p?.phone}</div></div>
              </div>
              <div style={{ fontSize: 13.5 }}>الدكتور: <strong>{d?.name}</strong></div>
              <div style={{ fontSize: 13.5 }}>الوقت: <span className="mono">{a.time}</span> — {fmtDate(a.date)}</div>
              <div style={{ fontSize: 13.5 }}>النوع: {a.type}</div>
              {a.notes && <div style={{ fontSize: 13.5 }}>ملاحظات: {a.notes}</div>}
              <div><Badge status={a.status} /></div>
              {statusError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5 }}>
                  <AlertTriangle size={15} /> {statusError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <>
                    <button className="btn btn-outline" disabled={statusBusy} onClick={() => handleStatusChange(a.id, "confirmed")}><CheckCircle2 size={14} /> تأكيد الحضور</button>
                    <button className="btn btn-outline" style={{ color: "var(--danger)" }} disabled={statusBusy} onClick={() => handleStatusChange(a.id, "cancelled")}><XCircle size={14} /> إلغاء الموعد</button>
                  </>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
