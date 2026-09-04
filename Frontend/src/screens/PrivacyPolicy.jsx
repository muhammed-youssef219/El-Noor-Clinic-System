import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

const SECTIONS = [
  {
    title: "البيانات اللي بنجمعها",
    body: "بياناتك الشخصية (الاسم، تاريخ الميلاد، النوع، الرقم القومي، رقم الهاتف، العنوان)، وبيانات صحية (فصيلة الدم، الحساسية، الأمراض المزمنة، تاريخ الزيارات، الكشوفات الطبية والروشتات)، وبيانات الفواتير والمدفوعات.",
  },
  {
    title: "الغرض من جمع البيانات",
    body: "استخدام بياناتك بيقتصر على: حجز وإدارة مواعيدك، متابعة حالتك الصحية من الدكتور المعالج، إصدار الفواتير ومتابعة المدفوعات، والتواصل معاك بخصوص مواعيدك (تذكيرات، تأكيد أو إلغاء).",
  },
  {
    title: "مين يقدر يشوف بياناتك",
    body: "بياناتك الطبية التفصيلية (التشخيص والكشف) متاحة بس للدكتور المعالج والأدمن. فريق الاستقبال يقدر يشوف بيانات التواصل والحجز والفواتير بس، من غير تفاصيل الكشف الطبي.",
  },
  {
    title: "تخزين وحماية البيانات",
    body: "بياناتك بتتخزن بشكل آمن ومش بتتشارك مع أي طرف تالت بدون موافقتك، إلا لو كان ده مطلوب قانونيًا.",
  },
  {
    title: "حقوقك",
    body: "تقدر تطلب في أي وقت مراجعة بياناتك المسجلة، تعديلها، أو حذف حسابك، من خلال التواصل مع إدارة العيادة مباشرة.",
  },
];

export const metadata = {
  title: "سياسة الخصوصية — عيادات النور",
  description: "سياسة الخصوصية وشروط استخدام بيانات المرضى في عيادات النور التخصصية.",
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-faint)", textDecoration: "none", marginBottom: 24 }}>
        <ArrowRight size={15} /> رجوع للرئيسية
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={20} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>سياسة الخصوصية</h1>
      </div>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.9, marginBottom: 28 }}>
        عيادات النور التخصصية بتحترم خصوصية بياناتك، والسياسة دي بتوضح إزاي بنجمع بياناتك ونستخدمها ونحميها.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map(s => (
          <div key={s.title} className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 8 }}>{s.title}</div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.9 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
