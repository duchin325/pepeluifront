"use client";
import { useEffect, useMemo, useState } from "react";
import { Product } from "@/data/menu";
import { CartItemCustomization, SelectedExtra } from "@/hooks/useCart";
import { formatPrice } from "@/lib/whatsapp";

interface Props {
  product: Product;
  onClose: () => void;
  onConfirm: (customization: CartItemCustomization, quantity: number) => void;
}

export default function CustomizationModal({ product, onClose, onConfirm }: Props) {
  const { customization } = product;

  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
  const [radioSelections, setRadioSelections] = useState<Record<number, string>>({});
  const [checkboxSelections, setCheckboxSelections] = useState<Record<number, Set<string>>>({});
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) next.delete(ingredient);
      else next.add(ingredient);
      return next;
    });
  };

  const toggleCheckbox = (groupIdx: number, optionName: string) => {
    setCheckboxSelections((prev) => {
      const current = new Set(prev[groupIdx] ?? []);
      if (current.has(optionName)) current.delete(optionName);
      else current.add(optionName);
      return { ...prev, [groupIdx]: current };
    });
  };

  const selectedExtras = useMemo((): SelectedExtra[] => {
    const extras: SelectedExtra[] = [];
    customization?.extraGroups?.forEach((group, idx) => {
      if (group.type === "radio") {
        const selected = radioSelections[idx];
        if (selected) {
          const option = group.options.find((o) => o.name === selected);
          if (option) extras.push({ name: option.name, price: option.price });
        }
      } else {
        const selected = checkboxSelections[idx] ?? new Set<string>();
        group.options.forEach((option) => {
          if (selected.has(option.name)) extras.push({ name: option.name, price: option.price });
        });
      }
    });
    return extras;
  }, [radioSelections, checkboxSelections, customization?.extraGroups]);

  const unitPrice = product.price + selectedExtras.reduce((acc, e) => acc + e.price, 0);
  const totalPrice = unitPrice * quantity;

  const isValid = !customization?.extraGroups?.some(
    (group, idx) => group.required && group.type === "radio" && !radioSelections[idx]
  );

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(
      { removedIngredients: Array.from(removedIngredients), selectedExtras, note: note.trim() },
      quantity
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, centered modal on desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none">
        <div
          className="bg-cream w-full md:max-w-lg rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden pointer-events-auto animate-slide-up md:animate-scale-in shadow-2xl"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile only) */}
          <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-brand-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-brand-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-4xl select-none">{product.emoji}</span>
              <div>
                <h2
                  className="font-bold text-charcoal text-lg leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {product.name}
                </h2>
                <p className="text-xs text-brand-600 mt-0.5">{product.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-charcoal transition-colors flex-shrink-0 ml-2 mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Removable ingredients */}
            {customization?.ingredients && customization.ingredients.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-charcoal mb-1">Ingredientes</h3>
                <p className="text-xs text-brand-500 mb-3">Tocá para quitar</p>
                <div className="flex flex-wrap gap-2">
                  {customization.ingredients.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => toggleIngredient(ingredient)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        removedIngredients.has(ingredient)
                          ? "bg-red-50 border-red-300 text-red-400 line-through opacity-70"
                          : "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
                      }`}
                    >
                      {ingredient}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Extra groups */}
            {customization?.extraGroups?.map((group, groupIdx) => (
              <section key={groupIdx}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-charcoal">{group.label}</h3>
                  {group.required && (
                    <span className="text-xs font-medium bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                      Requerido
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isSelected =
                      group.type === "radio"
                        ? radioSelections[groupIdx] === option.name
                        : (checkboxSelections[groupIdx] ?? new Set<string>()).has(option.name);

                    return (
                      <label
                        key={option.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-brand-50 border-brand-400"
                            : "bg-white border-brand-100 hover:border-brand-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={group.type}
                            name={`group-${groupIdx}`}
                            checked={isSelected}
                            onChange={() => {
                              if (group.type === "radio") {
                                setRadioSelections((prev) => ({ ...prev, [groupIdx]: option.name }));
                              } else {
                                toggleCheckbox(groupIdx, option.name);
                              }
                            }}
                            className="accent-brand-400 w-4 h-4 flex-shrink-0"
                          />
                          <span className="text-sm text-charcoal">{option.name}</span>
                        </div>
                        <span className="text-xs font-medium text-brand-600 ml-2">
                          {option.price === 0 ? "Incluido" : `+$${formatPrice(option.price)}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Free-text note */}
            {customization?.hasNote && (
              <section>
                <h3 className="text-sm font-bold text-charcoal mb-2">Aclaraciones</h3>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: sin sal, bien cocido, término medio…"
                  maxLength={200}
                  rows={3}
                  className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400 resize-none"
                />
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-100 bg-white flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full border border-brand-200 text-brand-500 hover:bg-brand-50 flex items-center justify-center text-xl leading-none transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-full bg-brand-400 hover:bg-brand-500 text-white flex items-center justify-center text-xl leading-none transition-colors"
                >
                  +
                </button>
              </div>

              {/* Running total */}
              <div className="text-right">
                <p className="text-xs text-brand-500">Total</p>
                <p
                  className="text-xl font-bold text-charcoal"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="text-gold-500 text-sm font-bold mr-0.5">$</span>
                  {formatPrice(totalPrice)}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="w-full bg-gold-300 hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-charcoal font-bold py-4 rounded-2xl transition-all text-sm"
            >
              Agregar al carrito
            </button>

            {!isValid && (
              <p className="text-xs text-center text-red-400">
                Por favor, completá las opciones requeridas
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
