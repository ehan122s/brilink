import { supabase } from "../lib/supabase";
import { formatDisplayDate } from "../utils/transactionHelpers";

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, notes, total_transactions, last_transaction_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes ?? "-",
    totalTransactions: row.total_transactions ?? 0,
    lastTransaction: row.last_transaction_at
      ? formatDisplayDate(row.last_transaction_at)
      : "-",
  }));
}
