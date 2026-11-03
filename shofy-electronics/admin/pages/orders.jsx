import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, PageHeading, StatusBadge, canManageAll, canUpdateOrder, canViewOrderValue, formatDate, formatMoney } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";
import { printOrderInvoice } from "../lib/print-documents";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "returned", "cancel"];

function getSector(order, t) {
  const type = String(order.cart?.[0]?.productType || "").toLowerCase();
  return ["electronics", "fashion", "beauty", "jewelry", "home", "groceries"].includes(type) ? t(type) : "—";
}

export default function OrdersPage() {
  const router = useRouter();
  const { api, user } = useAdmin();
  const { lang, t } = useLang();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState("");
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [invoice, setInvoice] = useState("");
  const [filters, setFilters] = useState({ status: "", phone: "", city: "", invoice: "" });

  const role = user?.role;
  const showAddresses = canManageAll(role) || ["Logistics Officer", "Fulfillment Lead"].includes(role);
  const showCustomerDetails = canManageAll(role) || ["Logistics Officer", "Fulfillment Lead", "Support Staff", "Support Agent"].includes(role);
  const showAmounts = canViewOrderValue(role);
  const supportAgent = ["Support Staff", "Support Agent"].includes(role) && !canManageAll(role);

  useEffect(() => {
    if (!router.isReady || typeof router.query.invoice !== "string") return;
    setInvoice(router.query.invoice);
    setFilters((current) => ({ ...current, invoice: router.query.invoice }));
  }, [router.isReady, router.query.invoice]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      status: filters.status,
      phone: filters.phone,
      city: filters.city,
      invoice: filters.invoice,
    });
    try {
      const response = await api(`/admin/portal/orders?${params}`);
      setOrders(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({ status, phone: phone.trim(), city: city.trim(), invoice: invoice.trim() });
  };

  const updateStatus = async (order, nextStatus) => {
    setSavingId(order._id);
    setError("");
    try {
      await api(`/admin/portal/orders/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setNotice(t("saved"));
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  };

  const printInvoice = (order) => {
    try {
      printOrderInvoice(order, lang);
    } catch (printError) {
      setError(printError.message);
    }
  };

  return (
    <AdminLayout title={t("orders")} subtitle={lang === "ar" ? "مراجعة الطلبات وإدارة مراحل التنفيذ والتسليم." : "Review orders and manage fulfillment and delivery stages."}>
      <PageHeading title={t("orders")} subtitle={t("orderLifecycleNote")} />
      {notice && <Alert tone="success">{notice}<button className="safwa-alert-close" onClick={() => setNotice("")}>×</button></Alert>}
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={loadOrders}>{t("retry")}</button></Alert>}

      <form className="safwa-card safwa-order-filters" onSubmit={applyFilters}>
        <label className="safwa-field"><span>{t("status")}</span><select className="safwa-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t("allStatuses")}</option>{ORDER_STATUSES.map((value) => <option key={value} value={value}>{t(value === "cancel" ? "cancelled" : value)}</option>)}</select></label>
        <label className="safwa-field"><span>{t("phoneFilter")}</span><input className="safwa-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+20..." dir="ltr" /></label>
        <label className="safwa-field"><span>{t("city")}</span><input className="safwa-input" value={city} onChange={(event) => setCity(event.target.value)} /></label>
        <label className="safwa-field"><span>{t("invoice")}</span><input className="safwa-input" inputMode="numeric" value={invoice} onChange={(event) => setInvoice(event.target.value)} /></label>
        <label className="safwa-field"><span>{t("carrierFilter")}</span><select className="safwa-select" disabled aria-label={t("carrierFilter")}><option>{t("notTracked")}</option></select></label>
        <div className="safwa-filter-submit"><button className="safwa-btn-primary" type="submit">{t("search")}</button><button className="safwa-btn-secondary" type="button" onClick={() => { setPhone(""); setCity(""); setInvoice(""); setStatus(""); setFilters({ status: "", phone: "", city: "", invoice: "" }); router.replace("/orders", undefined, { shallow: true }); }}>{t("clearFilters")}</button></div>
      </form>

      <Alert>{t("shipmentUnavailable")}</Alert>

      <section className="safwa-card safwa-orders-card">
        <div className="safwa-panel-heading"><div><h2>{t("recentOrders")}</h2><p>{t("limitedRecords")}</p></div><span className="safwa-result-count">{orders.length} / 200</span></div>
        <DataState loading={loading} error="" onRetry={loadOrders} empty={!orders.length && !error}>
          <div className="safwa-table-scroll"><table className="safwa-table safwa-order-table">
            <thead><tr><th>{t("invoice")}</th>{showCustomerDetails && <><th>{t("customer")}</th><th>{t("phone")}</th></>}{showAddresses && <th>{t("address")}</th>}<th>{t("sector")}</th><th>{t("date")}</th>{showAmounts && <th>{t("amount")}</th>}<th>{t("status")}</th>{(canUpdateOrder(role) || canManageAll(role)) && <th>{t("actions")}</th>}</tr></thead>
            <tbody>{orders.map((order) => <tr key={order._id}>
              <td className="safwa-mono safwa-id">#{order.invoice || order._id?.slice(-7)}</td>
              {showCustomerDetails && <><td className="safwa-strong">{order.name || "—"}</td><td className="safwa-mono" dir="ltr">{order.contact || "—"}</td></>}
              {showAddresses && <td className="safwa-address">{[order.address, order.city, order.country, order.zipCode].filter(Boolean).join(", ") || "—"}</td>}
              <td>{getSector(order, t)}</td>
              <td>{formatDate(order.createdAt, lang, true)}</td>
              {showAmounts && <td className="safwa-strong">{formatMoney(order.totalAmount, lang)}</td>}
              <td><StatusBadge value={order.status} /></td>
              {(canUpdateOrder(role) || canManageAll(role)) && <td><div className="safwa-order-actions">
                {canUpdateOrder(role) && <select className="safwa-select safwa-status-select" value={String(order.status || "pending").toLowerCase()} onChange={(event) => updateStatus(order, event.target.value)} disabled={savingId === order._id} aria-label={`${t("status")} ${order.invoice}`}><option value="pending">{t("pending")}</option><option value="processing">{t("processing")}</option><option value="shipped">{t("shipped")}</option><option value="delivered">{t("delivered")}</option><option value="returned">{t("returned")}</option><option value="cancel">{t("cancelled")}</option></select>}
                {canManageAll(role) && <button className="safwa-btn-secondary safwa-print-button" onClick={() => printInvoice(order)} type="button">{t("printInvoice")}</button>}
                {canUpdateOrder(role) && <button className="safwa-icon-button" type="button" disabled title={t("printWaybill")} aria-label={t("printWaybill")}>▤</button>}
              </div></td>}
            </tr>)}</tbody>
          </table></div>
        </DataState>
        {supportAgent && <Alert tone="info">{t("supportUnavailable")}</Alert>}
      </section>
      <p className="safwa-footnote">{t("orderLifecycleNote")}</p>
    </AdminLayout>
  );
}
