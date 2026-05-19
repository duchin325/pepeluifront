// src/hooks/useCart.ts
import { create } from "zustand";
import { Product } from "@/data/menu";

export interface SelectedExtra {
  name: string;
  price: number;
}

export interface CartItemCustomization {
  removedIngredients: string[];
  selectedExtras: SelectedExtra[];
  note: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customization: CartItemCustomization;
  cartItemUnitPrice: number; // base price + sum of selected extras
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, customization: CartItemCustomization, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, customization, quantity) => {
    const extrasTotal = customization.selectedExtras.reduce((acc, e) => acc + e.price, 0);
    const cartItemUnitPrice = product.price + extrasTotal;
    const newItem: CartItem = {
      cartItemId: generateId(),
      product,
      quantity,
      customization,
      cartItemUnitPrice,
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((acc, i) => acc + i.cartItemUnitPrice * i.quantity, 0),
}));
