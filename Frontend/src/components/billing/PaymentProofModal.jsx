import { useRef, useState } from "react";
import { Copy, Check, Upload, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import { useClinicSettings } from "../../hooks/useClinicSettings";
import { submitPaymentProof } from "../../services/invoicesService";
import { fileToCompressedDataUrl } from "../../lib/image";

export default function PaymentProofModal({ invoice, actor, onClose, onSubmitted }) {
  const { data: settings, loading: settingsLoading } = useClinicSettings();
  const [photo, setPhoto] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("من فضلك اختر ملف صورة");
      return;
    }
    setError("");
    try {
      setPhoto(await fileToCompressedDataUrl(file));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(settings.paymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSubmit() {
    if (!photo) { setError("من فضلك ارفع صورة إثبات التحويل أولاً"); return; }
    setSaving(true);
    setError("");
    try {
      await submitPaymentProof(invoice.id, photo, actor);
      onSubmitted();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title="الدفع بالتحويل" onClose={onClose} width={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "var(--paper)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>
          حوّل مبلغ <strong className="mono">{invoice.total} ج.م</strong> على الرقم ده، وبعدين ارفع صورة إثبات التحويل تحت:
        </div>
        {settingsLoading ? (
          <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>جاري التحميل…</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px" }}>
            <span className="mono" style={{ fontSize: 16, fontWeight: 800, flex: 1 }}>{settings.paymentNumber}</span>
            <button type="button" className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }} onClick={handleCopy}>
              {copied ? <><Check size={13} /> اتنسخ</> : <><Copy size={13} /> نسخ</>}
            </button>
          </div>
        )}

        <div>
          <label>صورة إثبات التحويل *</label>
          {photo ? (
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
              <img src={photo} alt="إثبات التحويل" style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block", background: "var(--card-2)" }} />
              <button type="button" className="btn btn-outline" style={{ position: "absolute", bottom: 8, left: 8, padding: "5px 10px", fontSize: 12, background: "var(--card)" }} onClick={() => inputRef.current?.click()}>
                تغيير الصورة
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", padding: "16px 0" }} onClick={() => inputRef.current?.click()}>
              <Upload size={15} /> ارفع صورة السكرين شوت
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger)", fontSize: 12.5 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <button className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }} onClick={handleSubmit}>
          <Check size={15} /> {saving ? "جاري الإرسال…" : "إرسال إثبات الدفع"}
        </button>
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>هتراجع الاستقبال إثبات الدفع وتأكده — الفاتورة هتفضل "بانتظار مراجعة التحويل" لحد وقتها.</div>
      </div>
    </Modal>
  );
}
