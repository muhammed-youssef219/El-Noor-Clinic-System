"use client";

import RequireRole from "../../routes/RequireRole";
import Shell from "../../components/layout/Shell";

export default function AdminShellClient({ children }) {
  return (
    <RequireRole role="admin">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}
