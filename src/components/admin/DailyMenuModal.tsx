"use client";
import { useEffect, useState } from "react";
import { DailyMenuItem } from "@/data/menu";

export interface DailyMenuFormData {
  emoji: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

interface Props {
  mode: "create" | "edit" | "reuse";
  initialData?: DailyMenuItem;
  onClose: () => void;
  onSave: (data: DailyMenuFormData) => void;
}

const TITLES: Record<Props["mode"], string> = {
  create: "Nuevo menú del día",
  edit: "Editar menú",
  reuse: "Reutilizar menú",
};

const CONFIRM_LABELS: Record<Props["mode"], string> = {
  create: "Crear",
  edit: "Guardar cambios",
  reuse: "Guardar como nuevo",
};

export default function DailyMenuModal({ mode, initialData, onClose, onSave }: Props) {
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "🍽️");
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [active, setActive] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isValid = name.trim() !== "" && typeof price === "number" && price > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      emoji: emoji.trim() || "🍽️",
      name: name.trim(),
      description: description.trim(),
      price: price as number,
      active,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-cream w-full max-w-md rounded-2xl flex flex-col overflow-hidden pointer-events-auto animate-scale-in shadow-2xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 flex-shrink-0">
            <h2
              className="font-bold text-charcoal text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {TITLES[mode]}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-charcoal transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Emoji */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Emoji
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-20 text-center text-3xl border border-brand-200 bg-white rounded-xl px-2 py-2 focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Nombre <span className="text-red-400 font-normal normal-case">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Milanesa de Ternera con Puré"
                className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredientes y presentación del plato"
                rows={3}
                className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Precio (ARS) <span className="text-red-400 font-normal normal-case">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-sm pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={1}
                  placeholder="0"
                  className="w-full border border-brand-200 bg-white rounded-xl pl-7 pr-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-bold text-charcoal">Activar al guardar</p>
                <p className="text-xs text-brand-500 mt-0.5">
                  Aparecerá en el menú público hoy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive((a) => !a)}
                aria-pressed={active}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  active ? "bg-brand-400" : "bg-brand-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    active ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-100 bg-white flex-shrink-0 space-y-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full bg-gold-300 hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-charcoal font-bold py-3.5 rounded-xl transition-all text-sm"
            >
              {CONFIRM_LABELS[mode]}
            </button>
            <button
              onClick={onClose}
              className="w-full text-xs text-brand-400 hover:text-brand-600 transition-colors py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
