import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import { fetchReportsData } from "../../services/reportService";
import { reportCards } from "../../data/mockData";

export function ReportsPage() {
  const [reportsData, setReportsData] = useState({
    cards: reportCards,
    insightTitle: "Performa bulan ini tumbuh 18.7% dibanding bulan lalu",
    stats: [
      { value: "Rp68,4 jt", label: "total transaksi" },
      { value: "Rp9,2 jt", label: "profit kotor" },
    ],
  });
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Menghitung laporan dari Supabase..."
      : "Mode demo aktif. Laporan masih memakai data contoh.",
  );

  useEffect(() => {
    async function loadReports() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const data = await fetchReportsData();
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
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Status laporan</p>
          <h2>Laporan dari Supabase</h2>
          <p className="muted-copy">{statusMessage}</p>
        </div>
      </div>

      <div className="page-header-card">
        <div>
          <p className="eyebrow">Laba rugi</p>
          <h2>Ringkasan uang kotor, fee, biaya, dan laba bersih usaha</h2>
        </div>
      </div>

      <div className="report-grid">
        {reportsData.cards.map((card) => (
          <article key={card.title} className="report-card">
            <p className="panel-kicker">{card.title}</p>
            <h3>{card.subtitle}</h3>
            <button className="ghost-button" type="button">
              {card.action}
            </button>
          </article>
        ))}
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Insight cepat</p>
          <h2>{reportsData.insightTitle}</h2>
          <p className="muted-copy">
            Halaman ini disiapkan sebagai versi aplikasi dan web dari pola
            pembukuan usaha: transaksi masuk, biaya dicatat, lalu hasil bersihnya
            langsung terlihat tanpa hitung manual.
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
    </section>
  );
}
