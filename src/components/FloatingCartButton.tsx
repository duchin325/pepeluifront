"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";

export default function FloatingCartButton() {
  const { totalItems, totalPrice, isOpen, openCart } = useCart();
  const [count, setCount] = useState(0);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const unsub = useCart.subscribe((state) => {
      setCount(state.totalItems());
      setPrice(state.totalPrice());
    });
    setCount(totalItems());
    setPrice(totalPrice());
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (count === 0 || isOpen) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 sm:hidden">
      <button
        onClick={openCart}
        className="flex items-center gap-3 bg-charcoal text-white px-5 py-3.5 rounded-2xl shadow-xl active:scale-95 transition-transform"
        style={{ animation: "fade-in 0.3s ease" }}
      >
        <span className="w-6 h-6 rounded-full bg-gold-300 text-charcoal text-xs font-bold flex items-center justify-center">
          {count}
        </span>
        <span className="text-sm font-bold">Ver pedido</span>
        <span className="text-sm font-bold text-brand-300">
          ${formatPrice(price)}
        </span>
      </button>
    </div>
  );
}
