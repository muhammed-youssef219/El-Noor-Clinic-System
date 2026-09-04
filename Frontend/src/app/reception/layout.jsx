import ReceptionShellClient from "./ReceptionShellClient";

export const metadata = { robots: { index: false, follow: false } };

export default function ReceptionLayout({ children }) {
  return <ReceptionShellClient>{children}</ReceptionShellClient>;
}
