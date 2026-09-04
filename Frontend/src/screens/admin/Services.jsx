import { useState } from "react";
import { Plus, Wallet, TrendingUp, ArrowDown, ArrowUp, Pencil, Trash2, Check, X as XIcon } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import SpecialtyTag from "../../components/ui/SpecialtyTag";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useServicesCatalog } from "../../hooks/useServicesCatalog";
import { useAuth } from "../../context/AuthContext";
import { createService, updateService, deleteService } from "../../services/servicesCatalogService";
import { SPECIALTIES, specialtyByKey } from "../../data/specialties";

const EMPTY_FORM = { name: "", specialtyKey: SPECIALTIES[0].key, price: "" };

export default function AdminServicesPage() {
  const { userLabel } = useAuth();
  const { data: services, loading, reload } = useServicesCatalog();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const avgPrice = loading || services.length === 0 ? 0 : Math.round(services.reduce((s, i) => s + i.price, 0) / services.length);
  const maxService = loading ? null : services.reduce((a, b) => (b.price > (a?.price || 0) ? b : a), null);
  const minService = loading ? null : services.reduce((a, b) => (a === null || b.price < a.price ? b : a), null);

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    reload();
  }

  async function handleDelete(id) {
    setDeleting(true);
    await deleteService(id, userLabel);
    setDeleting(false);
    setConfirmingDelete(null);
    reload();
  }

  return (
    <div>
      <SectionHeader
        title="الخدمات والأسعار"
        sub="قائمة الأسعار الموحدة للعيادة"
        action={<button className="btn btn-primary" onClick={() => setFormOpen(true)}><Plus size={15} /> إضافة خدمة</button>}
      />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Wallet} label="إجمالي الخدمات" value={services.length} color="primary" />
          <StatCard icon={TrendingUp} label="متوسط السعر" value={avgPrice + " ج.م"} color="info" />
          <StatCard icon={ArrowUp} label="أغلى خدمة" value={(maxService?.price || 0) + " ج.م"} sub={maxService?.name} color="gold" />
          <StatCard icon={ArrowDown} label="أرخص خدمة" value={(minService?.price || 0) + " ج.م"} sub={minService?.name} color="accent" />
        </div>
      )}
      <div className="card table-scroll" style={{ padding: 0 }}>
        {loading ? <SkeletonRows rows={6} cols={3} /> : (
          <table style={{ minWidth: 480 }}>
            <thead><tr><th>اسم الخدمة</th><th>التخصص</th><th>السعر</th><th></th></tr></thead>
            <tbody>
              {services.map(s => {
                const spec = specialtyByKey(s.specialtyKey);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.name}</td>
                    <td><SpecialtyTag specialtyKey={s.specialtyKey} name={spec?.name} /></td>
                    <td className="mono">{s.price} ج.م</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setEditing(s)}>
                          <Pencil size={12} /> تعديل
                        </button>
                        <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--danger)" }} onClick={() => setConfirmingDelete(s)}>
                          <Trash2 size={12} /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && <ServiceFormModal actor={userLabel} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {editing && <ServiceFormModal service={editing} actor={userLabel} onClose={() => setEditing(null)} onSaved={handleSaved} />}

      {confirmingDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setConfirmingDelete(null)} width={420}>
          <div style={{ fontSize: 13.5, marginBottom: 16 }}>
            متأكد إنك عايز تحذف خدمة <strong>{confirmingDelete.name}</strong>؟
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ background: "var(--danger)" }} disabled={deleting} onClick={() => handleDelete(confirmingDelete.id)}>
              <Trash2 size={14} /> {deleting ? "جاري الحذف…" : "تأكيد الحذف"}
            </button>
            <button className="btn btn-outline" onClick={() => setConfirmingDelete(null)}><XIcon size={14} /> إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ServiceFormModal({ service, actor, onClose, onSaved }) {
  const [form, setForm] = useState(service ? { name: service.name, specialtyKey: service.specialtyKey, price: service.price } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }
  const canSave = form.name.trim() && form.price !== "" && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), specialtyKey: form.specialtyKey, price: Number(form.price) || 0 };
      if (service) await updateService(service.id, payload, actor);
      else await createService(payload, actor);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={service ? `تعديل خدمة: ${service.name}` : "إضافة خدمة جديدة"} onClose={onClose} width={440}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label>اسم الخدمة *</label>
          <input value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div>
          <label>التخصص *</label>
          <select value={form.specialtyKey} onChange={e => update("specialtyKey", e.target.value)}>
            {SPECIALTIES.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>السعر (ج.م) *</label>
          <input className="mono" type="number" min="0" value={form.price} onChange={e => update("price", e.target.value)} />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : service ? "حفظ التعديلات" : "إضافة الخدمة"}
        </button>
      </form>
    </Modal>
  );
}
