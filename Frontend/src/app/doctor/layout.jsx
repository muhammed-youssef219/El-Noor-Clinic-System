import DoctorShellClient from "./DoctorShellClient";

export const metadata = { robots: { index: false, follow: false } };

export default function DoctorLayout({ children }) {
  return <DoctorShellClient>{children}</DoctorShellClient>;
}
