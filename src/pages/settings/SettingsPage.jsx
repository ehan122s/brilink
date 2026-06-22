export function SettingsPage() {
  return (
    <section className="page-stack">
      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Setelan usaha</p>
          <h2>Konfigurasi outlet dan pondasi pembukuan usaha</h2>
          <p className="muted-copy">
            Halaman ini disiapkan sebagai pondasi untuk identitas outlet,
            sinkronisasi data, dan pengembangan fitur pembukuan berikutnya.
          </p>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <span>Role aktif</span>
            <strong>Owner</strong>
          </div>
          <div className="settings-item">
            <span>Outlet</span>
            <strong>BRILink Sukamaju</strong>
          </div>
          <div className="settings-item">
            <span>Status sinkronisasi Supabase</span>
            <strong>Normal</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
