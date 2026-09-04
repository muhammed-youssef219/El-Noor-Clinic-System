export const SPECIALTIES = [
  { id: "sp1", key: "general", name: "باطنة عامة" },
  { id: "sp2", key: "dermatology", name: "جلدية" },
  { id: "sp3", key: "dental", name: "أسنان" },
  { id: "sp4", key: "obgyn", name: "نساء وتوليد" },
  { id: "sp5", key: "pediatrics", name: "أطفال" },
  { id: "sp6", key: "orthopedics", name: "عظام" },
  { id: "sp7", key: "cardiology", name: "قلب" },
  { id: "sp8", key: "ophthalmology", name: "عيون" },
];

export function specialtyByKey(key) {
  return SPECIALTIES.find(s => s.key === key);
}
