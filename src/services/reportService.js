import { fetchExpenses } from "./expenseService";
import { fetchTransactions } from "./transactionService";
import { transactionRows } from "../data/mockData";
import {
  formatCurrency,
  formatDisplayDate,
  normalizeTransactionRows,
} from "../utils/transactionHelpers";

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonthValue() {
  return getTodayIsoDate().slice(0, 7);
}

function formatMonthLabel(monthValue) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthValue}-01`));
}

function matchesMonth(isoDate, monthValue) {
  return String(isoDate).startsWith(monthValue);
}

function getScopedRows(transactionRows, expenses, mode, selectedDate, selectedMonth) {
  if (mode === "daily") {
    return {
      transactions: transactionRows.filter((row) => row.isoDate === selectedDate),
      expenses: expenses.filter((row) => row.isoDate === selectedDate),
      periodLabel: formatDisplayDate(selectedDate),
      periodCaption: "Semua angka dihitung dari satu tanggal yang dipilih.",
    };
  }

  if (mode === "monthly") {
    return {
      transactions: transactionRows.filter((row) => matchesMonth(row.isoDate, selectedMonth)),
      expenses: expenses.filter((row) => matchesMonth(row.isoDate, selectedMonth)),
      periodLabel: formatMonthLabel(selectedMonth),
      periodCaption: "Semua angka dihitung dari satu bulan yang dipilih.",
    };
  }

  return {
    transactions: transactionRows,
    expenses,
    periodLabel: "Semua Periode",
    periodCaption: "Rekap menggabungkan seluruh data transaksi dan pengeluaran yang tersedia.",
  };
}

function buildReportCards(metrics, transactionCount) {
  return [
    {
      title: "Uang Kotor",
      subtitle: `Akumulasi uang masuk dari ${transactionCount} transaksi`,
      action: formatCurrency(metrics.totalTransactions),
    },
    {
      title: "Nominal Transaksi",
      subtitle: "Total pokok nominal yang diproses outlet",
      action: formatCurrency(metrics.totalNominal),
    },
    {
      title: "Fee / Jasa",
      subtitle: "Bagian admin pelanggan yang menjadi pemasukan outlet",
      action: formatCurrency(metrics.totalFees),
    },
    {
      title: "Pengeluaran",
      subtitle: "Biaya usaha yang mengurangi hasil akhir",
      action: formatCurrency(metrics.totalExpenses),
    },
    {
      title: "Admin Bank",
      subtitle: "Potongan bank dari transaksi yang berjalan",
      action: formatCurrency(metrics.totalBankAdmin),
    },
    {
      title: "Laba Bersih",
      subtitle: "Admin bersih setelah dikurangi pengeluaran usaha",
      action: formatCurrency(metrics.netProfit),
    },
  ];
}

function buildMetrics(mode, selectedDate, selectedMonth, transactionRows, expenses) {
  const scoped = getScopedRows(
    transactionRows,
    expenses,
    mode,
    selectedDate,
    selectedMonth,
  );
  const totalTransactions = scoped.transactions.reduce((sum, row) => sum + row.totalValue, 0);
  const totalNominal = scoped.transactions.reduce((sum, row) => sum + row.nominalValue, 0);
  const totalFees = scoped.transactions.reduce((sum, row) => sum + row.adminFeeValue, 0);
  const totalBankAdmin = scoped.transactions.reduce((sum, row) => sum + row.bankAdminFeeValue, 0);
  const netTransactionProfit = scoped.transactions.reduce(
    (sum, row) => sum + row.netAdminValue,
    0,
  );
  const totalExpenses = scoped.expenses.reduce((sum, row) => sum + row.amount, 0);
  const netProfit = netTransactionProfit - totalExpenses;
  const averageTransaction =
    scoped.transactions.length > 0 ? Math.round(totalTransactions / scoped.transactions.length) : 0;

  return {
    mode,
    selectedDate,
    selectedMonth,
    periodLabel: scoped.periodLabel,
    periodCaption: scoped.periodCaption,
    totalTransactions,
    totalNominal,
    totalFees,
    totalBankAdmin,
    totalExpenses,
    netProfit,
    transactionCount: scoped.transactions.length,
    expenseCount: scoped.expenses.length,
    averageTransaction,
    cards: buildReportCards(
      {
        totalTransactions,
        totalNominal,
        totalFees,
        totalBankAdmin,
        totalExpenses,
        netProfit,
      },
      scoped.transactions.length,
    ),
    insightTitle:
      mode === "daily"
        ? `Laporan harian ${scoped.periodLabel} menunjukkan laba bersih ${formatCurrency(netProfit)}`
        : mode === "monthly"
          ? `Laporan bulanan ${scoped.periodLabel} menghasilkan laba bersih ${formatCurrency(netProfit)}`
          : `Rekap seluruh periode saat ini menghasilkan laba bersih ${formatCurrency(netProfit)}`,
    stats: [
      {
        value: String(scoped.transactions.length),
        label: mode === "monthly" ? "jumlah transaksi bulan ini" : "jumlah transaksi",
      },
      {
        value: formatCurrency(averageTransaction),
        label: "rata-rata per transaksi",
      },
      {
        value: String(scoped.expenses.length),
        label: "jumlah pengeluaran",
      },
    ],
    breakdown: [
      {
        label: "Total transaksi masuk",
        value: formatCurrency(totalTransactions),
        detail: `${scoped.transactions.length} transaksi tercatat`,
      },
      {
        label: "Nominal murni",
        value: formatCurrency(totalNominal),
        detail: "Pokok transaksi tanpa admin pelanggan",
      },
      {
        label: "Admin pelanggan",
        value: formatCurrency(totalFees),
        detail: "Pendapatan jasa outlet",
      },
      {
        label: "Admin bank",
        value: formatCurrency(totalBankAdmin),
        detail: "Biaya potong bank",
      },
      {
        label: "Pengeluaran usaha",
        value: formatCurrency(totalExpenses),
        detail: `${scoped.expenses.length} biaya dicatat`,
      },
      {
        label: "Laba bersih",
        value: formatCurrency(netProfit),
        detail: "Admin bersih dikurangi pengeluaran",
      },
    ],
  };
}

export function buildReportsData({
  mode = "overview",
  selectedDate = getTodayIsoDate(),
  selectedMonth = getCurrentMonthValue(),
  transactions = normalizeTransactionRows(transactionRows),
  expenses = [],
  hasTransactionsTable = true,
  hasExpensesTable = true,
} = {}) {
  const metrics = buildMetrics(mode, selectedDate, selectedMonth, transactions, expenses);

  return {
    ...metrics,
    hasTransactionsTable,
    hasExpensesTable,
  };
}

export async function fetchReportsData(options = {}) {
  const selectedDate = options.selectedDate ?? getTodayIsoDate();
  const selectedMonth = options.selectedMonth ?? getCurrentMonthValue();
  const mode = options.mode ?? "overview";

  const [transactions, expensesResult] = await Promise.allSettled([
    fetchTransactions(),
    fetchExpenses(),
  ]);

  const transactionData =
    transactions.status === "fulfilled" ? transactions.value : [];
  const expenses =
    expensesResult.status === "fulfilled" ? expensesResult.value : [];

  return buildReportsData({
    mode,
    selectedDate,
    selectedMonth,
    transactions: transactionData,
    expenses,
    hasTransactionsTable: transactions.status === "fulfilled",
    hasExpensesTable: expensesResult.status === "fulfilled",
  });
}
