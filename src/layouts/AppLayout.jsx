import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { InstallPrompt } from "../components/app/InstallPrompt";

const desktopNavigationItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transaksi", path: "/transactions" },
  { label: "Kas & Saldo", path: "/cashflow" },
  { label: "Pengeluaran", path: "/expenses" },
  { label: "Laba Rugi", path: "/reports" },
  { label: "Setelan", path: "/settings" },
];

const mobileNavigationItems = [
  { label: "Home", path: "/dashboard" },
  { label: "Transaksi", path: "/transactions" },
  { label: "Kas", path: "/cashflow" },
  { label: "Biaya", path: "/expenses" },
  { label: "Laporan", path: "/reports" },
];

const pageMeta = {
  "/dashboard": {
    eyebrow: "Pembukuan Hari Ini",
    title: "Pantau cash, saldo, pemasukan, dan laba dari satu ringkasan inti.",
  },
  "/transactions": {
    eyebrow: "Transaksi",
    title: "Catat transaksi harian dan biarkan totalnya dihitung otomatis.",
  },
  "/cashflow": {
    eyebrow: "Kas & Saldo",
    title: "Pisahkan arus cash dan saldo agar pembukuan usaha lebih jelas.",
  },
  "/expenses": {
    eyebrow: "Pengeluaran",
    title: "Catat biaya usaha untuk menghitung laba bersih dengan benar.",
  },
  "/reports": {
    eyebrow: "Laba Rugi",
    title: "Baca ringkasan usaha dari uang kotor sampai uang bersih.",
  },
  "/settings": {
    eyebrow: "Setelan",
    title: "Atur outlet, sinkronisasi, dan pondasi aplikasi pembukuan.",
  },
};

export function AppLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? pageMeta["/dashboard"];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-tag">BRILink Flow</p>
          <h1>Pembukuan usaha BRILink dan konter yang rapi untuk owner dan kasir.</h1>
        </div>

        <nav className="side-nav">
          {desktopNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="sidebar-card-title">Fokus Hari Ini</p>
          <strong>Pembukuan Harian</strong>
          <span>Cash, saldo, biaya, dan laba selalu sinkron.</span>
        </div>
      </aside>

      <main className="content">
        <div className="mobile-app-bar">
          <div>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h2>{meta.title}</h2>
          </div>
          <Link className="mobile-primary-action" to="/transactions">
            + Transaksi
          </Link>
        </div>

        <InstallPrompt />

        <header className="topbar">
          <div>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h2>{meta.title}</h2>
          </div>

          <div className="topbar-actions">
            <button className="ghost-button" type="button">
              Export Rekap
            </button>
            <Link className="primary-button" to="/transactions">
              + Tambah Transaksi
            </Link>
          </div>
        </header>

        <div className="content-body">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-bottom-nav">
        {mobileNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`
            }
          >
            <span className="mobile-nav-dot" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
