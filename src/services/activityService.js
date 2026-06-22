import { fetchTransactions } from "./transactionService";
import { formatCurrency, formatDisplayTime } from "../utils/transactionHelpers";

export async function fetchActivityData() {
  const rows = await fetchTransactions();
  const recentRows = rows.slice(0, 5);

  const latestTransactions = recentRows.map((row) => ({
    id: row.code,
    customer: "-",
    category: row.category,
    amount: row.nominal,
    fee: row.netAdmin,
    status: "Selesai",
    time: formatDisplayTime(row.createdAt),
  }));

  const activityFeed = recentRows.map((row) => ({
    time: formatDisplayTime(row.createdAt),
    title: `${row.cashier} memproses ${row.category}`,
    description: `Nominal ${row.nominal}, admin pelanggan ${row.adminFee}, admin bank ${row.bankAdminFee}.`,
  }));

  const alerts = [];
  const biggestTransaction = [...rows].sort(
    (left, right) => right.totalValue - left.totalValue,
  )[0];

  if (biggestTransaction && biggestTransaction.totalValue >= 1000000) {
    alerts.push({
      title: "Transaksi besar terdeteksi",
      description: `${biggestTransaction.code} bernilai ${formatCurrency(biggestTransaction.totalValue)}.`,
    });
  }

  if (rows.length === 0) {
    alerts.push({
      title: "Belum ada transaksi",
      description: "Data aktivitas akan muncul setelah transaksi pertama tersimpan.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      title: "Operasional normal",
      description: "Belum ada anomali yang perlu perhatian khusus hari ini.",
    });
  }

  return {
    latestTransactions,
    activityFeed,
    alerts,
  };
}
