import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  calculateAvailableBalances,
  fetchBalanceSettings,
  saveBalanceSettings,
} from "../../services/balanceService";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from "../../services/transactionService";
import { TransactionTable } from "../../components/tables/TransactionTable";
import { transactionRows } from "../../data/mockData";
import {
  formatCurrency,
  formatDisplayDate,
  getNextTransactionCode,
  normalizeTransactionRows,
} from "../../utils/transactionHelpers";

const today = new Date().toISOString().slice(0, 10);

export function TransactionsPage() {
  const [rows, setRows] = useState(() => normalizeTransactionRows(transactionRows));
  const [editingId, setEditingId] = useState(null);
  const [demoBalanceSettingsByDate, setDemoBalanceSettingsByDate] = useState({});
  const [form, setForm] = useState({
    category: "Transfer",
    transactionDate: today,
    nominal: "",
    adminFee: "",
    bankAdminFee: "",
    cashier: "Kasir 1",
  });
  const [balanceSettings, setBalanceSettings] = useState({
    openingSaldo: 0,
    openingCash: 0,
  });
  const [balanceForm, setBalanceForm] = useState({
    openingSaldo: "",
    openingCash: "",
  });
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Menghubungkan transaksi ke Supabase..."
      : "Mode demo aktif. Isi file `.env` agar data transaksi tersimpan ke Supabase.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBalance, setIsSavingBalance] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const nominalValue = Number(form.nominal) || 0;
  const adminFeeValue = Number(form.adminFee) || 0;
  const bankAdminFeeValue = Number(form.bankAdminFee) || 0;
  const totalValue = nominalValue + adminFeeValue;
  const netAdminValue = adminFeeValue - bankAdminFeeValue;

  const filteredRows = rows.filter((row) => row.isoDate === form.transactionDate);
  const totalTransactions = filteredRows.length;
  const totalNominal = filteredRows.reduce((sum, row) => sum + row.nominalValue, 0);
  const totalAdmin = filteredRows.reduce((sum, row) => sum + row.adminFeeValue, 0);
  const totalBankAdmin = filteredRows.reduce((sum, row) => sum + row.bankAdminFeeValue, 0);
  const totalNetAdmin = filteredRows.reduce((sum, row) => sum + row.netAdminValue, 0);
  const grandTotal = filteredRows.reduce((sum, row) => sum + row.totalValue, 0);
  const allTransactionsTotal = rows.reduce((sum, row) => sum + row.totalValue, 0);
  const availableBalances = calculateAvailableBalances(filteredRows, balanceSettings);

  useEffect(() => {
    async function loadTransactions() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const transactionsResult = await fetchTransactions();

        setRows(transactionsResult);
        setStatusMessage("Transaksi berhasil dimuat dari Supabase.");
      } catch (error) {
        console.error(error);
        setRows(normalizeTransactionRows(transactionRows));
        setBalanceSettings({
          openingSaldo: 0,
          openingCash: 0,
        });
        setStatusMessage("Supabase belum siap dibaca. Data demo ditampilkan sementara.");
        setErrorMessage(error.message ?? "Gagal memuat transaksi dari Supabase.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, []);

  useEffect(() => {
    async function loadBalanceSettingsByDate() {
      if (!isSupabaseConfigured) {
        const nextSettings = demoBalanceSettingsByDate[form.transactionDate] ?? {
          balanceDate: form.transactionDate,
          openingSaldo: 0,
          openingCash: 0,
        };

        setBalanceSettings(nextSettings);
        setBalanceForm({
          openingSaldo: String(nextSettings.openingSaldo || ""),
          openingCash: String(nextSettings.openingCash || ""),
        });
        return;
      }

      try {
        setErrorMessage("");
        const nextSettings = await fetchBalanceSettings(form.transactionDate);
        setBalanceSettings(nextSettings);
        setBalanceForm({
          openingSaldo: String(nextSettings.openingSaldo || ""),
          openingCash: String(nextSettings.openingCash || ""),
        });
      } catch (error) {
        console.error(error);
        setBalanceSettings({
          balanceDate: form.transactionDate,
          openingSaldo: 0,
          openingCash: 0,
        });
        setBalanceForm({
          openingSaldo: "",
          openingCash: "",
        });
        setErrorMessage(error.message ?? "Gagal memuat saldo awal untuk tanggal ini.");
      }
    }

    loadBalanceSettingsByDate();
  }, [demoBalanceSettingsByDate, form.transactionDate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleBalanceChange(event) {
    const { name, value } = event.target;
    setBalanceForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      category: "Transfer",
      transactionDate: today,
      nominal: "",
      adminFee: "",
      bankAdminFee: "",
      cashier: "Kasir 1",
    });
  }

  async function handleBalanceSubmit(event) {
    event.preventDefault();

    const openingSaldo = Number(balanceForm.openingSaldo) || 0;
    const openingCash = Number(balanceForm.openingCash) || 0;

    try {
      setIsSavingBalance(true);
      setErrorMessage("");

      if (isSupabaseConfigured) {
        const nextSettings = await saveBalanceSettings({
          balanceDate: form.transactionDate,
          openingSaldo,
          openingCash,
        });
        setBalanceSettings(nextSettings);
        setBalanceForm({
          openingSaldo: String(nextSettings.openingSaldo || ""),
          openingCash: String(nextSettings.openingCash || ""),
        });
        setStatusMessage("Saldo awal dan uang cash awal tanggal ini berhasil disimpan ke Supabase.");
      } else {
        const nextSettings = {
          balanceDate: form.transactionDate,
          openingSaldo,
          openingCash,
        };

        setDemoBalanceSettingsByDate((current) => ({
          ...current,
          [form.transactionDate]: nextSettings,
        }));
        setBalanceSettings(nextSettings);
        setStatusMessage("Saldo awal dan uang cash awal tanggal ini diperbarui di mode demo.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? "Gagal menyimpan saldo dan uang cash.");
    } finally {
      setIsSavingBalance(false);
    }
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setErrorMessage("");
    setForm({
      category: row.category,
      transactionDate: row.isoDate,
      nominal: String(row.nominalValue),
      adminFee: String(row.adminFeeValue),
      bankAdminFee: String(row.bankAdminFeeValue),
      cashier: row.cashier,
    });
    setStatusMessage(`Mengedit transaksi ${row.code}.`);
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Hapus transaksi ${row.code}?`);
    if (!confirmed) {
      return;
    }

    try {
      setBusyId(row.id);
      setErrorMessage("");

      if (isSupabaseConfigured && row.id) {
        await deleteTransaction(row.id);
        setStatusMessage(`Transaksi ${row.code} berhasil dihapus dari Supabase.`);
      } else {
        setStatusMessage(`Transaksi ${row.code} berhasil dihapus dari mode demo.`);
      }

      setRows((current) => current.filter((item) => item.id !== row.id));

      if (editingId === row.id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? "Gagal menghapus transaksi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (nominalValue <= 0) {
      setErrorMessage("Nominal transaksi harus lebih besar dari nol.");
      return;
    }

    const transactionCode = getNextTransactionCode(rows);

    try {
      setIsSaving(true);
      setErrorMessage("");

      let nextRow;

      if (editingId) {
        if (isSupabaseConfigured) {
          nextRow = await updateTransaction({
            id: editingId,
            category: form.category,
            transactionDate: form.transactionDate,
            nominal: nominalValue,
            adminFee: adminFeeValue,
            bankAdminFee: bankAdminFeeValue,
            cashier: form.cashier,
          });
          setStatusMessage("Transaksi berhasil diperbarui di Supabase.");
        } else {
          nextRow = normalizeTransactionRows([
            {
              id: editingId,
              code: rows.find((item) => item.id === editingId)?.code ?? transactionCode,
              category: form.category,
              nominal: nominalValue,
              admin_fee: adminFeeValue,
              bank_admin_fee: bankAdminFeeValue,
              total_amount: totalValue,
              transaction_date: form.transactionDate,
              cashier: form.cashier,
            },
          ])[0];
          setStatusMessage("Transaksi berhasil diperbarui di mode demo.");
        }
      } else {
        if (isSupabaseConfigured) {
          nextRow = await createTransaction({
            transactionCode,
            category: form.category,
            transactionDate: form.transactionDate,
            nominal: nominalValue,
            adminFee: adminFeeValue,
            bankAdminFee: bankAdminFeeValue,
            cashier: form.cashier,
          });
          setStatusMessage("Transaksi berhasil disimpan ke Supabase.");
        } else {
          nextRow = normalizeTransactionRows([
            {
              code: transactionCode,
              category: form.category,
              nominal: nominalValue,
              admin_fee: adminFeeValue,
              bank_admin_fee: bankAdminFeeValue,
              total_amount: totalValue,
              transaction_date: form.transactionDate,
              cashier: form.cashier,
            },
          ])[0];
          setStatusMessage("Transaksi disimpan di mode demo lokal.");
        }
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
      setErrorMessage(error.message ?? "Gagal menyimpan transaksi ke Supabase.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Koneksi backend</p>
          <h2>Supabase untuk penyimpanan transaksi</h2>
          <p className="muted-copy">{statusMessage}</p>
          {errorMessage ? <p className="error-copy">{errorMessage}</p> : null}
        </div>
      </div>

      <div className="transaction-summary-grid">
        <article className="summary-card summary-card-primary">
          <div className="summary-card-head">
            <p>Total transaksi tanggal ini</p>
            <span className="summary-chip">{totalTransactions} trx</span>
          </div>
          <strong>{formatCurrency(grandTotal)}</strong>
          <span className="summary-accent">{formatDisplayDate(form.transactionDate)}</span>
        </article>

        <article className="summary-card summary-card-success">
          <div className="summary-card-head">
            <p>Total nominal</p>
            <span className="summary-chip">Nominal</span>
          </div>
          <strong>{formatCurrency(totalNominal)}</strong>
          <span className="summary-accent">Akumulasi nominal pada tanggal terpilih</span>
        </article>

        <article className="summary-card summary-card-neutral">
          <div className="summary-card-head">
            <p>Admin pelanggan</p>
            <span className="summary-chip">Masuk</span>
          </div>
          <strong>{formatCurrency(totalAdmin)}</strong>
          <span className="summary-accent">Biaya admin yang dibayar pelanggan</span>
        </article>

        <article className="summary-card summary-card-danger">
          <div className="summary-card-head">
            <p>Admin bank</p>
            <span className="summary-chip">Biaya</span>
          </div>
          <strong>{formatCurrency(totalBankAdmin)}</strong>
          <span className="summary-accent">Biaya yang dipotong bank per transaksi</span>
        </article>

        <article className="summary-card summary-card-success">
          <div className="summary-card-head">
            <p>Laba bersih transaksi</p>
            <span className="summary-chip">Admin bersih</span>
          </div>
          <strong>{formatCurrency(totalNetAdmin)}</strong>
          <span className="summary-accent">Admin pelanggan dikurangi admin bank</span>
        </article>

        <article className="summary-card summary-card-danger">
          <div className="summary-card-head">
            <p>Total semua transaksi</p>
            <span className="summary-chip">Semua data</span>
          </div>
          <strong>{formatCurrency(allTransactionsTotal)}</strong>
          <span className="summary-accent">Akumulasi seluruh uang masuk dari pelanggan</span>
        </article>

        <article className="summary-card summary-card-primary">
          <div className="summary-card-head">
            <p>Saldo tersedia</p>
            <span className="summary-chip">Live</span>
          </div>
          <strong>{formatCurrency(availableBalances.saldoAvailable)}</strong>
          <span className="summary-accent">
            Saldo awal {formatCurrency(availableBalances.openingSaldo)}
          </span>
        </article>

        <article className="summary-card summary-card-success">
          <div className="summary-card-head">
            <p>Cash tersedia</p>
            <span className="summary-chip">Kas outlet</span>
          </div>
          <strong>{formatCurrency(availableBalances.cashAvailable)}</strong>
          <span className="summary-accent">
            Cash awal {formatCurrency(availableBalances.openingCash)}
          </span>
        </article>
      </div>

      <div className="page-header-card">
        <div>
          <p className="eyebrow">Manajemen transaksi</p>
          <h2>
            {editingId
              ? "Edit transaksi dengan total yang dihitung otomatis"
              : "Input transaksi dengan total yang dihitung otomatis"}
          </h2>
        </div>

        <form className="transaction-form-grid" onSubmit={handleSubmit}>
          <label>
            Jenis transaksi
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Transfer</option>
              <option>Tarik tunai</option>
              <option>Setor tunai</option>
              <option>Top up e-wallet</option>
              <option>Pembayaran tagihan</option>
              <option>Token listrik</option>
              <option>Pulsa</option>
            </select>
          </label>
          <label>
            Tanggal
            <input
              name="transactionDate"
              type="date"
              value={form.transactionDate}
              onChange={handleChange}
            />
          </label>
          <label>
            Nominal
            <input
              name="nominal"
              type="number"
              min="0"
              placeholder="0"
              value={form.nominal}
              onChange={handleChange}
            />
          </label>
          <label>
            Admin pelanggan
            <input
              name="adminFee"
              type="number"
              min="0"
              placeholder="0"
              value={form.adminFee}
              onChange={handleChange}
            />
          </label>
          <label>
            Admin bank
            <input
              name="bankAdminFee"
              type="number"
              min="0"
              placeholder="0"
              value={form.bankAdminFee}
              onChange={handleChange}
            />
          </label>
          <label>
            Kasir
            <select name="cashier" value={form.cashier} onChange={handleChange}>
              <option>Kasir 1</option>
              <option>Kasir 2</option>
            </select>
          </label>
          <label>
            Total dibayar pelanggan
            <input type="text" value={formatCurrency(totalValue)} readOnly />
          </label>
          <label>
            Laba bersih transaksi
            <input type="text" value={formatCurrency(netAdminValue)} readOnly />
          </label>
          <button className="primary-button full-width-button" type="submit" disabled={isSaving}>
            {isSaving
              ? "Menyimpan..."
              : editingId
                ? "Simpan perubahan"
                : "Simpan transaksi"}
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

      <div className="page-header-card">
        <div>
          <p className="eyebrow">Saldo dan kas</p>
          <h2>Atur saldo awal dan uang cash awal per tanggal</h2>
          <p className="muted-copy">
            Tanggal <strong>{formatDisplayDate(form.transactionDate)}</strong> punya saldo
            awal sendiri. Saat ganti tanggal, nilai tidak mengambil saldo hari kemarin.
          </p>
        </div>

        <form className="balance-config-grid" onSubmit={handleBalanceSubmit}>
          <label>
            Saldo awal
            <input
              name="openingSaldo"
              type="number"
              min="0"
              placeholder="0"
              value={balanceForm.openingSaldo}
              onChange={handleBalanceChange}
            />
          </label>
          <label>
            Cash awal
            <input
              name="openingCash"
              type="number"
              min="0"
              placeholder="0"
              value={balanceForm.openingCash}
              onChange={handleBalanceChange}
            />
          </label>
          <button
            className="primary-button full-width-button"
            type="submit"
            disabled={isSavingBalance}
          >
            {isSavingBalance ? "Menyimpan..." : "Simpan saldo awal"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="panel">
          <p className="muted-copy">Memuat transaksi dari Supabase...</p>
        </div>
      ) : (
        <TransactionTable
          rows={filteredRows}
          selectedDate={formatDisplayDate(form.transactionDate)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}
    </section>
  );
}
