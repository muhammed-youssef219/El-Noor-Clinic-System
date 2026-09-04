import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../ui/Modal";
import { createPatient, updatePatient } from "../../services/patientsService";
import { todayISO } from "../../lib/date";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function emptyForm() {
  return { name: "", dob: "", gender: "ذكر", phone: "", nationalId: "", address: "", blood: "O+", allergies: "لا يوجد", chronic: "لا يوجد" };
}

export default function PatientFormModal({ patient, actor, onClose, onSaved }) {
  const [form, setForm] = useState(patient ? {
    name: patient.name, dob: patient.dob, gender: patient.gender, phone: patient.phone, nationalId: patient.nationalId,
    address: patient.address, blood: patient.blood, allergies: patient.allergies, chronic: patient.chronic,
  } : emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }
  const canSave = form.name.trim() && form.phone.trim() && form.dob && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      const saved = patient
        ? await updatePatient(patient.id, form, actor)
        : await createPatient({ ...form, firstVisit: todayISO(0) }, actor);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={patient ? `تعديل بيانات: ${patient.name}` : "تسجيل مريض جديد"} onClose={onClose} width={520}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label>الاسم الكامل *</label>
          <input value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>تاريخ الميلاد *</label>
            <input type="date" value={form.dob} onChange={e => update("dob", e.target.value)} />
          </div>
          <div>
            <label>النوع</label>
            <select value={form.gender} onChange={e => update("gender", e.target.value)}>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>
        </div>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>رقم التليفون *</label>
            <input className="mono" value={form.phone} onChange={e => update("phone", e.target.value)} />
          </div>
          <div>
            <label>الرقم القومي</label>
            <input className="mono" value={form.nationalId} onChange={e => update("nationalId", e.target.value)} />
          </div>
        </div>
        <div>
          <label>العنوان</label>
          <input value={form.address} onChange={e => update("address", e.target.value)} />
        </div>
        <div className="split-grid" style={{ "--split": "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label>فصيلة الدم</label>
            <select value={form.blood} onChange={e => update("blood", e.target.value)}>
              {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label>الحساسية</label>
            <input value={form.allergies} onChange={e => update("allergies", e.target.value)} />
          </div>
          <div>
            <label>أمراض مزمنة</label>
            <input value={form.chronic} onChange={e => update("chronic", e.target.value)} />
          </div>
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : patient ? "حفظ التعديلات" : "تسجيل المريض"}
        </button>
      </form>
    </Modal>
  );
}
