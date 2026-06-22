import { fetchExpenses } from "./expenseService";
import { fetchTransactions } from "./transactionService";
import { formatCurrency } from "../utils/transactionHelpers";

export async function fetchReportsData() {
  const [transactions, expensesResult] = await Promise.allSettled([
    fetchTransactions(),
    fetchExpenses(),
  ]);

  const transactionRows =
    transactions.status === "fulfilled" ? transactions.value : [];
  const expenses =
    expensesResult.status === "fulfilled" ? expensesResult.value : [];

  const totalTransactions = transactionRows.reduce(
    (sum, row) => sum + row.totalValue,
    0,
  );
  const totalNominal = transactionRows.reduce((sum, row) => sum + row.nominalValue, 0);
  const totalFees = transactionRows.reduce((sum, row) => sum + row.adminFeeValue, 0);
  const totalBankAdmin = transactionRows.reduce((sum, row) => sum + row.bankAdminFeeValue, 0);
  const netTransactionProfit = transactionRows.reduce((sum, row) => sum + row.netAdminValue, 0);
  const totalExpenses = expenses.reduce((sum, row) => sum + row.amount, 0);
  const netProfit = netTransactionProfit - totalExpenses;

  return {
    totalTransactions,
    totalNominal,
    totalFees,
    totalBankAdmin,
    totalExpenses,
    netProfit,
    hasTransactionsTable: transactions.status === "fulfilled",
    hasExpensesTable: expensesResult.status === "fulfilled",
    cards: [
      {
        title: "Uang Kotor",
        subtitle: `Akumulasi semua transaksi yang sudah masuk dari ${transactionRows.length} data`,
        action: formatCurrency(totalTransactions),
      },
      {
        title: "Fee / Jasa",
        subtitle: "Bagian pendapatan usaha yang benar-benar menjadi milik outlet",
        action: formatCurrency(totalFees),
      },
      {
        title: "Admin Bank",
        subtitle: "Biaya admin yang dipotong bank dari setiap transaksi",
        action: formatCurrency(totalBankAdmin),
      },
      {
        title: "Pengeluaran",
        subtitle: "Semua biaya yang mengurangi hasil akhir pembukuan",
        action: formatCurrency(totalExpenses),
      },
    ],
    insightTitle: `Laba bersih saat ini ${formatCurrency(netProfit)} setelah admin pelanggan dikurangi admin bank dan pengeluaran usaha`,
    stats: [
      {
        value: formatCurrency(totalNominal),
        label: "nominal transaksi",
      },
      {
        value: formatCurrency(netProfit),
        label: expensesResult.status === "fulfilled" ? "laba bersih" : "hasil tanpa pengeluaran",
      },
    ],
  };
}
