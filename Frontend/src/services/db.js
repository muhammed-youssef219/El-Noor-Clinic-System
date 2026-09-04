// In-memory "database" seeded from /data. This is the single seam that a real
// backend integration replaces — every service function below reads/writes
// only through here, never touching the seed modules directly again.
import { DOCTORS } from "../data/doctors";
import { PATIENTS } from "../data/patients";
import { APPOINTMENTS } from "../data/appointments";
import { MEDICAL_RECORDS } from "../data/medicalRecords";
import { INVOICES } from "../data/invoices";
import { SERVICES_CATALOG } from "../data/servicesCatalog";
import { STAFF_USERS } from "../data/users";
import { AUDIT_LOG_SEED } from "../data/auditLog";
import { NOTIFICATIONS_SEED } from "../data/notifications";
import { LEAVES_SEED } from "../data/leaves";
import { CLINIC_SETTINGS_SEED } from "../data/clinicSettings";
import { SCHEDULE_EXCEPTIONS_SEED } from "../data/scheduleExceptions";

const STORAGE_KEY = "clinic-db-v1";

// Doctor/medicalRecord objects are cloned (not just the array) so edits made
// through services (profile updates, password changes) never mutate the
// original seed modules imported elsewhere.
function freshDb() {
  return {
    doctors: DOCTORS.map(d => ({ ...d, schedule: { ...d.schedule } })),
    patients: [...PATIENTS],
    appointments: [...APPOINTMENTS],
    medicalRecords: MEDICAL_RECORDS.map(r => ({ ...r, medications: r.medications.map(m => ({ ...m })) })),
    invoices: INVOICES.map(i => ({ ...i, services: i.services.map(s => ({ ...s })) })),
    servicesCatalog: [...SERVICES_CATALOG],
    staffUsers: STAFF_USERS.map(u => ({ ...u })),
    auditLog: [...AUDIT_LOG_SEED],
    notifications: [...NOTIFICATIONS_SEED],
    leaves: [...LEAVES_SEED],
    clinicSettings: { ...CLINIC_SETTINGS_SEED },
    scheduleExceptions: [...SCHEDULE_EXCEPTIONS_SEED],
  };
}

function loadDb() {
  if (typeof window === "undefined") return freshDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Backfill any keys added since the stored snapshot was written (e.g.
      // a returning session from before clinicSettings existed) instead of
      // discarding everything the user already has saved.
      return { ...freshDb(), ...JSON.parse(raw) };
    }
  } catch {
    // corrupted/old-shape data — fall back to a fresh seed below
  }
  return freshDb();
}

export const db = loadDb();

// Called after every mutation (every service funnels writes through
// recordAudit, so that's the single choke point that calls this) so state
// survives a page refresh without needing a real backend yet.
export function persistDb() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full/unavailable — mutation still succeeded in memory
  }
}

// Simulated network latency so loading states are real, not instant.
export function delay(ms = 260) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
