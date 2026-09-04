import { todayISO } from "../lib/date";

export const APPOINTMENTS = [
  { id: "a1", patientId: "p1", doctorId: "d1", date: todayISO(0), time: "09:00", duration: 20, type: "متابعة", status: "confirmed", notes: "", bookedBy: "reception" },
  { id: "a2", patientId: "p2", doctorId: "d2", date: todayISO(0), time: "12:30", duration: 20, type: "كشف جديد", status: "confirmed", notes: "حساسية جلدية متكررة", bookedBy: "reception" },
  { id: "a3", patientId: "p3", doctorId: "d1", date: todayISO(0), time: "09:40", duration: 20, type: "متابعة", status: "completed", notes: "", bookedBy: "reception" },
  { id: "a4", patientId: "p5", doctorId: "d7", date: todayISO(0), time: "09:00", duration: 30, type: "متابعة", status: "completed", notes: "متابعة قسطرة", bookedBy: "reception" },
  { id: "a5", patientId: "p4", doctorId: "d3", date: todayISO(0), time: "10:20", duration: 30, type: "كشف جديد", status: "booked", notes: "", bookedBy: "patient" },
  { id: "a6", patientId: "p6", doctorId: "d4", date: todayISO(0), time: "11:00", duration: 20, type: "استشارة", status: "cancelled", notes: "", bookedBy: "reception" },
  { id: "a7", patientId: "p7", doctorId: "d5", date: todayISO(0), time: "16:30", duration: 20, type: "كشف جديد", status: "booked", notes: "حرارة مرتفعة", bookedBy: "reception" },
  { id: "a8", patientId: "p8", doctorId: "d2", date: todayISO(0), time: "13:10", duration: 20, type: "متابعة", status: "no-show", notes: "", bookedBy: "reception" },
  { id: "a9", patientId: "p1", doctorId: "d6", date: todayISO(1), time: "10:00", duration: 30, type: "كشف جديد", status: "booked", notes: "", bookedBy: "reception" },
  { id: "a10", patientId: "p3", doctorId: "d8", date: todayISO(2), time: "12:00", duration: 20, type: "متابعة", status: "confirmed", notes: "", bookedBy: "reception" },
];
