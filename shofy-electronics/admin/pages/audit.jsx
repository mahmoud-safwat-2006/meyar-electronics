import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { Alert, DataState, PageHeading, StatusBadge, formatDate, roleLabel } from "../components/admin/AdminComponents";
import { useAdmin } from "../context/AdminContext";
import { useLang } from "../context/LanguageContext";

export default function AuditPage() {
  const { api } = useAdmin();
  const { lang, t } = useLang();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api("/admin/portal/audit-logs");
      setLogs(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminLayout title={t("audit")} subtitle={lang === "ar" ? "سجل عمليات التغيير المنفذة من أعضاء فريق الإدارة." : "A record of administrative changes performed by team members."}>
      <PageHeading title={t("audit")} subtitle={t("limitedRecords")} actions={<button className="safwa-btn-secondary" onClick={load}>{t("refresh")} ↻</button>} />
      {error && <Alert tone="error">{error}<button className="safwa-inline-button" onClick={load}>{t("retry")}</button></Alert>}
      <section className="safwa-card safwa-audit-panel"><DataState loading={loading} error="" onRetry={load} empty={!logs.length && !error}>
        <div className="safwa-table-scroll"><table className="safwa-table safwa-audit-table">
          <thead><tr><th>{lang === "ar" ? "المسؤول" : "Actor"}</th><th>{t("role")}</th><th>{lang === "ar" ? "العملية" : "Action"}</th><th>{lang === "ar" ? "المورد" : "Resource"}</th><th>{lang === "ar" ? "النتيجة" : "Result"}</th><th>IP</th><th>{t("date")}</th></tr></thead>
          <tbody>{logs.map((log) => <tr key={log._id}>
            <td className="safwa-strong">{log.actorName}</td>
            <td><span className="safwa-role-chip">{roleLabel(log.actorRole, t)}</span></td>
            <td className="safwa-mono safwa-audit-action" dir="ltr">{log.action}</td>
            <td>{log.resource}{log.resourceId ? ` · ${String(log.resourceId).slice(-7)}` : ""}</td>
            <td><StatusBadge value={log.statusCode < 400 ? "active" : "cancel"} /></td>
            <td className="safwa-mono" dir="ltr">{log.ipAddress || "—"}</td>
            <td>{formatDate(log.createdAt, lang, true)}</td>
          </tr>)}</tbody>
        </table></div>
      </DataState><footer className="safwa-table-footer">{lang === "ar" ? "لا تُحفظ كلمات المرور أو محتويات الطلبات في سجل التدقيق." : "Passwords and order contents are not stored in the audit trail."}</footer></section>
    </AdminLayout>
  );
}
