export default function PrintHeader({ clinicName, title }) {
  return (
    <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 12, marginBottom: 18 }}>
      <div style={{ fontSize: 20, fontWeight: 900 }}>{clinicName}</div>
      <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{title}</div>
    </div>
  );
}
