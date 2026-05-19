import { DailyMenuItem } from "@/data/menu";
import { DailyMenuFormData } from "@/components/admin/DailyMenuModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ── Shared helpers ────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem("auth_token") ?? "";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginAdmin(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Credenciales incorrectas");
  const data = await res.json();
  localStorage.setItem("auth_token", data.access_token);
}

// ── Daily menus ───────────────────────────────────────────────────────────────

export async function getDailyMenusAll(): Promise<DailyMenuItem[]> {
  return fetchAdmin<DailyMenuItem[]>("/daily-menus/all");
}

export async function createDailyMenu(data: DailyMenuFormData): Promise<DailyMenuItem> {
  return fetchAdmin<DailyMenuItem>("/daily-menus", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDailyMenu(
  id: string,
  data: DailyMenuFormData
): Promise<DailyMenuItem> {
  return fetchAdmin<DailyMenuItem>(`/daily-menus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function activateDailyMenu(id: string): Promise<DailyMenuItem> {
  return fetchAdmin<DailyMenuItem>(`/daily-menus/${id}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateDailyMenu(id: string): Promise<DailyMenuItem> {
  return fetchAdmin<DailyMenuItem>(`/daily-menus/${id}/deactivate`, {
    method: "PATCH",
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  emoji: string;
  sortOrder: number;
}

export async function getCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function createCategory(data: CategoryFormData): Promise<ApiCategory> {
  return fetchAdmin<ApiCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ApiCategory> {
  return fetchAdmin<ApiCategory>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchAdmin<unknown>(`/categories/${id}`, { method: "DELETE" });
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ApiExtraOption {
  id: string;
  name: string;
  price: number;   // in pesos (normalized from centavos)
  sortOrder: number;
}

export interface ApiExtraGroup {
  id: string;
  name: string;
  type: "checkbox" | "radio";
  required: boolean;
  sortOrder: number;
  options: ApiExtraOption[];
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;         // in pesos (normalized from centavos)
  emoji: string;
  available: boolean;
  sortOrder: number;
  imageUrl: string | null;
  categoryId: string;
  ingredients: { id: string; name: string }[];
  extraGroups: ApiExtraGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ExtraOptionFormData {
  name: string;
  price: number;  // in pesos
}

export interface ExtraGroupFormData {
  name: string;
  type: "checkbox" | "radio";
  required: boolean;
  options: ExtraOptionFormData[];
}

export interface ProductFormData {
  name: string;
  description: string;
  emoji: string;
  price: number;         // in pesos (will be sent as centavos ×100)
  categoryId: string;
  available: boolean;
  sortOrder: number;
  imageUrl?: string;
  ingredients: { name: string }[];
  extraGroups: ExtraGroupFormData[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAdminProduct(raw: any): AdminProduct {
  return {
    ...raw,
    price: Math.round(raw.price / 100),
    imageUrl: raw.imageUrl ?? null,
    extraGroups: (raw.extraGroups ?? []).map((g: ApiExtraGroup & { options: Array<{price: number} & ApiExtraOption> }) => ({
      ...g,
      options: g.options.map((o) => ({ ...o, price: Math.round(o.price / 100) })),
    })),
  };
}

export async function getProducts(categoryId?: string): Promise<AdminProduct[]> {
  const qs = categoryId ? `?categoryId=${categoryId}` : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await fetchAdmin<any[]>(`/products${qs}`);
  return raw.map(normalizeAdminProduct);
}

export async function createProduct(data: ProductFormData): Promise<AdminProduct> {
  const payload = {
    ...data,
    price: data.price * 100,
    extraGroups: data.extraGroups.map((g) => ({
      ...g,
      options: g.options.map((o) => ({ ...o, price: o.price * 100 })),
    })),
  };
  const raw = await fetchAdmin<unknown>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeAdminProduct(raw);
}

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<AdminProduct> {
  const payload = {
    ...data,
    price: data.price * 100,
    extraGroups: data.extraGroups.map((g) => ({
      ...g,
      options: g.options.map((o) => ({ ...o, price: o.price * 100 })),
    })),
  };
  const raw = await fetchAdmin<unknown>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeAdminProduct(raw);
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchAdmin<unknown>(`/products/${id}`, { method: "DELETE" });
}
