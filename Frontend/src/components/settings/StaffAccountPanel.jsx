import { useEffect, useState } from "react";
import { Check, KeyRound, ShieldCheck, Mail } from "lucide-react";
import Avatar from "../ui/Avatar";
import { updateStaffCredentials, changeStaffPassword } from "../../services/usersService";

export default function StaffAccountPanel({ user, staffUserId, onSaved, roleLabel }) {
  return (
    <div className="split-grid" style={{ alignItems: "start" }}>
      <EmailForm user={user} roleLabel={roleLabel} onSaved={onSaved} />
      <PasswordForm userId={staffUserId} />
    </div>
  );
}

function EmailForm({ user, roleLabel, onSaved }) {
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setEmail(user.email); }, [user.email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateStaffCredentials(user.id, { email: email.trim() });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(Object.values(err.errors || {}).flat().join(" ") || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar name={user.name} size={48} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{roleLabel}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label>البريد الإلكتروني (تسجيل الدخول)</label>
          <input className="mono" type="email" value={email} onChange={e => { setEmail(e.target.value); setSaved(false); }} />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: "flex-start" }}>
          <Mail size={15} /> {saving ? "جاري الحفظ…" : saved ? "تم الحفظ" : "حفظ البريد الإلكتروني"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm({ userId }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = current && /^[A-Za-z0-9]+$/.test(next) && next === confirm && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (next !== confirm) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(next)) {
      setError("كلمة المرور يجب أن تحتوي على حروف وأرقام فقط");
      return;
    }
    setSaving(true);
    try {
      await changeStaffPassword(userId, current, next);
      setSuccess("تم تغيير كلمة المرور بنجاح");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KeyRound size={17} color="var(--primary)" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>تغيير كلمة المرور</div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label>كلمة المرور الحالية</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} />
        </div>
        <div>
          <label>كلمة المرور الجديدة</label>
          <input type="password" value={next} onChange={e => setNext(e.target.value)} />
        </div>
        <div>
          <label>تأكيد كلمة المرور الجديدة</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        {success && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--success)", fontSize: 12.5 }}><ShieldCheck size={14} /> {success}</div>}
        <button className="btn btn-outline" type="submit" disabled={!canSubmit} style={{ alignSelf: "flex-start", opacity: canSubmit ? 1 : 0.5 }}>
          <Check size={15} /> {saving ? "جاري التحديث…" : "تحديث كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
