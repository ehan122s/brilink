import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  buildReportsData,
  fetchReportsData,
} from "../../services/reportService";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);
const currentYear = today.slice(0, 4);

const REPORT_MODES = [
  { key: "overview", label: "Rekap" },
  { key: "daily", label: "Harian" },
  { key: "monthly", label: "Bulanan" },
  { key: "yearly", label: "Tahunan" },
];

export function ReportsPage() {
  const [reportMode, setReportMode] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportsData, setReportsData] = useState(() =>
    buildReportsData({
      mode: "overview",
      selectedDate: today,
      selectedMonth: currentMonth,
      selectedYear: currentYear,
      hasTransactionsTable: false,
      hasExpensesTable: false,
    }),
  );
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Menghitung laporan dari Supabase..."
      : "Mode demo aktif. Laporan dihitung dari data contoh lokal.",
  );

  useEffect(() => {
    async function loadReports() {
      if (!isSupabaseConfigured) {
        setReportsData(
          buildReportsData({
            mode: reportMode,
            selectedDate,
            selectedMonth,
            selectedYear,
            hasTransactionsTable: false,
            hasExpensesTable: false,
          }),
        );
        return;
      }

      try {
        const data = await fetchReportsData({
          mode: reportMode,
          selectedDate,
          selectedMonth,
          selectedYear,
        });
        setReportsData(data);
        setStatusMessage(
          !data.hasTransactionsTable
            ? "Tabel transactions belum siap di Supabase. Data contoh ditampilkan."
            : data.hasExpensesTable
              ? "Laporan live dari transaksi dan expenses Supabase."
              : "Laporan live dari transaksi Supabase. Tabel expenses belum tersedia.",
        );
      } catch (error) {
        console.error(error);
        setStatusMessage("Gagal memuat laporan dari Supabase. Data contoh ditampilkan sementara.");
      }
    }

    loadReports();
  }, [reportMode, selectedDate, selectedMonth, selectedYear]);

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Status laporan</p>
          <h2>Laporan dari Supabase</h2>
          <p className="muted-copy">{statusMessage}</p>
        </div>
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Laporan agen</p>
          <h2>Rekap, harian, bulanan, dan tahunan dalam satu area laporan</h2>
          <p className="muted-copy">{reportsData.periodCaption}</p>
        </div>
        <div className="reports-toolbar">
          <div className="report-mode-switcher">
            {REPORT_MODES.map((mode) => (
              <button
                key={mode.key}
                className={`report-mode-button ${
                  reportMode === mode.key ? "report-mode-button-active" : ""
                }`}
                type="button"
                onClick={() => setReportMode(mode.key)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {reportMode === "daily" ? (
            <label className="report-filter-label">
              Tanggal
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          ) : null}

          {reportMode === "monthly" ? (
            <label className="report-filter-label">
              Bulan
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </label>
          ) : null}

          {reportMode === "yearly" ? (
            <label className="report-filter-label">
              Tahun
              <input
                type="number"
                min="2020"
                max="2100"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              />
            </label>
          ) : null}
        </div>
      </div>

      <div className="page-header-card report-period-card">
        <div>
          <p className="eyebrow">Periode aktif</p>
          <h2>{reportsData.periodLabel}</h2>
          <p className="muted-copy">
            Mode <strong>{REPORT_MODES.find((item) => item.key === reportMode)?.label}</strong>
            {" "}menampilkan angka sesuai periode yang sedang Anda pilih.
          </p>
        </div>
        <div className="stat-pile">
          {reportsData.stats.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-grid">
        {reportsData.cards.map((card) => (
          <article key={card.title} className="report-card">
            <p className="panel-kicker">{card.title}</p>
            <h3>{card.action}</h3>
            <p>{card.subtitle}</p>
          </article>
        ))}
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Insight cepat</p>
          <h2>{reportsData.insightTitle}</h2>
          <p className="muted-copy">
            Pola pembukuan sekarang bisa dibaca dari tiga sudut: total semua data,
            satu hari tertentu, satu bulan tertentu, atau satu tahun tertentu.
          </p>
        </div>
      </div>

      <div className="report-breakdown-grid">
        {reportsData.breakdown.map((item) => (
          <article key={item.label} className="finance-item">
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            <div className="finance-item-side">
              <strong>{item.value}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
