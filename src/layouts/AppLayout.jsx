import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { InstallPrompt } from "../components/app/InstallPrompt";

const desktopNavigationItems = [
  { label: "Beranda", path: "/dashboard" },
  { label: "Transaksi", path: "/transactions" },
  { label: "Saldo Harian", path: "/cashflow" },
  { label: "Biaya", path: "/expenses" },
  { label: "Laporan", path: "/reports" },
  { label: "Pengaturan", path: "/settings" },
];

const mobileNavigationItems = [
  { label: "Home", path: "/dashboard" },
  { label: "Saldo", path: "/cashflow" },
  { label: "Transaksi", path: "/transactions", emphasis: true },
  { label: "Biaya", path: "/expenses" },
  { label: "Laporan", path: "/reports" },
];

const pageMeta = {
  "/dashboard": {
    eyebrow: "Beranda Operator",
    title: "Pantau transaksi, saldo, cash, dan laporan dari layar utama operator.",
    mobileTitle: "Beranda",
  },
  "/transactions": {
    eyebrow: "Transaksi",
    title: "Input layanan BRILink, mini ATM, dan konter dengan form kerja harian.",
    mobileTitle: "Input Transaksi",
  },
  "/cashflow": {
    eyebrow: "Saldo Harian",
    title: "Kelola cash awal, saldo awal, dan pergerakan dana per tanggal.",
    mobileTitle: "Saldo Harian",
  },
  "/expenses": {
    eyebrow: "Biaya Outlet",
    title: "Catat pengeluaran operasional agar pembukuan outlet tetap rapi.",
    mobileTitle: "Biaya Outlet",
  },
  "/reports": {
    eyebrow: "Laporan",
    title: "Lihat rekap keseluruhan, laporan harian, bulanan, dan tahunan outlet.",
    mobileTitle: "Laporan",
  },
  "/settings": {
    eyebrow: "Pengaturan",
    title: "Atur identitas outlet, akun saldo, dan layanan utama agen.",
    mobileTitle: "Pengaturan",
  },
};

export function AppLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? pageMeta["/dashboard"];
  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="brand-tag">BukuLink Konter</p>
          <h1>Aplikasi operasional harian untuk agen BRILink, mini ATM, dan usaha konter.</h1>
          <p className="sidebar-copy">
            Model tampilannya diarahkan seperti aplikasi operator: fokus ke transaksi, saldo, dan rekap harian.
          </p>
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
          <p className="sidebar-card-title">Shift Aktif</p>
          <strong>Outlet Utama</strong>
          <span>Fokus transaksi, set saldo harian, dan tutup buku harian sebelum ganti tanggal.</span>
        </div>
      </aside>

      <main className="content">
        <div className="mobile-shell-header">
          <div className="mobile-shell-brand">
            <span className="mobile-shell-logo">BK</span>
            <div>
              <strong>BukuLink Konter</strong>
              <span>Outlet aktif</span>
            </div>
          </div>
          <div className="mobile-shell-meta">
            <span>{todayLabel}</span>
            <span>BRILink Mobile</span>
          </div>
        </div>

        <div className="mobile-app-bar">
          <div className="mobile-app-bar-copy">
            <span className="mobile-app-badge">BukuLink Konter</span>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h2>{meta.mobileTitle ?? meta.title}</h2>
          </div>
          <div className="mobile-app-bar-side">
            <span className="mobile-app-date">{todayLabel}</span>
            <span className="mobile-app-status">Outlet aktif</span>
          </div>
          <Link className="mobile-primary-action" to="/transactions">
            Input
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
              Rekap Hari Ini
            </button>
            <Link className="primary-button" to="/transactions">
              + Input Transaksi
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
              `mobile-nav-link ${item.emphasis ? "mobile-nav-link-emphasis" : ""} ${
                isActive ? "mobile-nav-link-active" : ""
              }`
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
