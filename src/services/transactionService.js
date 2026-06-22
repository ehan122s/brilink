import { supabase } from "../lib/supabase";
import { normalizeTransactionRows } from "../utils/transactionHelpers";

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, transaction_code, category, transaction_date, nominal, admin_fee, bank_admin_fee, total_amount, cashier, created_at",
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return normalizeTransactionRows(data ?? []);
}

export async function createTransaction(payload) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      transaction_code: payload.transactionCode,
      category: payload.category,
      transaction_date: payload.transactionDate,
      nominal: payload.nominal,
      admin_fee: payload.adminFee,
      bank_admin_fee: payload.bankAdminFee,
      cashier: payload.cashier,
    })
    .select();

  if (error) {
    throw error;
  }

  return normalizeTransactionRows(data ?? [])[0];
}

export async function updateTransaction(payload) {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      category: payload.category,
      transaction_date: payload.transactionDate,
      nominal: payload.nominal,
      admin_fee: payload.adminFee,
      bank_admin_fee: payload.bankAdminFee,
      cashier: payload.cashier,
    })
    .eq("id", payload.id)
    .select();

  if (error) {
    throw error;
  }

  return normalizeTransactionRows(data ?? [])[0];
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
