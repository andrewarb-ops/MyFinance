// frontend/src/api/categories.ts
import { apiGet, apiPost, apiDelete } from "./client";

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  parent_id: number | null;
  is_active: boolean;
}

export interface CategoryCreate {
  name: string;
  type: "income" | "expense";
  parent_id?: number | null;
}

export interface CategoryUpdate {
  name?: string;
  type?: "income" | "expense";
  parent_id?: number | null;
  is_active?: boolean;
}

// Параметр options опциональный, старые вызовы getCategories() не ломаем
export async function getCategories(
  options?: { type?: "income" | "expense" }
): Promise<Category[]> {
  const query = options?.type ? `?type=${options.type}` : "";
  const data = await apiGet<Category[]>(`/categories${query}`);
  return data;
}

export async function createCategory(
  data: CategoryCreate
): Promise<Category> {
  const res = await apiPost<CategoryCreate, Category>("/categories", data);
  return res;
}

export async function updateCategory(
  id: number,
  data: CategoryUpdate
): Promise<Category> {
  // если на бэке PATCH, лучше использовать apiPatch, но я оставляю твой POST-variant
  const res = await apiPost<CategoryUpdate, Category>(`/categories/${id}`, data);
  return res;
}

export async function deleteCategory(
  id: number
): Promise<{ success: boolean }> {
  await apiDelete(`/categories/${id}`);
  return { success: true };
}
