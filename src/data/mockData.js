function toIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

const mockTodayDate = new Date();
const mockYesterdayDate = new Date(mockTodayDate);
mockYesterdayDate.setDate(mockYesterdayDate.getDate() - 1);

const mockTodayIsoDate = toIsoDate(mockTodayDate);
const mockYesterdayIsoDate = toIsoDate(mockYesterdayDate);

export const summaryCards = [
  {
    title: "Pemasukan Hari Ini",
    value: "Rp3.750.000",
    delta: "+12.4%",
    tone: "primary",
    accent: "Arus masuk stabil sejak pagi",
  },
  {
    title: "Pengeluaran Hari Ini",
    value: "Rp925.000",
    delta: "-4.1%",
    tone: "danger",
    accent: "Biaya operasional lebih hemat",
  },
  {
    title: "Keuntungan Bersih",
    value: "Rp2.825.000",
    delta: "+18.7%",
    tone: "success",
    accent: "Profit di atas target harian",
  },
  {
    title: "Saldo Operasional",
    value: "Rp14.500.000",
    delta: "Aman",
    tone: "neutral",
    accent: "Likuiditas cukup untuk 2 shift",
  },
];

export const transactionTrend = [
  { name: "Sen", pemasukan: 2100000, pengeluaran: 450000 },
  { name: "Sel", pemasukan: 2400000, pengeluaran: 520000 },
  { name: "Rab", pemasukan: 1900000, pengeluaran: 400000 },
  { name: "Kam", pemasukan: 3100000, pengeluaran: 720000 },
  { name: "Jum", pemasukan: 2750000, pengeluaran: 610000 },
  { name: "Sab", pemasukan: 3550000, pengeluaran: 900000 },
];

export const latestTransactions = [
  {
    id: "TRX-1024",
    customer: "Rina Oktavia",
    category: "Transfer",
    amount: "Rp1.500.000",
    fee: "Rp7.500",
    status: "Selesai",
    time: "08:14",
  },
  {
    id: "TRX-1025",
    customer: "Agus Rahman",
    category: "Tarik tunai",
    amount: "Rp750.000",
    fee: "Rp10.000",
    status: "Selesai",
    time: "09:03",
  },
  {
    id: "TRX-1026",
    customer: "Dewi Laras",
    category: "Top up e-wallet",
    amount: "Rp250.000",
    fee: "Rp5.000",
    status: "Pending",
    time: "10:26",
  },
  {
    id: "TRX-1027",
    customer: "Budi Santoso",
    category: "Pulsa",
    amount: "Rp100.000",
    fee: "Rp3.000",
    status: "Selesai",
    time: "11:17",
  },
];

export const alerts = [
  {
    title: "Saldo e-wallet menipis",
    description: "Sisa Rp1.250.000. Pertimbangkan top up sebelum jam sibuk sore.",
  },
  {
    title: "Transaksi besar terdeteksi",
    description: "Tarik tunai Rp5.000.000 butuh verifikasi owner.",
  },
];

export const cashBalances = [
  { label: "Tunai", amount: "Rp7.500.000" },
  { label: "BRILink", amount: "Rp5.250.000" },
  { label: "E-Wallet", amount: "Rp1.750.000" },
];

export const operationalHighlights = [
  {
    label: "Target Harian",
    value: "83%",
    detail: "Rp2.825.000 dari target Rp3.400.000",
  },
  {
    label: "Layanan Terpadat",
    value: "Transfer",
    detail: "37 transaksi sejak pukul 08.00",
  },
  {
    label: "Sinkronisasi",
    value: "Normal",
    detail: "Terakhir sinkron 2 menit yang lalu",
  },
];

export const servicePerformance = [
  {
    service: "Transfer",
    total: "148 trx",
    growth: "+14%",
    width: "82%",
  },
  {
    service: "Tarik Tunai",
    total: "96 trx",
    growth: "+8%",
    width: "64%",
  },
  {
    service: "Top Up E-Wallet",
    total: "74 trx",
    growth: "+22%",
    width: "58%",
  },
  {
    service: "Pembayaran Tagihan",
    total: "41 trx",
    growth: "+5%",
    width: "36%",
  },
];

export const activityFeed = [
  {
    time: "11:42",
    title: "Kasir 1 menyelesaikan transaksi transfer",
    description: "Nominal Rp1.850.000 dengan fee admin Rp7.500.",
  },
  {
    time: "11:28",
    title: "Saldo tunai outlet diperbarui",
    description: "Penambahan saldo operasional Rp2.000.000 dari owner.",
  },
  {
    time: "11:10",
    title: "Notifikasi threshold e-wallet aktif",
    description: "Sistem mengingatkan saldo mendekati batas minimum.",
  },
];

export const transactionRows = [
  {
    code: "TRX-1028",
    customer: "Maya Putri",
    category: "Transfer",
    nominal: "Rp2.000.000",
    adminFee: "Rp7.500",
    total: "Rp2.007.500",
    date: "Hari ini",
    isoDate: mockTodayIsoDate,
    createdAt: `${mockTodayIsoDate}T08:15:00.000Z`,
    cashier: "Kasir 1",
  },
  {
    code: "TRX-1029",
    customer: "Rizal Saputra",
    category: "Setor tunai",
    nominal: "Rp1.250.000",
    adminFee: "Rp6.000",
    total: "Rp1.256.000",
    isoDate: mockTodayIsoDate,
    createdAt: `${mockTodayIsoDate}T10:05:00.000Z`,
    date: "Hari ini",
    cashier: "Kasir 2",
  },
  {
    code: "TRX-1030",
    customer: "Siska Amelia",
    category: "Token listrik",
    nominal: "Rp500.000",
    adminFee: "Rp4.000",
    total: "Rp504.000",
    isoDate: mockTodayIsoDate,
    createdAt: `${mockTodayIsoDate}T11:42:00.000Z`,
    date: "Hari ini",
    cashier: "Kasir 1",
  },
  {
    code: "TRX-1031",
    customer: "Rio Pratama",
    category: "Pembayaran tagihan",
    nominal: "Rp890.000",
    adminFee: "Rp5.000",
    total: "Rp895.000",
    isoDate: mockYesterdayIsoDate,
    createdAt: `${mockYesterdayIsoDate}T14:10:00.000Z`,
    date: "Kemarin",
    cashier: "Kasir 2",
  },
];

export const customerRows = [
  {
    name: "Rina Oktavia",
    phone: "0812-4567-8901",
    notes: "Sering transfer antarbank",
    totalTransactions: 24,
    lastTransaction: "20 Jun 2026",
  },
  {
    name: "Agus Rahman",
    phone: "0821-7788-1199",
    notes: "Tarik tunai grosir",
    totalTransactions: 17,
    lastTransaction: "20 Jun 2026",
  },
  {
    name: "Dewi Laras",
    phone: "0813-2020-4545",
    notes: "Top up e-wallet mingguan",
    totalTransactions: 9,
    lastTransaction: "20 Jun 2026",
  },
];

export const reportCards = [
  {
    title: "Laporan Harian",
    subtitle: "Ringkasan transaksi dan profit per hari",
    action: "Unduh PDF",
  },
  {
    title: "Laporan Mingguan",
    subtitle: "Performa tujuh hari terakhir",
    action: "Unduh Excel",
  },
  {
    title: "Laporan Bulanan",
    subtitle: "Analisis pemasukan dan pengeluaran bulanan",
    action: "Lihat Detail",
  },
];
