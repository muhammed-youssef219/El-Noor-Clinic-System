import { Construction } from "lucide-react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";

export default function PageStub({ title, sub }) {
  return (
    <div>
      <SectionHeader title={title} sub={sub} />
      <div className="card">
        <EmptyState icon={Construction} title="هذه الشاشة قيد الإنشاء" sub="سيتم استكمالها في المرحلة القادمة من البناء" />
      </div>
    </div>
  );
}
