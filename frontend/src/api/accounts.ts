import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export interface Account {
  id: number;
  name: string;
  type: string;
  currency: string;
  is_active: boolean;
  card_number?: string | null;
  created_at: string | null;
}

export interface AccountCreate {
  name: string;
  type: string;
  currency: string;
  card_number?: string | null;
}

export interface AccountUpdate {
  name?: string;
  type?: string;
  currency?: string;
  card_number?: string | null;
  is_active?: boolean;
}

export interface AccountBalance {
  account_id: number;
  balance_minor: number;
  currency: string;
}

export function getAccounts(): Promise<Account[]> {
  return apiGet<Account[]>("/accounts");
}

export function createAccount(data: AccountCreate): Promise<Account> {
  return apiPost<AccountCreate, Account>("/accounts", data);
}

export function updateAccount(
  id: number,
  data: AccountUpdate
): Promise<Account> {
  return apiPatch<AccountUpdate, Account>(`/accounts/${id}`, data);
}

export function deleteAccount(id: number): Promise<void> {
  return apiDelete(`/accounts/${id}`);
}

export function getAccountBalance(id: number): Promise<AccountBalance> {
  return apiGet<AccountBalance>(`/accounts/${id}/balance`);
}
