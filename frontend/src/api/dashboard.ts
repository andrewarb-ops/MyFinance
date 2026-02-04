// frontend/src/api/dashboard.ts
import { apiGet } from "./client";

export type PeriodType = "day" | "week" | "month" | "quarter" | "year";

export interface DashboardSummary {
  period: PeriodType;
  date_from: string; // ISO yyyy-mm-dd
  date_to: string;
  net_flow_minor: number;
  income_minor: number;
  expense_minor: number;
  accounts_balance_minor: number;
  currency: string;
}

export interface DashboardTrendPoint {
  label: string;
  income_minor: number;
  expense_minor: number;
}

export interface DashboardTrends {
  period: PeriodType;
  date_from: string;
  date_to: string;
  points: DashboardTrendPoint[];
  currency: string;
}

export interface DashboardCategoryItem {
  category_id: number;
  name: string;
  amount_minor: number;
  share: number; // 0.27 == 27%
}

export interface DashboardCategories {
  period: PeriodType;
  date_from: string;
  date_to: string;
  total_expense_minor: number;
  currency: string;
  categories: DashboardCategoryItem[];
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function getDashboardSummary(
  period: PeriodType,
  baseDate: string,
  currency = "RUB"
): Promise<DashboardSummary> {
  const qs = buildQuery({ period, base_date: baseDate, currency });
  return apiGet<DashboardSummary>(`/dashboard/summary${qs}`);
}

export async function getDashboardTrends(
  period: PeriodType,
  baseDate: string,
  currency = "RUB"
): Promise<DashboardTrends> {
  const qs = buildQuery({ period, base_date: baseDate, currency });
  return apiGet<DashboardTrends>(`/dashboard/trends${qs}`);
}

export async function getDashboardCategories(
  period: PeriodType,
  baseDate: string,
  limit = 5,
  currency = "RUB"
): Promise<DashboardCategories> {
  const qs = buildQuery({ period, base_date: baseDate, limit, currency });
  return apiGet<DashboardCategories>(`/dashboard/categories${qs}`);
}
