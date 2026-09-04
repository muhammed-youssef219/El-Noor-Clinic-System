import { TIME_SLOTS } from "./constants";
import { weekdayAr, todayISO } from "./date";

// All slots within the doctor's working hours for that weekday (schedule-only,
// no knowledge of existing bookings — see availableSlotsForDate for that).
export function scheduleSlotsForDay(doctor, weekday) {
  const hours = doctor?.schedule?.[weekday];
  if (!hours) return [];
  const [from, to] = hours;
  return TIME_SLOTS.filter(t => t >= from && t < to);
}

// A one-off exception on a specific date overrides that day's recurring
// weekly schedule entirely (can add hours on a normally-off day, shorten a
// normal day, or move it) — falls back to the weekly schedule when none exists.
export function scheduleSlotsForDate(doctor, date, exceptions) {
  const exception = (exceptions || []).find(e => e.doctorId === doctor?.id && e.date === date);
  if (exception) return TIME_SLOTS.filter(t => t >= exception.from && t < exception.to);
  return scheduleSlotsForDay(doctor, weekdayAr(date));
}

// Working-hour slots for a specific date, each flagged with whether it's
// still bookable (not already taken, and not in the past for today).
export function availableSlotsForDate(doctor, date, appointmentsThatDay, exceptions) {
  const slots = scheduleSlotsForDate(doctor, date, exceptions);
  const takenTimes = new Set(
    (appointmentsThatDay || []).filter(a => a.status !== "cancelled").map(a => a.time)
  );
  const isToday = date === todayISO(0);
  const nowTime = new Date().toTimeString().slice(0, 5);

  return slots.map(time => ({
    time,
    taken: takenTimes.has(time),
    past: isToday && time <= nowTime,
  }));
}
