"use client";

import RequireRole from "../../routes/RequireRole";
import Shell from "../../components/layout/Shell";

export default function ReceptionShellClient({ children }) {
  return (
    <RequireRole role="reception">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}
