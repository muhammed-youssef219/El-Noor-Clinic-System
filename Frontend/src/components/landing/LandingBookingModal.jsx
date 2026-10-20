"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import SpecialtyTag from "../ui/SpecialtyTag";
import { specialtyByKey } from "../../data/specialties";
import { createAppointment } from "../../services/appointmentsService";
import { registerPatient } from "../../services/patientsService";
import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { todayISO, weekdayAr } from "../../lib/date";
import { scheduleSlotsForDay } from "../../lib/availability";

export default function LandingBookingModal({ doctor, onClose }) {
  const router = useRouter();
  const { auth, role, login } = useAuth();
  const isPatientLoggedIn = role === "patient" && !!auth;

  // Booking state
  const [date, setDate] = useState(todayISO(0));
  const [time, setTime] = useState("");
  const [type] = useState("كشف جديد");
  const [notes] = useState("");

  // Guest patient form state
  const [guestTab, setGuestTab] = useState("register"); // "register" or "login"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob] = useState("1995-01-01");
  const [gender] = useState("ذكر");

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successAppt, setSuccessAppt] = useState(null);

  const doctorId = doctor?.id;
  const weekday = date ? weekdayAr(date) : "";
  const worksThatDay = Boolean(doctor?.schedule && doctor.schedule[weekday]);

  // Pure memoized slots computation without any network polling overhead
  const slots = useMemo(() => {
    if (!doctor || !date || !worksThatDay) return [];
    const isToday = date === todayISO(0);
    const nowTime = new Date().toTimeString().slice(0, 5);
    const daySlots = scheduleSlotsForDay(doctor, weekday);
    return daySlots.map(timeSlot => ({
      time: timeSlot,
      taken: false,
      past: isToday && timeSlot <= nowTime,
    }));
  }, [doctor, date, weekday, worksThatDay]);

  // Reset selected time slot only when date changes
  useEffect(() => {
    setTime("");
  }, [date]);

  async function handleConfirmBooking(e) {
    e.preventDefault();
    setError("");

    if (!date) {
      setError("من فضلك اختر تاريخ الكشف");
      return;
    }
    if (!time) {
      setError("من فضلك اختر موعداً مناسباً من الأوقات المتاحة");
      return;
    }

    setSubmitting(true);

    try {
      let activePatientId = auth?.patientId || auth?.patient?.id;

      // If guest, register or login first
      if (!isPatientLoggedIn) {
        if (guestTab === "register") {
          if (!name.trim()) throw new Error("من فضلك أدخل اسم المريض");
          if (!phone.trim()) throw new Error("من فضلك أدخل رقم الهاتف");
          if (!email.trim()) throw new Error("من فضلك أدخل البريد الإلكتروني");
          if (!password || password.length < 8) throw new Error("كلمة المرور يجب أن لا تقل عن 8 أحرف");

          await registerPatient({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password,
            dob,
            gender,
            consent: true,
          });

          const loggedInUser = await loginRequest(email.trim(), password, "patient");
          login(loggedInUser);
          activePatientId = loggedInUser?.patientId || loggedInUser?.patient?.id;
        } else {
          // Login existing
          if (!email.trim() || !password) throw new Error("من فضلك أدخل البريد وكلمة المرور");
          const loggedInUser = await loginRequest(email.trim(), password, "patient");
          login(loggedInUser);
          activePatientId = loggedInUser?.patientId || loggedInUser?.patient?.id;
        }
      }

      if (!activePatientId) {
        throw new Error("تعذر تحديد ملف المريض، يرجى المحاولة مرة أخرى.");
      }

      // Create Appointment
      const appt = await createAppointment({
        patientId: activePatientId,
        doctorId,
        date,
        time,
        type,
        notes: notes.trim() || null,
      });

      setSuccessAppt(appt);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حجز الموعد");
    } finally {
      setSubmitting(false);
    }
  }

  const spec = specialtyByKey(doctor?.specialtyKey);

  // Quick dates options (Today, Tomorrow, Day after)
  const quickDates = [
    { label: "اليوم", value: todayISO(0) },
    { label: "غداً", value: todayISO(1) },
    { label: "بعد غد", value: todayISO(2) },
  ];

  return (
    <Modal title="حجز كشف طبي مباشر" onClose={onClose} width={560}>
      {/* Success View */}
      {successAppt ? (
        <div style={{ textAlign: "center", padding: "16px 8px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--success-soft)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "var(--ink)" }}>
            تم تأكيد حجز موعدك بنجاح!
          </h3>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 20px" }}>
            تم تسجيل موعد الكشف بنجاح، ونتطلع لخدمتك في عيادات النور التخصصية.
          </p>

          <div
            className="card"
            style={{
              background: "var(--card-2)",
              padding: 16,
              borderRadius: 12,
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>الطبيب:</span>
              <span style={{ fontWeight: 800, fontSize: 13.5 }}>{doctor?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>التخصص:</span>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{spec?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>تاريخ الموعد:</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 13.5 }}>{date} ({weekdayAr(date)})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>الساعة:</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: 13.5, color: "var(--primary)" }}>{time}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>قيمة الكشف:</span>
              <span style={{ fontWeight: 800, fontSize: 13.5 }}>{doctor?.price} ج.م (دفع بالعيادة)</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                router.push("/patient/appointments");
              }}
            >
              عرض مواعيدي في حسابي
            </button>
            <button className="btn btn-outline" onClick={onClose}>
              إغلاق
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form View */
        <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Doctor Brief Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              background: "var(--card-2)",
              border: "1px solid var(--line)",
            }}
          >
            <Avatar name={doctor?.name || ""} src={doctor?.photo} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{doctor?.name}</span>
                <SpecialtyTag specialtyKey={doctor?.specialtyKey} name={spec?.name} />
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>
                <span>كشف: <strong>{doctor?.price} ج.م</strong></span>
                <span>⭐ {doctor?.rating || "4.8"}</span>
              </div>
            </div>
          </div>

          {/* 1. Date Selection */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ margin: 0, fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
                <CalendarDays size={15} color="var(--primary)" />
                اختر تاريخ الكشف
              </label>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {date} ({weekday})
              </span>
            </div>

            {/* Quick date pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {quickDates.map(qd => (
                <button
                  key={qd.value}
                  type="button"
                  className={date === qd.value ? "btn btn-primary" : "btn btn-outline"}
                  style={{ flex: 1, padding: "7px 10px", fontSize: 12.5, justifyContent: "center" }}
                  onClick={() => setDate(qd.value)}
                >
                  {qd.label}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={date}
              min={todayISO(0)}
              onChange={e => setDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* 2. Time Slots Selection */}
          <div>
            <label style={{ fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Clock size={15} color="var(--primary)" />
              اختر الموعد المتاح
            </label>

            {!worksThatDay ? (
              <div style={{ background: "var(--card-2)", color: "var(--ink-soft)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>
                الطبيب لا يعمل يوم ({weekday}). يرجى اختيار يوم آخر من جدول عمله.
              </div>
            ) : slots.length === 0 ? (
              <div style={{ background: "var(--card-2)", color: "var(--ink-soft)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>
                اكتملت جميع مواعيد هذا اليوم. يمكنك اختيار موعد في اليوم التالي.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8, maxHeight: 160, overflowY: "auto", padding: 2 }}>
                {slots.map(s => {
                  const isSelected = time === s.time;
                  const isUnavailable = s.taken || s.past;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={isUnavailable}
                      className={isSelected ? "btn btn-primary" : "btn btn-outline"}
                      style={{
                        padding: "7px 4px",
                        fontSize: 12.5,
                        justifyContent: "center",
                        opacity: isUnavailable ? 0.35 : 1,
                        cursor: isUnavailable ? "not-allowed" : "pointer",
                      }}
                      onClick={() => setTime(s.time)}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Patient Information */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            {isPatientLoggedIn ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>الحجز مسجل باسم: <strong>{auth.name}</strong> ({auth.phone})</span>
                <Check size={16} />
              </div>
            ) : (
              <div>
                {/* Guest toggle tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    className={guestTab === "register" ? "btn btn-primary" : "btn btn-ghost"}
                    style={{ flex: 1, padding: "8px 12px", fontSize: 13, justifyContent: "center" }}
                    onClick={() => setGuestTab("register")}
                  >
                    مريض جديد (حجز فوري)
                  </button>
                  <button
                    type="button"
                    className={guestTab === "login" ? "btn btn-primary" : "btn btn-ghost"}
                    style={{ flex: 1, padding: "8px 12px", fontSize: 13, justifyContent: "center" }}
                    onClick={() => setGuestTab("login")}
                  >
                    لدي حساب بالفعل
                  </button>
                </div>

                {guestTab === "register" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="split-grid" style={{ gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12.5 }}>اسم المريض بالكامل *</label>
                        <input
                          placeholder="الاسم ثلاثي"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12.5 }}>رقم الهاتف للتأكيد *</label>
                        <input
                          placeholder="01xxxxxxxxx"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          autoComplete="tel"
                          required
                        />
                      </div>
                    </div>

                    <div className="split-grid" style={{ gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12.5 }}>البريد الإلكتروني *</label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12.5 }}>كلمة المرور لحسابك *</label>
                        <input
                          type="password"
                          placeholder="8 أحرف على الأقل"
                          value={password}
                          minLength={8}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12.5 }}>البريد الإلكتروني</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12.5 }}>كلمة المرور</label>
                      <input
                        type="password"
                        placeholder="كلمة المرور"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--danger-soft)",
                color: "var(--danger)",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !time || !worksThatDay}
              style={{ padding: "10px 24px", fontWeight: 800 }}
            >
              <Check size={16} />
              {submitting ? "جارٍ تأكيد الموعد…" : "تأكيد حجز الكشف"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
