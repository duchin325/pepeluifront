"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { LOCAL_CONFIG } from "@/data/menu";

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const [count, setCount] = useState(0);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    const unsub = useCart.subscribe((state) => {
      const newCount = state.totalItems();
      if (newCount > count) {
        setBumping(true);
        setTimeout(() => setBumping(false), 300);
      }
      setCount(newCount);
    });
    setCount(totalItems());
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3">

        {/* Logo + nombre */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Logo Pepe Lui"
              fill
              className="object-cover rounded-full ring-2 ring-brand-200"
              sizes="48px"
              priority
            />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-charcoal leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {LOCAL_CONFIG.name}
            </h1>
            <p className="text-xs text-brand-500 hidden sm:block">
              Pedí por WhatsApp · Entrega y retiro
            </p>
          </div>
        </div>

        {/* Botón carrito */}
        <button
          onClick={toggleCart}
          aria-label={`Ver carrito — ${count} ítems`}
          className="relative flex items-center gap-2 bg-brand-400 hover:bg-brand-500 active:scale-95 text-white px-4 py-2 rounded-xl transition-all text-sm font-bold flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14M10 19a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          <span className="hidden sm:inline">Mi pedido</span>
          {count > 0 && (
            <span
              className={`w-5 h-5 rounded-full bg-gold-300 text-charcoal text-xs font-bold flex items-center justify-center ${
                bumping ? "animate-count-bump" : ""
              }`}
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
