import { useState } from "react";
import { UserPlus, Users, SlidersHorizontal, UserRound, Stethoscope, Pencil, Trash2, Check, X as XIcon } from "lucide-react";
import SectionHeader from "../../components/ui/SectionHeader";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useUsers } from "../../hooks/useUsers";
import { useAuth } from "../../context/AuthContext";
import { createStaffUser, updateStaffCredentials, deleteStaffUser } from "../../services/usersService";

const ROLE_LABEL = { admin: "أدمن", reception: "استقبال", doctor: "دكتور" };
const EMPTY_FORM = { name: "", role: "reception", email: "" };

export default function AdminUsersPage() {
  const { userLabel, staffUserId } = useAuth();
  const { data: users, loading, reload } = useUsers();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const countByRole = role => (loading ? 0 : users.filter(u => u.role === role).length);

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    reload();
  }

  async function handleDelete(id) {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteStaffUser(id, userLabel);
      setConfirmingDelete(null);
      reload();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="المستخدمين والصلاحيات"
        sub={loading ? "جاري التحميل…" : `${users.length} مستخدم`}
        action={<button className="btn btn-primary" onClick={() => setFormOpen(true)}><UserPlus size={15} /> إضافة مستخدم</button>}
      />
      {loading ? (
        <div className="card" style={{ marginBottom: 14 }}><SkeletonRows rows={1} cols={4} /></div>
      ) : (
        <div className="stat-grid" style={{ "--cols": 4, marginBottom: 20 }}>
          <StatCard icon={Users} label="إجمالي المستخدمين" value={users.length} color="primary" />
          <StatCard icon={SlidersHorizontal} label="أدمن" value={countByRole("admin")} color="gold" />
          <StatCard icon={UserRound} label="استقبال" value={countByRole("reception")} color="info" />
          <StatCard icon={Stethoscope} label="دكاترة" value={countByRole("doctor")} color="accent" />
        </div>
      )}
      <div className="card table-scroll" style={{ padding: 0 }}>
        {loading ? <SkeletonRows rows={6} cols={4} /> : (
          <table style={{ minWidth: 560 }}>
            <thead><tr><th>الاسم</th><th>الدور</th><th>البريد الإلكتروني</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {users.map((u, i) => {
                const isDoctor = u.role === "doctor";
                return (
                  <tr key={u.id || i}>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={u.name} size={26} />{u.name}</td>
                    <td>{ROLE_LABEL[u.role] || u.role}</td>
                    <td className="mono" style={{ color: "var(--ink-faint)" }}>{u.email}</td>
                    <td><Badge status={u.status} /></td>
                    <td>
                      {isDoctor ? (
                        <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>يُدار من صفحة الدكاترة</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setEditing(u)}>
                            <Pencil size={12} /> تعديل
                          </button>
                          <button className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--danger)" }} onClick={() => { setConfirmingDelete(u); setDeleteError(""); }}>
                            <Trash2 size={12} /> حذف
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && <UserFormModal actor={userLabel} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}
      {editing && <UserFormModal user={editing} actor={userLabel} onClose={() => setEditing(null)} onSaved={handleSaved} />}

      {confirmingDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setConfirmingDelete(null)} width={420}>
          <div style={{ fontSize: 13.5, marginBottom: 16 }}>
            متأكد إنك عايز تحذف حساب <strong>{confirmingDelete.name}</strong>؟
            {confirmingDelete.id === staffUserId && " (هذا هو حسابك الحالي)"}
          </div>
          {deleteError && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 12 }}>{deleteError}</div>}
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

function UserFormModal({ user, actor, onClose, onSaved }) {
  const [form, setForm] = useState(user ? { name: user.name, role: user.role, email: user.email } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) { setForm(f => ({ ...f, [key]: value })); }
  const canSave = form.name.trim() && form.email.trim() && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), role: form.role, email: form.email.trim() };
      if (user) await updateStaffCredentials(user.id, payload);
      else await createStaffUser(payload, actor);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={user ? `تعديل حساب: ${user.name}` : "إضافة مستخدم جديد"} onClose={onClose} width={440}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label>الاسم الكامل *</label>
          <input value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div>
          <label>الدور *</label>
          <select value={form.role} onChange={e => update("role", e.target.value)}>
            <option value="reception">استقبال</option>
            <option value="admin">أدمن</option>
          </select>
        </div>
        <div>
          <label>البريد الإلكتروني (تسجيل الدخول) *</label>
          <input className="mono" type="email" value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
        {!user && <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>كلمة المرور الافتراضية للحساب الجديد: <span className="mono" style={{ fontWeight: 700 }}>Clinic@123</span></div>}
        {error && <div style={{ color: "var(--danger)", fontSize: 12.5 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, alignSelf: "flex-start" }}>
          <Check size={15} /> {saving ? "جاري الحفظ…" : user ? "حفظ التعديلات" : "إضافة المستخدم"}
        </button>
      </form>
    </Modal>
  );
}
