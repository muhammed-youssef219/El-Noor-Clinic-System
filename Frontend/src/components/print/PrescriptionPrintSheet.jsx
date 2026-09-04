import PrintHeader from "./PrintHeader";
import { fmtDate, ageFromDob } from "../../lib/date";

const cell = { border: "1px solid #111", padding: "6px 8px", fontSize: 12.5, textAlign: "right" };

export default function PrescriptionPrintSheet({ record, patient, doctor, clinicName = "عيادات النور التخصصية" }) {
  if (!record) return null;
  return (
    <div className="print-sheet" style={{ padding: "24px 32px", fontFamily: "'Tajawal', sans-serif" }}>
      <PrintHeader clinicName={clinicName} title="روشتة طبية" />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontSize: 13 }}>
        <div>
          <div><strong>المريض:</strong> {patient?.name}</div>
          <div><strong>السن:</strong> {patient ? ageFromDob(patient.dob) : "—"} سنة · {patient?.gender}</div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div><strong>الدكتور:</strong> {doctor?.name}</div>
          <div><strong>التاريخ:</strong> {fmtDate(record.date)}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, marginBottom: 8 }}><strong>الشكوى الأساسية:</strong> {record.complaint || "—"}</div>
      <div style={{ fontSize: 13, marginBottom: 8 }}><strong>الفحص الإكلينيكي:</strong> {record.exam || "—"}</div>
      <div style={{ fontSize: 13, marginBottom: 8 }}><strong>التشخيص:</strong> {record.diagnosis || "—"}</div>
      {record.labs && <div style={{ fontSize: 13, marginBottom: 8 }}><strong>تحاليل / أشعة مطلوبة:</strong> {record.labs}</div>}

      <div style={{ fontWeight: 900, fontSize: 16, margin: "20px 0 8px" }}>℞</div>
      {record.medications?.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={cell}>الدواء</th>
              <th style={cell}>الجرعة</th>
              <th style={cell}>عدد المرات</th>
              <th style={cell}>المدة</th>
            </tr>
          </thead>
          <tbody>
            {record.medications.map((m, i) => (
              <tr key={i}>
                <td style={cell}>{m.name}</td>
                <td style={cell}>{m.dose}</td>
                <td style={cell}>{m.freq}</td>
                <td style={cell}>{m.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: 12.5, color: "#555" }}>لا توجد أدوية موصوفة.</div>
      )}

      {record.notes && (
        <div style={{ fontSize: 13, marginTop: 16 }}><strong>ملاحظات الدكتور:</strong> {record.notes}</div>
      )}

      <div style={{ marginTop: 70, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #111", paddingTop: 6, fontSize: 12 }}>توقيع وختم الطبيب</div>
        </div>
      </div>
    </div>
  );
}
