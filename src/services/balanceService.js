import { supabase } from "../lib/supabase";
import { getTransactionBalanceImpact } from "../utils/transactionHelpers";

const DEFAULT_BALANCE_SETTINGS = {
  id: null,
  openingSaldo: 0,
  openingCash: 0,
  updatedAt: null,
};

function normalizeBalanceSettings(row) {
  if (!row) {
    return DEFAULT_BALANCE_SETTINGS;
  }

  return {
    id: row.id ?? null,
    openingSaldo: Number(row.opening_saldo) || 0,
    openingCash: Number(row.opening_cash) || 0,
    updatedAt: row.updated_at ?? null,
  };
}

export async function fetchBalanceSettings() {
  const { data, error } = await supabase
    .from("balance_settings")
    .select("id, opening_saldo, opening_cash, updated_at")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeBalanceSettings(data);
}

export async function saveBalanceSettings(payload) {
  const { data, error } = await supabase
    .from("balance_settings")
    .upsert(
      {
        singleton_key: "default",
        opening_saldo: payload.openingSaldo,
        opening_cash: payload.openingCash,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "singleton_key",
      },
    )
    .select("id, opening_saldo, opening_cash, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeBalanceSettings(data);
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

