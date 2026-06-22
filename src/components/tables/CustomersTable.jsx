export function CustomersTable({ rows }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Pelanggan</p>
          <h3>Daftar pelanggan aktif</h3>
        </div>
        <button className="primary-button" type="button">
          + Pelanggan Baru
        </button>
      </div>

      <div className="table-scroll desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>No. HP</th>
              <th>Catatan</th>
              <th>Total transaksi</th>
              <th>Transaksi terakhir</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id ?? row.phone}>
                  <td>{row.name}</td>
                  <td>{row.phone}</td>
                  <td>{row.notes}</td>
                  <td>{row.totalTransactions}</td>
                  <td>{row.lastTransaction}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Belum ada data pelanggan di Supabase.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-card-list">
        {rows.length > 0 ? (
          rows.map((row) => (
            <article key={row.id ?? row.phone} className="mobile-data-card">
              <div className="mobile-data-card-head">
                <strong>{row.name}</strong>
                <span className="table-caption">{row.phone}</span>
              </div>
              <div className="mobile-data-grid">
                <div>
                  <span className="mobile-data-label">Catatan</span>
                  <strong>{row.notes}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Total transaksi</span>
                  <strong>{row.totalTransactions}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Transaksi terakhir</span>
                  <strong>{row.lastTransaction}</strong>
                </div>
              </div>
            </article>
          ))
        ) : (
          <article className="mobile-data-card">
            <p className="muted-copy">Belum ada data pelanggan di Supabase.</p>
          </article>
        )}
      </div>
    </div>
  );
}
