"use client";
import { useEffect, useState } from "react";
import { ApiCategory, CategoryFormData } from "@/lib/admin-api";

interface Props {
  mode: "create" | "edit";
  initialData?: ApiCategory;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
}

export default function CategoryModal({ mode, initialData, onClose, onSave }: Props) {
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "🍽️");
  const [name, setName] = useState(initialData?.name ?? "");
  const [sortOrder, setSortOrder] = useState<number | "">(initialData?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isValid = name.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        emoji: emoji.trim() || "🍽️",
        name: name.trim(),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      });
    } catch {
      setError("Error al guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-cream w-full max-w-sm rounded-2xl flex flex-col overflow-hidden pointer-events-auto animate-scale-in shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 flex-shrink-0">
            <h2 className="font-bold text-charcoal text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {mode === "create" ? "Nueva categoría" : "Editar categoría"}
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
          <div className="px-6 py-5 space-y-4">
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

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

            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Nombre <span className="text-red-400 font-normal normal-case">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Pollos y Carnes"
                className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Orden
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                className="w-24 border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-100 bg-white flex-shrink-0 space-y-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="w-full bg-gold-300 hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-charcoal font-bold py-3 rounded-xl transition-all text-sm"
            >
              {saving ? "Guardando…" : mode === "create" ? "Crear" : "Guardar cambios"}
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
