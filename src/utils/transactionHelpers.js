export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDisplayTime(value) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatPercentChange(current, previous) {
  if (previous <= 0) {
    return current > 0 ? "Baru" : "0%";
  }

  const delta = ((current - previous) / previous) * 100;
  const prefix = delta >= 0 ? "+" : "";
  return `${prefix}${delta.toFixed(1)}%`;
}

export function groupTransactionsByDate(rows, days) {
  const dayMap = new Map();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const isoDate = date.toISOString().slice(0, 10);
    dayMap.set(isoDate, {
      isoDate,
      name: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
      pemasukan: 0,
      pengeluaran: 0,
    });
  }

  rows.forEach((row) => {
    if (!dayMap.has(row.isoDate)) {
      return;
    }

    const current = dayMap.get(row.isoDate);
    current.pemasukan += row.totalValue;
  });

  return [...dayMap.values()];
}

export function isSameIsoDate(left, right) {
  return String(left).slice(0, 10) === String(right).slice(0, 10);
}

export function parseCurrencyValue(value) {
  return Number.parseInt(String(value).replace(/[^\d]/g, ""), 10) || 0;
}

function getNumericAmount(...candidates) {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === "") {
      continue;
    }

    if (typeof candidate === "number") {
      return candidate;
    }

    return parseCurrencyValue(candidate);
  }

  return 0;
}

export function normalizeTransactionRow(row) {
  const isoDate =
    row.isoDate ??
    row.transaction_date ??
    (row.date === "20 Jun 2026"
      ? "2026-06-20"
      : row.date === "19 Jun 2026"
        ? "2026-06-19"
        : new Date().toISOString().slice(0, 10));

  const code = row.code ?? row.transaction_code ?? row.id ?? "TRX-0000";
  const nominalValue = getNumericAmount(row.nominalValue, row.nominal);
  const adminFeeValue = getNumericAmount(row.adminFeeValue, row.admin_fee, row.adminFee);
  const bankAdminFeeValue = getNumericAmount(
    row.bankAdminFeeValue,
    row.bank_admin_fee,
    row.bankAdminFee,
  );
  const totalValue = getNumericAmount(
    row.totalValue,
    row.total_amount,
    row.total,
  ) || nominalValue + adminFeeValue;
  const netAdminValue =
    getNumericAmount(row.netAdminValue, row.netAdmin) || adminFeeValue - bankAdminFeeValue;

  return {
    id: row.id ?? code,
    code,
    category: row.category,
    nominal: formatCurrency(nominalValue),
    adminFee: formatCurrency(adminFeeValue),
    bankAdminFee: formatCurrency(bankAdminFeeValue),
    netAdmin: formatCurrency(netAdminValue),
    total: formatCurrency(totalValue),
    date: formatDisplayDate(isoDate),
    createdAt: row.created_at ?? row.createdAt ?? `${isoDate}T00:00:00.000Z`,
    cashier: row.cashier,
    nominalValue,
    adminFeeValue,
    bankAdminFeeValue,
    netAdminValue,
    totalValue,
    isoDate,
  };
}

export function normalizeTransactionRows(rows) {
  return rows.map(normalizeTransactionRow);
}

export function getNextTransactionCode(rows) {
  const maxCode = rows.reduce((maxValue, row) => {
    const numericCode = Number.parseInt(String(row.code).replace(/[^\d]/g, ""), 10);
    return Number.isNaN(numericCode) ? maxValue : Math.max(maxValue, numericCode);
  }, 1031);

  return `TRX-${maxCode + 1}`;
}

export function getTransactionBalanceImpact(row) {
  const nominalValue = getNumericAmount(row.nominalValue, row.nominal);
  const adminFeeValue = getNumericAmount(row.adminFeeValue, row.admin_fee, row.adminFee);
  const bankAdminFeeValue = getNumericAmount(
    row.bankAdminFeeValue,
    row.bank_admin_fee,
    row.bankAdminFee,
  );

  if (row.category === "Tarik tunai") {
    return {
      saldoDelta: nominalValue - bankAdminFeeValue,
      cashDelta: adminFeeValue - nominalValue,
    };
  }

  return {
    saldoDelta: -(nominalValue + bankAdminFeeValue),
    cashDelta: nominalValue + adminFeeValue,
  };
}
