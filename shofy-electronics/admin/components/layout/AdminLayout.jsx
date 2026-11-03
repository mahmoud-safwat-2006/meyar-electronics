import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAdmin } from "../../context/AdminContext";
import { useLang } from "../../context/LanguageContext";

const navigation = [
  { href: "/", key: "overview", icon: "grid" },
  { href: "/products", key: "products", icon: "box", roles: ["Warehouse Manager", "Operations Manager", "Manager", "Catalog Editor"] },
  { href: "/orders", key: "orders", icon: "orders", roles: ["Operations Manager", "Manager", "Logistics Officer", "Fulfillment Lead", "Support Staff", "Support Agent", "Finance Manager", "Auditor"] },
  { href: "/staff", key: "staff", icon: "users", roles: ["Super Admin"] },
  { href: "/coupons", key: "coupons", icon: "tag", roles: ["Marketing Manager"] },
  { href: "/finance", key: "finance", icon: "chart", roles: ["Finance Manager", "Auditor"] },
  { href: "/audit", key: "audit", icon: "shield", roles: ["Super Admin"] },
];

const ROLE_LABELS = {
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

const hasFullAccess = (role) => ["Super Admin", "CEO", "Admin"].includes(role);
const canSee = (item, role) => !item.roles || hasFullAccess(role) || item.roles.includes(role);
const canSeeFinance = (role) => hasFullAccess(role) || ["Finance Manager", "Auditor"].includes(role);

function Icon({ name, size = 19 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    box: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7M12 11v10" /></>,
    orders: <><path d="M8 4h8M8 8h8M8 12h8M8 16h5" /><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    tag: <><path d="M20 13 13 20a2 2 0 0 1-2.83 0L3 12.83V4h8.83L20 12.17a.6.6 0 0 1 0 .83Z" /><circle cx="7.5" cy="8" r="1" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    language: <><path d="M4 5h12M10 3v2m1 8a16 16 0 0 1-6-6" /><path d="M7 15c2-1 4-3 5-6M13 21l4-9 4 9m-6-3h4" /></>,
    external: <><path d="M14 3h7v7m0-7-10 10" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    store: <><path d="M3 10v10h18V10M2 4h20l-2 6H4L2 4Z" /><path d="M9 20v-6h6v6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>;
}

export default function AdminLayout({ children, title, subtitle }) {
  const router = useRouter();
  const { lang, toggleLang, t } = useLang();
  const { user, ready, api, login, logout } = useAdmin();
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [system, setSystem] = useState(null);
  const [overview, setOverview] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());

  const role = user?.role || "";
  const navItems = useMemo(() => navigation.filter((item) => canSee(item, role)), [role]);
  const userName = user?.name || "Administrator";

  const refreshHealth = useCallback(async () => {
    try {
      const [health, summary] = await Promise.all([
        api("/admin/portal/system"),
        api("/admin/portal/overview"),
      ]);
      setSystem(health.data);
      setOverview(summary.data);
      setServerOffset(new Date(health.data.serverTime).getTime() - Date.now());
    } catch (error) {
      if (error.status !== 401 && error.status !== 403) setSystem({ api: "offline", database: "disconnected" });
    }
  }, [api]);

  useEffect(() => {
    if (!ready || !user) return undefined;
    refreshHealth();
    const timer = window.setInterval(refreshHealth, 60000);
    return () => window.clearInterval(timer);
  }, [ready, refreshHealth, user]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (!user || query.length < 2) {
      setSearchResults([]);
      setSearchError("");
      return undefined;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const result = await api(`/admin/portal/search?q=${encodeURIComponent(query)}`);
        if (active) {
          setSearchResults(result.data || []);
          setSearchError("");
        }
      } catch (error) {
        if (active) {
          setSearchResults([]);
          if (error.status !== 401 && error.status !== 403) setSearchError(error.message);
        }
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [api, search, user]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    const values = new FormData(event.currentTarget);
    try {
      await login(String(values.get("email")), String(values.get("password")));
    } catch (error) {
      setLoginError(error.message || t("invalidLogin"));
    } finally {
      setLoginBusy(false);
    }
  };

  const chooseSearchResult = (result) => {
    setSearch("");
    setSearchResults([]);
    router.push(result.type === "product" ? `/products?search=${encodeURIComponent(result.detail || result.label)}` : `/orders?invoice=${encodeURIComponent(result.label.replace("#", ""))}`);
  };

  const activeNavigation = navigation.find((item) => item.href === router.pathname);
  const pageTitle = title || t(activeNavigation?.key || "overview");
  const serverNow = new Date(clockNow + serverOffset);
  const timeLabel = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(serverNow);

  if (!ready) {
    return <main className="safwa-loading-screen"><span className="safwa-spinner" />{t("loading")}</main>;
  }

  if (!user) {
    return (
      <>
        <Head><title>{t("loginTitle")} | SAFWA</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <main className="safwa-login-shell">
          <section className="safwa-login-brand">
            <div className="safwa-logo-box">ص</div>
            <p className="safwa-login-overline">SAFWA · ENTERPRISE</p>
            <h1>{lang === "ar" ? "تشغيل أكثر ذكاءً.\nتجارة أقوى." : "Operate smarter.\nGrow with confidence."}</h1>
            <p className="safwa-login-copy">{lang === "ar" ? "منصة موحّدة لإدارة المنتجات والطلبات وفريق صفوة." : "One workspace for Safwa products, orders, and teams."}</p>
            <div className="safwa-login-orbit" />
          </section>
          <section className="safwa-login-panel">
            <form className="safwa-login-form" onSubmit={handleLogin}>
              <span className="safwa-eyebrow">{t("subBrand")}</span>
              <h2>{t("loginTitle")}</h2>
              <p>{t("loginDescription")}</p>
              <label className="safwa-field"><span>{t("email")}</span><input name="email" type="email" autoComplete="username" required dir="ltr" /></label>
              <label className="safwa-field"><span>{t("password")}</span><input name="password" type="password" autoComplete="current-password" required minLength="6" /></label>
              {loginError && <div className="safwa-error" role="alert">{loginError}</div>}
              <button className="safwa-btn-primary safwa-login-submit" type="submit" disabled={loginBusy}>{loginBusy ? t("loading") : t("signIn")}<span aria-hidden="true">→</span></button>
              <button type="button" className="safwa-language-login" onClick={toggleLang}><Icon name="language" size={16} />{t("langToggle")}</button>
            </form>
            <span className="safwa-login-footer">© {new Date().getFullYear()} SAFWA</span>
          </section>
        </main>
      </>
    );
  }

  if (!canSee(activeNavigation || navigation[0], role)) {
    return (
      <div className="safwa-app">
        <aside className="safwa-sidebar"><Brand lang={lang} t={t} /><div className="safwa-sidebar-footer"><UserCard user={user} role={role} t={t} /><button className="safwa-nav-link" onClick={logout}><Icon name="logout" />{t("logout")}</button></div></aside>
        <main className="safwa-content-area"><Topbar title={pageTitle} subtitle={subtitle} lang={lang} t={t} toggleLang={toggleLang} timeLabel={timeLabel} /><div className="safwa-main-body"><div className="safwa-alert safwa-alert-error">{t("noPermission")}</div></div></main>
      </div>
    );
  }

  return (
    <>
      <Head><title>{pageTitle} | SAFWA</title><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#F8FAFC" /></Head>
      <div className={`safwa-app ${menuOpen ? "safwa-menu-open" : ""}`}>
        <button className="safwa-mobile-overlay" aria-label={t("close")} onClick={() => setMenuOpen(false)} />
        <aside className="safwa-sidebar">
          <Brand lang={lang} t={t} />
          <div className="safwa-workspace-label">{t("workspace")}</div>
          <div className="safwa-workspace"><span className="safwa-workspace-mark">S</span><span><strong>{t("workspaceName")}</strong><small>Safwa Store</small></span><i /></div>
          <div className="safwa-section-label">{t("mainMenu")}</div>
          <nav className="safwa-nav" aria-label={t("mainMenu")}>
            {navItems.map((item) => {
              const active = router.pathname === item.href;
              const badge = item.href === "/orders" && overview?.orderStatuses
                ? overview.orderStatuses.filter((status) => status._id === "pending").reduce((sum, status) => sum + status.count, 0)
                : item.href === "/products" ? overview?.lowStock : null;
              return (
                <Link key={item.href} href={item.href} className={`safwa-nav-link ${active ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <span className="safwa-nav-icon"><Icon name={item.icon} /></span><span className="safwa-nav-label">{t(item.key)}</span>
                  {badge > 0 && <span className={`safwa-nav-badge ${item.href === "/products" ? "warning" : ""}`}>{badge > 99 ? "99+" : badge}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="safwa-sidebar-footer">
            <div className={`safwa-db-badge ${system?.database === "connected" ? "connected" : system?.api === "offline" ? "offline" : "checking"}`}>
              <span className="safwa-db-dot" /><span className="safwa-db-text">{system?.database === "connected" ? t("connected") : system?.api === "offline" ? t("apiOffline") : t("connecting")}</span><span className="safwa-db-port">:7000</span>
            </div>
            <UserCard user={user} role={role} t={t} />
            <button className="safwa-nav-link safwa-logout" onClick={logout}><span className="safwa-nav-icon"><Icon name="logout" /></span><span className="safwa-nav-label">{t("logout")}</span></button>
          </div>
        </aside>
        <main className="safwa-content-area">
          <header className="safwa-topbar">
            <button className="safwa-mobile-menu" onClick={() => setMenuOpen(true)} aria-label={t("mainMenu")}><Icon name="menu" /></button>
            <div className="safwa-topbar-heading"><div className="safwa-breadcrumb"><span>{t("operationsCenter")}</span><span>/</span><strong>{pageTitle}</strong></div>{subtitle && <p>{subtitle}</p>}</div>
            <div className="safwa-topbar-actions">
              <div className="safwa-global-search">
                <Icon name="search" size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("searchPlaceholder")} />
                {search.trim().length >= 2 && <div className="safwa-search-results">
                  {searchError && <p className="safwa-search-empty">{searchError}</p>}
                  {!searchError && searchResults.length === 0 && <p className="safwa-search-empty">{t("searchNoResults")}</p>}
                  {searchResults.map((result) => <button key={`${result.type}-${result.id}`} onClick={() => chooseSearchResult(result)}><span className="safwa-search-result-icon"><Icon name={result.type === "product" ? "box" : "orders"} size={16} /></span><span><strong>{result.label}</strong><small>{result.detail}</small></span></button>)}
                </div>}
              </div>
              <button type="button" className="safwa-icon-button" onClick={toggleLang} title={t("switchLangTip")} aria-label={t("switchLangTip")}><Icon name="language" size={17} /><span>{t("langToggle")}</span></button>
              <button className="safwa-icon-button safwa-alert-button" onClick={() => router.push("/orders")} title={t("alerts")} aria-label={t("alerts")}><Icon name="bell" size={17} />{overview?.orderStatuses?.some((item) => item._id === "pending" && item.count > 0) && <i />}</button>
              <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="safwa-store-link"><Icon name="store" size={16} /><span>{t("liveStore")}</span><Icon name="external" size={13} /></a>
              <span className="safwa-server-time">{timeLabel}</span>
              <button className="safwa-refresh-button" onClick={refreshHealth} title={t("refresh")} aria-label={t("refresh")}>↻</button>
            </div>
          </header>
          <div className="safwa-main-body">{children}</div>
        </main>
      </div>
    </>
  );
}

function Brand({ lang, t }) {
  return <Link href="/" className="safwa-brand"><span className="safwa-logo-box">{lang === "ar" ? "ص" : "S"}</span><span className="safwa-brand-copy"><span className="safwa-brand-title">{t("brand")}<small>PRO</small></span><span className="safwa-brand-sub">{t("subBrand")}</span></span></Link>;
}

function UserCard({ user, role, t }) {
  return <div className="safwa-user-card"><span className="safwa-avatar">{user.name?.slice(0, 1) || "A"}</span><span><strong>{user.name}</strong><small>{t(ROLE_LABELS[role] || "roleAdmin")}</small></span></div>;
}

function Topbar({ title, subtitle, lang, t, toggleLang, timeLabel }) {
  return <header className="safwa-topbar"><div className="safwa-topbar-heading"><div className="safwa-breadcrumb"><span>{t("operationsCenter")}</span><span>/</span><strong>{title}</strong></div>{subtitle && <p>{subtitle}</p>}</div><div className="safwa-topbar-actions"><button type="button" className="safwa-icon-button" onClick={toggleLang}><Icon name="language" /><span>{t("langToggle")}</span></button><span className="safwa-server-time">{timeLabel}</span></div></header>;
}
