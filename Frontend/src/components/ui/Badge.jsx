import { STATUS_META } from "../../lib/constants";

const COLOR_VARS = {
  success: { bg: "var(--success-soft)", c: "var(--success)" },
  danger: { bg: "var(--danger-soft)", c: "var(--danger)" },
  gold: { bg: "var(--gold-soft)", c: "var(--gold)" },
  info: { bg: "var(--info-soft)", c: "var(--info)" },
  primary: { bg: "var(--primary-soft)", c: "var(--primary)" },
};

export default function Badge({ status, label }) {
  const meta = STATUS_META[status] || { label: label || status, color: "info" };
  const s = COLOR_VARS[meta.color] || COLOR_VARS.info;
  return (
    <span className="badge" style={{ background: s.bg, color: s.c }}>
      {label || meta.label}
    </span>
  );
}
