import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, Field, Modal, PageHeading, StatusBadge, formatDate, roleLabel } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

const STAFF_ROLES = [
  "Operations Manager",
  "Catalog Editor",
  "Fulfillment Lead",
  "Support Agent",
  "Auditor",
  "Warehouse Manager",
  "Logistics Officer",
  "Support Staff",
  "Marketing Manager",
  "Finance Manager",
];

const emptyForm = { name: "", email: "", phone: "", role: "", password: "", status: "Active" };

export default function StaffPage() {
  const { api, user } = useAdmin();
  const { lang, t } = useLang();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/admin/portal/staff");
      setStaff(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const visibleStaff = staff.filter((member) => {
    const query = search.trim().toLowerCase();
    return !query || [member.name, member.email, member.role, member.phone].some((value) => String(value || "").toLowerCase().includes(query));
  });

  const openForm = (member = null) => {
    setEditing(member);
    setForm(member ? { ...emptyForm, ...member, password: "" } : emptyForm);
    setFormError("");
    setModal(true);
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveStaff = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
    };
    if (form.password) payload.password = form.password;
    if (editing) payload.status = form.status;
    try {
      await api(editing ? `/admin/portal/staff/${editing._id}` : "/admin/portal/staff", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setModal(false);
      setNotice(t(editing ? "staffUpdated" : "staffCreated"));
      await loadStaff();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member) => {
    const status = member.status === "Inactive" ? "Active" : "Inactive";
    try {
      await api(`/admin/portal/staff/${member._id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setNotice(t("saved"));
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const removeStaff = async (member) => {
    if (!window.confirm(`${t("confirmDelete")}\n${member.name}`)) return;
    try {
      await api(`/admin/portal/staff/${member._id}`, { method: "DELETE" });
      setNotice(t("deleted"));
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <AdminLayout title={t("staff")} subtitle={lang === "ar" ? "إدارة أعضاء الفريق وتقييد الوصول حسب الدور." : "Manage team members and enforce role-based access."}>
      <PageHeading title={t("staff")} subtitle={t("staffAccessNote")} actions={<button className="safwa-btn-primary" onClick={() => openForm()}>＋ {t("newStaff")}</button>} />
      {notice && <Alert tone="success">{notice}<button className="safwa-alert-close" onClick={() => setNotice("")}>×</button></Alert>}
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={loadStaff}>{t("retry")}</button></Alert>}
      <div className="safwa-card safwa-staff-toolbar"><label className="safwa-search-form"><input className="safwa-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} /></label><span className="safwa-result-count">{visibleStaff.length} / {staff.length}</span></div>
      <section className="safwa-card safwa-staff-panel">
        <DataState loading={loading} error="" onRetry={loadStaff} empty={!visibleStaff.length && !error}>
          <div className="safwa-table-scroll"><table className="safwa-table safwa-staff-table">
            <thead><tr><th>{lang === "ar" ? "الموظف" : "Team member"}</th><th>{t("role")}</th><th>{t("joined")}</th><th>{lang === "ar" ? "آخر دخول" : "Last sign-in"}</th><th>{t("status")}</th><th>{t("actions")}</th></tr></thead>
            <tbody>{visibleStaff.map((member) => <tr key={member._id}>
              <td><div className="safwa-staff-cell"><span className="safwa-avatar">{member.name?.slice(0, 1) || "A"}</span><span><strong>{member.name}</strong><small dir="ltr">{member.email}</small></span></div></td>
              <td><span className="safwa-role-chip">{roleLabel(member.role, t)}</span></td>
              <td>{formatDate(member.joiningDate || member.createdAt, lang)}</td>
              <td className="safwa-muted-cell">{t("noLastLogin")}</td>
              <td><StatusBadge value={member.status} /></td>
              <td><div className="safwa-row-actions"><button className="safwa-btn-secondary" onClick={() => openForm(member)}>{t("edit")}</button>{member._id !== user?.id && <button className={`safwa-icon-button ${member.status === "Inactive" ? "" : "danger"}`} onClick={() => toggleStatus(member)} title={member.status === "Inactive" ? t("activate") : t("freeze")} aria-label={member.status === "Inactive" ? t("activate") : t("freeze")}>{member.status === "Inactive" ? "↻" : "◌"}</button>}{member._id !== user?.id && <button className="safwa-icon-button danger" onClick={() => removeStaff(member)} title={t("delete")} aria-label={t("delete")}>⌫</button>}</div></td>
            </tr>)}</tbody>
          </table></div>
        </DataState>
        <footer className="safwa-table-footer">{t("staffAccessNote")}</footer>
      </section>
      <section className="safwa-role-legend"><h2>{t("rolesLabel")}</h2><div>{STAFF_ROLES.slice(0, 5).map((role) => <span key={role} className="safwa-role-chip">{roleLabel(role, t)}</span>)}</div></section>

      {modal && <Modal title={t("staffForm")} onClose={() => setModal(false)}>
        <form className="safwa-modal-form" onSubmit={saveStaff}>
          <div className="safwa-form-grid">
            <Field label={lang === "ar" ? "الاسم الكامل" : "Full name"}><input className="safwa-input" value={form.name} onChange={(event) => setField("name", event.target.value)} required minLength="2" /></Field>
            <Field label={t("email")}><input className="safwa-input" type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required dir="ltr" /></Field>
            <Field label={t("phone")}><input className="safwa-input" value={form.phone || ""} onChange={(event) => setField("phone", event.target.value)} dir="ltr" /></Field>
            <Field label={t("role")}><select className="safwa-select" value={form.role} onChange={(event) => setField("role", event.target.value)} required><option value="">—</option>{STAFF_ROLES.map((role) => <option key={role} value={role}>{roleLabel(role, t)}</option>)}</select></Field>
            <Field label={t("password")} hint={editing ? (lang === "ar" ? "اتركه فارغًا للإبقاء على كلمة المرور الحالية." : "Leave blank to keep the current password.") : ""}><input className="safwa-input" type="password" value={form.password || ""} onChange={(event) => setField("password", event.target.value)} minLength="6" required={!editing} autoComplete="new-password" /></Field>
            {editing && <Field label={t("status")}><select className="safwa-select" value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="Active">{t("active")}</option><option value="Inactive">{t("inactive")}</option></select></Field>}
          </div>
          {formError && <Alert tone="error">{formError}</Alert>}
          <div className="safwa-modal-actions"><button type="button" className="safwa-btn-secondary" onClick={() => setModal(false)}>{t("cancel")}</button><button type="submit" className="safwa-btn-primary" disabled={saving}>{saving ? t("loading") : t("save")}</button></div>
        </form>
      </Modal>}
    </AdminLayout>
  );
}
