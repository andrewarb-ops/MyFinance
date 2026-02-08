import { apiPost } from "./client";

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export async function login(credentials: AuthCredentials): Promise<AuthTokenResponse> {
  return apiPost<AuthCredentials, AuthTokenResponse>("/auth/login", credentials);
}

export async function register(credentials: AuthCredentials): Promise<void> {
  await apiPost<AuthCredentials, unknown>("/auth/register", credentials);
}
