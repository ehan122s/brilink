import { supabase } from "../lib/supabase";
import { getTransactionBalanceImpact } from "../utils/transactionHelpers";

const DEFAULT_BALANCE_SETTINGS = {
  id: null,
  balanceDate: null,
  openingSaldo: 0,
  openingCash: 0,
  updatedAt: null,
};

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeBalanceDate(balanceDate) {
  return balanceDate ?? getTodayIsoDate();
}

function normalizeBalanceSettings(row, balanceDate) {
  if (!row) {
    return {
      ...DEFAULT_BALANCE_SETTINGS,
      balanceDate: normalizeBalanceDate(balanceDate),
    };
  }

  return {
    id: row.id ?? null,
    balanceDate: row.balance_date ?? normalizeBalanceDate(balanceDate),
    openingSaldo: Number(row.opening_saldo) || 0,
    openingCash: Number(row.opening_cash) || 0,
    updatedAt: row.updated_at ?? null,
  };
}

export async function fetchBalanceSettings(balanceDate) {
  const normalizedDate = normalizeBalanceDate(balanceDate);
  const { data, error } = await supabase
    .from("balance_settings")
    .select("id, balance_date, opening_saldo, opening_cash, updated_at")
    .eq("balance_date", normalizedDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeBalanceSettings(data, normalizedDate);
}

export async function saveBalanceSettings(payload) {
  const normalizedDate = normalizeBalanceDate(payload.balanceDate);
  const { data, error } = await supabase
    .from("balance_settings")
    .upsert(
      {
        balance_date: normalizedDate,
        opening_saldo: payload.openingSaldo,
        opening_cash: payload.openingCash,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "balance_date",
      },
    )
    .select("id, balance_date, opening_saldo, opening_cash, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeBalanceSettings(data, normalizedDate);
}

export function calculateAvailableBalances(rows, settings) {
  const openingSaldo = Number(settings?.openingSaldo) || 0;
  const openingCash = Number(settings?.openingCash) || 0;

  return rows.reduce(
    (current, row) => {
      const { saldoDelta, cashDelta } = getTransactionBalanceImpact(row);

      return {
        openingSaldo,
        openingCash,
        saldoAvailable: current.saldoAvailable + saldoDelta,
        cashAvailable: current.cashAvailable + cashDelta,
      };
    },
    {
      openingSaldo,
      openingCash,
      saldoAvailable: openingSaldo,
      cashAvailable: openingCash,
    },
  );
}
