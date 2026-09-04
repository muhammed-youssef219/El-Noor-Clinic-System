"use client";

import RequireRole from "../../routes/RequireRole";
import Shell from "../../components/layout/Shell";

export default function DoctorShellClient({ children }) {
  return (
    <RequireRole role="doctor">
      <Shell>{children}</Shell>
    </RequireRole>
  );
}
