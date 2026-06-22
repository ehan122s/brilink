import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  fetchBalanceSettings,
  saveBalanceSettings,
} from "../../services/balanceService";
import { fetchExpenses } from "../../services/expenseService";
import { fetchTransactions } from "../../services/transactionService";
import { transactionRows } from "../../data/mockData";
import {
  formatCurrency,
  normalizeTransactionRows,
} from "../../utils/transactionHelpers";

const SHEET_ROWS = [
  {
    key: "transfer",
    label: "Transfer",
    category: "Transaksi",
    matches: (row) => row.category === "Transfer",
    countInTotal: true,
  },
  {
    key: "tarik_tunai",
    label: "Tarik Tunai",
    category: "Transaksi",
    matches: (row) => row.category === "Tarik tunai",
    countInTotal: true,
  },
  {
    key: "setor_tunai",
    label: "Setor Tunai",
    category: "Transaksi",
    matches: (row) => row.category === "Setor tunai",
    countInTotal: true,
  },
  {
    key: "topup",
    label: "Topup",
    category: "Transaksi",
    matches: (row) => row.category === "Top up e-wallet",
    countInTotal: true,
  },
  {
    key: "isi_pulsa",
    label: "Isi Pulsa / Token",
    category: "Transaksi",
    matches: (row) => row.category === "Pulsa" || row.category === "Token listrik",
    countInTotal: true,
  },
  {
    key: "tagihan",
    label: "Bayar Tagihan",
    category: "Transaksi",
    matches: (row) => row.category === "Pembayaran tagihan",
    countInTotal: true,
  },
  {
    key: "biaya_operasional",
    label: "Biaya Operasional",
    category: "Beban Usaha",
    isExpense: true,
    countInTotal: true,
  },
  {
    key: "admin_nasabah",
    label: "Admin Nasabah",
    category: "Pendapatan Usaha",
    isAdminRow: true,
    countInTotal: false,
  },
  {
    key: "admin_bank",
    label: "Admin Bank",
    category: "Beban Transaksi",
    isBankAdminRow: true,
    countInTotal: false,
  },
  {
    key: "modal_awal",
    label: "Modal Awal",
    category: "Modal Usaha",
    isOpeningRow: true,
    countInTotal: true,
  },
  {
    key: "pindah_saldo",
    label: "Pindah Saldo",
    category: "Modal Usaha",
    matches: (row) => row.category === "Pindah saldo",
    countInTotal: true,
  },
];

function getTransactionFlows(row) {
  const nominal = row.nominalValue;
  const admin = row.adminFeeValue;
  const bankAdmin = row.bankAdminFeeValue;

  if (row.category === "Tarik tunai") {
    return {
      cashIn: admin,
      cashOut: nominal,
      saldoIn: nominal - bankAdmin,
      saldoOut: 0,
      admin: 0,
      bankAdmin: 0,
    };
  }

  if (row.category === "Pindah saldo") {
    return {
      cashIn: 0,
      cashOut: 0,
      saldoIn: nominal,
      saldoOut: nominal + bankAdmin,
      admin: 0,
      bankAdmin: 0,
    };
  }

  return {
    cashIn: nominal + admin,
    cashOut: 0,
    saldoIn: 0,
    saldoOut: nominal + bankAdmin,
    admin: 0,
    bankAdmin: 0,
  };
}

function sumRows(rows, key, predicate = () => true) {
  return rows
    .filter(predicate)
    .reduce((sum, row) => sum + row[key], 0);
}

function buildSheetRows(transactions, expenses, settings) {
  return SHEET_ROWS.map((definition) => {
    if (definition.isExpense) {
      return {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        count: expenses.length,
        cashIn: 0,
        cashOut: expenses.reduce((sum, item) => sum + item.amount, 0),
        saldoIn: 0,
        saldoOut: 0,
        admin: 0,
        bankAdmin: 0,
        countInTotal: definition.countInTotal,
      };
    }

    if (definition.isAdminRow) {
      const transactionsWithAdmin = transactions.filter((row) => row.adminFeeValue > 0);

      return {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        count: transactionsWithAdmin.length,
        cashIn: 0,
        cashOut: 0,
        saldoIn: 0,
        saldoOut: 0,
        admin: transactionsWithAdmin.reduce((sum, row) => sum + row.adminFeeValue, 0),
        bankAdmin: 0,
        countInTotal: definition.countInTotal,
      };
    }

    if (definition.isBankAdminRow) {
      const transactionsWithBankAdmin = transactions.filter((row) => row.bankAdminFeeValue > 0);

      return {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        count: transactionsWithBankAdmin.length,
        cashIn: 0,
        cashOut: 0,
        saldoIn: 0,
        saldoOut: 0,
        admin: 0,
        bankAdmin: transactionsWithBankAdmin.reduce(
          (sum, row) => sum + row.bankAdminFeeValue,
          0,
        ),
        countInTotal: definition.countInTotal,
      };
    }

    if (definition.isOpeningRow) {
      const openingCash = Number(settings.openingCash) || 0;
      const openingSaldo = Number(settings.openingSaldo) || 0;

      return {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        count: (openingCash > 0 ? 1 : 0) + (openingSaldo > 0 ? 1 : 0),
        cashIn: openingCash,
        cashOut: 0,
        saldoIn: openingSaldo,
        saldoOut: 0,
        admin: 0,
        bankAdmin: 0,
        countInTotal: definition.countInTotal,
      };
    }

    const matchedRows = transactions.filter(definition.matches);
    const flows = matchedRows.map(getTransactionFlows);

    return {
      key: definition.key,
      label: definition.label,
      category: definition.category,
      count: matchedRows.length,
      cashIn: sumRows(flows, "cashIn"),
      cashOut: sumRows(flows, "cashOut"),
      saldoIn: sumRows(flows, "saldoIn"),
      saldoOut: sumRows(flows, "saldoOut"),
      admin: sumRows(flows, "admin"),
      bankAdmin: sumRows(flows, "bankAdmin"),
      countInTotal: definition.countInTotal,
    };
  });
}

function formatCompactNumber(value) {
  return value > 0 ? formatCurrency(value) : "Rp 0";
}

export function CashflowPage() {
  const [transactions, setTransactions] = useState(() =>
    normalizeTransactionRows(transactionRows),
  );
  const [expenses, setExpenses] = useState([]);
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
      ? "Mengambil pembukuan kas dan saldo dari Supabase..."
      : "Mode demo aktif. Tabel pembukuan masih memakai data contoh.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  useEffect(() => {
    async function loadCashflow() {
      if (!isSupabaseConfigured) {
        return;
      }

      const [transactionsResult, expensesResult, balanceResult] =
        await Promise.allSettled([
          fetchTransactions(),
          fetchExpenses(),
          fetchBalanceSettings(),
        ]);

      if (transactionsResult.status === "fulfilled") {
        setTransactions(transactionsResult.value);
      }

      if (expensesResult.status === "fulfilled") {
        setExpenses(expensesResult.value);
      }

      if (balanceResult.status === "fulfilled") {
        setBalanceSettings(balanceResult.value);
        setBalanceForm({
          openingSaldo: String(balanceResult.value.openingSaldo || ""),
          openingCash: String(balanceResult.value.openingCash || ""),
        });
      }

      setStatusMessage(
        transactionsResult.status === "fulfilled"
          ? "Format pembukuan berhasil dihitung dari data transaksi, biaya, cash, dan saldo."
          : "Sebagian data belum siap dibaca dari Supabase. Data contoh dipakai sementara.",
      );
    }

    loadCashflow().catch((error) => {
      console.error(error);
      setStatusMessage("Gagal memuat pembukuan dari Supabase. Data contoh ditampilkan.");
    });
  }, []);

  function handleBalanceChange(event) {
    const { name, value } = event.target;
    setBalanceForm((current) => ({ ...current, [name]: value }));
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
          openingSaldo,
          openingCash,
        });

        setBalanceSettings(nextSettings);
        setBalanceForm({
          openingSaldo: String(nextSettings.openingSaldo || ""),
          openingCash: String(nextSettings.openingCash || ""),
        });
        setStatusMessage("Modal awal cash dan saldo berhasil disimpan ke Supabase.");
      } else {
        setBalanceSettings({ openingSaldo, openingCash });
        setStatusMessage("Modal awal cash dan saldo diperbarui di mode demo.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message ?? "Gagal menyimpan modal awal.");
    } finally {
      setIsSavingBalance(false);
    }
  }

  const sheetRows = buildSheetRows(transactions, expenses, balanceSettings);
  const totalCount = sheetRows
    .filter((row) => row.countInTotal)
    .reduce((sum, row) => sum + row.count, 0);
  const cashIn = sumRows(sheetRows, "cashIn");
  const cashOut = sumRows(sheetRows, "cashOut");
  const saldoIn = sumRows(sheetRows, "saldoIn");
  const saldoOut = sumRows(sheetRows, "saldoOut");
  const adminTotal = sumRows(sheetRows, "admin");
  const bankAdminTotal = sumRows(sheetRows, "bankAdmin");
  const labaBersihTransaksi = adminTotal - bankAdminTotal;
  const saldoKas = cashIn - cashOut;
  const saldoRekening = saldoIn - saldoOut;
  const totalAsset = saldoKas + saldoRekening;

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Pembukuan kas & saldo</p>
          <h2>Format ringkas seperti sheet pembukuan usaha</h2>
          <p className="muted-copy">{statusMessage}</p>
          {errorMessage ? <p className="error-copy">{errorMessage}</p> : null}
        </div>
      </div>

      <div className="ledger-sheet panel">
        <div className="panel-heading ledger-heading">
          <div>
            <p className="panel-kicker">Sheet pembukuan</p>
            <h3>Rekap transaksi, cash, saldo, admin pelanggan, dan admin bank</h3>
          </div>
          <div className="ledger-actions">
            <Link className="ghost-button compact-button" to="/transactions">
              Input transaksi
            </Link>
            <Link className="ghost-button compact-button" to="/expenses">
              Input biaya
            </Link>
          </div>
        </div>

        <div className="table-scroll ledger-table-view">
          <table className="data-table ledger-table">
            <thead>
              <tr>
                <th>Jenis Transaksi</th>
                <th>Kategori</th>
                <th>Jumlah Transaksi</th>
                <th>Jumlah Masuk</th>
                <th>Jumlah Keluar</th>
                <th>Saldo Masuk</th>
                <th>Saldo Keluar</th>
                <th>Admin Pelanggan</th>
                <th>Admin Bank</th>
              </tr>
            </thead>
            <tbody>
              {sheetRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.category}</td>
                  <td>{row.count}</td>
                  <td>{formatCompactNumber(row.cashIn)}</td>
                  <td>{formatCompactNumber(row.cashOut)}</td>
                  <td>{formatCompactNumber(row.saldoIn)}</td>
                  <td>{formatCompactNumber(row.saldoOut)}</td>
                  <td>{formatCompactNumber(row.admin)}</td>
                  <td>{formatCompactNumber(row.bankAdmin)}</td>
                </tr>
              ))}
              <tr className="ledger-total-row">
                <td colSpan="2">Total</td>
                <td>{totalCount}</td>
                <td>{formatCurrency(cashIn)}</td>
                <td>{formatCurrency(cashOut)}</td>
                <td>{formatCurrency(saldoIn)}</td>
                <td>{formatCurrency(saldoOut)}</td>
                <td>{formatCurrency(adminTotal)}</td>
                <td>{formatCurrency(bankAdminTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list ledger-mobile-list">
          {sheetRows.map((row) => (
            <article key={row.key} className="mobile-data-card ledger-mobile-card">
              <div className="mobile-data-card-head">
                <strong>{row.label}</strong>
                <span className="table-caption">{row.category}</span>
              </div>
              <div className="mobile-data-grid">
                <div>
                  <span className="mobile-data-label">Jumlah</span>
                  <strong>{row.count}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Uang Masuk</span>
                  <strong>{formatCompactNumber(row.cashIn)}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Uang Keluar</span>
                  <strong>{formatCompactNumber(row.cashOut)}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Saldo Masuk</span>
                  <strong>{formatCompactNumber(row.saldoIn)}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Saldo Keluar</span>
                  <strong>{formatCompactNumber(row.saldoOut)}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Admin Pelanggan</span>
                  <strong>{formatCompactNumber(row.admin)}</strong>
                </div>
                <div>
                  <span className="mobile-data-label">Admin Bank</span>
                  <strong>{formatCompactNumber(row.bankAdmin)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="ledger-summary">
          <div className="ledger-summary-block">
            <div className="ledger-summary-row">
              <span>Uang Masuk</span>
              <strong>{formatCurrency(cashIn)}</strong>
            </div>
            <div className="ledger-summary-row">
              <span>Uang Keluar</span>
              <strong>{formatCurrency(cashOut)}</strong>
            </div>
            <div className="ledger-summary-row ledger-summary-row-strong">
              <span>Saldo Kas</span>
              <strong>{formatCurrency(saldoKas)}</strong>
            </div>
          </div>

          <div className="ledger-summary-block">
            <div className="ledger-summary-row">
              <span>Saldo Masuk</span>
              <strong>{formatCurrency(saldoIn)}</strong>
            </div>
            <div className="ledger-summary-row">
              <span>Saldo Keluar</span>
              <strong>{formatCurrency(saldoOut)}</strong>
            </div>
            <div className="ledger-summary-row ledger-summary-row-strong">
              <span>Saldo Rekening</span>
              <strong>{formatCurrency(saldoRekening)}</strong>
            </div>
          </div>

          <div className="ledger-summary-block ledger-summary-block-total">
            <div className="ledger-summary-row">
              <span>Admin Pelanggan</span>
              <strong>{formatCurrency(adminTotal)}</strong>
            </div>
            <div className="ledger-summary-row">
              <span>Admin Bank</span>
              <strong>{formatCurrency(bankAdminTotal)}</strong>
            </div>
            <div className="ledger-summary-row ledger-summary-row-strong">
              <span>Laba Bersih Transaksi</span>
              <strong>{formatCurrency(labaBersihTransaksi)}</strong>
            </div>
            <div className="ledger-summary-row ledger-summary-row-strong">
              <span>Total Asset</span>
              <strong>{formatCurrency(totalAsset)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Modal awal</p>
          <h2>Atur cash awal dan saldo awal usaha</h2>
          <p className="muted-copy">
            Nilai ini akan langsung masuk ke baris <strong>Modal Awal</strong> seperti format pembukuan pada contoh.
          </p>
        </div>

        <form className="balance-config-grid ledger-balance-form" onSubmit={handleBalanceSubmit}>
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
          <button
            className="primary-button full-width-button"
            type="submit"
            disabled={isSavingBalance}
          >
            {isSavingBalance ? "Menyimpan..." : "Simpan modal awal"}
          </button>
        </form>
      </div>
    </section>
  );
}
