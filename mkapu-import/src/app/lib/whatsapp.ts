import { CartItem } from "../context/CartContext";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines = items.map(
    (i) => `• ${i.name} x${i.qty} — S/ ${(i.price * i.qty).toFixed(2)}`
  );
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  lines.push(`\n*Total: S/ ${total.toFixed(2)}*`);
  lines.push("\nHola, quisiera hacer este pedido 🛒");
  return lines.join("\n");
}

export function sendToWhatsApp(items: CartItem[]) {
  if (!items.length) return;
  const msg = buildWhatsAppMessage(items);
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}