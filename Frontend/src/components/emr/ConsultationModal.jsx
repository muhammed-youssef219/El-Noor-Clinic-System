import { useState } from "react";
import { Plus, Check, Printer, Pencil } from "lucide-react";
import Modal from "../ui/Modal";
import PrescriptionPrintSheet from "../print/PrescriptionPrintSheet";
import { usePrint } from "../../hooks/usePrint";

export default function ConsultationModal({ patientName, patient, doctor, existing, readonly, onClose, onSave }) {
  const [complaint, setComplaint] = useState(existing?.complaint || "");
  const [exam, setExam] = useState(existing?.exam || "");
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [labs, setLabs] = useState(existing?.labs || "");
  const [meds, setMeds] = useState(existing?.medications?.length ? existing.medications : [{ name: "", dose: "", freq: "", duration: "" }]);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(!!readonly);
  const [printRecord, setPrintRecord] = usePrint();

  function updateMed(i, key, val) {
    setMeds(prev => prev.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ complaint, exam, diagnosis, notes, labs, medications: meds.filter(m => m.name) });
    setSaving(false);
  }

  return (
    <>
      <Modal title={`كشف — ${patientName}`} onClose={onClose} width={620}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label>الشكوى الأساسية</label>
            <textarea rows={2} value={complaint} disabled={locked} onChange={e => setComplaint(e.target.value)} />
          </div>
          <div>
            <label>الفحص الإكلينيكي</label>
            <textarea rows={2} value={exam} disabled={locked} onChange={e => setExam(e.target.value)} />
          </div>
          <div>
            <label>التشخيص</label>
            <input value={diagnosis} disabled={locked} onChange={e => setDiagnosis(e.target.value)} />
          </div>
          <div>
            <label>ملاحظات الدكتور</label>
            <textarea rows={2} value={notes} disabled={locked} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <label>طلب تحاليل / أشعة (اختياري)</label>
            <input value={labs} disabled={locked} onChange={e => setLabs(e.target.value)} placeholder="مثال: صورة دم كاملة" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ margin: 0 }}>الروشتة</label>
              {!locked && (
                <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 12 }} onClick={() => setMeds(prev => [...prev, { name: "", dose: "", freq: "", duration: "" }])}>
                  <Plus size={13} /> إضافة دواء
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meds.map((m, i) => (
                <div key={i} className="med-row">
                  <input placeholder="اسم الدواء" value={m.name} disabled={locked} onChange={e => updateMed(i, "name", e.target.value)} />
                  <input placeholder="الجرعة" value={m.dose} disabled={locked} onChange={e => updateMed(i, "dose", e.target.value)} />
                  <input placeholder="عدد المرات" value={m.freq} disabled={locked} onChange={e => updateMed(i, "freq", e.target.value)} />
                  <input placeholder="المدة" value={m.duration} disabled={locked} onChange={e => updateMed(i, "duration", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!locked && (
              <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={saving} onClick={handleSave}>
                <Check size={15} /> {saving ? "جاري الحفظ…" : existing ? "حفظ التعديلات" : "حفظ الكشف وإنهاء الزيارة"}
              </button>
            )}
            {locked && existing && (
              <>
                <button className="btn btn-outline" style={{ alignSelf: "flex-start" }} onClick={() => setLocked(false)}>
                  <Pencil size={15} /> تعديل الكشف
                </button>
                <button className="btn btn-outline" style={{ alignSelf: "flex-start" }} onClick={() => setPrintRecord(existing)}>
                  <Printer size={15} /> طباعة الروشتة
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
      <PrescriptionPrintSheet record={printRecord} patient={patient} doctor={doctor} />
    </>
  );
}
