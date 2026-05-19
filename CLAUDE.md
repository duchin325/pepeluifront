# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

**Next.js 16 App Router + React 18 + TypeScript + Tailwind CSS + Zustand**

Online food ordering MVP for a rotisserie restaurant. Customers browse the menu, build a cart, and are redirected to WhatsApp with a pre-filled order message. No backend — all data is hardcoded.

### Key paths

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage — renders hero, category nav, and product sections |
| `src/app/layout.tsx` | Root layout with site metadata |
| `src/data/menu.ts` | Hardcoded menu items and `LOCAL_CONFIG` (WhatsApp number, restaurant name) |
| `src/hooks/useCart.ts` | Zustand store — cart items, quantities, sidebar open/close |
| `src/lib/whatsapp.ts` | Builds the WhatsApp `wa.me` deep-link from cart contents |

### Data flow

1. Menu data originates in `src/data/menu.ts` (static, no API calls).
2. `useCart` (Zustand) is the single source of truth for cart state — components read and mutate it directly.
3. On checkout, `whatsapp.ts` serialises the cart into a URL-encoded message and opens `wa.me/{phone}?text=...`.

### Styling conventions

- Tailwind utility classes throughout; no CSS modules.
- Custom brand colors (`brand`, `gold`) are defined in `tailwind.config.js`.
- Custom animations (`slide-in`, `fade-in`, `scale-in`, `count-bump`) are also in `tailwind.config.js`.
- Global font configuration lives in `src/app/globals.css`.

### Path aliases

`@/*` resolves to `./src/*` (configured in `tsconfig.json`).
