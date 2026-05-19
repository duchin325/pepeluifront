
export interface ExtraOption {
  name: string;
  price: number; // 0 = incluido
}

export interface ExtraGroup {
  label: string;
  type: "checkbox" | "radio";
  required: boolean;
  options: ExtraOption[];
}

export interface Customization {
  ingredients?: string[];   // ingredientes removibles sin costo extra
  extraGroups?: ExtraGroup[];
  hasNote?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;          // en pesos ARS
  emoji: string;
  available: boolean;
  imageUrl?: string;
  customization?: Customization;
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface DailyMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  active: boolean;
  date: string;        // "YYYY-MM-DD"
  createdAt: string;   // ISO string
}

export const LOCAL_CONFIG = {
  name: "Pepe Lui",
  whatsappNumber: "5493491580221", // formato: código país + área + número, sin +
  greeting: "¡Hola! 👋 Quiero hacer el siguiente pedido:",
};

