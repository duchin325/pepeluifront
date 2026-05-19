"use client";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/data/menu";
import { CartItemCustomization, useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";
import CustomizationModal from "./CustomizationModal";

interface Props { product: Product; }

const EMPTY_CUSTOMIZATION: CartItemCustomization = {
  removedIngredients: [],
  selectedExtras: [],
  note: "",
};

export default function ProductCard({ product }: Props) {
  const { addItem, items } = useCart();
  const [bumping, setBumping] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const inCartQuantity = items
    .filter((i) => i.product.id === product.id)
    .reduce((acc, i) => acc + i.quantity, 0);

  const bump = () => {
    setBumping(true);
    setTimeout(() => setBumping(false), 300);
  };

  const handleAdd = () => {
    if (!product.available) return;
    if (product.customization) {
      setModalOpen(true);
    } else {
      addItem(product, EMPTY_CUSTOMIZATION, 1);
      bump();
    }
  };

  const handleModalConfirm = (customization: CartItemCustomization, quantity: number) => {
    addItem(product, customization, quantity);
    setModalOpen(false);
    bump();
  };

  return (
    <>
      <div
        className={`product-card relative bg-white rounded-2xl border border-brand-100 flex flex-col overflow-hidden transition-shadow hover:shadow-md hover:shadow-brand-100 ${
          !product.available ? "opacity-60" : ""
        }`}
      >
        {/* Imagen o emoji placeholder */}
        <div className="relative h-32 bg-brand-50 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <span className="text-5xl select-none">{product.emoji}</span>
          )}
        </div>

        {!product.available && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-brand-700 text-brand-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Agotado
          </span>
        )}

        {product.customization && product.available && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
            ✎ personalizable
          </span>
        )}

        <div className="p-4 flex flex-col flex-1 gap-1">
          <h3 className="font-bold text-charcoal text-sm leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-brand-600 leading-relaxed flex-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span
              className="font-bold text-charcoal text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-gold-500 text-sm font-bold mr-0.5">$</span>
              {formatPrice(product.price)}
            </span>

            {inCartQuantity > 0 ? (
              <span
                className={`text-xs font-bold bg-brand-400 text-white px-3 py-1.5 rounded-xl ${
                  bumping ? "animate-count-bump" : ""
                }`}
                style={{ minWidth: 60, textAlign: "center" }}
              >
                {inCartQuantity} en carrito
              </span>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!product.available}
                className="text-xs font-bold bg-gold-300 hover:bg-gold-400 active:scale-95 disabled:cursor-not-allowed text-charcoal px-3 py-1.5 rounded-xl transition-all"
              >
                + Agregar
              </button>
            )}
          </div>

          {inCartQuantity > 0 && (
            <button
              onClick={handleAdd}
              className="mt-1 text-xs text-brand-400 hover:text-brand-600 transition-colors text-left"
            >
              + Agregar otro
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <CustomizationModal
          product={product}
          onClose={() => setModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
}
