"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  AdminProduct,
  ApiCategory,
  ProductFormData,
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/whatsapp";
import ProductModal from "./ProductModal";

export default function ProductsSection() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalData, setModalData] = useState<AdminProduct | undefined>(undefined);

  const load = useCallback(async (catId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts(catId || undefined),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      setError("Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterCategoryId || undefined); }, [load, filterCategoryId]);

  const openCreate = () => {
    setModalMode("create");
    setModalData(undefined);
    setModalOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setModalMode("edit");
    setModalData(product);
    setModalOpen(true);
  };

  const handleSave = async (data: ProductFormData) => {
    if (modalMode === "edit" && modalData) {
      await updateProduct(modalData.id, data);
    } else {
      await createProduct(data);
    }
    setModalOpen(false);
    await load(filterCategoryId || undefined);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      await load(filterCategoryId || undefined);
    } catch {
      setError("Error al eliminar el producto.");
      setDeleteConfirmId(null);
    }
  };

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>
          Productos
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="border border-brand-200 bg-white rounded-xl px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-brand-400"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-gold-300 hover:bg-gold-400 active:scale-[0.97] text-charcoal font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Nuevo producto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-brand-400 py-8">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-8 text-center">
          <p className="text-sm text-brand-500">No hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden divide-y divide-brand-50">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors">
              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <span className="text-xl select-none">{product.emoji}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">{product.name}</p>
                <p className="text-xs text-brand-400">
                  {categoryName(product.categoryId)}
                  {" · "}
                  <span className="text-charcoal font-medium">${formatPrice(product.price)}</span>
                  {" · "}
                  <span className={product.available ? "text-green-600" : "text-red-400"}>
                    {product.available ? "Disponible" : "No disponible"}
                  </span>
                </p>
              </div>

              {deleteConfirmId === product.id ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(product.id)}
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
                    onClick={() => openEdit(product)}
                    className="text-xs font-bold border border-brand-200 text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(product.id)}
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
        <ProductModal
          mode={modalMode}
          initialData={modalData}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
