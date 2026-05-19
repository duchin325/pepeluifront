# 🍗 Rotisería App — MVP Frontend

Web app para pedidos online por WhatsApp. El cliente arma su pedido desde el menú y es redirigido directamente a WhatsApp con el detalle.

## 🚀 Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuración inicial (importante)

Antes de mostrarle a tu amigo, editá **dos archivos**:

### 1. `src/data/menu.ts`
Actualizá los datos del local y el menú real:

```ts
export const LOCAL_CONFIG = {
  name: "Rotisería El Hornito",        // ← nombre real
  whatsappNumber: "5493512345678",      // ← número real (sin + ni espacios)
  greeting: "¡Hola! 👋 Quiero hacer el siguiente pedido:",
};
```

Y reemplazá los productos de cada categoría con los platos reales, precios, etc.

### 2. Fotos de los platos (opcional para el MVP)
Por ahora se usan emojis como placeholder. Cuando tengas fotos:
1. Agregá el campo `image: "/fotos/pollo-entero.jpg"` a cada producto
2. Poné las fotos en `/public/fotos/`
3. En `ProductCard.tsx`, reemplazá el div de emoji por `<Image src={product.image} .../>`

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx        # Layout raíz con metadatos
│   ├── page.tsx          # Página principal (menú)
│   └── globals.css       # Estilos globales + fuentes
├── components/
│   ├── Navbar.tsx        # Header con botón de carrito
│   ├── CategoryNav.tsx   # Pills de navegación por categoría
│   ├── CategorySection.tsx  # Sección de una categoría
│   ├── ProductCard.tsx   # Tarjeta de producto individual
│   ├── CartSidebar.tsx   # Panel lateral del carrito
│   └── FloatingCartButton.tsx  # Botón flotante en mobile
├── data/
│   └── menu.ts           # 👈 Datos del menú (hardcodeados por ahora)
├── hooks/
│   └── useCart.ts        # Estado global del carrito (Zustand)
└── lib/
    └── whatsapp.ts       # Generador de links de WhatsApp
```

## 🔮 Próximos pasos (post-validación)

- [ ] Agregar fotos reales a los productos
- [ ] Panel de administración para editar el menú sin tocar código
- [ ] Backend NestJS + PostgreSQL
- [ ] Deploy en Vercel + Railway

## 🛠️ Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (estado del carrito)
