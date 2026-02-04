import { apiGet, apiPost, apiPatch, apiDelete } from "./client.ts";

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number | null;
  amount_minor: number;
  currency: string;
  dt: string;
  description: string | null;
  kind: "income" | "expense" | "transfer";
}

export interface TransactionCreate {
  account_id: number;
  to_account_id?: number | null;
  category_id?: number | null;
  amount_minor: number;
  currency: string;
  dt: string;
  description?: string | null;
  kind: "income" | "expense" | "transfer";
}

export interface TransactionUpdate {
  category_id?: number | null;
  description?: string | null;
  amount_minor?: number; // новая сумма в копейках
}

export async function getTransactions(): Promise<Transaction[]> {
  return apiGet<Transaction[]>("/transactions");
}

export async function createTransaction(
  data: TransactionCreate
): Promise<Transaction> {
  return apiPost<TransactionCreate, Transaction>("/transactions", data);
}

export async function updateTransaction(
  id: number,
  data: TransactionUpdate
): Promise<Transaction> {
  return apiPatch<TransactionUpdate, Transaction>(`/transactions/${id}`, data);
}

export async function deleteTransaction(id: number): Promise<void> {
  return apiDelete(`/transactions/${id}`);
}
