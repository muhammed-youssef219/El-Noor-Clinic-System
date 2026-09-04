import SectionHeader from "../../components/ui/SectionHeader";
import { SkeletonRows } from "../../components/ui/Skeleton";
import StaffAccountPanel from "../../components/settings/StaffAccountPanel";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../hooks/useUsers";

export default function AdminProfile() {
  const { staffUserId } = useAuth();
  const { data: users, loading, reload } = useUsers();
  const me = (users || []).find(u => u.id === staffUserId);

  return (
    <div>
      <SectionHeader title="حسابي" sub="بيانات حساب الدخول الخاص بك" />
      {loading || !me ? (
        <div className="card"><SkeletonRows rows={4} cols={2} /></div>
      ) : (
        <StaffAccountPanel user={me} staffUserId={staffUserId} onSaved={reload} roleLabel="أدمن / صاحب العيادة" />
      )}
    </div>
  );
}
