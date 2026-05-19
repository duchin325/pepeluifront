// src/lib/whatsapp.ts
import { CartItem } from "@/hooks/useCart";
import { LOCAL_CONFIG } from "@/data/menu";

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines: string[] = [];

  for (const item of items) {
    const itemTotal = item.cartItemUnitPrice * item.quantity;
    lines.push(`• ${item.quantity}x ${item.product.name} — $${formatPrice(itemTotal)}`);

    const { removedIngredients, selectedExtras, note } = item.customization;

    if (removedIngredients.length > 0) {
      lines.push(`  sin ${removedIngredients.join(", sin ")}`);
    }
    for (const extra of selectedExtras) {
      lines.push(`  + ${extra.name}`);
    }
    if (note) {
      lines.push(`  Nota: ${note}`);
    }
  }

  const total = items.reduce(
    (acc, item) => acc + item.cartItemUnitPrice * item.quantity,
    0
  );

  const message = [
    LOCAL_CONFIG.greeting,
    "",
    ...lines,
    "",
    `*Total: $${formatPrice(total)}*`,
    "",
    "¿Podría confirmarme el pedido? 😊",
  ].join("\n");

  return message;
}

export function buildWhatsAppURL(items: CartItem[]): string {
  const message = buildWhatsAppMessage(items);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${LOCAL_CONFIG.whatsappNumber}?text=${encoded}`;
}

export function formatPrice(price: number): string {
  return price.toLocaleString("es-AR");
}
