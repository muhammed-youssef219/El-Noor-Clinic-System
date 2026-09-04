# Backend Implementation Plan — Al Noor Specialized Clinics

## Scope and repository findings

This is an **analysis-only** plan based on `BACKEND_REQUIREMENTS.md`. No hospital backend, frontend, routes, migrations, models, or API endpoints have been implemented as part of this plan.

### Repository audit

| Area | Finding |
| --- | --- |
| Current backend | A fresh Laravel 13.17 skeleton on PHP 8.3. It has one web route (`GET /`), the default `User` model, and only Laravel's default `users`, `password_reset_tokens`, `sessions`, `cache`, and `jobs` migrations. There is no `routes/api.php`, no API controller, no domain model, no policy, and no business service. |
| Database | SQLite is configured locally and the three default migrations have run. It contains no clinic domain schema or data. |
| Current frontend | There is no hospital frontend in this repository. `resources/js/app.js` is empty; `resources/views/welcome.blade.php` is Laravel's welcome page. Vite + Tailwind CSS are installed, but no React/Vue or application UI framework is installed. |
| Services / hooks / types | No `src/`, `services/`, `hooks/`, `lib/`, component, type, or model files for the hospital UI exist. |
| API-like functions | No `fetch`, Axios, XMLHttpRequest, API client, or API route exists. The sole API-related behavior is JSON exception rendering for `api/*` in `bootstrap/app.php`. |
| Mock data / browser storage | No `db.js`, `localStorage`, `sessionStorage`, IndexedDB, fixtures, or hospital mock data exists in the repository. |
| Tests | Only Laravel's default example feature and unit tests exist; there are no hospital tests. |
| Version control | This directory does not contain a usable `.git` worktree, so change history and pre-existing uncommitted changes cannot be assessed here. |

The requirements refer to an existing frontend under `src/services/*.js`, `src/hooks/*.js`, `AuthContext.jsx`, `lib/availability.js`, and `lib/date.js`. Those files are **not present** in this repository. Consequently, their stated mocks and frontend implementations cannot be verified or changed from this checkout. The frontend integration mapping below is therefore a requirements-level mapping, not a file-level audit of actual frontend code.

## 1. Architecture

Build a Laravel REST API under `/api/v1`, with thin controllers, Form Requests for validation, API Resources for response shaping, Policies/Gates for authorization, and domain services for operations that must be atomic or have cross-model effects:

- `AppointmentBookingService`: availability calculation and transactional booking.
- `MedicalRecordService`: create/update a record and mark its appointment completed in one transaction; optionally create an invoice only when that policy is agreed.
- `InvoicePaymentService`: payment-proof upload, verification, rejection, and ordinary collection rules.
- `AuditLogger`: centralized audit recording through domain events/listeners or an explicit reusable action, never a client-supplied audit endpoint.
- Notifications should be persisted in-app first through Laravel notifications/queued jobs. SMS/WhatsApp remains a later external integration, as required.

Use PostgreSQL in production for transactional integrity and an active-booking unique constraint; SQLite may remain only for local development and fast tests. Store uploaded doctor photos and payment proofs outside the database, with the database retaining the storage path/URL and metadata. Use queues for non-blocking notifications and scheduled jobs for eventual reminders.

Keep the existing Laravel skeleton files where they are useful: extend `bootstrap/app.php` for API routing/middleware, extend the default `User` model and auth configuration, and add new migrations rather than replacing existing migration history. The current `routes/web.php`/welcome page is unrelated to the API and should not be used as the API surface.

### Existing requirement-to-repository mapping

| Requirement feature | Existing repository file(s) | Planned treatment |
| --- | --- | --- |
| Authentication and user identity | `app/Models/User.php`, default users/password reset/session migration, `config/auth.php` | Reuse and extend into a single account model with role/profile relations; replace the default single-role assumptions. |
| REST API routing / role middleware | `bootstrap/app.php` only | Add API route registration and role/authorization middleware from scratch. |
| Doctors, patients, appointments, records, invoices, catalog, leaves, notifications, audit, settings, specialties, schedule exceptions | None | Build backend domain schema, models, policies, services, controllers, resources, and tests from scratch. |
| Frontend mock services listed in the requirements | Not present (`src/services/*.js` missing) | No file can be reused or replaced in this checkout. When the frontend repository is supplied, replace its local-service calls with a shared API client while preserving screen contracts. |
| Frontend hooks and `AuthContext.jsx` | Not present (`src/hooks/*.js`, `AuthContext.jsx` missing) | No hook can be wired here. Later, adapt authentication state to `/auth/me` and API calls, without changing screens. |
| Browser mock database, localStorage, base64 image storage | Not present (`db.js` and browser-storage code missing) | No migration possible in this checkout. The real backend will replace these behaviors with relational data and object/file storage. |
| Availability and leave tests in Vitest | Not present (`lib/availability.js`, `lib/date.js`, test setup missing) | Do not change frontend tests; recreate the server-side business-rule coverage in PHPUnit feature/unit tests. |
| Generic Laravel test baseline | `tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php` | Replace/augment with domain tests in the implementation phase. |

## 2. Database

Use a single `users` table for authentication and separate role-specific profiles. This preserves a consistent token/session identity and allows `doctor_id`/`patient_id` to be resolved server-side instead of trusted from the client.

| Table | Main columns and constraints | Relationships / indexes |
| --- | --- | --- |
| `users` | id, name, role (`admin`, `reception`, `doctor`, `patient`), email, phone nullable, password hash, status (`active`, `inactive`), timestamps. Email unique; phone unique if used for login. | One-to-one with `doctors` or `patients` where applicable. Index role/status. |
| `specialties` | id, key unique, name, timestamps. | Has many doctors and service catalog items. Seed as semi-static reference data. |
| `doctors` | id, user_id unique, specialty_id, license unique, experience_years, photo_path/URL, bio, new-visit price, follow-up price, rating, timestamps. | Belongs to user/specialty; has working hours, leaves, schedule exceptions, appointments, and records. Index specialty. |
| `doctor_working_hours` | id, doctor_id, weekday, starts_at, ends_at. Unique `(doctor_id, weekday)` unless multiple daily intervals are explicitly approved. | Normalized persistence for the required weekly `schedule`; indexed by doctor/weekday. |
| `patients` | id, user_id unique, date of birth, gender, national ID unique, phone, address, emergency contact name/phone, blood type, allergies, chronic conditions, first_visit_at, consent_accepted_at, timestamps. | Belongs to user; has appointments, records, invoices. Index name, phone, national ID. |
| `appointments` | id, patient_id, doctor_id, appointment_date, starts_at, duration_minutes, type, status, notes, booked_by role/user reference, timestamps. | Belongs to patient/doctor; has one medical record and invoice(s) as finally agreed. Index doctor/date/time, patient/date, status. |
| `medical_records` | id, appointment_id unique, patient_id, doctor_id, record_date, complaint, exam, diagnosis, notes, labs, timestamps. | Belongs to appointment/patient/doctor; has many medications. Index patient, doctor, appointment. |
| `medical_record_medications` | id, medical_record_id, name, dose, frequency, duration, timestamps. | Belongs to medical record. |
| `service_catalog_items` | id, name, specialty_id nullable, price, timestamps. | Belongs to specialty; indexed by specialty/name. |
| `invoices` | id, patient_id, appointment_id, total, payment_method (`cash`, `visa`, `insurance`, plus the transfer method only if it is modelled separately), status (`pending`, `paid`, `awaiting_verification`), issued_at, timestamps. | Belongs to patient/appointment; has invoice items and payment proofs. Index patient/status. |
| `invoice_items` | id, invoice_id, service_catalog_item_id nullable, name snapshot, unit price, timestamps. | Belongs to invoice; preserves the billed name/price even if catalog data later changes. |
| `invoice_payment_proofs` | id, invoice_id, file path/URL, uploaded_by_user_id, reviewed_by_user_id nullable, reviewed_at nullable, rejection reason nullable, timestamps. | Belongs to invoice; file itself is outside the DB. |
| `leaves` | id, doctor_id, starts_on, ends_on, reason, status (`pending`, `approved`, `rejected`), reviewed_by_user_id nullable, reviewed_at nullable, timestamps. | Belongs to doctor; index doctor/status/date range. |
| `schedule_exceptions` | id, doctor_id, exception_date, starts_at, ends_at, note, timestamps. | Belongs to doctor; unique/index doctor/date. It takes precedence over weekly working hours. |
| `notifications` | id, type, appointment_id nullable, recipient_user_id nullable, title, body, channel, status, sent_at, timestamps. | Recipient is a user account; `NULL` represents staff-wide notifications only if that behavior is retained. Index recipient/status/sent_at. |
| `audit_logs` | id, occurred_at, actor_user_id nullable, action (`create`, `update`, `delete`), auditable type/id, summary, request metadata as agreed, timestamps. | Polymorphic entity reference; index actor and entity/time. Logs must be append-only to application users. |
| `clinic_settings` | singleton id, name, address, phone, WhatsApp/transfer receiving number, hours, timestamps. | Exactly one row, protected by admin-only update. |
| `password_reset_tokens`, `sessions`, `cache`, `jobs`, `failed_jobs` | Laravel default/support tables. | Reuse existing default tables; session lifetime enforces inactivity expiry. |

For production booking safety, create a database-enforced uniqueness strategy for non-cancelled `(doctor_id, appointment_date, starts_at)` bookings, combined with the booking transaction. PostgreSQL can express this with a partial unique index. If MySQL is selected instead, the equivalent locking/constraint design must be chosen before implementation.

## 3. Authentication

Use Laravel Sanctum in stateful SPA/session-cookie mode for the browser client: secure, HttpOnly cookies, CSRF protection, a 15-minute server-side inactivity expiry, and `/auth/me` as the source of truth. This meets the specification's session-cookie option and is safer for a browser frontend than persisting a bearer JWT in localStorage. If the eventual client is on another allowed domain, configure Sanctum stateful domains and the exact CORS origin list; do not fall back to wildcard CORS.

- Login accepts the required `email`, `password`, and `role`; reject inactive accounts and role/profile mismatches.
- Passwords use Laravel's configured password hashing (Argon2id where supported, otherwise bcrypt) and are never returned in API resources or audit summaries.
- Logout invalidates the current server session/token. `/auth/me` derives identity, role, doctor profile, and patient profile from authenticated server state.
- Change-password requires the authenticated account and current-password verification.
- Implement the required secure reset flow: `POST /auth/forgot-password` issues a single-use, short-lived token/code through an approved email/SMS provider; `POST /auth/reset-password` consumes it. The current frontend-style immediate reset is explicitly not reusable.

## 4. Roles

| Role | Allowed scope |
| --- | --- |
| `admin` | Full clinic administration: doctors, staff users, patients, service catalog, appointments, invoices, leaves, settings, audit logs, and medical records. It is the only role that may read the audit log or update settings. |
| `reception` | Create/search/update/delete patients; book, confirm attendance, and cancel appointments; read billing and collect/verify payments; view and decide leave requests. It must not receive medical-record/visit diagnosis data from any API response. |
| `doctor` | Read only own schedule/availability and relevant appointments; confirm or reject bookings according to the allowed status transitions; create medical records and edit only records authored by that doctor; create own leave requests and own schedule exceptions; edit only permitted personal profile data. |
| `patient` | Register/use own account, read/update only own permitted profile data, read only own appointments/records/invoices/notifications, book an appointment, and cancel only own upcoming `booked`/`confirmed` appointment. Never accept another patient's ID as authority. |

Policies must enforce resource ownership even where a query parameter is supplied. Admin override for medical-record editing follows the explicit business rule; reception has no medical-record read endpoint access.

## 5. API Modules

All endpoints below are proposed beneath `/api/v1`; the requirement paths are shown without that prefix for readability.

| Module | Endpoints | Access |
| --- | --- | --- |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password` | Login/reset public with rate limits; other endpoints authenticated. |
| Doctors & availability | `GET /doctors`, `GET /doctors/{id}`, `POST /doctors`, `PATCH /doctors/{id}`, `DELETE /doctors/{id}`, `POST /doctors/{id}/photo`, `GET /doctors/{id}/availability?date=` | Read/list available to booking roles as required; write/admin operations admin only except own permitted doctor profile update. |
| Patients | `GET /patients?query=`, `GET /patients/{id}`, `POST /patients`, `PATCH /patients/{id}`, `DELETE /patients/{id}` | Staff scope, plus tightly scoped self-service registration/profile access for patients. Medical record data is not embedded for reception. |
| Appointments | `GET /appointments?doctorId=&patientId=&date=`, `POST /appointments`, `PATCH /appointments/{id}/status` | Server filters results by role ownership; creation/status transitions policy-controlled. |
| Medical records | `GET /medical-records?patientId=&doctorId=&appointmentId=`, `POST /medical-records`, `PATCH /medical-records/{id}` | Admin, authoring doctor, and own patient only; never reception. |
| Billing | `GET /invoices?patientId=&status=`, `POST /invoices`, `PATCH /invoices/{id}/mark-paid`, `POST /invoices/{id}/payment-proof`, `POST /invoices/{id}/confirm-payment`, `POST /invoices/{id}/reject-payment` | Admin/reception manage; patient is read-own and uploads proof only for own invoice. |
| Service catalog | `GET /services-catalog`, `POST /services-catalog`, `PATCH /services-catalog/{id}`, `DELETE /services-catalog/{id}` | Read as required for booking/billing; writes admin. |
| Staff users | `GET /users`, `POST /users`, `PATCH /users/{id}`, `DELETE /users/{id}` | Admin only. The list may combine staff and doctors as the requirements state. |
| Leaves | `GET /leaves?doctorId=&status=`, `POST /leaves`, `PATCH /leaves/{id}/status` | Doctor creates/reads own; admin/reception review; admin has full visibility. |
| Schedule exceptions | **Assumption:** `GET/POST/PATCH/DELETE /doctors/{id}/schedule-exceptions` | Doctor owns their exceptions; admin may manage them. Exact routes are not prescribed, but persisted exception management is required. |
| Notifications | `GET /notifications?recipientId=` | Server scopes to the authenticated recipient; notification creation is internal/queued rather than a frontend endpoint. |
| Audit log | `GET /audit-log` | Admin only. |
| Clinic settings | `GET /settings`, `PATCH /settings` | Read scope to be confirmed; update admin only. |

The requirements mention admin reports but do not define report data or endpoints. No reporting module should be designed or implemented until its metrics, audience, filters, and export needs are specified.

## 6. Business Rules

1. Booking is executed inside one database transaction. A non-cancelled appointment with the same doctor, date, and time blocks another booking; the transaction plus database constraint/lock prevents races.
2. The requested time must be within that doctor's effective working interval for that date. A schedule exception takes precedence over normal weekly working hours, including making an ordinarily non-working day bookable.
3. Availability excludes appointments that occupy a slot and **approved** leave dates only. Pending and rejected leave requests do not block time. Availability must be recalculated by the API, never trusted from a client calculation.
4. Doctor and staff email addresses are unique. Patient login uses the requirement's email/phone identity rule; final required-vs-optional fields are an assumption pending confirmation.
5. A patient may cancel only their own appointment and only while status is `booked` or `confirmed`; completed or already-cancelled appointments cannot be cancelled by the patient.
6. Status changes are authorization-aware: doctors confirm/reject their own new bookings; reception confirms attendance/cancels within its permitted workflow; patients have only the cancellation rule above. Exact meaning of “رفض” must map to an allowed stored status before implementation.
7. Saving a medical record automatically marks the linked appointment `completed`, transactionally. Automatic invoice creation is optional in the requirements and must be a confirmed policy before enabling it.
8. A medical record may be edited only by its authoring doctor or an admin. The API must not expose medical-record/visit data to reception, even if the frontend hides it.
9. A doctor with future, non-cancelled appointments (`date >= today`) cannot be deleted until those appointments are cancelled or transferred. Return a clear conflict response.
10. Deleting or deactivating a staff user must not remove the final admin account. Count active admins inside the transaction used for the deletion/change.
11. Doctors upload photos and patients upload transfer proofs through multipart requests. Persist a file reference, validate type/size, and never retain base64 blobs in browser storage or the database.
12. Invoice status `awaiting_verification` cannot use ordinary `mark-paid`; only the review flow confirms or rejects its uploaded proof.
13. Patient registration requires privacy consent and persists `consent_accepted_at` as evidence, not merely a client checkbox.
14. Every create/update/delete across domain modules produces an append-only audit entry with actor, time, entity, entity ID, action, and safe summary. Sensitive medical content/passwords must not be copied into audit summaries.
15. Date calculations must be timezone-safe for Egypt: process supplied local date/time values deliberately and avoid deriving clinic dates from UTC `toISOString()` conversion.
16. In-app notifications are supported by the data model. Real SMS/WhatsApp reminders require a provider, credentials, consent/opt-in policy, budget, and a scheduler; they are not silently included.

## 7. Security

- Enforce HTTPS, secure/HttpOnly/SameSite cookies, CSRF protection for stateful requests, and a strict allowlist of CORS origins.
- Rate-limit login, password-reset, upload, and sensitive mutation endpoints; return generic login/reset errors to avoid account enumeration.
- Validate every request with Form Requests: enums, ownership IDs, dates/times, file MIME/type/size, required consent, numeric money, and pagination/filter limits.
- Use Policies for resource-level authorization and do not trust `doctorId`, `patientId`, `recipientId`, or role values supplied by the client.
- Use Eloquent/query binding, encoded API Resources, and Laravel validation to resist SQL injection and XSS. Do not return password hashes, session tokens, internal storage paths, or unnecessary medical fields.
- Store files on private storage/object storage; authorize downloads/temporary URLs. Resize/scan uploaded images as part of the file-handling design.
- Use database transactions and constraints for booking, record completion, invoice/payment transitions, and last-admin protection.
- Keep audit logs append-only, log security events without credentials/medical plaintext, apply least-privilege database/storage credentials, and schedule encrypted backups with restore testing.
- Add production error monitoring only after a provider and DSN are selected; do not expose exception details to API clients.

## 8. Testing Strategy

Use PHPUnit feature tests for HTTP/auth/policy/database behavior, unit tests for pure availability/status logic, factories/seeders for realistic roles, and faked storage/notifications/queues for integration boundaries.

- Authentication: valid/invalid login, inactive user, role mismatch, `me`, logout, password change, reset token expiration/single use, and 15-minute session expiry.
- Authorization matrix: all four roles on each endpoint; ownership spoof attempts; reception medical-record denial; admin audit/settings access; doctor author-only edit; patient self-only access/cancellation.
- Data integrity: unique email/phone/national ID rules, consent persistence, safe deletion, last-admin prevention, doctor deletion with future appointments, and audit entry generation.
- Booking: weekly hours, exception precedence, approved vs pending/rejected leave, occupied slot, cancelled slot reuse, concurrent booking requests, and clinic timezone/date-boundary cases.
- Clinical/billing flows: record creation completes appointment; record update permission; invoice generation when enabled; `awaiting_verification` cannot be ordinarily collected; proof upload/confirm/reject authorization.
- Files and operations: allowed/rejected upload type/size, private access controls, pagination/filter validation, notification dispatch behavior, and failed-job handling.
- Regression coverage: carry the frontend's stated availability/leave/date scenarios into backend tests; run the focused test set in each implementation phase and the full suite before release.

## 9. Implementation Phases

1. **Foundation and identity:** choose production DB and frontend origin; install/configure stateful API authentication; add API routing, user roles/profiles, password flow, policies, base resources, audit infrastructure, and tests.
2. **Reference and core profiles:** specialties, doctor profile/working hours/photo storage, patient profile/consent, service catalog, validation, and role-safe CRUD.
3. **Scheduling:** leaves, schedule exceptions, availability endpoint, transaction/constraint-based booking, appointment list/status rules, and concurrency/timezone tests.
4. **Clinical and billing:** medical records/medications, appointment completion workflow, invoices/items, manual collection, transfer-proof review, and private file access.
5. **Administration:** staff user management with final-admin protection, audit-log read API, clinic settings, notifications persistence, and authorization hardening.
6. **Operational integrations:** only after business approval, add a storage provider, SMS/WhatsApp provider plus scheduler, production monitoring, backups/restore validation, deployment configuration, and security review.

## Assumptions and decisions required before implementation

1. The actual frontend repository/branch containing `src/services`, hooks, local mocks, and Vitest tests must be supplied before frontend wiring is planned; it is absent here.
2. The plan chooses same-origin/stateful Sanctum session cookies. Confirm this remains valid if the frontend will be a separate origin or native mobile client.
3. Production database selection is not specified. PostgreSQL is recommended for the active-booking constraint; confirm the hosting database before migrations are authored.
4. The requirements say login can use email/phone but also list `email` as required. Confirm whether phone-only patient accounts are permitted and which identifier is mandatory/unique.
5. Confirm appointment slot duration/default intervals and whether overlapping durations, rather than only identical start times, must be blocked.
6. Confirm the stored status that represents a doctor “rejection”; the given appointment status enum contains `cancelled` but not `rejected`.
7. Confirm whether automatic invoice creation on medical-record save is enabled and whether an appointment may have one invoice or multiple invoices.
8. Confirm the canonical payment-method values and the lifecycle after payment-proof rejection; only the specified invoice statuses are used here.
9. Confirm the exact schedule-exception CRUD interface; persistence and availability precedence are required, but endpoints are not defined.
10. Confirm who may read clinic settings and whether admins may delete patient accounts with appointments/medical/invoice history; the requirements do not define retention/deletion behavior.
11. SMS/WhatsApp, email delivery, object storage, Sentry/error monitoring, and their credentials/budget are explicitly external decisions and are not included in the core backend scope.
