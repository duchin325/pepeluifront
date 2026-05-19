"use client";
import { useCart } from "@/hooks/useCart";
import { buildWhatsAppURL, formatPrice } from "@/lib/whatsapp";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  const handleOrder = () => {
    if (items.length === 0) return;
    window.open(buildWhatsAppURL(items), "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-40" onClick={closeCart} />

      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-cream z-50 flex flex-col shadow-2xl animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100">
          <div>
            <h2
              className="text-xl font-bold text-charcoal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Tu pedido
            </h2>
            {items.length > 0 && (
              <p className="text-xs text-brand-500 mt-0.5">
                {items.reduce((a, i) => a + i.quantity, 0)} ítem
                {items.reduce((a, i) => a + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="w-9 h-9 rounded-full bg-brand-50 hover:bg-brand-100 flex items-center justify-center transition-colors text-charcoal text-lg"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-16">
              <span className="text-5xl">🛒</span>
              <p className="text-brand-600 text-sm">
                Tu carrito está vacío.<br />¡Agregá algo del menú!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white rounded-xl p-3 border border-brand-100"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl w-10 text-center flex-shrink-0 mt-0.5 select-none">
                    {item.product.emoji}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-charcoal">{item.product.name}</p>

                    {/* Customization summary */}
                    {(item.customization.removedIngredients.length > 0 ||
                      item.customization.selectedExtras.length > 0 ||
                      item.customization.note) && (
                      <div className="mt-1 space-y-0.5">
                        {item.customization.removedIngredients.length > 0 && (
                          <p className="text-xs text-red-400">
                            sin {item.customization.removedIngredients.join(", sin ")}
                          </p>
                        )}
                        {item.customization.selectedExtras.map((extra) => (
                          <p key={extra.name} className="text-xs text-brand-500">
                            + {extra.name}
                            {extra.price > 0 && ` ($${formatPrice(extra.price)})`}
                          </p>
                        ))}
                        {item.customization.note && (
                          <p className="text-xs text-brand-400 italic">
                            &ldquo;{item.customization.note}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-brand-500 mt-1">
                      ${formatPrice(item.cartItemUnitPrice)} c/u
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-charcoal">
                      ${formatPrice(item.cartItemUnitPrice * item.quantity)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-brand-200 text-brand-500 hover:bg-brand-50 flex items-center justify-center text-lg leading-none transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-brand-400 hover:bg-brand-500 text-white flex items-center justify-center text-lg leading-none transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-brand-100 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-600">Total estimado</span>
              <span
                className="text-2xl font-bold text-charcoal"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ${formatPrice(totalPrice())}
              </span>
            </div>

            <button
              onClick={handleOrder}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5b] active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.117 1.528 5.845L.057 23.485a.75.75 0 00.921.921l5.64-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.498-5.27-1.449l-.378-.23-3.913 1.02 1.02-3.913-.23-.378A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Realizar pedido por WhatsApp
            </button>

            <button
              onClick={clearCart}
              className="w-full text-xs text-brand-400 hover:text-brand-600 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
