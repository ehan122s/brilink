import {
  calculateAvailableBalances,
  fetchBalanceSettings,
} from "./balanceService";
import { fetchExpenses } from "./expenseService";
import { fetchTransactions } from "./transactionService";
import {
  formatCurrency,
  formatPercentChange,
  groupTransactionsByDate,
  isSameIsoDate,
} from "../utils/transactionHelpers";

const DAILY_TARGET = 3000000;

function sumByDate(rows, isoDate, key) {
  return rows
    .filter((row) => isSameIsoDate(row.isoDate, isoDate))
    .reduce((sum, row) => sum + row[key], 0);
}

export async function fetchDashboardData() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const [transactions, expensesResult, balanceResult] = await Promise.allSettled([
    fetchTransactions(),
    fetchExpenses(),
    fetchBalanceSettings(today),
  ]);

  const transactionRows =
    transactions.status === "fulfilled" ? transactions.value : [];
  const expenses =
    expensesResult.status === "fulfilled" ? expensesResult.value : [];
  const balanceSettings =
    balanceResult.status === "fulfilled" ? balanceResult.value : null;

  const pemasukanHariIni = sumByDate(transactionRows, today, "totalValue");
  const pemasukanKemarin = sumByDate(transactionRows, yesterday, "totalValue");
  const pengeluaranHariIni = expenses
    .filter((item) => isSameIsoDate(item.isoDate, today))
    .reduce((sum, item) => sum + item.amount, 0);
  const pengeluaranKemarin = expenses
    .filter((item) => isSameIsoDate(item.isoDate, yesterday))
    .reduce((sum, item) => sum + item.amount, 0);
  const adminBersihHariIni = sumByDate(transactionRows, today, "netAdminValue");
  const adminBersihKemarin = sumByDate(transactionRows, yesterday, "netAdminValue");
  const keuntunganHariIni = adminBersihHariIni - pengeluaranHariIni;
  const keuntunganKemarin = adminBersihKemarin - pengeluaranKemarin;
  const balances = calculateAvailableBalances(
    transactionRows.filter((row) => isSameIsoDate(row.isoDate, today)),
    balanceSettings,
  );

  const categoryCounts = transactionRows
    .filter((row) => isSameIsoDate(row.isoDate, today))
    .reduce((map, row) => {
      map.set(row.category, (map.get(row.category) ?? 0) + 1);
      return map;
    }, new Map());

  const busiestCategory =
    [...categoryCounts.entries()].sort((left, right) => right[1] - left[1])[0] ??
    ["Belum ada", 0];

  return {
    summaryCards: [
      {
        title: "Pemasukan Hari Ini",
        value: formatCurrency(pemasukanHariIni),
        delta: formatPercentChange(pemasukanHariIni, pemasukanKemarin),
        tone: "primary",
        accent: "Data live dari transaksi Supabase",
      },
      {
        title: "Pengeluaran Hari Ini",
        value: formatCurrency(pengeluaranHariIni),
        delta: formatPercentChange(pengeluaranHariIni, pengeluaranKemarin),
        tone: "danger",
        accent: "Diambil dari tabel expenses jika tersedia",
      },
      {
        title: "Keuntungan Bersih",
        value: formatCurrency(keuntunganHariIni),
        delta: formatPercentChange(keuntunganHariIni, keuntunganKemarin),
        tone: "success",
        accent: "Admin pelanggan dikurangi admin bank dan pengeluaran hari ini",
      },
      {
        title: "Saldo tersedia",
        value: formatCurrency(balances.saldoAvailable),
        delta: transactionRows.length > 0 ? `${transactionRows.length} trx` : "Kosong",
        tone: "neutral",
        accent: `Cash tersedia ${formatCurrency(balances.cashAvailable)}`,
      },
    ],
    transactionTrend: groupTransactionsByDate(transactionRows, 6),
    operationalHighlights: [
      {
        label: "Target Harian",
        value: `${Math.min(
          100,
          Math.round((keuntunganHariIni / DAILY_TARGET) * 100) || 0,
        )}%`,
        detail: `${formatCurrency(keuntunganHariIni)} dari target ${formatCurrency(DAILY_TARGET)}`,
      },
      {
        label: "Layanan Terpadat",
        value: busiestCategory[0],
        detail: `${busiestCategory[1]} transaksi tercatat hari ini`,
      },
      {
        label: "Cash tersedia",
        value: formatCurrency(balances.cashAvailable),
        detail:
          balanceResult.status === "fulfilled"
            ? `Cash awal ${formatCurrency(balances.openingCash)} dan otomatis bergerak dari transaksi`
            : "Tabel balance_settings belum siap, jadi cash masih mengikuti nilai default",
      },
    ],
    status: {
      hasTransactionsTable: transactions.status === "fulfilled",
      hasExpensesTable: expensesResult.status === "fulfilled",
      hasBalanceSettingsTable: balanceResult.status === "fulfilled",
      hasTransactions: transactionRows.length > 0,
    },
  };
}
