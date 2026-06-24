import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  buildDashboardData,
  fetchDashboardData,
} from "../../services/dashboardService";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { SummaryCard } from "../../components/dashboard/SummaryCard";

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(() =>
    buildDashboardData({
      hasTransactionsTable: false,
      hasExpensesTable: false,
      hasBalanceSettingsTable: false,
    }),
  );
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Mengambil ringkasan dashboard dari Supabase..."
      : "Mode demo aktif. Dashboard masih memakai data contoh.",
  );

  useEffect(() => {
    async function loadDashboard() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        setStatusMessage(
          !data.status.hasTransactionsTable
            ? "Tabel transactions belum siap di Supabase. Data contoh ditampilkan."
            : data.status.hasExpensesTable && data.status.hasBalanceSettingsTable
              ? "Dashboard live dari Supabase."
              : data.status.hasExpensesTable
                ? "Dashboard live dari Supabase. Tabel balance_settings belum tersedia jadi saldo dan cash masih default."
                : data.status.hasBalanceSettingsTable
                  ? "Dashboard live dari transaksi Supabase. Tabel expenses belum tersedia jadi pengeluaran masih 0."
                  : "Dashboard live dari transaksi Supabase. Tabel expenses dan balance_settings belum tersedia jadi beberapa ringkasan masih default."
        );
      } catch (error) {
        console.error(error);
        setStatusMessage("Gagal memuat dashboard Supabase. Data contoh ditampilkan sementara.");
      }
    }

    loadDashboard();
  }, []);

  return (
    <section className="page-stack">
      <div className="operator-home-hero">
        <div className="operator-home-copy">
          <p className="eyebrow">{dashboardData.hero.eyebrow}</p>
          <h2>{dashboardData.hero.title}</h2>
          <p className="muted-copy">{dashboardData.hero.copy}</p>
          <p className="operator-home-status">{statusMessage}</p>

          <div className="hero-actions">
            <Link className="primary-button" to="/transactions">
              Input transaksi
            </Link>
            <Link className="ghost-button" to="/cashflow">
              Atur saldo hari ini
            </Link>
          </div>
        </div>

        <div className="operator-balance-strip">
          {dashboardData.operatorSnapshot.map((item) => (
            <article key={item.label} className="operator-balance-card">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="service-shortcut-grid">
        {dashboardData.serviceTiles.map((item) => (
          <Link
            key={item.key}
            className={`service-shortcut-card service-shortcut-card-${item.tone}`}
            to={item.key === "pengeluaran" ? "/expenses" : "/transactions"}
          >
            <div className="service-shortcut-head">
              <strong>{item.label}</strong>
              <span>{item.count} trx</span>
            </div>
            <h3>{item.total}</h3>
            <p>{item.detail}</p>
          </Link>
        ))}
      </div>

      <div className="summary-grid dashboard-summary-grid">
        {dashboardData.summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="operator-workspace-grid dashboard-workspace-grid">
        <div className="panel dashboard-menu-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Menu utama</p>
              <h3>Area kerja operator</h3>
            </div>
          </div>

          <div className="quick-link-grid">
            <Link className="quick-link-card" to="/transactions">
              <strong>Input transaksi</strong>
              <span>Masuk ke form transfer, tarik tunai, setor tunai, top up, dan PPOB.</span>
            </Link>
            <Link className="quick-link-card" to="/cashflow">
              <strong>Saldo & cash</strong>
              <span>Set saldo awal dan cash awal per hari tanpa mengambil hari kemarin.</span>
            </Link>
            <Link className="quick-link-card" to="/reports">
              <strong>Rekap laporan</strong>
              <span>Buka rekap keseluruhan, harian, bulanan, sampai tahunan.</span>
            </Link>
            <Link className="quick-link-card" to="/settings">
              <strong>Pengaturan outlet</strong>
              <span>Atur identitas usaha, kanal layanan, dan kebutuhan operasional.</span>
            </Link>
          </div>
        </div>

        <div className="panel side-panel dashboard-feed-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Transaksi terbaru</p>
              <h3>Gerak outlet hari ini</h3>
            </div>
          </div>

          <div className="operator-feed-list">
            {dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.map((row) => (
                <article key={row.code} className="operator-feed-item">
                  <div>
                    <strong>{row.category}</strong>
                    <p>{row.code} - {row.cashier}</p>
                  </div>
                  <div className="operator-feed-side">
                    <strong>{row.total}</strong>
                    <span>{row.time}</span>
                  </div>
                </article>
              ))
            ) : (
              <article className="operator-feed-item">
                <div>
                  <strong>Belum ada transaksi</strong>
                  <p>Mulai input transaksi agar home ini menampilkan aktivitas outlet.</p>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-analytics-grid">
        <RevenueChart data={dashboardData.transactionTrend} />

        <div className="panel side-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Sorotan hari ini</p>
              <h3>Posisi outlet</h3>
            </div>
          </div>

          <div className="highlight-stack">
            {dashboardData.operationalHighlights.map((item) => (
              <article key={item.label} className="hero-highlight-card">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
