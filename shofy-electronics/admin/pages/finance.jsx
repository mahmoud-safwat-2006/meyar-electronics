import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, PageHeading, Panel, formatDate, formatMoney } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

export default function FinancePage() {
  const { api } = useAdmin();
  const { lang, t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/admin/portal/finance");
      setData(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const chartMax = useMemo(() => Math.max(1, ...(data?.daily || []).map((item) => item.revenue || 0)), [data]);

  return (
    <AdminLayout title={t("finance")} subtitle={lang === "ar" ? "مراجعة قيمة الطلبات المسجلة وحالة إعداد بوابة الدفع." : "Review recorded order values and payment gateway configuration."}>
      <PageHeading title={t("finance")} subtitle={t("financeNote")} />
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={load}>{t("retry")}</button></Alert>}
      <DataState loading={loading} error="" onRetry={load} empty={!data && !error}>
        {data && <>
          <Alert tone="warning">{t("financeNote")}</Alert>
          <div className="safwa-finance-kpis">
            <article className="safwa-card safwa-finance-kpi"><span>{lang === "ar" ? "قيمة الطلبات غير الملغاة" : "Non-cancelled order value"}</span><strong>{formatMoney(data.revenue, lang)}</strong><small>{t("salesNotSettled")}</small></article>
            <article className="safwa-card safwa-finance-kpi"><span>{t("totalOrders")}</span><strong>{Number(data.orders || 0).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</strong><small>{lang === "ar" ? "لا تشمل الطلبات الملغاة" : "Cancelled orders excluded"}</small></article>
            <article className="safwa-card safwa-finance-kpi"><span>{lang === "ar" ? "متوسط قيمة الطلب" : "Average order value"}</span><strong>{formatMoney(data.averageOrder, lang)}</strong><small>{t("financeNote")}</small></article>
          </div>
          <div className="safwa-dashboard-lower">
            <Panel title={lang === "ar" ? "قيمة الطلبات اليومية" : "Daily order value"} subtitle={lang === "ar" ? "آخر سبعة أيام" : "Last seven days"}>
              {data.daily?.length ? <div className="safwa-finance-chart">{data.daily.map((item) => <div className="safwa-finance-bar" key={item._id}><span>{formatMoney(item.revenue, lang)}</span><i style={{ height: `${Math.max(4, item.revenue / chartMax * 144)}px` }} /><small>{formatDate(item._id, lang)}</small></div>)}</div> : <div className="safwa-state">{t("noData")}</div>}
            </Panel>
            <Panel title={lang === "ar" ? "بوابات الدفع" : "Payment gateways"} subtitle={t("paymentUnavailable")}>
              {data.gateways?.map((gateway) => <div className="safwa-gateway-row" key={gateway.name}><span className="safwa-gateway-logo">S</span><span><strong>{gateway.name}</strong><small>{lang === "ar" ? "مفتاح الخادم" : "Server-side key"}</small></span><span className={`safwa-gateway-state ${gateway.configured ? "ready" : ""}`}><i />{gateway.configured ? (lang === "ar" ? "مهيأ" : "Configured") : (lang === "ar" ? "غير مهيأ" : "Not configured")}</span></div>)}
              <p className="safwa-footnote">{data.note}</p>
            </Panel>
          </div>
        </>}
      </DataState>
    </AdminLayout>
  );
}
