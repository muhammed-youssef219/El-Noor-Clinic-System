import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useClinicSettings } from "../../hooks/useClinicSettings";
import { updateClinicSettings } from "../../services/settingsService";

export default function Settings() {
  const { userLabel } = useAuth();
  const { data: settings, loading, reload } = useClinicSettings();

  if (loading) {
    return (
      <div>
        <SectionHeader title="الإعدادات العامة" sub="بيانات العيادة الأساسية" />
        <div className="card" style={{ maxWidth: 560 }}><SkeletonRows rows={4} cols={1} /></div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="الإعدادات العامة" sub="بيانات العيادة الأساسية" />
      <SettingsForm settings={settings} actor={userLabel} onSaved={reload} />
    </div>
  );
}

function SettingsForm({ settings, actor, onSaved }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateClinicSettings(form, actor);
    setSaving(false);
    setSaved(true);
    onSaved();
  }

  return (
    <div className="card" style={{ padding: 20, maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
      <div><label>اسم العيادة</label><input value={form.name} onChange={e => update("name", e.target.value)} /></div>
      <div><label>العنوان</label><input value={form.address} onChange={e => update("address", e.target.value)} /></div>
      <div className="split-grid" style={{ gap: 12 }}>
        <div><label>رقم التليفون</label><input value={form.phone} onChange={e => update("phone", e.target.value)} className="mono" /></div>
        <div><label>واتساب الحجوزات</label><input value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} className="mono" /></div>
      </div>
      <div><label>ساعات العمل</label><input value={form.hours} onChange={e => update("hours", e.target.value)} /></div>
      <div>
        <label>رقم استلام التحويلات (فودافون كاش / إنستاباي)</label>
        <input className="mono" value={form.paymentNumber || ""} onChange={e => update("paymentNumber", e.target.value)} />
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>ده الرقم اللي هيظهر للمريض لما يختار يدفع بالتحويل</div>
      </div>
      <button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 6 }} disabled={saving} onClick={handleSave}>
        <Check size={15} /> {saving ? "جاري الحفظ…" : saved ? "تم الحفظ" : "حفظ التغييرات"}
      </button>
    </div>
  );
}
