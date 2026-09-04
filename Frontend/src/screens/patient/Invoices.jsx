import { useState } from "react";
import { Receipt, CreditCard, AlertCircle, Printer, Wallet } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import InvoicePrintSheet from "../../components/print/InvoicePrintSheet";
import PaymentProofModal from "../../components/billing/PaymentProofModal";
import { useInvoices } from "../../hooks/useInvoices";
import { useAuth } from "../../context/AuthContext";
import { usePrint } from "../../hooks/usePrint";
import { fmtDate } from "../../lib/date";

export default function PatientInvoices() {
  const { patientId, userLabel } = useAuth();
  const { data: invoices, loading, reload } = useInvoices({ patientId });
  const [printInvoice, setPrintInvoice] = usePrint();
  const [payingInvoice, setPayingInvoice] = useState(null);

  const totalPaid = loading ? 0 : invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = loading ? 0 : invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);

  function handleSubmitted() {
    setPayingInvoice(null);
    reload();
  }

  return (
    <div>
      <SectionHeader title="فواتيري" sub="سجل مدفوعاتي" />
      {loading ? (
        <div className="card" style={{ marginBottom: 14, maxWidth: 480 }}><SkeletonRows rows={1} cols={2} /></div>
      ) : (
        <div className="split-grid" style={{ gap: 14, marginBottom: 20, maxWidth: 480 }}>
          <StatCard icon={CreditCard} label="إجمالي المدفوع" value={totalPaid.toLocaleString("ar-EG") + " ج.م"} color="success" />
          <StatCard icon={AlertCircle} label="مستحق عليّ" value={totalPending.toLocaleString("ar-EG") + " ج.م"} color="gold" />
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={3} cols={4} /></div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="لا توجد فواتير بعد" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 560 }}>
            <thead><tr><th>التاريخ</th><th>الخدمات</th><th>الإجمالي</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {invoices.map(i => (
                <tr key={i.id}>
                  <td>{fmtDate(i.date)}</td>
                  <td>{i.services.map(s => s.name).join("، ")}</td>
                  <td className="mono">{i.total} ج.م</td>
                  <td><Badge status={i.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {i.status === "pending" && (
                        <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setPayingInvoice(i)}>
                          <Wallet size={13} /> ادفع بالتحويل
                        </button>
                      )}
                      <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setPrintInvoice(i)}>
                        <Printer size={13} /> طباعة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <InvoicePrintSheet invoice={printInvoice} patient={{ name: userLabel }} />
      {payingInvoice && (
        <PaymentProofModal invoice={payingInvoice} actor={userLabel} onClose={() => setPayingInvoice(null)} onSubmitted={handleSubmitted} />
      )}
    </div>
  );
}
