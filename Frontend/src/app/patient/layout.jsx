import PatientShellClient from "./PatientShellClient";

export const metadata = { robots: { index: false, follow: false } };

export default function PatientLayout({ children }) {
  return <PatientShellClient>{children}</PatientShellClient>;
}
