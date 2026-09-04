import { useState } from "react";
import { FileText, Stethoscope, CalendarClock, Users, CheckCircle2, Clock3, Wallet, XCircle, ClipboardCheck, AlertTriangle } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import ConsultationModal from "../../components/emr/ConsultationModal";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { usePatients } from "../../hooks/usePatients";
import { useMedicalRecords } from "../../hooks/useMedicalRecords";
import { useDoctors } from "../../hooks/useDoctors";
import { createMedicalRecord, updateMedicalRecord } from "../../services/medicalRecordsService";
import { updateAppointmentStatus } from "../../services/appointmentsService";
import { createBookingStatusNotification } from "../../services/notificationsService";
import { todayISO, fmtDate, ageFromDob } from "../../lib/date";
import { VISIT_TYPES } from "../../lib/constants";

export default function DoctorSchedule() {
  const { doctorId, userLabel } = useAuth();
  const today = todayISO(0);
  const [consulting, setConsulting] = useState(null);
  const [deciding, setDeciding] = useState(null);
  const [decisionError, setDecisionError] = useState("");

  const { data: appointments, loading: apptsLoading, reload: reloadAppts } = useAppointments({ doctorId, date: today });
  const { data: allAppointments, loading: allApptsLoading, reload: reloadAllAppts } = useAppointments({ doctorId });
  const { data: patients, loading: patientsLoading } = usePatients();
  const { data: records, loading: recordsLoading, reload: reloadRecords } = useMedicalRecords({ doctorId });
  const { data: doctors, loading: doctorsLoading } = useDoctors();

  const loading = apptsLoading || patientsLoading || recordsLoading || doctorsLoading;
  const todays = (appointments || [])
    .filter(a => a.status !== "cancelled")
    .sort((a, b) => a.time.localeCompare(b.time));
  const completedToday = todays.filter(a => a.status === "completed");
  const me = (doctors || []).find(d => d.id === doctorId);
  const expectedIncome = me ? completedToday.reduce((s, a) => s + (a.type === VISIT_TYPES[0] ? me.price : me.followUp), 0) : 0;

  const pending = (allAppointments || [])
    .filter(a => a.status === "booked")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  function patientOf(id) {
    return (patients || []).find(x => x.id === id);
  }
  function recordOf(appointmentId) {
    return (records || []).find(r => r.appointmentId === appointmentId);
  }

  async function handleSaveConsultation(payload) {
    if (consulting.record) {
      await updateMedicalRecord(consulting.record.id, payload, userLabel);
    } else {
      await createMedicalRecord({ appointmentId: consulting.appt.id, patientId: consulting.patient.id, doctorId, ...payload }, userLabel);
      await updateAppointmentStatus(consulting.appt.id, "completed", userLabel);
    }
    reloadAppts();
    reloadRecords();
    setConsulting(null);
  }

  async function handleDecision(appt, outcome) {
    setDeciding(appt.id);
    setDecisionError("");
    try {
      const status = outcome === "confirmed" ? "confirmed" : "cancelled";
      await updateAppointmentStatus(appt.id, status, userLabel);
      await createBookingStatusNotification({
        appointmentId: appt.id,
        recipientId: appt.patientId,
        outcome,
        title: outcome === "confirmed" ? "تم تأكيد موعدك" : "تم إلغاء موعدك",
        body: outcome === "confirmed"
          ? `${userLabel} أكد موعدك يوم ${fmtDate(appt.date)} الساعة ${appt.time}`
          : `${userLabel} اعتذر عن موعدك يوم ${fmtDate(appt.date)} الساعة ${appt.time}، برجاء حجز موعد آخر`,
      });
      reloadAllAppts();
      reloadAppts();
    } catch {
      setDecisionError("حدث خطأ أثناء تحديث حالة الموعد، حاول مرة أخرى");
    } finally {
      setDeciding(null);
    }
  }

  return (
    <div>
      <SectionHeader title="جدولي اليومي" sub={fmtDate(today)} />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Users} label="مرضى اليوم" value={todays.length} color="primary" />
          <StatCard icon={CheckCircle2} label="تم الكشف عليهم" value={completedToday.length} color="success" />
          <StatCard icon={Clock3} label="متبقي" value={todays.length - completedToday.length} color="info" />
          <StatCard icon={Wallet} label="إيراد اليوم المتوقع" value={expectedIncome.toLocaleString("ar-EG") + " ج.م"} color="accent" />
        </div>
      )}

      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardCheck size={16} color="var(--gold)" /> مواعيد بانتظار التأكيد {!allApptsLoading && `(${pending.length})`}
      </div>
      {decisionError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginBottom: 12 }}>
          <AlertTriangle size={15} /> {decisionError}
        </div>
      )}
      {allApptsLoading ? (
        <div className="card" style={{ marginBottom: 24 }}><SkeletonRows rows={2} cols={4} /></div>
      ) : pending.length === 0 ? (
        <div className="card" style={{ marginBottom: 24 }}>
          <EmptyState icon={ClipboardCheck} title="لا توجد مواعيد بانتظار التأكيد" sub="كل الحجوزات الجديدة هتظهر هنا" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {pending.map(a => {
            const p = patientOf(a.patientId);
            const busy = deciding === a.id;
            return (
              <div key={a.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", width: 90 }}>
                  <div className="mono" style={{ fontWeight: 800, fontSize: 13 }}>{a.time}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{fmtDate(a.date)}</div>
                </div>
                <Avatar name={p?.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{p?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{a.type} · {p ? ageFromDob(p.dob) : "—"} سنة</div>
                </div>
                <button className="btn btn-outline" disabled={busy} style={{ color: "var(--success)" }} onClick={() => handleDecision(a, "confirmed")}>
                  <CheckCircle2 size={14} /> تأكيد
                </button>
                <button className="btn btn-outline" disabled={busy} style={{ color: "var(--danger)" }} onClick={() => handleDecision(a, "cancelled")}>
                  <XCircle size={14} /> رفض
                </button>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="card"><SkeletonRows rows={4} cols={4} /></div>
      ) : todays.length === 0 ? (
        <EmptyState icon={CalendarClock} title="لا يوجد مواعيد اليوم" sub="استمتع بيومك!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {todays.map(a => {
            const p = patientOf(a.patientId);
            const record = recordOf(a.id);
            const done = a.status === "completed" || !!record;
            return (
              <div key={a.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", width: 56 }}>
                  <div className="mono" style={{ fontWeight: 800, fontSize: 15 }}>{a.time}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{a.duration} د</div>
                </div>
                <Avatar name={p?.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{p?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{a.type} · {p ? ageFromDob(p.dob) : "—"} سنة</div>
                </div>
                <Badge status={a.status} />
                {done ? (
                  <button className="btn btn-outline" onClick={() => setConsulting({ appt: a, patient: p, readonly: true, record })}>
                    <FileText size={14} /> عرض الكشف
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setConsulting({ appt: a, patient: p })}>
                    <Stethoscope size={14} /> بدء الكشف
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {consulting && (
        <ConsultationModal
          patientName={consulting.patient?.name}
          patient={consulting.patient}
          doctor={me}
          existing={consulting.record}
          readonly={consulting.readonly}
          onClose={() => setConsulting(null)}
          onSave={handleSaveConsultation}
        />
      )}
    </div>
  );
}
