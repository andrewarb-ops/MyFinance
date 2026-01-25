import { apiGet, apiPost } from "./client";

export interface Account {
  id: number;
  name: string;
  type: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface AccountCreate {
  name: string;
  type: string;
  currency: string;
}

export function getAccounts(): Promise<Account[]> {
  return apiGet<Account[]>("/accounts");
}

export function createAccount(data: AccountCreate): Promise<Account> {
  return apiPost<AccountCreate, Account>("/accounts", data);
}
