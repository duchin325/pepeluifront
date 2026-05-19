"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DailyMenuItem } from "@/data/menu";
import DailyMenuModal, { DailyMenuFormData } from "@/components/admin/DailyMenuModal";
import CategoriesSection from "@/components/admin/CategoriesSection";
import ProductsSection from "@/components/admin/ProductsSection";
import { formatPrice } from "@/lib/whatsapp";
import {
  loginAdmin,
  getDailyMenusAll,
  createDailyMenu,
  updateDailyMenu,
  activateDailyMenu,
  deactivateDailyMenu,
} from "@/lib/admin-api";

type Tab = "daily" | "categories" | "products";
const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "Menú del Día" },
  { id: "categories", label: "Categorías" },
  { id: "products", label: "Productos" },
];

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getLocalToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day} ${MONTH_NAMES[month - 1]}`;
}

export default function AdminPage() {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  const [menus, setMenus] = useState<DailyMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "reuse">("create");
  const [modalInitialData, setModalInitialData] = useState<DailyMenuItem | undefined>(undefined);

  const today = getLocalToday();

  const loadMenus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyMenusAll();
      setMenus(data);
    } catch {
      setError("Error al cargar los menús. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setUnlocked(true);
      loadMenus();
    }
    setInitializing(false);
  }, [loadMenus]);

  const todayActive = useMemo(
    () => menus.filter((m) => m.date === today && m.active),
    [menus, today]
  );

  const historial = useMemo(
    () =>
      menus
        .filter((m) => !(m.date === today && m.active))
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
        ),
    [menus, today]
  );

  const handleLogin = async () => {
    if (!pinInput) return;
    setLoading(true);
    setPinError(false);
    try {
      await loginAdmin("admin", pinInput);
      setUnlocked(true);
      await loadMenus();
    } catch {
      setPinError(true);
      setPinInput("");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode: "create" | "edit" | "reuse", data?: DailyMenuItem) => {
    setModalMode(mode);
    setModalInitialData(data);
    setModalOpen(true);
  };

  const handleDeactivate = async (id: string) => {
    setError(null);
    try {
      await deactivateDailyMenu(id);
      await loadMenus();
    } catch {
      setError("Error al desactivar el menú.");
    }
  };

  const handleActivate = async (id: string) => {
    setError(null);
    try {
      await activateDailyMenu(id);
      await loadMenus();
    } catch {
      setError("Error al activar el menú.");
    }
  };

  const handleSave = async (formData: DailyMenuFormData) => {
    setError(null);
    try {
      if (modalMode === "edit" && modalInitialData) {
        await updateDailyMenu(modalInitialData.id, formData);
      } else {
        await createDailyMenu(formData);
      }
      setModalOpen(false);
      await loadMenus();
    } catch {
      setError("Error al guardar el menú.");
    }
  };

  // ── Inicializando (verificando token) ────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="text-brand-400 text-sm">Cargando…</span>
      </div>
    );
  }

  // ── Pantalla de PIN / login ──────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-brand-100 p-8 w-full max-w-xs text-center space-y-5">
          <div className="text-5xl select-none">🔒</div>
          <div>
            <h1
              className="text-xl font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Panel de Administración
            </h1>
            <p className="text-sm text-brand-500 mt-1">Ingresá tu PIN para continuar</p>
          </div>

          <input
            type="password"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="••••"
            maxLength={12}
            autoFocus
            disabled={loading}
            className={`w-full text-center text-2xl tracking-[0.5em] border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
              pinError
                ? "border-red-300 bg-red-50 focus:border-red-400"
                : "border-brand-200 focus:border-brand-400"
            }`}
          />

          {pinError && (
            <p className="text-xs text-red-500">PIN incorrecto. Intentá de nuevo.</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !pinInput}
            className="w-full bg-brand-400 hover:bg-brand-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? "Verificando…" : "Ingresar"}
          </button>

          <Link
            href="/"
            className="block text-xs text-brand-400 hover:text-brand-600 transition-colors"
          >
            ← Volver al menú
          </Link>
        </div>
      </div>
    );
  }

  // ── Panel de administración ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-brand-400 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-100">
            Pepe Lui
          </p>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Panel de Administración
          </h1>
        </div>
        <Link
          href="/"
          className="text-xs text-brand-100 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Volver al menú
        </Link>
      </header>

      {/* Tab navigation */}
      <div className="bg-white border-b border-brand-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-400 text-brand-600"
                  : "border-transparent text-brand-400 hover:text-brand-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-32">

        {/* ── Categorías ────────────────────────────────────────────────────── */}
        {activeTab === "categories" && <CategoriesSection />}

        {/* ── Productos ─────────────────────────────────────────────────────── */}
        {activeTab === "products" && <ProductsSection />}

        {/* ── Menú del Día ──────────────────────────────────────────────────── */}
        {activeTab === "daily" && (
        <div className="space-y-10">

        {/* Mensaje de error global */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <p className="text-center text-sm text-brand-400 py-4">Cargando…</p>
        )}

        {/* ── Activos hoy ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Activos hoy
            </h2>
            <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full border border-brand-100">
              {todayActive.length}/2
            </span>
          </div>

          {!loading && todayActive.length === 0 ? (
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 text-center">
              <p className="text-sm text-gold-700 font-medium">
                No hay menús activos para hoy.
              </p>
              <p className="text-xs text-brand-500 mt-1">
                Creá uno con el botón de abajo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayActive.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-gold-50 border border-gold-200 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl select-none flex-shrink-0">{menu.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-charcoal text-sm leading-snug">
                        {menu.name}
                      </p>
                      <p className="text-xs text-gold-700 mt-0.5 leading-relaxed line-clamp-2">
                        {menu.description}
                      </p>
                      <p className="text-sm font-bold text-charcoal mt-1.5">
                        <span className="text-gold-500 text-xs mr-0.5">$</span>
                        {formatPrice(menu.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal("edit", menu)}
                      className="flex-1 text-xs font-bold border border-brand-200 text-brand-600 hover:bg-brand-50 py-2 rounded-xl transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeactivate(menu.id)}
                      className="flex-1 text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl transition-colors"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Historial ─────────────────────────────────────────────────────── */}
        <section>
          <h2
            className="text-lg font-bold text-charcoal mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Historial
          </h2>

          {!loading && historial.length === 0 ? (
            <p className="text-sm text-brand-500">Sin historial aún.</p>
          ) : (
            <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden divide-y divide-brand-50">
              {historial.map((menu) => (
                <div
                  key={menu.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors"
                >
                  <span className="text-2xl select-none flex-shrink-0">{menu.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">{menu.name}</p>
                    <p className="text-xs text-brand-500 capitalize">
                      {formatDate(menu.date)} · ${formatPrice(menu.price)}
                    </p>
                  </div>

                  {menu.date === today ? (
                    <button
                      onClick={() => handleActivate(menu.id)}
                      disabled={todayActive.length >= 2}
                      className="flex-shrink-0 text-xs font-bold bg-brand-50 hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed text-brand-600 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Activar
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal("reuse", menu)}
                      disabled={todayActive.length >= 2}
                      className="flex-shrink-0 text-xs font-bold bg-gold-100 hover:bg-gold-200 disabled:opacity-50 disabled:cursor-not-allowed text-gold-700 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Reutilizar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        </div>
        )}
      </main>

      {/* ── FAB (sólo en Menú del Día) ─────────────────────────────────────── */}
      {activeTab === "daily" && (
        <div className="fixed bottom-6 right-6 z-30">
          <div className="relative group">
            <button
              onClick={() => todayActive.length < 2 && openModal("create")}
              disabled={todayActive.length >= 2}
              className="flex items-center gap-2 bg-gold-300 hover:bg-gold-400 active:scale-[0.97] disabled:bg-brand-100 disabled:text-brand-400 disabled:cursor-not-allowed text-charcoal font-bold px-5 py-3.5 rounded-2xl shadow-lg transition-all text-sm"
            >
              <span className="text-lg leading-none">+</span>
              Nuevo menú del día
            </button>

            {todayActive.length >= 2 && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-charcoal text-white text-xs rounded-xl px-3 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                Ya hay 2 menús activos hoy. Desactivá uno para agregar otro.
                <span className="absolute top-full right-5 border-4 border-transparent border-t-charcoal" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal (Menú del Día) ────────────────────────────────────────────── */}
      {modalOpen && (
        <DailyMenuModal
          mode={modalMode}
          initialData={modalInitialData}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
