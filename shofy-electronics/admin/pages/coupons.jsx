import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, Field, Modal, PageHeading, StatusBadge, formatDate, formatMoney } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

const DEPARTMENTS = ["electronics", "fashion", "beauty", "jewelry", "home", "groceries"];
const emptyForm = {
  title: "",
  couponCode: "",
  discountPercentage: "",
  minimumAmount: "0",
  productType: "electronics",
  startTime: new Date().toISOString().slice(0, 10),
  endTime: "",
  status: "active",
  logo: "https://placehold.co/96x96?text=Safwa",
};

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function CouponsPage() {
  const { api } = useAdmin();
  const { lang, t } = useLang();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/admin/portal/coupons");
      setCoupons(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const now = new Date();
  const filtered = coupons.filter((coupon) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [coupon.couponCode, coupon.title, coupon.productType].some((value) => String(value || "").toLowerCase().includes(query));
    const expired = coupon.endTime && new Date(coupon.endTime) < now;
    const effectiveStatus = coupon.status === "inactive" || expired ? "inactive" : "active";
    return matchesSearch && (!statusFilter || statusFilter === effectiveStatus);
  });

  const openForm = (coupon = null) => {
    setEditing(coupon);
    setForm(coupon ? {
      title: coupon.title || "",
      couponCode: coupon.couponCode || "",
      discountPercentage: coupon.discountPercentage ?? "",
      minimumAmount: coupon.minimumAmount ?? 0,
      productType: coupon.productType || "electronics",
      startTime: dateInputValue(coupon.startTime) || emptyForm.startTime,
      endTime: dateInputValue(coupon.endTime),
      status: coupon.status || "active",
      logo: coupon.logo || emptyForm.logo,
    } : { ...emptyForm, startTime: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setModal(true);
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      title: form.title.trim(),
      couponCode: form.couponCode.trim().toUpperCase(),
      discountPercentage: Number(form.discountPercentage),
      minimumAmount: Number(form.minimumAmount || 0),
      productType: form.productType,
      startTime: form.startTime ? new Date(`${form.startTime}T00:00:00`).toISOString() : new Date().toISOString(),
      endTime: form.endTime ? new Date(`${form.endTime}T23:59:59`).toISOString() : "",
      status: form.status,
      logo: form.logo.trim(),
    };
    try {
      await api(editing ? `/admin/portal/coupons/${editing._id}` : "/admin/portal/coupons", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setModal(false);
      setNotice(t(editing ? "couponUpdated" : "couponCreated"));
      await loadCoupons();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (coupon) => {
    try {
      await api(`/admin/portal/coupons/${coupon._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: coupon.status === "active" ? "inactive" : "active" }),
      });
      setNotice(t("saved"));
      await loadCoupons();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const removeCoupon = async (coupon) => {
    if (!window.confirm(`${t("confirmDelete")}\n${coupon.couponCode}`)) return;
    try {
      await api(`/admin/portal/coupons/${coupon._id}`, { method: "DELETE" });
      setNotice(t("deleted"));
      await loadCoupons();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <AdminLayout title={t("coupons")} subtitle={lang === "ar" ? "إنشاء عروض الخصم وإدارة قواعدها وتواريخ صلاحيتها." : "Create discount offers and manage promotion rules and expiry dates."}>
      <PageHeading title={t("coupons")} subtitle={t("usage") + ": " + t("notTracked")} actions={<button className="safwa-btn-primary" onClick={() => openForm()}>＋ {t("newCoupon")}</button>} />
      {notice && <Alert tone="success">{notice}<button className="safwa-alert-close" onClick={() => setNotice("")}>×</button></Alert>}
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={loadCoupons}>{t("retry")}</button></Alert>}
      <section className="safwa-card safwa-coupon-panel">
        <div className="safwa-table-toolbar">
          <input className="safwa-input safwa-coupon-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} />
          <div className="safwa-filter-group"><select className="safwa-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">{t("allStatuses")}</option><option value="active">{t("active")}</option><option value="inactive">{t("inactive")}</option></select><span className="safwa-result-count">{filtered.length} / {coupons.length}</span></div>
        </div>
        <DataState loading={loading} error="" onRetry={loadCoupons} empty={!filtered.length && !error}>
          <div className="safwa-table-scroll"><table className="safwa-table safwa-coupon-table">
            <thead><tr><th>{lang === "ar" ? "الحملة" : "Campaign"}</th><th>{lang === "ar" ? "كود الخصم" : "Code"}</th><th>{t("discount")}</th><th>{t("minimumAmount")}</th><th>{t("sector")}</th><th>{t("usage")}</th><th>{t("expiry")}</th><th>{t("status")}</th><th>{t("actions")}</th></tr></thead>
            <tbody>{filtered.map((coupon) => {
              const isExpired = coupon.endTime && new Date(coupon.endTime) < new Date();
              const activeStatus = coupon.status === "active" && !isExpired ? "active" : "inactive";
              return <tr key={coupon._id}>
                <td className="safwa-strong">{coupon.title}</td>
                <td><span className="safwa-coupon-code">{coupon.couponCode}</span></td>
                <td className="safwa-strong">{coupon.discountPercentage}%</td>
                <td>{formatMoney(coupon.minimumAmount, lang)}</td>
                <td><span className="safwa-sector-tag">{t(DEPARTMENTS.includes(coupon.productType) ? coupon.productType : "sector")}</span></td>
                <td className="safwa-muted-cell">{t("notTracked")}</td>
                <td>{formatDate(coupon.endTime, lang)}</td>
                <td><StatusBadge value={activeStatus} /></td>
                <td><div className="safwa-row-actions"><button className="safwa-btn-secondary" onClick={() => openForm(coupon)}>{t("edit")}</button><button className="safwa-icon-button" onClick={() => toggleCoupon(coupon)} title={activeStatus === "active" ? t("inactive") : t("active")} aria-label={activeStatus === "active" ? t("inactive") : t("active")}>{activeStatus === "active" ? "◌" : "↻"}</button><button className="safwa-icon-button danger" onClick={() => removeCoupon(coupon)} aria-label={t("delete")}>⌫</button></div></td>
              </tr>;
            })}</tbody>
          </table></div>
        </DataState>
        <footer className="safwa-table-footer">{t("usage")}: {t("notTracked")}. {t("salesNotSettled")}</footer>
      </section>

      {modal && <Modal title={t("couponForm")} onClose={() => setModal(false)}>
        <form className="safwa-modal-form" onSubmit={saveCoupon}>
          <div className="safwa-form-grid">
            <Field label={lang === "ar" ? "اسم الحملة" : "Campaign name"}><input className="safwa-input" value={form.title} onChange={(event) => setField("title", event.target.value)} required /></Field>
            <Field label={lang === "ar" ? "كود الخصم" : "Coupon code"}><input className="safwa-input safwa-mono-input" value={form.couponCode} onChange={(event) => setField("couponCode", event.target.value.toUpperCase())} required dir="ltr" maxLength="40" /></Field>
            <Field label={`${t("discount")} (%)`} hint={lang === "ar" ? "قاعدة البيانات تدعم خصمًا نسبيًا فقط." : "The current model supports percentage discounts only."}><input className="safwa-input" type="number" value={form.discountPercentage} onChange={(event) => setField("discountPercentage", event.target.value)} min="1" max="100" step="0.1" required /></Field>
            <Field label={t("minimumAmount")}><input className="safwa-input" type="number" value={form.minimumAmount} onChange={(event) => setField("minimumAmount", event.target.value)} min="0" step="0.01" required /></Field>
            <Field label={t("sector")}><select className="safwa-select" value={form.productType} onChange={(event) => setField("productType", event.target.value)} required>{DEPARTMENTS.map((key) => <option key={key} value={key}>{t(key)}</option>)}</select></Field>
            <Field label={lang === "ar" ? "تاريخ البدء" : "Start date"}><input className="safwa-input" type="date" value={form.startTime} onChange={(event) => setField("startTime", event.target.value)} required /></Field>
            <Field label={t("expiry")}><input className="safwa-input" type="date" value={form.endTime} onChange={(event) => setField("endTime", event.target.value)} required /></Field>
            {editing && <Field label={t("status")}><select className="safwa-select" value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="active">{t("active")}</option><option value="inactive">{t("inactive")}</option></select></Field>}
          </div>
          {formError && <Alert tone="error">{formError}</Alert>}
          <div className="safwa-modal-actions"><button type="button" className="safwa-btn-secondary" onClick={() => setModal(false)}>{t("cancel")}</button><button className="safwa-btn-primary" disabled={saving}>{saving ? t("loading") : t("save")}</button></div>
        </form>
      </Modal>}
    </AdminLayout>
  );
}
