import { todayISO } from "../lib/date";

export const NOTIFICATIONS_SEED = [
  { id: "n1", type: "appointment-reminder", title: "تذكير بموعد", body: "تذكير: لديك موعد غدًا الساعة 10:00 صباحًا", channel: "SMS", status: "sent", sentAt: todayISO(0), read: false },
  { id: "n2", type: "booking-confirmation", title: "تأكيد حجز", body: "تم تأكيد حجز موعدك بنجاح", channel: "WhatsApp", status: "sent", sentAt: todayISO(0), read: false },
  { id: "n3", type: "follow-up", title: "متابعة", body: "حان موعد متابعة الحالة، برجاء التواصل مع العيادة", channel: "SMS", status: "sent", sentAt: todayISO(-1), read: true },
];
