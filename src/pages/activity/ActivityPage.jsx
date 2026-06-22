import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import { fetchActivityData } from "../../services/activityService";
import { LatestTransactionsTable } from "../../components/tables/LatestTransactionsTable";
import { activityFeed, alerts, latestTransactions } from "../../data/mockData";

export function ActivityPage() {
  const [activityData, setActivityData] = useState({
    activityFeed,
    alerts,
    latestTransactions,
  });
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Mengambil aktivitas terbaru dari Supabase..."
      : "Mode demo aktif. Aktivitas masih memakai data contoh.",
  );

  useEffect(() => {
    async function loadActivity() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const data = await fetchActivityData();
        setActivityData(data);
        setStatusMessage("Aktivitas live berhasil dimuat dari Supabase.");
      } catch (error) {
        console.error(error);
        setStatusMessage("Gagal memuat aktivitas dari Supabase. Data contoh ditampilkan sementara.");
      }
    }

    loadActivity();
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Status aktivitas</p>
          <h2>Aktivitas outlet dari data Supabase</h2>
          <p className="muted-copy">{statusMessage}</p>
        </div>
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Aktivitas outlet</p>
          <h2>Notifikasi dan jejak kerja dipisah supaya lebih mudah dipantau.</h2>
          <p className="muted-copy">
            Anda bisa lihat sinyal penting, aktivitas live, dan transaksi terbaru
            tanpa menumpuk semuanya di dashboard utama.
          </p>
        </div>

        <div className="stat-pile">
          <div>
            <strong>{activityData.alerts.length}</strong>
            <span>alert aktif</span>
          </div>
          <div>
            <strong>{activityData.latestTransactions.length}</strong>
            <span>transaksi terbaru</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Aktivitas live</p>
              <h3>Jejak operasional terbaru</h3>
            </div>
          </div>

          <div className="activity-list">
            {activityData.activityFeed.map((item) => (
              <article key={`${item.time}-${item.title}`} className="activity-item">
                <span className="activity-time">{item.time}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel side-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Notifikasi</p>
              <h3>Butuh perhatian</h3>
            </div>
          </div>

          <div className="alert-list">
            {activityData.alerts.map((alert) => (
              <article key={alert.title} className="alert-card">
                <strong>{alert.title}</strong>
                <p>{alert.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <LatestTransactionsTable rows={activityData.latestTransactions} />
    </section>
  );
}
