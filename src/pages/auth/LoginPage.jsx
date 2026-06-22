import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="login-shell">
      <section className="login-hero">
        <p className="brand-tag">BRILink Flow</p>
        <h1>Digitalisasi pencatatan transaksi dengan ritme kerja yang rapi.</h1>
        <p className="login-copy">
          Pantau pemasukan, pengeluaran, saldo operasional, dan aktivitas kasir
          dalam satu dashboard yang ringan dan jelas.
        </p>
        <div className="login-stats">
          <div>
            <strong>480+</strong>
            <span>transaksi mingguan</span>
          </div>
          <div>
            <strong>3 outlet</strong>
            <span>siap dipantau owner</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Masuk ke sistem</p>
          <h2>Login BRILink</h2>
          <form className="login-form">
            <label>
              Email
              <input type="email" placeholder="owner@brilink.id" />
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
