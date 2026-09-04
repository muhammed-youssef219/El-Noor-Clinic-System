import SectionHeader from "../../components/ui/SectionHeader";
import StaffAccountPanel from "../../components/settings/StaffAccountPanel";
import { useAuth } from "../../context/AuthContext";

export default function ReceptionProfile() {
  const { auth, staffUserId, login } = useAuth();

  return (
    <div>
      <SectionHeader title="بياناتي" sub="بيانات حساب الدخول الخاص بك" />
      {auth && <StaffAccountPanel user={auth} staffUserId={staffUserId} onSaved={() => login(auth)} roleLabel="الاستقبال" />}
    </div>
  );
}
