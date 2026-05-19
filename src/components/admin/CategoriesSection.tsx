"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ApiCategory,
  CategoryFormData,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/admin-api";
import CategoryModal from "./CategoryModal";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalData, setModalData] = useState<ApiCategory | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setModalMode("create");
    setModalData(undefined);
    setModalOpen(true);
  };

  const openEdit = (cat: ApiCategory) => {
    setModalMode("edit");
    setModalData(cat);
    setModalOpen(true);
  };

  const handleSave = async (data: CategoryFormData) => {
    if (modalMode === "edit" && modalData) {
      await updateCategory(modalData.id, data);
    } else {
      await createCategory(data);
    }
    setModalOpen(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteCategory(id);
      setDeleteConfirmId(null);
      await load();
    } catch {
      setError("Error al eliminar la categoría.");
      setDeleteConfirmId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>
          Categorías
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-gold-300 hover:bg-gold-400 active:scale-[0.97] text-charcoal font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
        >
          <span className="text-base leading-none">+</span>
          Nueva categoría
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-brand-400 py-8">Cargando…</p>
      ) : categories.length === 0 ? (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 text-center">
          <p className="text-sm text-brand-500">No hay categorías aún.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden divide-y divide-brand-50">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors">
              <span className="text-2xl select-none flex-shrink-0">{cat.emoji}</span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">{cat.name}</p>
                <p className="text-xs text-brand-400">
                  Orden: {cat.sortOrder}
                  {" · "}
                  <span className={cat.active ? "text-green-600" : "text-red-400"}>
                    {cat.active ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>

              {deleteConfirmId === cat.id ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-xs font-bold border border-brand-200 text-brand-500 hover:bg-brand-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-xs font-bold border border-brand-200 text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          mode={modalMode}
          initialData={modalData}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
