import { todayISO } from "../lib/date";

export const INVOICES = [
  { id: "inv1", patientId: "p3", appointmentId: "a3", services: [{ name: "كشف متابعة - باطنة", price: 150 }], total: 150, method: "كاش", status: "paid", date: todayISO(0) },
  { id: "inv2", patientId: "p5", appointmentId: "a4", services: [{ name: "كشف متابعة - قلب", price: 220 }, { name: "تخطيط قلب", price: 120 }], total: 340, method: "فيزا", status: "paid", date: todayISO(0) },
  { id: "inv3", patientId: "p2", appointmentId: "a2", services: [{ name: "كشف جديد - جلدية", price: 300 }], total: 300, method: "كاش", status: "pending", date: todayISO(0) },
  { id: "inv4", patientId: "p8", appointmentId: "a8", services: [{ name: "كشف متابعة - جلدية", price: 180 }], total: 180, method: "تأمين", status: "pending", date: todayISO(0) },
];
