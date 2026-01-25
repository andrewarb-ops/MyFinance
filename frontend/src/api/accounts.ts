import { apiGet, apiPost } from "./client";

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

export function getAccounts(): Promise<Account[]> {
  return apiGet("/accounts");
}

export function createAccount(data: AccountCreate): Promise<Account> {
  return apiPost("/accounts", data);
}
