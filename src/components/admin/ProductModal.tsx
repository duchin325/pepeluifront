"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AdminProduct,
  ApiCategory,
  ExtraGroupFormData,
  ProductFormData,
} from "@/lib/admin-api";
import { uploadImage } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/whatsapp";

interface Props {
  mode: "create" | "edit";
  initialData?: AdminProduct;
  categories: ApiCategory[];
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}

export default function ProductModal({ mode, initialData, categories, onClose, onSave }: Props) {
  // Basic fields
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "🍽️");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [sortOrder, setSortOrder] = useState<number | "">(initialData?.sortOrder ?? 0);

  // Image
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  // Ingredients
  const [ingredients, setIngredients] = useState<string[]>(
    initialData?.ingredients?.map((i) => i.name) ?? []
  );
  const [ingredientInput, setIngredientInput] = useState("");

  // Extra groups
  const [extraGroups, setExtraGroups] = useState<ExtraGroupFormData[]>(
    initialData?.extraGroups?.map((g) => ({
      name: g.name,
      type: g.type,
      required: g.required,
      options: g.options.map((o) => ({ name: o.name, price: o.price })),
    })) ?? []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    name.trim() !== "" &&
    typeof price === "number" &&
    price > 0 &&
    categoryId !== "";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Image ───────────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Ingredients ─────────────────────────────────────────────────────────────

  const addIngredient = () => {
    const val = ingredientInput.trim();
    if (!val || ingredients.includes(val)) return;
    setIngredients((prev) => [...prev, val]);
    setIngredientInput("");
  };

  const removeIngredient = (name: string) => {
    setIngredients((prev) => prev.filter((i) => i !== name));
  };

  // ── Extra groups ─────────────────────────────────────────────────────────────

  const addExtraGroup = () => {
    setExtraGroups((prev) => [
      ...prev,
      { name: "", type: "checkbox", required: false, options: [] },
    ]);
  };

  const removeExtraGroup = (idx: number) => {
    setExtraGroups((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateExtraGroup = (idx: number, patch: Partial<ExtraGroupFormData>) => {
    setExtraGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, ...patch } : g))
    );
  };

  const addOption = (groupIdx: number) => {
    setExtraGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, options: [...g.options, { name: "", price: 0 }] }
          : g
      )
    );
  };

  const removeOption = (groupIdx: number, optIdx: number) => {
    setExtraGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, options: g.options.filter((_, j) => j !== optIdx) }
          : g
      )
    );
  };

  const updateOption = (
    groupIdx: number,
    optIdx: number,
    patch: { name?: string; price?: number }
  ) => {
    setExtraGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              options: g.options.map((o, j) =>
                j === optIdx ? { ...o, ...patch } : o
              ),
            }
          : g
      )
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);

    let imageUrl: string | undefined = initialData?.imageUrl ?? undefined;

    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(imageFile);
      } catch {
        setError("Error al subir la imagen. Intentá de nuevo.");
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        emoji: emoji.trim() || "🍽️",
        price: price as number,
        categoryId,
        available,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        imageUrl,
        ingredients: ingredients.map((n) => ({ name: n })),
        extraGroups,
      });
    } catch {
      setError("Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="bg-cream w-full max-w-lg rounded-2xl flex flex-col overflow-hidden pointer-events-auto animate-scale-in shadow-2xl max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 flex-shrink-0">
            <h2 className="font-bold text-charcoal text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {mode === "create" ? "Nuevo producto" : "Editar producto"}
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
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* ── Imagen ────────────────────────────────────────────────────── */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-2">
                Imagen
              </label>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Vista previa" fill className="object-cover" sizes="96px" unoptimized={imagePreview.startsWith("blob:")} />
                  ) : (
                    <span className="text-3xl select-none">{emoji || "🍽️"}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs font-bold border border-brand-200 text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-xl transition-colors"
                  >
                    {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="block text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Quitar imagen
                    </button>
                  )}
                  <p className="text-xs text-brand-400">JPG, PNG o WebP. Máx 5 MB.</p>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* ── Emoji y nombre ────────────────────────────────────────────── */}
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div>
                <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                  Emoji
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="w-full text-center text-2xl border border-brand-200 bg-white rounded-xl px-2 py-2 focus:outline-none focus:border-brand-400"
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
                  placeholder="Ej: Pollo Entero al Horno"
                  className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>

            {/* ── Descripción ──────────────────────────────────────────────── */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredientes y presentación"
                rows={2}
                className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400 resize-none"
              />
            </div>

            {/* ── Precio y categoría ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                  Precio (ARS) <span className="text-red-400 font-normal normal-case">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-sm pointer-events-none">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    min={1}
                    placeholder="0"
                    className="w-full border border-brand-200 bg-white rounded-xl pl-7 pr-3 py-2.5 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
                  />
                </div>
                {typeof price === "number" && price > 0 && (
                  <p className="text-xs text-brand-400 mt-1">${formatPrice(price)}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                  Categoría <span className="text-red-400 font-normal normal-case">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-brand-400"
                >
                  <option value="">Seleccioná…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Orden y disponibilidad ───────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-1.5">
                  Orden
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
                  min={0}
                  className="w-20 border border-brand-200 bg-white rounded-xl px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-brand-400"
                />
              </div>

              <div className="flex items-center justify-between flex-1 py-1">
                <div>
                  <p className="text-sm font-bold text-charcoal">Disponible</p>
                  <p className="text-xs text-brand-500">Visible en el menú público</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable((a) => !a)}
                  aria-pressed={available}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${available ? "bg-brand-400" : "bg-brand-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${available ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* ── Ingredientes removibles ──────────────────────────────────── */}
            <div>
              <label className="text-xs font-bold text-charcoal uppercase tracking-wide block mb-2">
                Ingredientes removibles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                  placeholder="Ej: Tomate"
                  className="flex-1 border border-brand-200 bg-white rounded-xl px-3 py-2 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Agregar
                </button>
              </div>
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing)}
                        className="text-brand-400 hover:text-brand-700 leading-none ml-0.5"
                        aria-label={`Quitar ${ing}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Grupos de extras ─────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wide">
                  Grupos de extras
                </label>
                <button
                  type="button"
                  onClick={addExtraGroup}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  + Agregar grupo
                </button>
              </div>

              <div className="space-y-4">
                {extraGroups.map((group, gi) => (
                  <div key={gi} className="bg-white border border-brand-100 rounded-xl p-4 space-y-3">
                    {/* Group header */}
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateExtraGroup(gi, { name: e.target.value })}
                        placeholder="Nombre del grupo (ej: Guarnición)"
                        className="flex-1 border border-brand-200 bg-brand-50 rounded-lg px-3 py-2 text-sm text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraGroup(gi)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none px-1 py-1 flex-shrink-0"
                        aria-label="Eliminar grupo"
                      >
                        ×
                      </button>
                    </div>

                    {/* Group options row */}
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${gi}`}
                          checked={group.type === "radio"}
                          onChange={() => updateExtraGroup(gi, { type: "radio" })}
                          className="accent-brand-400"
                        />
                        Selección única
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name={`type-${gi}`}
                          checked={group.type === "checkbox"}
                          onChange={() => updateExtraGroup(gi, { type: "checkbox" })}
                          className="accent-brand-400"
                        />
                        Múltiple
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                        <input
                          type="checkbox"
                          checked={group.required}
                          onChange={(e) => updateExtraGroup(gi, { required: e.target.checked })}
                          className="accent-brand-400"
                        />
                        Requerido
                      </label>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {group.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(gi, oi, { name: e.target.value })}
                            placeholder="Opción (ej: Papas fritas)"
                            className="flex-1 border border-brand-100 rounded-lg px-2.5 py-1.5 text-xs text-charcoal placeholder:text-brand-300 focus:outline-none focus:border-brand-300 bg-brand-50"
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gold-500 text-xs pointer-events-none">$</span>
                            <input
                              type="number"
                              value={opt.price}
                              onChange={(e) => updateOption(gi, oi, { price: Number(e.target.value) })}
                              min={0}
                              className="w-full border border-brand-100 rounded-lg pl-6 pr-2 py-1.5 text-xs text-charcoal focus:outline-none focus:border-brand-300 bg-brand-50"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(gi, oi)}
                            className="text-red-400 hover:text-red-600 text-base leading-none flex-shrink-0"
                            aria-label="Quitar opción"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(gi)}
                        className="text-xs text-brand-500 hover:text-brand-700 transition-colors"
                      >
                        + Agregar opción
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-100 bg-white flex-shrink-0 space-y-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="w-full bg-gold-300 hover:bg-gold-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-charcoal font-bold py-3.5 rounded-xl transition-all text-sm"
            >
              {uploading ? "Subiendo imagen…" : saving ? "Guardando…" : mode === "create" ? "Crear producto" : "Guardar cambios"}
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
