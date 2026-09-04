import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Menu, Home, Check, X, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";
import { listAppointments } from "../../services/appointmentsService";
import {
  createAppointmentReminder, markNotificationRead, markAllNotificationsRead,
  deleteNotification, clearAllNotifications,
} from "../../services/notificationsService";
import { DOCTORS } from "../../data/doctors";
import { todayISO } from "../../lib/date";

const REMINDER_WINDOW_MINUTES = 60;
const REMINDER_CHECK_INTERVAL = 20000;

function minutesUntil(appt) {
  const target = new Date(`${appt.date}T${appt.time}:00`);
  return (target.getTime() - Date.now()) / 60000;
}

function formatSentAt(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return value.includes("T")
    ? d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
}

export default function Topbar({ userLabel, roleLabel, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { role, patientId, staffUserId } = useAuth();
  // Admin sees all notifications; others see only their own
  const notifFilters = role === "admin"
    ? {}
    : role === "patient"
      ? { recipientId: patientId }
      : (role === "doctor" || role === "reception") && staffUserId
        ? { recipientId: staffUserId }
        : {};
  const { data: notifications, reload } = useNotifications(notifFilters);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Frontend-only reminder: while the patient's dashboard is open, poll for
  // any of their appointments landing within the next hour and surface an
  // in-app notification. This can't reach their phone as a real SMS without
  // a backend + SMS provider — it only fires here, inside the app.
  useEffect(() => {
    if (role !== "patient" || !patientId) return;

    async function checkReminders() {
      const appts = await listAppointments({ patientId });
      const today = todayISO(0);
      let created = false;
      for (const appt of appts) {
        if (appt.date !== today) continue;
        if (appt.status !== "booked" && appt.status !== "confirmed") continue;
        const mins = minutesUntil(appt);
        if (mins <= 0 || mins > REMINDER_WINDOW_MINUTES) continue;
        const doctor = DOCTORS.find(d => d.id === appt.doctorId);
        const notif = await createAppointmentReminder({
          appointmentId: appt.id,
          recipientId: patientId,
          title: "تذكير بموعدك",
          body: `لديك موعد مع ${doctor?.name || "الدكتور"} الساعة ${appt.time} اليوم`,
        });
        if (notif) created = true;
      }
      if (created) reload();
    }

    checkReminders();
    const interval = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [role, patientId, reload]);

  const count = notifications?.length || 0;
  const unreadCount = (notifications || []).filter(n => !n.read).length;

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    reload();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead(notifFilters);
    reload();
  }

  async function handleDelete(id) {
    await deleteNotification(id);
    reload();
  }

  async function handleClearAll() {
    await clearAllNotifications(notifFilters);
    reload();
  }

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--card)", gap: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="theme-toggle mobile-menu-btn" onClick={onMenuClick} aria-label="فتح القائمة">
          <Menu size={16} />
        </button>
        <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
          {new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" className="btn btn-outline" style={{ padding: "7px 12px", fontSize: 12.5 }}>
          <Home size={14} /> <span className="topbar-user-text">الصفحة الرئيسية</span>
        </Link>
        <ThemeToggle />
        <div style={{ position: "relative" }} ref={ref}>
          <button
            className="theme-toggle"
            style={{ position: "relative" }}
            onClick={() => setOpen(o => !o)}
            aria-label="الإشعارات"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -3, left: -3, width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
            )}
          </button>
          {open && (
            <div className="card" style={{ position: "absolute", left: 0, top: 40, width: 320, padding: 0, zIndex: 40, boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>الإشعارات{unreadCount > 0 && ` (${unreadCount})`}</span>
                {count > 0 && (
                  <div style={{ display: "flex", gap: 10 }}>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost" style={{ padding: 0, fontSize: 11, color: "var(--primary)" }} onClick={handleMarkAllRead}>
                        <Check size={11} /> تحديد الكل كمقروء
                      </button>
                    )}
                    <button className="btn btn-ghost" style={{ padding: 0, fontSize: 11, color: "var(--danger)" }} onClick={handleClearAll}>
                      <Trash2 size={11} /> مسح الكل
                    </button>
                  </div>
                )}
              </div>
              {count === 0 ? (
                <div style={{ padding: 16, fontSize: 12.5, color: "var(--ink-faint)", textAlign: "center" }}>لا توجد إشعارات</div>
              ) : (
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                      style={{
                        display: "flex", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--line-soft)",
                        background: n.read ? "transparent" : "var(--primary-soft)", cursor: n.read ? "default" : "pointer",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: n.read ? 600 : 800 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{n.body}</div>
                        <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 4 }}>{n.channel} · {formatSentAt(n.sentAt)}</div>
                      </div>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: 4, alignSelf: "flex-start", flexShrink: 0 }}
                        onClick={e => { e.stopPropagation(); handleDelete(n.id); }}
                        aria-label="حذف الإشعار"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={userLabel} size={30} />
          <div className="topbar-user-text">
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{userLabel}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
