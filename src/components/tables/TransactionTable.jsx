export function TransactionTable({
  rows,
  selectedDate,
  onEdit,
  onDelete,
  busyId,
}) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Riwayat transaksi</p>
          <h3>Daftar transaksi outlet</h3>
        </div>
        <span className="table-caption">{selectedDate}</span>
      </div>

      <div className="table-scroll desktop-table-view">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Kategori</th>
              <th>Nominal</th>
              <th>Admin pelanggan</th>
              <th>Admin bank</th>
              <th>Laba bersih</th>
              <th>Total</th>
              <th>Tanggal</th>
              <th>Kasir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.code}>
                  <td>{row.code}</td>
                  <td>{row.category}</td>
                  <td>{row.nominal}</td>
                  <td>{row.adminFee}</td>
                  <td>{row.bankAdminFee}</td>
                  <td>{row.netAdmin}</td>
                  <td>{row.total}</td>
                  <td>{row.date}</td>
                  <td>{row.cashier}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="ghost-button compact-button"
                        type="button"
                        onClick={() => onEdit(row)}
                        disabled={busyId === row.id}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button compact-button"
                        type="button"
                        onClick={() => onDelete(row)}
                        disabled={busyId === row.id}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">Belum ada transaksi pada tanggal ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-card-list">
        {rows.length > 0 ? (
          rows.map((row) => (
            <article key={row.code} className="mobile-data-card">
              <div className="mobile-data-card-head">
                <strong>{row.code}</strong>
                <span className="table-caption">{row.date}</span>
              </div>
              <div className="mobile-data-grid">
                <div>
                  <span className="mobile-data-label">Kategori</span>
                  <strong>{row.category}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Nominal</span>
                  <strong>{row.nominal}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Admin pelanggan</span>
                  <strong>{row.adminFee}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Admin bank</span>
                  <strong>{row.bankAdminFee}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Laba bersih</span>
                  <strong>{row.netAdmin}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Total</span>
                  <strong>{row.total}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Kasir</span>
                  <strong>{row.cashier}</strong>
                </div>
              </div>
              <div className="row-actions mobile-row-actions">
                <button
                  className="ghost-button compact-button"
                  type="button"
                  onClick={() => onEdit(row)}
                  disabled={busyId === row.id}
                >
                  Edit
                </button>
                <button
                  className="danger-button compact-button"
                  type="button"
                  onClick={() => onDelete(row)}
                  disabled={busyId === row.id}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="mobile-data-card">
            <p className="muted-copy">Belum ada transaksi pada tanggal ini.</p>
          </article>
        )}
      </div>
    </div>
  );
}
