import { useEffect, useState } from "react";
import { Check, KeyRound, ShieldCheck } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import SpecialtyTag from "../../components/ui/SpecialtyTag";
import PhotoUploadField from "../../components/doctors/PhotoUploadField";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useDoctors } from "../../hooks/useDoctors";
import { updateDoctorProfile, changeDoctorPassword } from "../../services/doctorsService";
import { specialtyByKey } from "../../data/specialties";

export default function DoctorProfile() {
  const { doctorId } = useAuth();
  const { data: doctors, loading, reload } = useDoctors();
  const me = (doctors || []).find(d => d.id === doctorId);

  return (
    <div>
      <SectionHeader title="بياناتي الشخصية" sub="بيانات حسابك ومعلوماتك المهنية" />
      {loading || !me ? (
        <div className="card"><SkeletonRows rows={4} cols={2} /></div>
      ) : (
        <div className="split-grid" style={{ alignItems: "start" }}>
          <ProfileForm doctor={me} onSaved={reload} />
          <PasswordForm doctorId={doctorId} />
        </div>
      )}
    </div>
  );
}

function ProfileForm({ doctor, onSaved }) {
  const [form, setForm] = useState({
    email: doctor.email, bio: doctor.bio, price: doctor.price, followUp: doctor.followUp, exp: doctor.exp,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);

  useEffect(() => {
    setForm({ email: doctor.email, bio: doctor.bio, price: doctor.price, followUp: doctor.followUp, exp: doctor.exp });
  }, [doctor]);

  async function handlePhotoChange(photo) {
    setPhotoSaving(true);
    try {
      await updateDoctorProfile(doctor.id, { photo });
      onSaved();
    } finally {
      setPhotoSaving(false);
    }
  }

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateDoctorProfile(doctor.id, {
        email: form.email.trim(), bio: form.bio, price: Number(form.price), followUp: Number(form.followUp), exp: Number(form.exp),
      });
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(Object.values(err.errors || {}).flat().join(" ") || err.message);
    } finally {
      setSaving(false);
    }
  }

  const spec = specialtyByKey(doctor.specialtyKey);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{doctor.name}</div>
        <SpecialtyTag specialtyKey={doctor.specialtyKey} name={spec?.name} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <PhotoUploadField name={doctor.name} photo={doctor.photo} onChange={handlePhotoChange} />
        {photoSaving && <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>جاري حفظ الصورة…</div>}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label>البريد الإلكتروني (تسجيل الدخول)</label>
          <input className="mono" type="email" value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
        <div>
          <label>نبذة تعريفية</label>
          <textarea rows={3} value={form.bio} onChange={e => update("bio", e.target.value)} />
        </div>
        <div className="split-grid" style={{ gap: 12 }}>
          <div>
            <label>سعر الكشف الجديد (ج.م)</label>
            <input className="mono" type="number" min="0" value={form.price} onChange={e => update("price", e.target.value)} />
          </div>
          <div>
            <label>سعر المتابعة (ج.م)</label>
            <input className="mono" type="number" min="0" value={form.followUp} onChange={e => update("followUp", e.target.value)} />
          </div>
        </div>
        <div>
          <label>سنوات الخبرة</label>
          <input className="mono" type="number" min="0" value={form.exp} onChange={e => update("exp", e.target.value)} />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : saved ? "تم الحفظ" : "حفظ التغييرات"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm({ doctorId }) {
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
      await changeDoctorPassword(doctorId, current, next);
      setSuccess("تم تغيير كلمة المرور بنجاح");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(Object.values(err.errors || {}).flat().join(" ") || err.message);
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
          <KeyRound size={15} /> {saving ? "جاري التحديث…" : "تحديث كلمة المرور"}
        </button>
      </form>
    </div>
  );
}
