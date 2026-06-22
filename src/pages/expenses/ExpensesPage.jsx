import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from "../../services/expenseService";
import { formatCurrency, formatDisplayDate } from "../../utils/transactionHelpers";

const today = new Date().toISOString().slice(0, 10);

export function ExpensesPage() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Mengambil data pengeluaran dari Supabase..."
      : "Mode demo aktif. Pengeluaran tersimpan sementara di aplikasi.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    category: "Listrik",
    amount: "",
    expenseDate: today,
    description: "",
  });

  useEffect(() => {
    async function loadExpenses() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const data = await fetchExpenses();
        setRows(data);
        setStatusMessage("Pengeluaran berhasil dimuat dari Supabase.");
      } catch (error) {
        console.error(error);
        setStatusMessage(
          "Tabel expenses belum siap atau belum dibuat. Anda masih bisa mulai dari transaksi dulu.",
        );
      }
    }

    loadExpenses();
  }, []);

  const filteredRows = rows.filter((item) => item.isoDate === form.expenseDate);
  const totalToday = filteredRows.reduce((sum, item) => sum + item.amount, 0);
  const totalAll = rows.reduce((sum, item) => sum + item.amount, 0);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      category: "Listrik",
      amount: "",
      expenseDate: today,
      description: "",
    });
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setErrorMessage("");
    setForm({
      category: row.category,
      amount: String(row.amount),
      expenseDate: row.isoDate,
      description: row.description,
    });
    setStatusMessage(`Mengedit pengeluaran ${row.category}.`);
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Hapus pengeluaran ${row.category}?`);
    if (!confirmed) {
      return;
    }

    try {
      setBusyId(row.id);
      setErrorMessage("");

      if (isSupabaseConfigured) {
        await deleteExpense(row.id);
        setStatusMessage("Pengeluaran berhasil dihapus dari Supabase.");
      } else {
        setStatusMessage("Pengeluaran berhasil dihapus dari mode demo.");
      }

      setRows((current) => current.filter((item) => item.id !== row.id));

      if (editingId === row.id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? "Gagal menghapus pengeluaran.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount) || 0;
    if (amount <= 0) {
      setErrorMessage("Nominal pengeluaran harus lebih besar dari nol.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      let nextRow;

      if (editingId) {
        if (isSupabaseConfigured) {
          nextRow = await updateExpense({
            id: editingId,
            category: form.category,
            amount,
            expenseDate: form.expenseDate,
            description: form.description,
          });
          setStatusMessage("Pengeluaran berhasil diperbarui di Supabase.");
        } else {
          nextRow = {
            id: editingId,
            category: form.category,
            amount,
            amountLabel: formatCurrency(amount),
            isoDate: form.expenseDate,
            dateLabel: formatDisplayDate(form.expenseDate),
            description: form.description,
            createdAt: `${form.expenseDate}T00:00:00.000Z`,
          };
          setStatusMessage("Pengeluaran berhasil diperbarui di mode demo.");
        }
      } else if (isSupabaseConfigured) {
        nextRow = await createExpense({
          category: form.category,
          amount,
          expenseDate: form.expenseDate,
          description: form.description,
        });
        setStatusMessage("Pengeluaran berhasil disimpan ke Supabase.");
      } else {
        nextRow = {
          id: `local-${Date.now()}`,
          category: form.category,
          amount,
          amountLabel: formatCurrency(amount),
          isoDate: form.expenseDate,
          dateLabel: formatDisplayDate(form.expenseDate),
          description: form.description,
          createdAt: `${form.expenseDate}T00:00:00.000Z`,
        };
        setStatusMessage("Pengeluaran disimpan di mode demo.");
      }

      setRows((current) => {
        if (editingId) {
          return current.map((item) => (item.id === editingId ? nextRow : item));
        }

        return [nextRow, ...current];
      });

      resetForm();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? "Gagal menyimpan pengeluaran.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Pengeluaran usaha</p>
          <h2>Catat biaya agar laba bersih terbaca dengan benar</h2>
          <p className="muted-copy">{statusMessage}</p>
          {errorMessage ? <p className="error-copy">{errorMessage}</p> : null}
        </div>
      </div>

      <div className="summary-grid">
        <article className="summary-card summary-card-danger">
          <div className="summary-card-head">
            <p>Pengeluaran hari terpilih</p>
            <span className="summary-chip">{filteredRows.length} data</span>
          </div>
          <strong>{formatCurrency(totalToday)}</strong>
          <span className="summary-accent">{formatDisplayDate(form.expenseDate)}</span>
        </article>

        <article className="summary-card summary-card-neutral">
          <div className="summary-card-head">
            <p>Total semua pengeluaran</p>
            <span className="summary-chip">Akumulasi</span>
          </div>
          <strong>{formatCurrency(totalAll)}</strong>
          <span className="summary-accent">Akan mengurangi laba bersih usaha</span>
        </article>
      </div>

      <div className="page-header-card">
        <div>
          <p className="eyebrow">Form pengeluaran</p>
          <h2>{editingId ? "Edit pengeluaran usaha" : "Input pengeluaran usaha"}</h2>
        </div>

        <form className="transaction-form-grid" onSubmit={handleSubmit}>
          <label>
            Kategori
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Listrik</option>
              <option>Internet</option>
              <option>ATK</option>
              <option>Gaji</option>
              <option>Transport</option>
              <option>Lainnya</option>
            </select>
          </label>
          <label>
            Tanggal
            <input
              name="expenseDate"
              type="date"
              value={form.expenseDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Nominal
            <input
              name="amount"
              type="number"
              min="0"
              placeholder="0"
              value={form.amount}
              onChange={handleChange}
            />
          </label>
          <label className="wide-form-field">
            Keterangan
            <input
              name="description"
              type="text"
              placeholder="Contoh: bayar listrik outlet"
              value={form.description}
              onChange={handleChange}
            />
          </label>
          <button className="primary-button full-width-button" type="submit" disabled={isSaving}>
            {isSaving
              ? "Menyimpan..."
              : editingId
                ? "Simpan perubahan"
                : "Simpan pengeluaran"}
          </button>
          {editingId ? (
            <button
              className="ghost-button full-width-button"
              type="button"
              onClick={resetForm}
              disabled={isSaving}
            >
              Batal edit
            </button>
          ) : null}
        </form>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Riwayat pengeluaran</p>
            <h3>Daftar biaya usaha</h3>
          </div>
          <span className="table-caption">{formatDisplayDate(form.expenseDate)}</span>
        </div>

        <div className="table-scroll desktop-table-view">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.category}</td>
                    <td>{row.amountLabel}</td>
                    <td>{row.dateLabel}</td>
                    <td>{row.description || "-"}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="ghost-button compact-button"
                          type="button"
                          onClick={() => handleEdit(row)}
                          disabled={busyId === row.id}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-button compact-button"
                          type="button"
                          onClick={() => handleDelete(row)}
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
                  <td colSpan="5">Belum ada pengeluaran pada tanggal ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list">
          {filteredRows.length > 0 ? (
            filteredRows.map((row) => (
              <article key={row.id} className="mobile-data-card">
                <div className="mobile-data-card-head">
                  <strong>{row.category}</strong>
                  <span className="table-caption">{row.dateLabel}</span>
                </div>
                <div className="mobile-data-grid">
                  <div>
                    <span className="mobile-data-label">Nominal</span>
                    <strong>{row.amountLabel}</strong>
                  </div>
                  <div>
                    <span className="mobile-data-label">Keterangan</span>
                    <strong>{row.description || "-"}</strong>
                  </div>
                </div>
                <div className="row-actions mobile-row-actions">
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    onClick={() => handleEdit(row)}
                    disabled={busyId === row.id}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-button compact-button"
                    type="button"
                    onClick={() => handleDelete(row)}
                    disabled={busyId === row.id}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="mobile-data-card">
              <p className="muted-copy">Belum ada pengeluaran pada tanggal ini.</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
