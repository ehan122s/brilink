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

function buildServiceTiles(todayTransactions, todayExpenses) {
  const definitions = [
    {
      key: "transfer",
      label: "Transfer",
      category: "Transfer",
      tone: "primary",
    },
    {
      key: "tarik-tunai",
      label: "Tarik Tunai",
      category: "Tarik tunai",
      tone: "success",
    },
    {
      key: "setor-tunai",
      label: "Setor Tunai",
      category: "Setor tunai",
      tone: "neutral",
    },
    {
      key: "topup",
      label: "Top Up",
      category: "Top up e-wallet",
      tone: "primary",
    },
    {
      key: "tagihan",
      label: "PPOB",
      categories: ["Pembayaran tagihan", "Token listrik", "Pulsa"],
      tone: "warning",
    },
  ];

  const tiles = definitions.map((definition) => {
    const matches = todayTransactions.filter((row) =>
      definition.categories
        ? definition.categories.includes(row.category)
        : row.category === definition.category,
    );
    const total = matches.reduce((sum, row) => sum + row.totalValue, 0);

    return {
      key: definition.key,
      label: definition.label,
      count: matches.length,
      total: formatCurrency(total),
      tone: definition.tone,
      detail:
        matches.length > 0
          ? `${matches.length} transaksi hari ini`
          : "Belum ada transaksi hari ini",
    };
  });

  tiles.push({
    key: "pengeluaran",
    label: "Biaya",
    count: todayExpenses.length,
    total: formatCurrency(todayExpenses.reduce((sum, item) => sum + item.amount, 0)),
    tone: "danger",
    detail:
      todayExpenses.length > 0
        ? `${todayExpenses.length} biaya operasional`
        : "Belum ada biaya hari ini",
  });

  return tiles;
}

function buildRecentTransactions(rows) {
  return [...rows]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 5)
    .map((row) => ({
      code: row.code,
      category: row.category,
      cashier: row.cashier,
      total: row.total,
      adminFee: row.adminFee,
      time: formatDisplayDate(row.isoDate),
    }));
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
    serviceTiles: buildServiceTiles(todayTransactions, todayExpenses),
    recentTransactions: buildRecentTransactions(
      todayTransactions.length > 0 ? todayTransactions : transactions,
    ),
    operatorSnapshot: [
      {
        label: "Saldo tersedia",
        value: formatCurrency(balances.saldoAvailable),
        detail: `Saldo awal ${formatCurrency(balances.openingSaldo)}`,
      },
      {
        label: "Cash tersedia",
        value: formatCurrency(balances.cashAvailable),
        detail: `Cash awal ${formatCurrency(balances.openingCash)}`,
      },
      {
        label: "Admin bersih",
        value: formatCurrency(adminBersihHariIni),
        detail: "Admin pelanggan dikurangi admin bank",
      },
      {
        label: "Biaya hari ini",
        value: formatCurrency(pengeluaranHariIni),
        detail: "Pengeluaran operasional outlet",
      },
    ],
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
