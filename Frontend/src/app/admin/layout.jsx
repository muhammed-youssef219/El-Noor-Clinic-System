import AdminShellClient from "./AdminShellClient";

// Auth-gated dashboard — never indexable.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <AdminShellClient>{children}</AdminShellClient>;
}
