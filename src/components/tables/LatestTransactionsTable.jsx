export function LatestTransactionsTable({ rows }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Transaksi terbaru</p>
          <h3>Aktivitas kasir hari ini</h3>
        </div>
      </div>

      <div className="table-scroll desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pelanggan</th>
              <th>Kategori</th>
              <th>Nominal</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Jam</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.customer}</td>
                  <td>{row.category}</td>
                  <td>{row.amount}</td>
                  <td>{row.fee}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        row.status === "Pending"
                          ? "status-pill-warn"
                          : "status-pill-success"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Belum ada transaksi terbaru di Supabase.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-card-list">
        {rows.length > 0 ? (
          rows.map((row) => (
            <article key={row.id} className="mobile-data-card">
              <div className="mobile-data-card-head">
                <strong>{row.id}</strong>
                <span
                  className={`status-pill ${
                    row.status === "Pending"
                      ? "status-pill-warn"
                      : "status-pill-success"
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <div className="mobile-data-grid">
                <div>
                  <span className="mobile-data-label">Kategori</span>
                  <strong>{row.category}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Nominal</span>
                  <strong>{row.amount}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Fee</span>
                  <strong>{row.fee}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Jam</span>
                  <strong>{row.time}</strong>
                </div>
              </div>
            </article>
          ))
        ) : (
          <article className="mobile-data-card">
            <p className="muted-copy">Belum ada transaksi terbaru di Supabase.</p>
          </article>
        )}
      </div>
    </div>
  );
}
