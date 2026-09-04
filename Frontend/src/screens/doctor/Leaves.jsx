import { useState } from "react";
import { Plus, Calendar, CalendarCheck, CalendarX, Check, CalendarClock, Trash2 } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useDoctors } from "../../hooks/useDoctors";
import { useLeaves } from "../../hooks/useLeaves";
import { useScheduleExceptions } from "../../hooks/useScheduleExceptions";
import { createLeave } from "../../services/leavesService";
import { createScheduleException, deleteScheduleException } from "../../services/scheduleExceptionsService";
import { todayISO, fmtDate } from "../../lib/date";

export default function DoctorLeaves() {
  const { doctorId, userLabel } = useAuth();
  const [leaveModal, setLeaveModal] = useState(false);
  const [exceptionModal, setExceptionModal] = useState(false);
  const { data: doctors, loading: doctorsLoading } = useDoctors();
  const { data: leaves, loading: leavesLoading, reload: reloadLeaves } = useLeaves({ doctorId });
  const { data: exceptions, loading: exceptionsLoading, reload: reloadExceptions } = useScheduleExceptions({ doctorId });
  const doctor = (doctors || []).find(d => d.id === doctorId);
  const loading = doctorsLoading || leavesLoading;
  const workDaysCount = doctor ? Object.keys(doctor.schedule).length : 0;

  const sortedLeaves = (leaves || []).slice().sort((a, b) => b.from.localeCompare(a.from));
  const sortedExceptions = (exceptions || []).slice().sort((a, b) => a.date.localeCompare(b.date));

  async function handleDeleteException(id) {
    await deleteScheduleException(id, userLabel);
    reloadExceptions();
  }

  return (
    <div>
      <SectionHeader
        title="إجازاتي"
        sub="الأيام التي لن تكون فيها متاحًا للحجز"
        action={<button className="btn btn-primary" onClick={() => setLeaveModal(true)}><Plus size={15} /> طلب إجازة</button>}
      />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={3} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 3, marginBottom: 20 }}>
          <StatCard icon={CalendarCheck} label="أيام العمل بالأسبوع" value={workDaysCount} color="primary" />
          <StatCard icon={Calendar} label="إجازات مسجلة" value={sortedLeaves.length} color="info" />
          <StatCard icon={CalendarX} label="إجازات قادمة" value={sortedLeaves.filter(l => l.to >= todayISO(0)).length} color="gold" />
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={3} cols={2} /></div>
      ) : (
        <div className="split-grid" style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>جدول العمل الأسبوعي الحالي</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(doctor?.schedule || {}).map(([day, [from, to]]) => (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 10px", background: "var(--card-2)", borderRadius: 8 }}>
                  <span style={{ fontWeight: 700 }}>{day}</span>
                  <span className="mono" style={{ color: "var(--ink-soft)" }}>{from} - {to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={2} cols={3} /></div>
      ) : sortedLeaves.length === 0 ? (
        <EmptyState icon={Calendar} title="لا توجد إجازات مسجلة" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0, marginBottom: 24 }}>
          <table style={{ minWidth: 400 }}>
            <thead><tr><th>من</th><th>إلى</th><th>السبب</th></tr></thead>
            <tbody>{sortedLeaves.map(l => <tr key={l.id}><td>{fmtDate(l.from)}</td><td>{fmtDate(l.to)}</td><td>{l.reason}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <SectionHeader
        title="تعديلات جدول ليوم معين"
        sub="لو يوم معين هتيجي متأخر، أو هتضيف ساعات إضافية بره جدولك المعتاد"
        action={<button className="btn btn-outline" onClick={() => setExceptionModal(true)}><CalendarClock size={15} /> تعديل يوم معين</button>}
      />
      {exceptionsLoading ? (
        <div className="card"><SkeletonRows rows={2} cols={3} /></div>
      ) : sortedExceptions.length === 0 ? (
        <EmptyState icon={CalendarClock} title="لا توجد تعديلات جدول مسجلة" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 460 }}>
            <thead><tr><th>التاريخ</th><th>المواعيد المتاحة</th><th>ملاحظة</th><th></th></tr></thead>
            <tbody>
              {sortedExceptions.map(e => (
                <tr key={e.id}>
                  <td>{fmtDate(e.date)}</td>
                  <td className="mono">{e.from} - {e.to}</td>
                  <td style={{ color: "var(--ink-soft)" }}>{e.note || "—"}</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--danger)" }} onClick={() => handleDeleteException(e.id)}>
                      <Trash2 size={12} /> حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leaveModal && (
        <RequestLeaveModal
          onClose={() => setLeaveModal(false)}
          onSubmit={async ({ from, to, reason }) => {
            await createLeave({ doctorId, from, to, reason }, userLabel);
            reloadLeaves();
            setLeaveModal(false);
          }}
        />
      )}
      {exceptionModal && (
        <ScheduleExceptionModal
          onClose={() => setExceptionModal(false)}
          onSubmit={async ({ date, from, to, note }) => {
            await createScheduleException({ doctorId, date, from, to, note }, userLabel);
            reloadExceptions();
            setExceptionModal(false);
          }}
        />
      )}
    </div>
  );
}

function RequestLeaveModal({ onClose, onSubmit }) {
  const [from, setFrom] = useState(todayISO(0));
  const [to, setTo] = useState(todayISO(0));
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = from && to && from <= to && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      await onSubmit({ from, to, reason });
    } catch {
      setError("حدث خطأ أثناء تسجيل الإجازة، حاول مرة أخرى");
      setSaving(false);
    }
  }

  return (
    <Modal title="طلب إجازة جديدة" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>من تاريخ</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label>إلى تاريخ</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        {from > to && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>تاريخ النهاية لازم يكون بعد أو يساوي تاريخ البداية</div>}
        <div>
          <label>السبب (اختياري)</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="مثال: إجازة شخصية" />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : "تأكيد طلب الإجازة"}
        </button>
      </form>
    </Modal>
  );
}

function ScheduleExceptionModal({ onClose, onSubmit }) {
  const [date, setDate] = useState(todayISO(0));
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSave = date && from && to && from < to && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      await onSubmit({ date, from, to, note });
    } catch {
      setError("حدث خطأ أثناء الحفظ، حاول مرة أخرى");
      setSaving(false);
    }
  }

  return (
    <Modal title="تعديل جدول ليوم معين" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
          المواعيد اللي هتحددها هنا هتحل محل جدولك المعتاد في اليوم ده بس (سواء كان يوم شغل عندك أو يوم إجازة أسبوعية).
        </div>
        <div>
          <label>التاريخ</label>
          <input type="date" min={todayISO(0)} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>من الساعة</label>
            <input type="time" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label>إلى الساعة</label>
            <input type="time" value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        {from >= to && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>وقت النهاية لازم يكون بعد وقت البداية</div>}
        <div>
          <label>ملاحظة (اختياري)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="مثال: هتأخر ساعة عن المعتاد" />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : "حفظ التعديل"}
        </button>
      </form>
    </Modal>
  );
}
