import { Category, Customization, DailyMenuItem, Product } from "@/data/menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(raw: any): Product {
  const hasIngredients = raw.ingredients?.length > 0;
  const hasExtraGroups = raw.extraGroups?.length > 0;

  let customization: Customization | undefined;
  if (hasIngredients || hasExtraGroups) {
    customization = {
      ingredients: hasIngredients
        ? raw.ingredients.map((i: { name: string }) => i.name)
        : undefined,
      extraGroups: hasExtraGroups
        ? raw.extraGroups.map((g: {
            name: string;
            type: "checkbox" | "radio";
            required: boolean;
            options: { name: string; price: number }[];
          }) => ({
            label: g.name,
            type: g.type,
            required: g.required,
            options: g.options.map((o) => ({
              name: o.name,
              price: Math.round(o.price / 100),
            })),
          }))
        : undefined,
    };
  }

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: Math.round(raw.price / 100),
    emoji: raw.emoji,
    available: raw.available,
    imageUrl: raw.imageUrl ?? undefined,
    customization,
  };
}

export async function getMenu(): Promise<Category[]> {
  const categories = await fetchApi<Array<{ id: string; name: string }>>(
    "/categories"
  );
  return Promise.all(
    categories.map(async (cat) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await fetchApi<any[]>(`/products?categoryId=${cat.id}`);
      return { ...cat, products: raw.map(normalizeProduct) };
    })
  );
}

export async function getDailyMenus(): Promise<DailyMenuItem[]> {
  return fetchApi<DailyMenuItem[]>("/daily-menus");
}
