import { BUSINESS_CONFIG, ORDER_STATUS_CONFIG } from '../config/constants';
import { Order } from '../types';

export function getWhatsAppOrderUrl(order: Order): string {
  const number = BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9+]/g, '');
  const statusLabel = ORDER_STATUS_CONFIG[order.status]?.label || order.status;

  const text = `Hola Helados Caram 👋\nQuiero consultar sobre mi pedido #${order.order_number}.\n\nTotal: $${order.total.toFixed(2)}\nEstado: ${statusLabel}\nCliente: ${order.customer_name}\nDirección: ${order.shipping_address}`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppGeneralUrl(customMessage?: string): string {
  const number = BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9+]/g, '');
  const text =
    customMessage ||
    `Hola Helados Caram 👋 Me gustaría hacer una consulta sobre sus helados, cakes y entregas a domicilio en Puerto Padre.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
