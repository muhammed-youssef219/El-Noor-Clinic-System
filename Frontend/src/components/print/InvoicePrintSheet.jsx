import PrintHeader from "./PrintHeader";
import { fmtDate } from "../../lib/date";
import { STATUS_META } from "../../lib/constants";

const cell = { border: "1px solid #111", padding: "6px 8px", fontSize: 12.5, textAlign: "right" };

export default function InvoicePrintSheet({ invoice, patient, clinicName = "عيادات النور التخصصية" }) {
  if (!invoice) return null;
  return (
    <div className="print-sheet" style={{ padding: "24px 32px", fontFamily: "'Tajawal', sans-serif" }}>
      <PrintHeader clinicName={clinicName} title="فاتورة" />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontSize: 13 }}>
        <div>
          <div><strong>المريض:</strong> {patient?.name}</div>
          <div><strong>رقم الفاتورة:</strong> {invoice.id}</div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div><strong>التاريخ:</strong> {fmtDate(invoice.date)}</div>
          <div><strong>الحالة:</strong> {STATUS_META[invoice.status]?.label || invoice.status}</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={cell}>الخدمة</th>
            <th style={cell}>السعر</th>
          </tr>
        </thead>
        <tbody>
          {invoice.services.map((s, i) => (
            <tr key={i}>
              <td style={cell}>{s.name}</td>
              <td style={cell}>{s.price} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, borderTop: "2px solid #111", paddingTop: 10 }}>
        <span>الإجمالي</span>
        <span>{invoice.total} ج.م</span>
      </div>
      <div style={{ fontSize: 12.5, marginTop: 6, color: "#333" }}>طريقة الدفع: {invoice.method}</div>

      <div style={{ marginTop: 70, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #111", paddingTop: 6, fontSize: 12 }}>ختم العيادة</div>
        </div>
      </div>
    </div>
  );
}
