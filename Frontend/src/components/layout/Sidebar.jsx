import { LogOut, Building2, X } from "lucide-react";
import { NAV } from "../../lib/constants";

export default function Sidebar({ role, activeId, onNavigate, onLogout, open, onClose }) {
  const items = NAV[role];
  return (
    <aside className={"app-sidebar" + (open ? " open" : "")} style={{ background: "var(--primary-dark)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={17} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>عيادات النور</div>
          <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10.5 }}>نظام إدارة العيادة</div>
        </div>
        <button className="mobile-menu-btn" style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4 }} onClick={onClose} aria-label="إغلاق القائمة">
          <X size={18} />
        </button>
      </div>
      {items.map(it => (
        <div
          key={it.id}
          className={"sidebar-item" + (activeId === it.id ? " active" : "")}
          onClick={() => onNavigate(it.id)}
        >
          <it.icon size={17} />
          <span>{it.label}</span>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div className="sidebar-item" onClick={onLogout}>
        <LogOut size={17} />
        <span>تسجيل الخروج</span>
      </div>
    </aside>
  );
}
