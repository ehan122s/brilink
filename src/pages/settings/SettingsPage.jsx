export function SettingsPage() {
  return (
    <section className="page-stack">
      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Pengaturan usaha</p>
          <h2>Identitas outlet, akun saldo, dan kanal transaksi agen</h2>
          <p className="muted-copy">
            Halaman ini disusun seperti software pembukuan agen: outlet, saldo,
            akun bank, dan layanan usaha ditaruh dalam satu pusat pengaturan.
          </p>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <span>Role aktif</span>
            <strong>Owner</strong>
          </div>
          <div className="settings-item">
            <span>Outlet</span>
            <strong>BukuLink Konter Utama</strong>
          </div>
          <div className="settings-item">
            <span>Status sinkronisasi Supabase</span>
            <strong>Normal</strong>
          </div>
        </div>
      </div>

      <div className="report-breakdown-grid">
        <article className="finance-item">
          <div>
            <strong>Kanal transaksi utama</strong>
            <p>Atur jenis layanan yang dijual outlet agar input transaksi lebih cepat.</p>
          </div>
          <div className="finance-item-side">
            <strong>BRILink, Mini ATM, Konter PPOB</strong>
          </div>
        </article>

        <article className="finance-item">
          <div>
            <strong>Akun saldo default</strong>
            <p>Saldo awal per tanggal tetap dipisah, tetapi sumber rekening utamanya bisa ditandai di sini.</p>
          </div>
          <div className="finance-item-side">
            <strong>BRI 1234 / Bank Default</strong>
          </div>
        </article>

        <article className="finance-item">
          <div>
            <strong>Mode laporan</strong>
            <p>Laporan disiapkan untuk rekap total, harian, bulanan, dan tahunan.</p>
          </div>
          <div className="finance-item-side">
            <strong>4 mode aktif</strong>
          </div>
        </article>

        <article className="finance-item">
          <div>
            <strong>Cetak & ekspor</strong>
            <p>Alur berikutnya bisa diarahkan ke cetak rekap, struk, atau ekspor Excel/PDF.</p>
          </div>
          <div className="finance-item-side">
            <strong>Siap dikembangkan</strong>
          </div>
        </article>
      </div>
    </section>
  );
}
