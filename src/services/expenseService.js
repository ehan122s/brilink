import { supabase } from "../lib/supabase";
import { formatCurrency, formatDisplayDate } from "../utils/transactionHelpers";

function normalizeExpense(row) {
  const amount = Number(row.amount) || 0;
  const isoDate =
    row.expense_date ??
    new Date(row.created_at ?? Date.now()).toISOString().slice(0, 10);

  return {
    id: row.id,
    category: row.category,
    description: row.description ?? "",
    amount,
    amountLabel: formatCurrency(amount),
    isoDate,
    dateLabel: formatDisplayDate(isoDate),
    createdAt: row.created_at ?? `${isoDate}T00:00:00.000Z`,
  };
}

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, category, amount, description, expense_date, created_at")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeExpense);
}

export async function createExpense(payload) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      category: payload.category,
      amount: payload.amount,
      description: payload.description,
      expense_date: payload.expenseDate,
    })
    .select("id, category, amount, description, expense_date, created_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeExpense(data);
}

export async function updateExpense(payload) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      category: payload.category,
      amount: payload.amount,
      description: payload.description,
      expense_date: payload.expenseDate,
    })
    .eq("id", payload.id)
    .select("id, category, amount, description, expense_date, created_at")
    .single();

  if (error) {
    throw error;
  }

  return normalizeExpense(data);
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
