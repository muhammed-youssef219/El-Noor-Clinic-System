import { describe, it, expect, vi, afterEach } from "vitest";
import { scheduleSlotsForDay, scheduleSlotsForDate, availableSlotsForDate } from "./availability";
import { weekdayAr, shiftISO } from "./date";

// Derive the weekday name from the actual date helpers rather than
// hardcoding one, so the tests can't be wrong about which weekday a given
// ISO date falls on.
const WORK_DATE = "2025-11-30";
const WORK_WEEKDAY = weekdayAr(WORK_DATE);
const OFF_DATE = shiftISO(WORK_DATE, 1); // guaranteed to be a different weekday

const doctor = {
  id: "d1",
  schedule: {
    [WORK_WEEKDAY]: ["09:00", "12:00"],
  },
};

afterEach(() => {
  vi.useRealTimers();
});

describe("scheduleSlotsForDay", () => {
  it("returns the working-hour slots for a day the doctor works", () => {
    expect(scheduleSlotsForDay(doctor, WORK_WEEKDAY)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
  });

  it("returns an empty list for a day the doctor doesn't work", () => {
    expect(scheduleSlotsForDay(doctor, weekdayAr(OFF_DATE))).toEqual([]);
  });

  it("returns an empty list when the doctor is missing", () => {
    expect(scheduleSlotsForDay(null, WORK_WEEKDAY)).toEqual([]);
  });
});

describe("scheduleSlotsForDate", () => {
  it("falls back to the weekly schedule when there's no exception for that date", () => {
    expect(scheduleSlotsForDate(doctor, WORK_DATE, [])).toEqual(scheduleSlotsForDay(doctor, WORK_WEEKDAY));
  });

  it("lets a matching exception override the weekly schedule entirely", () => {
    const exceptions = [{ id: "e1", doctorId: "d1", date: OFF_DATE, from: "14:00", to: "16:00" }];
    // Doctor normally has no hours at all on OFF_DATE — the exception should still apply.
    expect(scheduleSlotsForDate(doctor, OFF_DATE, exceptions)).toEqual(["14:00", "14:30", "15:00", "15:30"]);
  });

  it("ignores exceptions for a different doctor or a different date", () => {
    const exceptions = [
      { id: "e1", doctorId: "someone-else", date: WORK_DATE, from: "14:00", to: "16:00" },
      { id: "e2", doctorId: "d1", date: shiftISO(WORK_DATE, 30), from: "14:00", to: "16:00" },
    ];
    expect(scheduleSlotsForDate(doctor, WORK_DATE, exceptions)).toEqual(scheduleSlotsForDay(doctor, WORK_WEEKDAY));
  });
});

describe("availableSlotsForDate", () => {
  it("marks a slot with a non-cancelled appointment as taken, but not a cancelled one", () => {
    const appts = [
      { time: "09:00", status: "confirmed" },
      { time: "09:30", status: "cancelled" },
    ];
    const slots = availableSlotsForDate(doctor, WORK_DATE, appts, []);
    expect(slots.find(s => s.time === "09:00").taken).toBe(true);
    expect(slots.find(s => s.time === "09:30").taken).toBe(false);
  });

  it("never double-books the same slot twice for the same doctor", () => {
    // The core no-double-booking guarantee: once a slot has a live booking,
    // it must always come back marked unavailable for a second booking attempt.
    const appts = [{ time: "10:00", status: "booked" }];
    const slots = availableSlotsForDate(doctor, WORK_DATE, appts, []);
    expect(slots.find(s => s.time === "10:00").taken).toBe(true);
  });

  it("marks past times as unbookable only when the date is today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${WORK_DATE}T10:15:00`));
    const slots = availableSlotsForDate(doctor, WORK_DATE, [], []);
    expect(slots.find(s => s.time === "09:00").past).toBe(true);
    expect(slots.find(s => s.time === "11:00").past).toBe(false);
  });

  it("doesn't mark anything past for a future date even at the same clock time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${shiftISO(WORK_DATE, -5)}T10:15:00`));
    const slots = availableSlotsForDate(doctor, WORK_DATE, [], []);
    expect(slots.every(s => !s.past)).toBe(true);
  });

  it("uses a schedule exception's hours instead of the weekly schedule", () => {
    const exceptions = [{ id: "e1", doctorId: "d1", date: WORK_DATE, from: "13:00", to: "14:00" }];
    const slots = availableSlotsForDate(doctor, WORK_DATE, [], exceptions);
    expect(slots.map(s => s.time)).toEqual(["13:00", "13:30"]);
  });
});
