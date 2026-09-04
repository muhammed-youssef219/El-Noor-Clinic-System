export const DEFAULT_DOCTOR_PASSWORD = "Clinic@123";

export const DOCTORS = [
  {
    id: "d1", name: "د. أحمد المصري", specialtyKey: "general", license: "12045", exp: 14,
    email: "ahmed.masry@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "استشاري باطنة عامة، خبرة في أمراض السكر والغدد الصماء.", price: 250, followUp: 150, rating: 4.8,
    schedule: { "السبت": ["09:00", "14:00"], "الاثنين": ["09:00", "14:00"], "الأربعاء": ["09:00", "14:00"] },
  },
  {
    id: "d2", name: "د. مروة سالم", specialtyKey: "dermatology", license: "12881", exp: 9,
    email: "marwa.salem@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "أخصائية جلدية وتجميل، مهتمة بحالات حب الشباب والصدفية.", price: 300, followUp: 180, rating: 4.9,
    schedule: { "الأحد": ["12:00", "20:00"], "الثلاثاء": ["12:00", "20:00"], "الخميس": ["12:00", "18:00"] },
  },
  {
    id: "d3", name: "د. كريم فتحي", specialtyKey: "dental", license: "10233", exp: 11,
    email: "kareem.fathy@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "استشاري تقويم وزراعة أسنان.", price: 200, followUp: 100, rating: 4.7,
    schedule: { "السبت": ["10:00", "18:00"], "الاثنين": ["10:00", "18:00"], "الأربعاء": ["10:00", "18:00"] },
  },
  {
    id: "d4", name: "د. هبة عبد الرحيم", specialtyKey: "obgyn", license: "13320", exp: 16,
    email: "heba.abdelrahim@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "استشارية نساء وتوليد وحديثي الولادة.", price: 350, followUp: 200, rating: 5.0,
    schedule: { "الأحد": ["11:00", "17:00"], "الثلاثاء": ["11:00", "17:00"], "الخميس": ["11:00", "17:00"] },
  },
  {
    id: "d5", name: "د. يوسف عادل", specialtyKey: "pediatrics", license: "11567", exp: 8,
    email: "youssef.adel@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "أخصائي طب أطفال وحديثي الولادة.", price: 220, followUp: 120, rating: 4.6,
    schedule: { "السبت": ["16:00", "22:00"], "الأحد": ["16:00", "22:00"], "الثلاثاء": ["16:00", "22:00"] },
  },
  {
    id: "d6", name: "د. سامح جرجس", specialtyKey: "orthopedics", license: "10998", exp: 20,
    email: "sameh.gerges@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "استشاري جراحة عظام ومفاصل.", price: 300, followUp: 180, rating: 4.8,
    schedule: { "الاثنين": ["10:00", "16:00"], "الأربعاء": ["10:00", "16:00"] },
  },
  {
    id: "d7", name: "د. هدى شفيق", specialtyKey: "cardiology", license: "12455", exp: 13,
    email: "hoda.shafik@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "استشارية قلب وقسطرة.", price: 400, followUp: 220, rating: 4.9,
    schedule: { "الأحد": ["09:00", "15:00"], "الخميس": ["09:00", "15:00"] },
  },
  {
    id: "d8", name: "د. عمر راشد", specialtyKey: "ophthalmology", license: "11020", exp: 10,
    email: "omar.rashed@clinic.eg", password: DEFAULT_DOCTOR_PASSWORD,
    bio: "أخصائي جراحة عيون وليزك.", price: 250, followUp: 150, rating: 4.7,
    schedule: { "السبت": ["12:00", "18:00"], "الثلاثاء": ["12:00", "18:00"] },
  },
];
