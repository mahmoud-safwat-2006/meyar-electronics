import { useEffect } from "react";
import { useLang } from "../../context/LanguageContext";

const STATUS_KEYS = {
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  returned: "returned",
  cancel: "cancelled",
  cancelled: "cancelled",
  active: "active",
  inactive: "inactive",
  "in-stock": "inStock",
  "out-of-stock": "outOfStock",
  discontinued: "discontinued",
};

export function PageHeading({ title, subtitle, actions }) {
  return (
    <div className="safwa-page-heading">
      <div><span className="safwa-eyebrow">SAFWA · ENTERPRISE</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {actions && <div className="safwa-page-actions">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, action, className = "", children }) {
  return <section className={`safwa-card safwa-panel ${className}`}><div className="safwa-panel-heading"><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}

export function Field({ label, hint, className = "", children }) {
  return <label className={`safwa-field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function Modal({ title, onClose, children }) {
  const { t } = useLang();
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="safwa-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="safwa-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header><div><span className="safwa-eyebrow">{t("subBrand")}</span><h2>{title}</h2></div><button type="button" className="safwa-icon-button" onClick={onClose} aria-label={t("close")}>×</button></header>
        {children}
      </section>
    </div>
  );
}

export function StatusBadge({ value }) {
  const { t } = useLang();
  const normalized = String(value || "").toLowerCase();
  const key = STATUS_KEYS[normalized] || "";
  const tone = ["delivered", "active", "in-stock"].includes(normalized) ? "success"
    : ["pending", "processing"].includes(normalized) ? "warning"
      : normalized === "shipped" ? "info"
        : ["cancel", "cancelled", "returned", "inactive", "out-of-stock", "discontinued"].includes(normalized) ? "danger" : "neutral";
  return <span className={`safwa-status safwa-status-${tone}`}><i />{key ? t(key) : value || "—"}</span>;
}

export function DataState({ loading, error, onRetry, empty, children }) {
  const { t } = useLang();
  if (loading) return <div className="safwa-state"><span className="safwa-spinner" />{t("loading")}</div>;
  if (error) return <div className="safwa-state safwa-state-error"><p>{error}</p>{onRetry && <button className="safwa-btn-secondary" onClick={onRetry}>{t("retry")}</button>}</div>;
  if (empty) return <div className="safwa-state">{t("noData")}</div>;
  return children;
}

export function Alert({ children, tone = "info" }) {
  return <div className={`safwa-alert safwa-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function formatMoney(value, lang = "en") {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value, lang = "en", withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
}

export function roleLabel(role, t) {
  const keys = {
    "Super Admin": "roleSuperAdmin",
    CEO: "roleSuperAdmin",
    Admin: "roleAdmin",
    Manager: "roleOperations",
    "Operations Manager": "roleOperations",
    "Warehouse Manager": "roleWarehouse",
    "Catalog Editor": "roleCatalog",
    "Logistics Officer": "roleLogistics",
    "Fulfillment Lead": "roleFulfillment",
    "Support Staff": "roleSupport",
    "Support Agent": "roleSupport",
    "Marketing Manager": "roleMarketing",
    "Finance Manager": "roleFinance",
    Auditor: "roleAuditor",
  };
  return t(keys[role] || "roleAdmin");
}

export function canManageAll(role) {
  return ["Super Admin", "CEO", "Admin"].includes(role);
}

export function canViewOrderValue(role) {
  return canManageAll(role) || ["Finance Manager", "Auditor"].includes(role);
}

export function canUpdateOrder(role) {
  return canManageAll(role) || ["Operations Manager", "Manager", "Logistics Officer", "Fulfillment Lead"].includes(role);
}

export function canManageProducts(role) {
  return canManageAll(role) || ["Warehouse Manager", "Catalog Editor"].includes(role);
}
