import { todayISO } from "../lib/date";

export const MEDICAL_RECORDS = [
  {
    id: "mr1", appointmentId: "a3", patientId: "p3", doctorId: "d1",
    complaint: "دوخة وصداع متكرر", exam: "ضغط الدم 150/95، نبض منتظم",
    diagnosis: "ارتفاع ضغط الدم غير منضبط", notes: "تعديل جرعة الدواء والمتابعة بعد أسبوعين",
    date: todayISO(0), labs: "تحليل دم شامل",
    medications: [{ name: "أملوديبين", dose: "5mg", freq: "مرة يوميًا", duration: "30 يوم" }],
  },
  {
    id: "mr2", appointmentId: "a4", patientId: "p5", doctorId: "d7",
    complaint: "ضيق تنفس عند المجهود", exam: "أصوات قلب طبيعية، تخطيط قلب مستقر",
    diagnosis: "قصور تاجي خفيف - متابعة دورية", notes: "الاستمرار على العلاج الحالي",
    date: todayISO(0), labs: "إيكو قلب، متابعة بعد 3 شهور",
    medications: [
      { name: "بيسوبرولول", dose: "2.5mg", freq: "مرة يوميًا", duration: "90 يوم" },
      { name: "أسبرين", dose: "81mg", freq: "مرة يوميًا", duration: "مستمر" },
    ],
  },
];
