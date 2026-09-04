import { useState } from "react";
import { Receipt, CreditCard, AlertCircle, FileStack, Download, Printer, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import SectionHeader from "../ui/SectionHeader";
import EmptyState from "../ui/EmptyState";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import StatCard from "../ui/StatCard";
import { SkeletonRows } from "../ui/Skeleton";
import InvoicePrintSheet from "../print/InvoicePrintSheet";
import ReviewPaymentModal from "./ReviewPaymentModal";
import { useInvoices } from "../../hooks/useInvoices";
import { usePatients } from "../../hooks/usePatients";
import { useAuth } from "../../context/AuthContext";
import { usePrint } from "../../hooks/usePrint";
import { markInvoicePaid } from "../../services/invoicesService";
import { exportToCsv } from "../../lib/csv";
import { fmtDate, todayISO } from "../../lib/date";
import { STATUS_META } from "../../lib/constants";

const TABS = [["all", "الكل"], ["paid", "مدفوعة"], ["pending", "معلقة"], ["awaiting_verification", "بانتظار المراجعة"]];
const METHOD_COLORS = { "كاش": "var(--primary)", "فيزا": "var(--info)", "تأمين": "var(--gold)", "تحويل": "var(--accent)" };

export default function BillingView() {
  const [tab, setTab] = useState("all");
  const { userLabel } = useAuth();
  const { data: invoices, loading, reload } = useInvoices({ status: tab });
  const { data: patients } = usePatients();
  const { data: allInvoices, loading: allLoading } = useInvoices();
  const [printInvoice, setPrintInvoice] = usePrint();
  const [collectingId, setCollectingId] = useState(null);
  const [collectError, setCollectError] = useState("");
  const [reviewingInvoice, setReviewingInvoice] = useState(null);

  const totalPaid = (allInvoices || []).filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = (allInvoices || []).filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);

  const methodBreakdown = allLoading ? [] : Object.keys(METHOD_COLORS)
    .map(method => ({ name: method, value: allInvoices.filter(i => i.method === method).length }))
    .filter(m => m.value > 0);

  function patientOf(id) {
    return (patients || []).find(p => p.id === id);
  }

  async function handleCollect(id) {
    setCollectingId(id);
    setCollectError("");
    try {
      await markInvoicePaid(id, userLabel);
      reload();
    } catch {
      setCollectError("حدث خطأ أثناء تحصيل الفاتورة، حاول مرة أخرى");
    } finally {
      setCollectingId(null);
    }
  }

  function handleExport() {
    exportToCsv(
      `الفواتير-${todayISO(0)}.csv`,
      ["المريض", "الخدمات", "الإجمالي", "طريقة الدفع", "الحالة", "التاريخ"],
      invoices.map(inv => [
        patientOf(inv.patientId)?.name || "",
        inv.services.map(s => s.name).join("، "),
        inv.total,
        inv.method,
        STATUS_META[inv.status]?.label || inv.status,
        fmtDate(inv.date),
      ])
    );
  }

  return (
    <div>
      <SectionHeader
        title="الفواتير" sub="متابعة المدفوعات المالية"
        action={!loading && invoices.length > 0 && <button className="btn btn-outline" onClick={handleExport}><Download size={15} /> تصدير CSV</button>}
      />
      <div className="split-grid" style={{ "--split": "1fr 1fr 1.2fr", marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StatCard icon={CreditCard} label="تم تحصيله" value={totalPaid.toLocaleString("ar-EG") + " ج.م"} color="primary" />
          <StatCard icon={AlertCircle} label="مستحق" value={totalPending.toLocaleString("ar-EG") + " ج.م"} color="gold" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StatCard icon={FileStack} label="إجمالي الفواتير" value={allLoading ? 0 : allInvoices.length} color="info" />
          <StatCard icon={Receipt} label="فواتير معلقة" value={allLoading ? 0 : allInvoices.filter(i => i.status === "pending").length} color="accent" />
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 4 }}>توزيع طرق الدفع</div>
          {allLoading || methodBreakdown.length === 0 ? (
            <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: 12 }}>لا توجد بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55} paddingAngle={2}>
                  {methodBreakdown.map((m, i) => <Cell key={i} fill={METHOD_COLORS[m.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Tajawal", fontSize: 12, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? "btn btn-primary" : "btn btn-outline"} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {collectError && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginBottom: 14 }}>
          <AlertTriangle size={15} /> {collectError}
        </div>
      )}
      {loading ? (
        <div className="card"><SkeletonRows rows={4} cols={5} /></div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="لا توجد فواتير" />
      ) : (
        <div className="card table-scroll" style={{ padding: 0 }}>
          <table style={{ minWidth: 680 }}>
            <thead><tr><th>المريض</th><th>الخدمات</th><th>الإجمالي</th><th>طريقة الدفع</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {invoices.map(inv => {
                const p = patientOf(inv.patientId);
                return (
                  <tr key={inv.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={p?.name} size={26} />{p?.name}</td>
                    <td style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{inv.services.map(s => s.name).join("، ")}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>{inv.total} ج.م</td>
                    <td>{inv.method}</td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {inv.status === "pending" && (
                          <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} disabled={collectingId === inv.id} onClick={() => handleCollect(inv.id)}>
                            {collectingId === inv.id ? "جاري التحصيل…" : "تحصيل"}
                          </button>
                        )}
                        {inv.status === "awaiting_verification" && (
                          <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--info)" }} onClick={() => setReviewingInvoice({ invoice: inv, patient: p })}>
                            مراجعة التحويل
                          </button>
                        )}
                        <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setPrintInvoice({ invoice: inv, patient: p })}>
                          <Printer size={12} /> طباعة
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <InvoicePrintSheet invoice={printInvoice?.invoice} patient={printInvoice?.patient} />
      {reviewingInvoice && (
        <ReviewPaymentModal
          invoice={reviewingInvoice.invoice}
          patient={reviewingInvoice.patient}
          actor={userLabel}
          onClose={() => setReviewingInvoice(null)}
          onReviewed={() => { setReviewingInvoice(null); reload(); }}
        />
      )}
    </div>
  );
}
