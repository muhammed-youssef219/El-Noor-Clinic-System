const COLOR_VARS = {
  primary: { bg: "var(--primary-soft)", c: "var(--primary)" },
  accent: { bg: "var(--accent-soft)", c: "var(--accent)" },
  gold: { bg: "var(--gold-soft)", c: "var(--gold)" },
  info: { bg: "var(--info-soft)", c: "var(--info)" },
  success: { bg: "var(--success-soft)", c: "var(--success)" },
  danger: { bg: "var(--danger-soft)", c: "var(--danger)" },
};

export default function StatCard({ icon: Icon, label, value, sub, color = "primary" }) {
  const s = COLOR_VARS[color] || COLOR_VARS.primary;
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-faint)" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={s.c} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{sub}</div>}
    </div>
  );
}
