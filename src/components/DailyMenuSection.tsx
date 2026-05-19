"use client";
import { useState } from "react";
import { DailyMenuItem, Product } from "@/data/menu";
import { CartItemCustomization, useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";

const EMPTY_CUSTOMIZATION: CartItemCustomization = {
  removedIngredients: [],
  selectedExtras: [],
  note: "",
};

function getLocalToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toProduct(item: DailyMenuItem): Product {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    emoji: item.emoji,
    available: true,
  };
}

function DailyCard({ item }: { item: DailyMenuItem }) {
  const { addItem, items } = useCart();
  const [bumping, setBumping] = useState(false);

  const inCartQuantity = items
    .filter((i) => i.product.id === item.id)
    .reduce((acc, i) => acc + i.quantity, 0);

  const handleAdd = () => {
    addItem(toProduct(item), EMPTY_CUSTOMIZATION, 1);
    setBumping(true);
    setTimeout(() => setBumping(false), 300);
  };

  return (
    <div className="flex-1 bg-white border border-gold-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:shadow-gold-200 transition-shadow">
      <span className="self-start inline-flex items-center gap-1.5 text-xs font-medium bg-gold-100 text-gold-700 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 inline-block" />
        Disponible solo hoy
      </span>

      <div className="flex items-start gap-4">
        <span className="text-5xl select-none flex-shrink-0">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-charcoal text-base leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {item.name}
          </h3>
          <p className="text-xs text-gold-700 mt-1 leading-relaxed">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span
          className="font-bold text-charcoal text-xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-gold-500 text-sm font-bold mr-0.5">$</span>
          {formatPrice(item.price)}
        </span>

        {inCartQuantity > 0 ? (
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={`text-xs font-bold bg-brand-400 text-white px-3 py-1.5 rounded-xl ${
                bumping ? "animate-count-bump" : ""
              }`}
              style={{ minWidth: 60, textAlign: "center" }}
            >
              {inCartQuantity} en carrito
            </span>
            <button
              onClick={handleAdd}
              className="text-xs text-gold-600 hover:text-gold-800 transition-colors"
            >
              + Agregar otro
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="text-xs font-bold bg-brand-400 hover:bg-brand-500 active:scale-95 text-white px-4 py-2 rounded-xl transition-all"
          >
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  dailyMenus: DailyMenuItem[];
}

export default function DailyMenuSection({ dailyMenus }: Props) {
  const today = getLocalToday();
  const activeMenus = dailyMenus.filter((m) => m.date === today && m.active);

  if (activeMenus.length === 0) return null;

  return (
    <section className="rounded-2xl bg-gold-50 border border-gold-200 p-5 sm:p-6 overflow-hidden relative">
      <span
        className="absolute -right-4 -top-4 text-8xl select-none pointer-events-none opacity-20"
        aria-hidden="true"
      >
        ☀️
      </span>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">HOY</span>
        </div>
        <h2
          className="text-2xl font-bold text-charcoal"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Menú del Día
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        {activeMenus.map((item) => (
          <DailyCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
