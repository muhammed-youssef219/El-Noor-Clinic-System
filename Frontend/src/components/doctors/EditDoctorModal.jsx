import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../ui/Modal";
import PhotoUploadField from "./PhotoUploadField";
import { SPECIALTIES } from "../../data/specialties";
import { WEEKDAY_AR } from "../../lib/date";
import { updateDoctorProfile } from "../../services/doctorsService";

function scheduleToDays(schedule) {
  return Object.fromEntries(WEEKDAY_AR.map(day => {
    const range = schedule[day];
    return [day, range ? { checked: true, from: range[0], to: range[1] } : { checked: false, from: "09:00", to: "17:00" }];
  }));
}

export default function EditDoctorModal({ doctor, onClose, onSaved, actor }) {
  const [form, setForm] = useState({
    name: doctor.name, specialtyKey: doctor.specialtyKey, email: doctor.email, license: doctor.license,
    exp: doctor.exp, price: doctor.price, followUp: doctor.followUp, bio: doctor.bio, photo: doctor.photo || null,
  });
  const [days, setDays] = useState(() => scheduleToDays(doctor.schedule));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }
  function updateDay(day, key, value) { setDays(prev => ({ ...prev, [day]: { ...prev[day], [key]: value } })); }

  const workingDays = Object.entries(days).filter(([, d]) => d.checked);
  const canSave = form.name.trim() && form.email.trim() && workingDays.length > 0 && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      const schedule = Object.fromEntries(workingDays.map(([day, d]) => [day, [d.from, d.to]]));
      const updated = await updateDoctorProfile(doctor.id, {
        name: form.name.trim(), specialtyKey: form.specialtyKey, email: form.email.trim(),
        license: form.license, exp: Number(form.exp) || 0, price: Number(form.price) || 0,
        followUp: Number(form.followUp) || 0, bio: form.bio, photo: form.photo, schedule,
      }, actor);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={`تعديل بيانات ${doctor.name}`} onClose={onClose} width={560}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <PhotoUploadField name={form.name || doctor.name} photo={form.photo} onChange={photo => update("photo", photo)} />
        <div>
          <label>الاسم الكامل *</label>
          <input value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>التخصص *</label>
            <select value={form.specialtyKey} onChange={e => update("specialtyKey", e.target.value)}>
              {SPECIALTIES.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label>رقم النقابة</label>
            <input className="mono" value={form.license} onChange={e => update("license", e.target.value)} />
          </div>
        </div>
        <div>
          <label>البريد الإلكتروني (تسجيل الدخول) *</label>
          <input className="mono" type="email" value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
        <div className="split-grid" style={{ "--split": "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label>سنوات الخبرة</label>
            <input className="mono" type="number" min="0" value={form.exp} onChange={e => update("exp", e.target.value)} />
          </div>
          <div>
            <label>سعر الكشف (ج.م)</label>
            <input className="mono" type="number" min="0" value={form.price} onChange={e => update("price", e.target.value)} />
          </div>
          <div>
            <label>سعر المتابعة (ج.م)</label>
            <input className="mono" type="number" min="0" value={form.followUp} onChange={e => update("followUp", e.target.value)} />
          </div>
        </div>
        <div>
          <label>نبذة تعريفية</label>
          <textarea rows={2} value={form.bio} onChange={e => update("bio", e.target.value)} />
        </div>

        <div>
          <label>جدول العمل الأسبوعي *</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1px solid var(--line)", borderRadius: 10, padding: 8 }}>
            {WEEKDAY_AR.map(day => (
              <div key={day} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, minWidth: 90, cursor: "pointer" }}>
                  <input type="checkbox" style={{ width: "auto" }} checked={days[day].checked} onChange={e => updateDay(day, "checked", e.target.checked)} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{day}</span>
                </label>
                {days[day].checked && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                    <input type="time" value={days[day].from} onChange={e => updateDay(day, "from", e.target.value)} />
                    <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>إلى</span>
                    <input type="time" value={days[day].to} onChange={e => updateDay(day, "to", e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : "حفظ التعديلات"}
        </button>
      </form>
    </Modal>
  );
}
