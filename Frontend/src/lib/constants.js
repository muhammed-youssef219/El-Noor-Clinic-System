import {
  LayoutDashboard, Stethoscope, Users, Wallet, FileBarChart, Settings,
  Calendar, Receipt, CalendarClock, Plus, FileText, ClipboardList, UserCog,
} from "lucide-react";

export const ROLE_LABEL = {
  admin: "أدمن",
  reception: "الاستقبال",
  doctor: "دكتور",
  patient: "مريض",
};

export const NAV = {
  admin: [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "doctors", label: "الدكاترة", icon: Stethoscope },
    { id: "patients", label: "المرضى", icon: Users },
    { id: "users", label: "المستخدمين والصلاحيات", icon: Users },
    { id: "services", label: "الخدمات والأسعار", icon: Wallet },
    { id: "billing", label: "الفواتير", icon: Receipt },
    { id: "reports", label: "التقارير", icon: FileBarChart },
    { id: "audit-log", label: "سجل العمليات", icon: ClipboardList },
    { id: "profile", label: "حسابي", icon: UserCog },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ],
  reception: [
    { id: "calendar", label: "جدول المواعيد", icon: Calendar },
    { id: "patients", label: "المرضى", icon: Users },
    { id: "billing", label: "الفواتير", icon: Receipt },
    { id: "profile", label: "بياناتي", icon: UserCog },
  ],
  doctor: [
    { id: "schedule", label: "جدولي اليومي", icon: CalendarClock },
    { id: "patients", label: "مرضاي", icon: Users },
    { id: "leaves", label: "إجازاتي", icon: Calendar },
    { id: "profile", label: "بياناتي الشخصية", icon: UserCog },
  ],
  patient: [
    { id: "appointments", label: "مواعيدي", icon: CalendarClock },
    { id: "book", label: "حجز موعد", icon: Plus },
    { id: "file", label: "ملفي الطبي", icon: FileText },
    { id: "invoices", label: "فواتيري", icon: Receipt },
  ],
};

export const STATUS_META = {
  booked: { label: "محجوز", color: "info" },
  confirmed: { label: "مؤكد", color: "success" },
  completed: { label: "تم الحضور", color: "primary" },
  cancelled: { label: "ملغي", color: "danger" },
  "no-show": { label: "لم يحضر", color: "gold" },
  paid: { label: "مدفوعة", color: "success" },
  pending: { label: "معلقة", color: "gold" },
  awaiting_verification: { label: "بانتظار مراجعة التحويل", color: "info" },
  partial: { label: "جزئي", color: "info" },
  active: { label: "نشط", color: "success" },
  suspended: { label: "موقوف", color: "danger" },
};

export const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export const VISIT_TYPES = ["كشف جديد", "متابعة", "استشارة"];

export const PAYMENT_METHODS = ["كاش", "فيزا", "تأمين", "تحويل"];
