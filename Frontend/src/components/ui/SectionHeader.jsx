export default function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
