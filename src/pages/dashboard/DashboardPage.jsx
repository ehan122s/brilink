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
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Status dashboard</p>
          <h2>Ringkasan live dari Supabase</h2>
          <p className="muted-copy">{statusMessage}</p>
        </div>
      </div>

      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">{dashboardData.hero.eyebrow}</p>
          <h2>{dashboardData.hero.title}</h2>
          <p className="muted-copy">{dashboardData.hero.copy}</p>

          <div className="hero-actions">
            <Link className="primary-button" to="/transactions">
              Input transaksi
            </Link>
            <Link className="ghost-button" to="/expenses">
              Input pengeluaran
            </Link>
          </div>
        </div>

        <div className="hero-highlight-grid">
          {dashboardData.operationalHighlights.map((item) => (
            <article key={item.label} className="hero-highlight-card">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="summary-grid">
        {dashboardData.summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="dashboard-grid">
        <RevenueChart data={dashboardData.transactionTrend} />

        <div className="panel side-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Navigasi cepat</p>
              <h3>Buka area kerja yang lebih spesifik</h3>
            </div>
          </div>

          <div className="quick-link-grid">
            <Link className="quick-link-card" to="/transactions">
              <strong>Transaksi</strong>
              <span>Input transaksi baru dan cek riwayat harian.</span>
            </Link>
            <Link className="quick-link-card" to="/cashflow">
              <strong>Kas & Saldo</strong>
              <span>Lihat cash tersedia, saldo tersedia, dan mutasi uang.</span>
            </Link>
            <Link className="quick-link-card" to="/expenses">
              <strong>Pengeluaran</strong>
              <span>Catat semua biaya usaha agar laba bersih akurat.</span>
            </Link>
            <Link className="quick-link-card" to="/reports">
              <strong>Laba Rugi</strong>
              <span>Lihat uang kotor, uang bersih, dan ringkasan usaha.</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
