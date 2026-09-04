"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { useIdleLogout } from "../../hooks/useIdleLogout";

export default function Shell({ children }) {
  const { role, userLabel, roleLabel, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const activeId = pathname.split("/")[2];
  const [menuOpen, setMenuOpen] = useState(false);

  useIdleLogout();

  function handleNavigate(id) {
    router.push(`/${role}/${id}`);
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role={role} activeId={activeId} onNavigate={handleNavigate} onLogout={handleLogout} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={"sidebar-backdrop" + (menuOpen ? " open" : "")} onClick={() => setMenuOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar userLabel={userLabel} roleLabel={roleLabel} onMenuClick={() => setMenuOpen(o => !o)} />
        <main className="app-main" style={{ flex: 1, position: "relative", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
