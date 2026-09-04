import { useState } from "react";
import { Check, X as XIcon } from "lucide-react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import { confirmPaymentProof, rejectPaymentProof } from "../../services/invoicesService";

export default function ReviewPaymentModal({ invoice, patient, actor, onClose, onReviewed }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    await confirmPaymentProof(invoice.id, actor);
    setBusy(false);
    onReviewed();
  }

  async function handleReject() {
    setBusy(true);
    await rejectPaymentProof(invoice.id, actor);
    setBusy(false);
    onReviewed();
  }

  return (
    <Modal title="مراجعة إثبات الدفع" onClose={onClose} width={460}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Avatar name={patient?.name} size={36} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{patient?.name}</div>
          <div className="mono" style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>{invoice.total} ج.م</div>
        </div>
      </div>
      {invoice.proofPhoto ? (
        <img src={invoice.proofPhoto} alt="إثبات التحويل" style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card-2)", marginBottom: 14 }} />
      ) : (
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 14 }}>مفيش صورة مرفوعة.</div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={busy} onClick={handleConfirm}>
          <Check size={15} /> {busy ? "جاري الحفظ…" : "تأكيد استلام التحويل"}
        </button>
        <button className="btn btn-outline" style={{ color: "var(--danger)" }} disabled={busy} onClick={handleReject}>
          <XIcon size={15} /> التحويل مش واصل
        </button>
      </div>
    </Modal>
  );
}
