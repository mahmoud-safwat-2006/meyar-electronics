import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, Field, Modal, PageHeading, StatusBadge, canManageAll, canManageProducts, formatMoney } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

const DEPARTMENTS = ["electronics", "fashion", "beauty", "jewelry", "home", "groceries"];
const splitList = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean);

function getProductForm(product = {}) {
  const specificationText = (product.additionalInformation || [])
    .map((item) => item.key ? `${item.key}: ${item.value || ""}` : "")
    .filter(Boolean)
    .join("\n");
  return {
    title: product.title || "",
    sku: product.sku || "",
    img: product.img || "",
    price: product.price ?? "",
    quantity: product.quantity ?? "",
    discount: product.discount ?? "",
    status: product.status || "in-stock",
    categoryId: product.category?.id || "",
    brandId: product.brand?.id || "",
    productType: product.productType || "",
    parent: product.parent || "",
    children: product.children || "",
    unit: product.unit || "piece",
    description: product.description || "",
    sizes: (product.sizes || []).join(", "),
    colors: (product.imageURLs || []).map((image) => image.color?.name).filter(Boolean).join(", "),
    specifications: specificationText,
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const { api, user } = useAdmin();
  const { lang, t } = useLang();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0, limit: 50 });
  const [options, setOptions] = useState({ categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getProductForm());
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [stock, setStock] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const canEdit = canManageProducts(user?.role);
  const canDelete = canManageAll(user?.role);
  const selectedCategory = useMemo(() => options.categories.find((item) => item._id === form.categoryId), [form.categoryId, options.categories]);

  useEffect(() => {
    if (!router.isReady) return;
    const query = router.query;
    if (typeof query.search === "string") setSearch(query.search);
    if (typeof query.department === "string") setDepartment(DEPARTMENTS.includes(query.department) ? query.department : "");
    if (typeof query.page === "string" && Number(query.page) > 0) setPage(Number(query.page));
  }, [router.isReady, router.query.department, router.query.page, router.query.search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      search,
      department,
      stock,
      status: availability === "inactive" ? "discontinued" : "",
      page: String(page),
      limit: "50",
    });
    try {
      const response = await api(`/admin/portal/products?${params}`);
      setRecords(response.data.items || []);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api, availability, department, page, search, stock]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setFormError("");
    try {
      const response = await api("/admin/portal/products/options");
      setOptions(response.data);
      return response.data;
    } catch (requestError) {
      setFormError(requestError.message);
      return null;
    } finally {
      setOptionsLoading(false);
    }
  }, [api]);

  const openForm = async (product = null) => {
    setEditing(product);
    setForm(getProductForm(product || {}));
    setFormError("");
    setModal(true);
    if (!options.categories.length || !options.brands.length) await loadOptions();
  };

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setFormError("");
    const category = options.categories.find((item) => item._id === form.categoryId);
    const brand = options.brands.find((item) => item._id === form.brandId);
    if (!category && !editing?.category) {
      setFormError(t("requiredFields"));
      return;
    }
    if (!brand && !editing?.brand) {
      setFormError(t("requiredFields"));
      return;
    }
    const additionalInformation = form.specifications.split(/\r?\n/).map((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) return null;
      return { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
    }).filter((item) => item && item.key && item.value);
    const imageURLs = splitList(form.colors).map((name) => ({
      color: { name, clrCode: "" },
      img: form.img,
      sizes: splitList(form.sizes),
    }));
    const payload = {
      title: form.title.trim(),
      sku: form.sku.trim(),
      img: form.img.trim(),
      price: Number(form.price),
      discount: Number(form.discount || 0),
      quantity: Number(form.quantity),
      status: form.status,
      unit: form.unit.trim(),
      parent: category?.parent || editing?.parent,
      children: form.children || category?.children?.[0] || editing?.children,
      productType: category?.productType || form.productType || editing?.productType,
      category: category
        ? { id: category._id, name: category.parent }
        : editing.category,
      brand: brand
        ? { id: brand._id, name: brand.name }
        : editing.brand,
      description: form.description.trim(),
      sizes: splitList(form.sizes),
      imageURLs,
      additionalInformation,
    };
    setSaving(true);
    try {
      await api(editing ? `/admin/portal/products/${editing._id}` : "/admin/portal/products", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setModal(false);
      setNotice(t(editing ? "productUpdated" : "productCreated"));
      await loadProducts();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`${t("confirmDelete")}\n${product.title}`)) return;
    try {
      await api(`/admin/portal/products/${product._id}`, { method: "DELETE" });
      setNotice(t("deleted"));
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleProduct = async (product) => {
    const status = product.status === "discontinued" ? "in-stock" : "discontinued";
    try {
      await api(`/admin/portal/products/${product._id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setNotice(t("saved"));
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const applyFilter = (callback, value) => {
    callback(value);
    setPage(1);
  };

  const changeDepartment = (value) => {
    applyFilter(setDepartment, value);
    router.replace({ pathname: "/products", query: { ...(value ? { department: value } : {}), ...(search ? { search } : {}) } }, undefined, { shallow: true });
  };

  const categoryChoices = options.categories.filter((item) => !form.productType || item.productType === form.productType);

  return (
    <AdminLayout title={t("products")} subtitle={lang === "ar" ? "إدارة الكتالوج والأسعار وتوفر المخزون عبر القطاعات الستة." : "Manage catalog, pricing, and stock availability across six sectors."}>
      <PageHeading title={t("products")} subtitle={t("stockWarning")} actions={canEdit && <button className="safwa-btn-primary" onClick={() => openForm()} disabled={optionsLoading}>{optionsLoading ? t("loading") : `＋ ${t("newProduct")}`}</button>} />
      {notice && <Alert tone="success">{notice}<button className="safwa-alert-close" onClick={() => setNotice("")}>×</button></Alert>}
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={loadProducts}>{t("retry")}</button></Alert>}

      <div className="safwa-department-tabs" role="tablist" aria-label={t("departmentFilter")}>
        <button className={!department ? "active" : ""} onClick={() => changeDepartment("")}>{t("allDepartments")}</button>
        {DEPARTMENTS.map((key) => <button key={key} className={department === key ? "active" : ""} onClick={() => changeDepartment(key)}>{t(key)}</button>)}
      </div>

      <section className="safwa-card safwa-product-panel">
        <div className="safwa-table-toolbar">
          <form className="safwa-search-form" onSubmit={(event) => { event.preventDefault(); setPage(1); loadProducts(); }}>
            <input className="safwa-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} />
            <button type="submit" className="safwa-btn-secondary">{t("search")}</button>
          </form>
          <div className="safwa-filter-group">
            <select className="safwa-select" aria-label={t("stockFilter")} value={stock} onChange={(event) => applyFilter(setStock, event.target.value)}>
              <option value="">{t("stockFilter")}</option><option value="in">{t("inStock")}</option><option value="low">{t("lowStock")}</option><option value="out">{t("outOfStock")}</option>
            </select>
            <select className="safwa-select" aria-label={t("allStatuses")} value={availability} onChange={(event) => applyFilter(setAvailability, event.target.value)}>
              <option value="">{t("allStatuses")}</option><option value="active">{t("active")}</option><option value="inactive">{t("inactive")}</option>
            </select>
            <span className="safwa-result-count">{pagination.total.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} {t("productCount").toLowerCase()}</span>
          </div>
        </div>

        <DataState loading={loading} error="" onRetry={loadProducts} empty={!records.length && !error}>
          <div className="safwa-table-scroll"><table className="safwa-table safwa-product-table">
            <thead><tr><th>{t("product")}</th><th>{t("sku")}</th><th>{t("sector")}</th><th>{t("price")}</th><th>{t("stock")}</th><th>{t("status")}</th>{canEdit && <th>{t("actions")}</th>}</tr></thead>
            <tbody>{records.map((product) => {
              const derivedStatus = product.status === "discontinued" ? product.status : product.quantity === 0 ? "out-of-stock" : product.quantity <= 5 ? "low-stock" : "in-stock";
              return <tr key={product._id}>
                <td><div className="safwa-product-cell"><img src={product.img} alt="" /><span><strong>{product.title}</strong><small>{product.brand?.name || "—"}</small></span></div></td>
                <td className="safwa-mono">{product.sku || "—"}</td>
                <td><span className="safwa-sector-tag">{t(DEPARTMENTS.includes(product.productType) ? product.productType : "sector")}</span><small className="safwa-secondary-line">{product.parent}</small></td>
                <td className="safwa-strong">{formatMoney(product.price, lang)}</td>
                <td><span className={`safwa-stock-value ${product.quantity <= 5 ? "low" : ""}`}>{Number(product.quantity || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</span></td>
                <td>{derivedStatus === "low-stock" ? <span className="safwa-status safwa-status-warning"><i />{t("lowStock")}</span> : <StatusBadge value={derivedStatus} />}</td>
                {canEdit && <td><div className="safwa-row-actions"><button className="safwa-icon-button" onClick={() => openForm(product)} title={t("edit")} aria-label={t("edit")}>✎</button><button className="safwa-icon-button" onClick={() => toggleProduct(product)} title={product.status === "discontinued" ? t("activate") : t("freeze")} aria-label={product.status === "discontinued" ? t("activate") : t("freeze")}>{product.status === "discontinued" ? "↻" : "◌"}</button>{canDelete && <button className="safwa-icon-button danger" onClick={() => deleteProduct(product)} title={t("delete")} aria-label={t("delete")}>⌫</button>}</div></td>}
              </tr>;
            })}</tbody>
          </table></div>
        </DataState>
        {pagination.pages > 1 && <div className="safwa-pagination"><span>{t("pagination")} {pagination.page} {t("of")} {pagination.pages} · {pagination.total}</span><div><button className="safwa-btn-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{t("previous")}</button><button className="safwa-btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>{t("next")}</button></div></div>}
        <footer className="safwa-table-footer">{t("limitedRecords")}</footer>
      </section>

      {modal && <Modal title={t("productForm")} onClose={() => setModal(false)}>
        {!optionsLoading && !options.categories.length && !formError ? <Alert tone="warning">{t("optionsUnavailable")}</Alert> : null}
        <form className="safwa-modal-form" onSubmit={saveProduct}>
          <div className="safwa-form-grid">
            <Field label={t("product")}><input className="safwa-input" value={form.title} onChange={(event) => setField("title", event.target.value)} required minLength="3" maxLength="200" /></Field>
            <Field label={t("sku")}><input className="safwa-input" value={form.sku} onChange={(event) => setField("sku", event.target.value)} dir="ltr" /></Field>
            <Field label={t("price")}><input className="safwa-input" type="number" value={form.price} onChange={(event) => setField("price", event.target.value)} min="0" step="0.01" required /></Field>
            <Field label={t("quantity")}><input className="safwa-input" type="number" value={form.quantity} onChange={(event) => setField("quantity", event.target.value)} min="0" step="1" required /></Field>
            <Field label={t("departmentFilter")}><select className="safwa-select" value={form.productType} onChange={(event) => { setField("productType", event.target.value); setField("categoryId", ""); setField("children", ""); }} required><option value="">{t("departmentFilter")}</option>{DEPARTMENTS.map((key) => <option key={key} value={key}>{t(key)}</option>)}</select></Field>
            <Field label={t("category")}><select className="safwa-select" value={form.categoryId} onChange={(event) => { const selected = options.categories.find((item) => item._id === event.target.value); setField("categoryId", event.target.value); setField("children", selected?.children?.[0] || ""); }} required={!editing}><option value="">{t("category")}</option>{categoryChoices.map((category) => <option key={category._id} value={category._id}>{category.parent}</option>)}</select></Field>
            <Field label={t("details")}><select className="safwa-select" value={form.children} onChange={(event) => setField("children", event.target.value)} required><option value="">{t("details")}</option>{(selectedCategory?.children || (editing?.children ? [editing.children] : [])).map((child) => <option key={child} value={child}>{child}</option>)}</select></Field>
            <Field label={t("brand")}><select className="safwa-select" value={form.brandId} onChange={(event) => setField("brandId", event.target.value)} required={!editing}><option value="">{t("brand")}</option>{options.brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}</select></Field>
            <Field label={t("productDescription")} className="safwa-field-wide"><input className="safwa-input" value={form.description} onChange={(event) => setField("description", event.target.value)} required /></Field>
            <Field label={lang === "ar" ? "رابط صورة المنتج" : "Product image URL"} className="safwa-field-wide"><input className="safwa-input" type="url" value={form.img} onChange={(event) => setField("img", event.target.value)} dir="ltr" required /></Field>
            <Field label={t("sizes")}><input className="safwa-input" value={form.sizes} onChange={(event) => setField("sizes", event.target.value)} placeholder="S, M, L" dir="auto" /></Field>
            <Field label={t("colors")}><input className="safwa-input" value={form.colors} onChange={(event) => setField("colors", event.target.value)} placeholder="Black, Ivory" dir="auto" /></Field>
            <Field label={t("specifications")} className="safwa-field-wide"><textarea className="safwa-input" rows="3" value={form.specifications} onChange={(event) => setField("specifications", event.target.value)} placeholder={lang === "ar" ? "المعالج: ...&#10;الوزن: ..." : "Processor: ...&#10;Weight: ..."} /></Field>
            <Field label={t("status")}><select className="safwa-select" value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="in-stock">{t("inStock")}</option><option value="out-of-stock">{t("outOfStock")}</option><option value="discontinued">{t("discontinued")}</option></select></Field>
          </div>
          {formError && <Alert tone="error">{formError}</Alert>}
          <div className="safwa-modal-actions"><button className="safwa-btn-secondary" type="button" onClick={() => setModal(false)}>{t("cancel")}</button><button className="safwa-btn-primary" disabled={saving || optionsLoading}>{saving ? t("loading") : t("save")}</button></div>
        </form>
      </Modal>}
    </AdminLayout>
  );
}
