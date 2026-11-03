import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, Panel, StatusBadge, formatDate, formatMoney } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

const PILLARS = [
  { type: "electronics", key: "electronics", icon: "⌁", color: "emerald" },
  { type: "fashion", key: "fashion", icon: "◌", color: "blue" },
  { type: "beauty", key: "beauty", icon: "✧", color: "rose" },
  { type: "jewelry", key: "jewelry", icon: "◇", color: "amber" },
  { type: "home", key: "home", icon: "⌂", color: "violet" },
  { type: "groceries", key: "groceries", icon: "▤", color: "cyan" },
];

export default function Dashboard() {
  const { api, user } = useAdmin();
  const { lang, t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await api("/admin/portal/overview");
      setData(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const roleCanSeeFinance = ["Super Admin", "CEO", "Admin", "Finance Manager", "Auditor"].includes(user?.role);
  const sectors = data?.sectors || [];
  const statusTotal = (data?.orderStatuses || []).reduce((total, item) => total + item.count, 0);

  return (
    <AdminLayout title={t("overview")} subtitle={lang === "ar" ? "مؤشرات تشغيلية حية من قاعدة بيانات صفوة" : "Live operational metrics from Safwa's database"}>
      <div className="safwa-hero-banner">
        <div className="safwa-hero-copy">
          <span className="safwa-hero-label">{t("operationsCenter")}</span>
          <h1>{lang === "ar" ? `مرحبًا بعودتك، ${user?.name || "فريق صفوة"}` : `Welcome back, ${user?.name || "Safwa team"}`}</h1>
          <p>{lang === "ar" ? "إليك صورة موحّدة لأداء المتجر والطلبات والمخزون." : "Your live view of store performance, orders, and inventory."}</p>
        </div>
        <div className="safwa-hero-meta"><span className="safwa-live-indicator"><i />{t("live")}</span><span>{data?.serverTime ? formatDate(data.serverTime, lang, true) : "—"}</span><small>{t("serverTime")}</small></div>
        <span className="safwa-hero-watermark">ص</span>
      </div>

      {error && <Alert tone="error">{error} <button className="safwa-inline-button" onClick={load}>{t("retry")}</button></Alert>}

      <DataState loading={loading} error="" onRetry={load} empty={false}>
        {data && <>
          <div className="safwa-kpi-grid">
            <article className="safwa-card safwa-kpi-card">
              <span className="safwa-kpi-icon emerald">＄</span>
              <span className="safwa-kpi-label">{t("totalRevenue")}</span>
              <strong className="safwa-kpi-value">{roleCanSeeFinance ? formatMoney(data.grossOrderValue, lang) : "—"}</strong>
              <span className="safwa-kpi-foot">{roleCanSeeFinance ? t("financeNote") : t("noPermission")}</span>
            </article>
            <article className="safwa-card safwa-kpi-card">
              <span className="safwa-kpi-icon blue">▤</span>
              <span className="safwa-kpi-label">{t("totalOrders")}</span>
              <strong className="safwa-kpi-value">{Number(data.orders || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
              <span className="safwa-kpi-foot">{Number(data.deliveredOrders || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} {t("deliveredOrders")}</span>
            </article>
            <article className="safwa-card safwa-kpi-card">
              <span className="safwa-kpi-icon violet">▦</span>
              <span className="safwa-kpi-label">{t("activeProducts")}</span>
              <strong className="safwa-kpi-value">{Number(data.activeProducts || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
              <span className="safwa-kpi-foot">{Number(data.products || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} {t("productCount").toLowerCase()}</span>
            </article>
            <article className="safwa-card safwa-kpi-card">
              <span className="safwa-kpi-icon amber">♙</span>
              <span className="safwa-kpi-label">{t("totalCustomers")}</span>
              <strong className="safwa-kpi-value">{Number(data.newCustomers || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
              <span className="safwa-kpi-foot">{t("weeklyGrowth")}</span>
            </article>
          </div>

          <div className="safwa-kpi-grid safwa-secondary-kpis">
            <article className="safwa-card safwa-kpi-card safwa-compact-kpi">
              <span className="safwa-kpi-label">{t("conversionRate")}</span>
              <strong className="safwa-kpi-value">—</strong>
              <span className="safwa-kpi-foot">{t("conversionUnavailable")}</span>
            </article>
            <article className="safwa-card safwa-kpi-card safwa-compact-kpi">
              <span className="safwa-kpi-label">{t("weeklyGrowth")}</span>
              <strong className={`safwa-kpi-value ${Number(data.weeklyGrowth) < 0 ? "negative" : ""}`}>
                {!roleCanSeeFinance || data.weeklyGrowth === null || data.weeklyGrowth === undefined
                  ? "—"
                  : `${data.weeklyGrowth >= 0 ? "+" : ""}${data.weeklyGrowth.toFixed(1)}%`}
              </strong>
              <span className="safwa-kpi-foot">{t("financeNote")}</span>
            </article>
            <article className="safwa-card safwa-kpi-card safwa-compact-kpi">
              <span className="safwa-kpi-label">{t("pendingOrders")}</span>
              <strong className="safwa-kpi-value">{Number(data.orderStatuses?.find((item) => item._id?.toLowerCase() === "pending")?.count || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
              <span className="safwa-kpi-foot">{t("totalOrders")}</span>
            </article>
            <article className="safwa-card safwa-kpi-card safwa-compact-kpi">
              <span className="safwa-kpi-label">{t("lowStockAlert")}</span>
              <strong className="safwa-kpi-value">{Number(data.lowStock || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong>
              <span className="safwa-kpi-foot">{t("stockWarning")}</span>
            </article>
          </div>

          <Panel title={t("allDepartments")} subtitle={t("sectorCatalog")} action={<Link className="safwa-text-link" href="/products">{t("products")} →</Link>} className="safwa-section-card">
            <div className="safwa-dept-grid">
              {PILLARS.map((pillar) => {
                const record = sectors.find((item) => item.type === pillar.type);
                return (
                  <Link key={pillar.type} href={`/products?department=${pillar.type}`} className="safwa-dept-box">
                    <span className={`safwa-dept-icon ${pillar.color}`}>{pillar.icon}</span>
                    <span className="safwa-dept-name">{t(pillar.key)}</span>
                    <strong>{Number(record?.count || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} <small>{t("productCount")}</small></strong>
                    <span className="safwa-dept-sales">{data.sectorSalesAvailable ? formatMoney(record?.sales || 0, lang) : "—"} <small>{t("salesValue")}</small></span>
                  </Link>
                );
              })}
            </div>
            <Alert>{t("salesNotSettled")}</Alert>
          </Panel>

          <div className="safwa-dashboard-lower">
            <Panel title={t("recentOrders")} subtitle={`${statusTotal.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")} ${t("totalOrders").toLowerCase()}`} action={<Link className="safwa-text-link" href="/orders">{t("orders")} →</Link>} className="safwa-orders-panel">
              {data.recentOrders?.length ? <div className="safwa-table-scroll"><table className="safwa-table">
                <thead><tr><th>{t("invoice")}</th><th>{t("customer")}</th><th>{t("phone")}</th><th>{t("sector")}</th><th>{t("date")}</th><th>{t("amount")}</th><th>{t("status")}</th></tr></thead>
                <tbody>{data.recentOrders.map((order) => <tr key={order._id}>
                  <td className="safwa-mono safwa-id">#{order.invoice || order._id?.slice(-7)}</td>
                  <td className="safwa-strong">{order.name || "—"}</td>
                  <td className="safwa-mono">{order.contact || "—"}</td>
                  <td>{order.sector ? t(PILLARS.find((item) => item.type === String(order.sector).toLowerCase())?.key || "sector") : "—"}</td>
                  <td>{formatDate(order.createdAt, lang)}</td>
                  <td className="safwa-strong">{order.totalAmount === undefined ? "—" : formatMoney(order.totalAmount, lang)}</td>
                  <td><StatusBadge value={order.status} /></td>
                </tr>)}</tbody>
              </table></div> : <div className="safwa-state">{t("noData")}</div>}
            </Panel>
            <Panel title={t("status")} subtitle={t("recentOrders")} className="safwa-status-panel">
              {data.orderStatuses?.length ? <div className="safwa-status-list">{data.orderStatuses.map((status) => {
                const count = status.count || 0;
                const percent = statusTotal ? Math.max(4, count / statusTotal * 100) : 0;
                return <div key={status._id || "none"} className="safwa-status-row"><div><StatusBadge value={status._id} /><strong>{count}</strong></div><div className="safwa-progress"><i className={`status-${String(status._id || "pending").toLowerCase()}`} style={{ width: `${percent}%` }} /></div></div>;
              })}</div> : <div className="safwa-state">{t("noData")}</div>}
            </Panel>
          </div>
        </>}
        {!data && !error && !loading && <button className="safwa-btn-secondary" onClick={load}>{t("retry")}</button>}
      </DataState>
    </AdminLayout>
  );
}
