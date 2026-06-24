import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="login-shell">
      <section className="login-hero">
        <p className="brand-tag">BukuLink Konter</p>
        <h1>Pembukuan agen yang terasa siap pakai sejak login pertama.</h1>
        <p className="login-copy">
          Catat transaksi BRILink, mini ATM, dan usaha konter. Pantau saldo,
          biaya, dan laporan usaha dalam satu alur kerja yang cepat.
        </p>
        <div className="login-stats">
          <div>
            <strong>Harian</strong>
            <span>rekap transaksi per tanggal</span>
          </div>
          <div>
            <strong>Bulanan</strong>
            <span>laporan usaha siap dibaca owner</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Masuk ke sistem</p>
          <h2>Login BukuLink</h2>
          <form className="login-form">
            <label>
              Email
              <input type="email" placeholder="owner@bukulink.id" />
            </label>
            <label>
              Password
              <input type="password" placeholder="Masukkan password" />
            </label>
            <Link className="primary-button login-button" to="/dashboard">
              Masuk
            </Link>
          </form>
          <button className="text-button" type="button">
            Lupa password?
          </button>
        </div>
      </section>
    </div>
  );
}
