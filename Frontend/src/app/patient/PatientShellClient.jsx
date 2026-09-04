"use client";

import RequireRole from "../../routes/RequireRole";
import Shell from "../../components/layout/Shell";

export default function PatientShellClient({ children }) {
  return (
    <RequireRole role="patient">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}
