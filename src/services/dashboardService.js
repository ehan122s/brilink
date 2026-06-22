import {
  calculateAvailableBalances,
  fetchBalanceSettings,
} from "./balanceService";
import { fetchExpenses } from "./expenseService";
import { fetchTransactions } from "./transactionService";
import { transactionRows } from "../data/mockData";
import {
  formatCurrency,
  formatDisplayDate,
  formatPercentChange,
  groupTransactionsByDate,
  isSameIsoDate,
  normalizeTransactionRows,
} from "../utils/transactionHelpers";

const DAILY_TARGET = 3000000;

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function sumByDate(rows, isoDate, key) {
  return rows
    .filter((row) => isSameIsoDate(row.isoDate, isoDate))
    .reduce((sum, row) => sum + row[key], 0);
}

function buildHeroData({
  today,
  todayTransactions,
  todayExpenses,
  keuntunganHariIni,
  busiestCategory,
  balances,
}) {
  if (todayTransactions.length === 0 && todayExpenses.length === 0) {
    return {
      eyebrow: `Ringkasan outlet ${formatDisplayDate(today)}`,
      title: "Dashboard outlet siap dipakai, tinggal mulai isi transaksi dan pengeluaran.",
      copy:
        "Begitu transaksi dan biaya mulai masuk, dashboard ini akan otomatis berubah menjadi ringkasan harian outlet Anda.",
    };
  }

  return {
    eyebrow: `Ringkasan outlet ${formatDisplayDate(today)}`,
    title: `Hari ini ada ${todayTransactions.length} transaksi dengan laba bersih ${formatCurrency(
      keuntunganHariIni,
    )}.`,
    copy:
      busiestCategory[1] > 0
        ? `Layanan terpadat hari ini adalah ${busiestCategory[0]}. Cash tersedia ${formatCurrency(
            balances.cashAvailable,
          )} dan saldo tersedia ${formatCurrency(balances.saldoAvailable)}.`
        : `Belum ada kategori transaksi yang dominan hari ini. Cash tersedia ${formatCurrency(
            balances.cashAvailable,
          )} dan saldo tersedia ${formatCurrency(balances.saldoAvailable)}.`,
  };
}

export function buildDashboardData({
  transactions = normalizeTransactionRows(transactionRows),
  expenses = [],
  balanceSettings = null,
  hasTransactionsTable = false,
  hasExpensesTable = false,
  hasBalanceSettingsTable = false,
} = {}) {
  const today = getTodayIsoDate();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const todayTransactions = transactions.filter((row) => isSameIsoDate(row.isoDate, today));
  const todayExpenses = expenses.filter((item) => isSameIsoDate(item.isoDate, today));

  const pemasukanHariIni = sumByDate(transactions, today, "totalValue");
  const pemasukanKemarin = sumByDate(transactions, yesterday, "totalValue");
  const pengeluaranHariIni = todayExpenses.reduce((sum, item) => sum + item.amount, 0);
  const pengeluaranKemarin = expenses
    .filter((item) => isSameIsoDate(item.isoDate, yesterday))
    .reduce((sum, item) => sum + item.amount, 0);
  const adminBersihHariIni = sumByDate(transactions, today, "netAdminValue");
  const adminBersihKemarin = sumByDate(transactions, yesterday, "netAdminValue");
  const keuntunganHariIni = adminBersihHariIni - pengeluaranHariIni;
  const keuntunganKemarin = adminBersihKemarin - pengeluaranKemarin;
  const balances = calculateAvailableBalances(todayTransactions, balanceSettings);

  const categoryCounts = todayTransactions.reduce((map, row) => {
    map.set(row.category, (map.get(row.category) ?? 0) + 1);
    return map;
  }, new Map());

  const busiestCategory =
    [...categoryCounts.entries()].sort((left, right) => right[1] - left[1])[0] ??
    ["Belum ada", 0];

  const hero = buildHeroData({
    today,
    todayTransactions,
    todayExpenses,
    keuntunganHariIni,
    busiestCategory,
    balances,
  });

  return {
    hero,
    summaryCards: [
      {
        title: "Pemasukan Hari Ini",
        value: formatCurrency(pemasukanHariIni),
        delta: formatPercentChange(pemasukanHariIni, pemasukanKemarin),
        tone: "primary",
        accent:
          todayTransactions.length > 0
            ? `${todayTransactions.length} transaksi masuk hari ini`
            : "Belum ada transaksi hari ini",
      },
      {
        title: "Pengeluaran Hari Ini",
        value: formatCurrency(pengeluaranHariIni),
        delta: formatPercentChange(pengeluaranHariIni, pengeluaranKemarin),
        tone: "danger",
        accent:
          todayExpenses.length > 0
            ? `${todayExpenses.length} biaya tercatat hari ini`
            : "Belum ada pengeluaran hari ini",
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
        delta: todayTransactions.length > 0 ? `${todayTransactions.length} trx` : "Kosong",
        tone: "neutral",
        accent: `Cash tersedia ${formatCurrency(balances.cashAvailable)}`,
      },
    ],
    transactionTrend: groupTransactionsByDate(transactions, 6),
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
        detail: hasBalanceSettingsTable
          ? `Cash awal ${formatCurrency(balances.openingCash)} untuk tanggal ${formatDisplayDate(
              today,
            )}`
          : "Saldo awal per tanggal belum diatur, jadi cash masih default",
      },
    ],
    status: {
      hasTransactionsTable,
      hasExpensesTable,
      hasBalanceSettingsTable,
      hasTransactions: transactions.length > 0,
    },
  };
}

export async function fetchDashboardData() {
  const today = getTodayIsoDate();

  const [transactions, expensesResult, balanceResult] = await Promise.allSettled([
    fetchTransactions(),
    fetchExpenses(),
    fetchBalanceSettings(today),
  ]);

  return buildDashboardData({
    transactions: transactions.status === "fulfilled" ? transactions.value : [],
    expenses: expensesResult.status === "fulfilled" ? expensesResult.value : [],
    balanceSettings: balanceResult.status === "fulfilled" ? balanceResult.value : null,
    hasTransactionsTable: transactions.status === "fulfilled",
    hasExpensesTable: expensesResult.status === "fulfilled",
    hasBalanceSettingsTable: balanceResult.status === "fulfilled",
  });
}
