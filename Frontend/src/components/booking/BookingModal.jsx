import { useEffect, useState } from "react";
import { X, Check, UserPlus, AlertTriangle, CalendarOff } from "lucide-react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import PatientFormModal from "../patients/PatientFormModal";
import { useDoctors } from "../../hooks/useDoctors";
import { usePatients } from "../../hooks/usePatients";
import { useLeaves } from "../../hooks/useLeaves";
import { useAppointments } from "../../hooks/useAppointments";
import { useScheduleExceptions } from "../../hooks/useScheduleExceptions";
import { createAppointment } from "../../services/appointmentsService";
import { isOnLeave } from "../../services/leavesService";
import { todayISO, weekdayAr } from "../../lib/date";
import { availableSlotsForDate, scheduleSlotsForDate } from "../../lib/availability";
import { VISIT_TYPES } from "../../lib/constants";

export default function BookingModal({ onClose, onBooked, presetDoctorId, presetTime, presetDate, forPatientId, actor }) {
  const [patientId, setPatientId] = useState(forPatientId || "");
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorId, setDoctorId] = useState(presetDoctorId || "");
  const [date, setDate] = useState(presetDate || todayISO(0));
  const [time, setTime] = useState(presetTime || "");
  const [type, setType] = useState(VISIT_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState(null);

  const { data: doctors, loading: doctorsLoading } = useDoctors();
  const { data: patientResults, reload: reloadPatients } = usePatients(forPatientId ? "" : patientQuery);
  const { data: doctorLeaves } = useLeaves({ doctorId });
  const { data: doctorExceptions } = useScheduleExceptions({ doctorId });
  const { data: dayAppointments, loading: slotsLoading } = useAppointments({ doctorId, date });
  const filteredPatients = forPatientId ? [] : (patientResults || []).slice(0, 5);

  const doctor = doctors?.find(d => d.id === doctorId);
  const selectedPatient = forPatientId
    ? null
    : (patientResults || []).find(p => p.id === patientId) || (patientId ? newPatient : null);

  function handlePatientCreated(patient) {
    setNewPatient(patient);
    setPatientId(patient.id);
    setShowNewPatient(false);
    reloadPatients();
  }

  const weekday = date ? weekdayAr(date) : "";
  const exceptionToday = doctor && date ? (doctorExceptions || []).find(e => e.date === date) : null;
  const worksThatDay = doctor && date ? scheduleSlotsForDate(doctor, date, doctorExceptions).length > 0 : false;
  const doctorOnLeave = Boolean(doctorId && date && !exceptionToday && isOnLeave(doctorLeaves, doctorId, date));
  const slots = doctor && date && worksThatDay && !doctorOnLeave
    ? availableSlotsForDate(doctor, date, dayAppointments, doctorExceptions)
    : [];

  // A previously picked slot can go stale the moment the doctor or date
  // changes (different hours, different bookings) — always re-confirm it,
  // but only once doctor + that day's bookings have actually loaded.
  useEffect(() => {
    if (doctorsLoading || slotsLoading) return;
    if (time && !slots.some(s => s.time === time && !s.taken && !s.past)) {
      setTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date, dayAppointments, doctorExceptions, doctorsLoading, slotsLoading]);

  useEffect(() => {
    if (error) setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, doctorId, date, time]);

  const canSave = patientId && doctorId && date && time && !saving;

  async function handleSave() {
    if (saving) return;
    if (!patientId) { setError("من فضلك اختر المريض أولاً"); return; }
    if (!doctorId) { setError("من فضلك اختر الدكتور"); return; }
    if (!date) { setError("من فضلك اختر التاريخ"); return; }
    if (!time) { setError("من فضلك اختر وقت الموعد من الأوقات المتاحة بالأعلى"); return; }
    setError("");
    setSaving(true);
    const appt = await createAppointment({ patientId, doctorId, date, time, type, notes }, actor);
    setSaving(false);
    onBooked(appt);
  }

  return (
    <Modal title="حجز موعد جديد" onClose={onClose} width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {!forPatientId && (
          <div>
            <label>المريض</label>
            {patientId ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px" }}>
                <Avatar name={selectedPatient?.name || ""} size={26} />
                <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{selectedPatient?.name}</span>
                <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setPatientId("")}><X size={14} /></button>
              </div>
            ) : (
              <>
                <input placeholder="ابحث بالاسم أو رقم التليفون" value={patientQuery} onChange={e => setPatientQuery(e.target.value)} />
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                  {filteredPatients.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setPatientId(p.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-soft)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Avatar name={p.name} size={24} />
                      <span style={{ fontSize: 13 }}>{p.name}</span>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{p.phone}</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-outline" style={{ marginTop: 8, padding: "6px 10px", fontSize: 12.5 }} onClick={() => setShowNewPatient(true)}>
                  <UserPlus size={13} /> المريض مش موجود؟ سجّله الآن
                </button>
              </>
            )}
          </div>
        )}

        <div>
          <label>الدكتور</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            <option value="">اختر الدكتور</option>
            {(doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {doctor && (
          <div style={{ background: "var(--card-2)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-faint)", marginBottom: 6 }}>أيام عمل الدكتور</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(doctor.schedule).map(([day, [from, to]]) => (
                <span key={day} className="badge" style={{ background: day === weekday && !exceptionToday ? "var(--primary-soft)" : "var(--paper)", color: day === weekday && !exceptionToday ? "var(--primary)" : "var(--ink-soft)" }}>
                  {day} <span className="mono">{from}-{to}</span>
                </span>
              ))}
            </div>
            {exceptionToday && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--info)" }}>
                جدول معدّل في {date}: <span className="mono">{exceptionToday.from}-{exceptionToday.to}</span> {exceptionToday.note && `— ${exceptionToday.note}`}
              </div>
            )}
          </div>
        )}

        <div>
          <label>التاريخ</label>
          <input type="date" min={todayISO(0)} value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {doctor && date && (
          <div>
            <label>الوقت المتاح</label>
            {doctorOnLeave ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5 }}>
                <AlertTriangle size={15} /> الدكتور في إجازة في هذا التاريخ، اختر تاريخًا آخر أو دكتورًا آخر
              </div>
            ) : !worksThatDay ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold-soft)", color: "var(--gold)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5 }}>
                <CalendarOff size={15} /> الدكتور لا يعمل يوم {weekday}، اختر تاريخًا آخر
              </div>
            ) : slotsLoading ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-faint)", padding: "8px 0" }}>جاري تحميل الأوقات المتاحة…</div>
            ) : (
              <div className="slot-grid">
                {slots.map(s => {
                  const disabled = s.taken || s.past;
                  const isSelected = time === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(s.time)}
                      title={s.taken ? "الموعد محجوز بالفعل" : s.past ? "الوقت فات" : ""}
                      style={{
                        padding: "8px 4px", borderRadius: 8, fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif", cursor: disabled ? "not-allowed" : "pointer",
                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--line)"}`,
                        background: isSelected ? "var(--primary)" : disabled ? "var(--card-2)" : "var(--card)",
                        color: isSelected ? "#fff" : disabled ? "var(--ink-faint)" : "var(--ink)",
                        textDecoration: s.taken ? "line-through" : "none",
                      }}
                    >
                      {s.time}
                    </button>
                  );
                })}
                {slots.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", fontSize: 12.5, color: "var(--ink-faint)" }}>لا توجد أوقات متاحة في هذا اليوم</div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label>نوع الزيارة</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>ملاحظات (اختياري)</label>
          <textarea rows={2} placeholder="أي معلومات إضافية عن الحجز" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        {doctor && (
          <div style={{ background: "var(--paper)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "var(--ink-soft)" }}>
            سعر {type === VISIT_TYPES[0] ? "الكشف" : "المتابعة"}: <strong className="mono">{type === VISIT_TYPES[0] ? doctor.price : doctor.followUp} ج.م</strong>
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5 }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-start", marginTop: 6 }}>
          <button className="btn btn-primary" disabled={saving} style={{ opacity: canSave ? 1 : 0.6 }} onClick={handleSave}>
            <Check size={15} /> {saving ? "جاري الحجز…" : "تأكيد الحجز"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>إلغاء</button>
        </div>
      </div>

      {showNewPatient && (
        <PatientFormModal actor={actor} onClose={() => setShowNewPatient(false)} onSaved={handlePatientCreated} />
      )}
    </Modal>
  );
}
