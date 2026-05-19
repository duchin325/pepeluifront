import Image from "next/image";
import { getMenu, getDailyMenus } from "@/lib/api";
import { Category, DailyMenuItem, LOCAL_CONFIG } from "@/data/menu";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import CategorySection from "@/components/CategorySection";
import DailyMenuSection from "@/components/DailyMenuSection";
import CartSidebar from "@/components/CartSidebar";
import FloatingCartButton from "@/components/FloatingCartButton";

export const revalidate = 60;

export default async function HomePage() {
  let menu: Category[] = [];
  let dailyMenus: DailyMenuItem[] = [];

  try {
    [menu, dailyMenus] = await Promise.all([getMenu(), getDailyMenus()]);
  } catch {
    // La API no está disponible — se renderiza con datos vacíos
  }

  return (
    <>
      <Navbar />
      <CategoryNav categories={menu} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10 pb-28">

        {/* Hero banner */}
        <div className="rounded-2xl bg-brand-400 text-white p-6 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-100 mb-1">
              Bienvenido a
            </p>
            <h2
              className="text-3xl font-bold mb-2 text-gold-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {LOCAL_CONFIG.name}
            </h2>
            <p className="text-brand-100 text-sm max-w-xs">
              Armá tu pedido y te lo confirmamos por WhatsApp. ¡Rápido y fácil!
            </p>
          </div>

          <div className="relative flex-shrink-0 ml-4">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-lg">
              <Image
                src="/logo.jpeg"
                alt="Pepe Lui"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Menú del Día */}
        {dailyMenus.length > 0 && <DailyMenuSection dailyMenus={dailyMenus} />}

        {/* Secciones del menú */}
        {menu.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}

        {/* Footer */}
        <footer className="text-center text-xs text-brand-500 pt-4 border-t border-brand-100 space-y-1">
          <p>Los precios son orientativos y pueden variar.</p>
          <p>
            ¿Tenés alguna consulta?{" "}
            <a
              href={`https://wa.me/${LOCAL_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline"
            >
              Escribinos por WhatsApp
            </a>
          </p>
          <p className="pt-2">
            <a href="/admin" className="text-brand-300 hover:text-brand-500 transition-colors">
              Admin
            </a>
          </p>
        </footer>
      </main>

      <CartSidebar />
      <FloatingCartButton />
    </>
  );
}
