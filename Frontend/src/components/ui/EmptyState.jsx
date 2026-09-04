export default function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--ink-faint)" }}>
      {Icon && <Icon size={30} style={{ marginBottom: 10, opacity: 0.5 }} />}
      <div style={{ fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
  );
}
