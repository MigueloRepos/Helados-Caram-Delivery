import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Globe,
  Truck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_DELIVERY_ZONES, PAYMENT_METHODS } from '../config/constants';
import { createOrder } from '../services/orderService';
import { DeliveryZone, PaymentMethod, Order } from '../types';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, total, selectedZone, setSelectedZone, clearCart, orderNotes, setOrderNotes } = useCart();
  const { profile, user } = useAuth();

  // Delivery type: home delivery vs in-store pickup
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  // Customer info
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '+53 ');
  const [altPhone, setAltPhone] = useState('');

  // Shipping address
  const [streetAddress, setStreetAddress] = useState(profile?.address || '');
  const [neighborhood, setNeighborhood] = useState('');
  const [landmark, setLandmark] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const effectiveDeliveryFee = deliveryType === 'pickup' ? 0 : deliveryFee;
  const finalTotal = subtotal + effectiveDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('Tu carrito está vacío. Agrega productos antes de continuar.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!phone.trim() || phone.trim() === '+53') {
      setErrorMsg('Por favor ingresa un número de teléfono de contacto.');
      return;
    }

    if (deliveryType === 'delivery' && !streetAddress.trim()) {
      setErrorMsg('Por favor ingresa la dirección de entrega en Puerto Padre.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddressString =
        deliveryType === 'pickup'
          ? 'Recogida en el local (Helados Caram, Puerto Padre)'
          : `${streetAddress}${neighborhood ? `, Reparto ${neighborhood}` : ''}${
              landmark ? ` (Ref: ${landmark})` : ''
            }`;

      const orderPayload: Partial<Order> = {
        user_id: profile?.id || user?.id || 'guest',
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        shipping_address: fullAddressString,
        delivery_zone_id: deliveryType === 'pickup' ? undefined : selectedZone.id,
        delivery_type: deliveryType,
        delivery_fee: effectiveDeliveryFee,
        subtotal: subtotal,
        total: finalTotal,
        payment_method: paymentMethod,
        payment_status: 'pending',
        notes: [
          altPhone ? `Teléfono alternativo: ${altPhone}` : '',
          orderNotes ? `Notas: ${orderNotes}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
      };

      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        total_price: Number(item.product.price) * item.quantity,
        flavor: item.selectedFlavor,
        notes: item.specialNotes,
        product_image: item.product.image_url,
      }));

      const newOrder = await createOrder({
        userId: profile?.id || user?.id || null,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        shippingAddress: fullAddressString,
        shippingReference: landmark ? landmark.trim() : undefined,
        deliveryZoneId: deliveryType === 'pickup' ? undefined : selectedZone.id,
        deliveryZoneName: deliveryType === 'pickup' ? 'Recogida en Heladería' : selectedZone.name,
        deliveryFee: effectiveDeliveryFee,
        paymentMethod: paymentMethod,
        notes: [
          altPhone ? `Tel alternativo: ${altPhone}` : '',
          orderNotes ? `Notas: ${orderNotes}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
        items: items,
      });

      setCreatedOrder(newOrder);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (createdOrder) {
    const waUrl = getWhatsAppOrderUrl(createdOrder);

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
        <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">
              ¡Pedido Registrado con Éxito!
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-display">
              Pedido #{createdOrder.order_number}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Gracias por tu compra, <span className="font-bold text-slate-800">{createdOrder.customer_name}</span>. Nuestro equipo ya está preparando tus helados y delicias.
            </p>
          </div>

          {/* Quick Info Card */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-left space-y-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold">Monto Total:</span>
              <span className="font-black text-rose-600 text-sm font-display">${createdOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Método de Pago:</span>
              <span className="capitalize font-bold text-slate-800">
                {PAYMENT_METHODS.find((p) => p.id === createdOrder.payment_method)?.name || createdOrder.payment_method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Destino:</span>
              <span className="truncate max-w-[200px] text-slate-600">{createdOrder.shipping_address}</span>
            </div>
          </div>

          {/* WhatsApp Notify Button */}
          <div className="pt-2 space-y-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>CONFIRMAR POR WHATSAPP</span>
            </a>

            <Link
              to={`/orders/${createdOrder.id}`}
              className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wide shadow-md flex items-center justify-center gap-2 transition"
            >
              <span>Ver Rastreo en Vivo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
          Helados Caram Delivery
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-0.5">
          Finalizar Pedido
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Fields (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Tipo de Entrega */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600" />
              <span>1. Modalidad de Entrega</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  deliveryType === 'delivery'
                    ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Entrega a Domicilio</p>
                  <p className="text-[10px] text-slate-500 font-normal">En moto a tu casa</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  deliveryType === 'pickup'
                    ? 'border-rose-500 bg-rose-50/60 text-rose-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Recogida en Local</p>
                  <p className="text-[10px] text-slate-500 font-normal">Sin costo de envío</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Datos del Cliente */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-rose-600" />
              <span>2. Información de Contacto</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Teléfono / WhatsApp (+53) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+53 58123456"
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Teléfono Alternativo (Opcional)
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="Para emergencias o persona que recibe"
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* 3. Dirección de Entrega (solo si delivery) */}
          {deliveryType === 'delivery' && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>3. Dirección de Entrega (Puerto Padre)</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Zona de Entrega *
                </label>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const z = DEFAULT_DELIVERY_ZONES.find((zone) => zone.id === e.target.value);
                    if (z) setSelectedZone(z);
                  }}
                  className="w-full text-xs font-semibold p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  {DEFAULT_DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.delivery_fee === 0 ? 'Envío Gratis' : `+$${z.delivery_fee.toFixed(2)}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Calle y Número / Entre Calles *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Ej: Calle Máximo Gómez #45 e/ Real y Libertad"
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Reparto / Barrio
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ej: Reparto Militar, La Boca..."
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Punto de Referencia
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Ej: Frente al parque, casa azul"
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Método de Pago */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>4. Método de Pago</span>
            </h2>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                let icon = <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />;
                if (method.id === 'transfer') icon = <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />;
                if (method.id === 'zelle' || method.id === 'paypal') icon = <Globe className="w-5 h-5 text-purple-600 shrink-0" />;

                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      {icon}
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">{method.name}</p>
                        <p className="text-[11px] text-slate-500">{method.description}</p>
                      </div>
                    </div>

                    {/* Show transfer details if selected */}
                    {isSelected && method.id === 'transfer' && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
                        <p className="font-bold">Datos para Transferencia:</p>
                        <p>Tarjeta EnZona / Transfermóvil: <span className="font-mono font-bold">9225 1234 5678 9012</span></p>
                        <p className="text-[10px] text-blue-700">Envía el comprobante por WhatsApp tras finalizar el pedido.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Comentarios Adicionales */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Comentarios o instrucciones para el pedido:
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ej: Tocar timbre fuerte, enviar cambio de $500, etc."
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>
        </div>

        {/* Order Summary & Submit (Right 5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-md space-y-5">
            <h3 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
              Resumen de Compra ({items.reduce((a, b) => a + b.quantity, 0)} ítems)
            </h3>

            {/* Items mini list */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 divide-y divide-slate-100 pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{it.quantity}x {it.product.name}</p>
                    {it.selectedFlavor && (
                      <p className="text-[10px] text-rose-600 font-semibold">{it.selectedFlavor}</p>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(Number(it.product.price) * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío:</span>
                <span className="font-semibold text-slate-900">
                  {effectiveDeliveryFee === 0 ? 'Gratis' : `$${effectiveDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>TOTAL A PAGAR:</span>
                <span className="text-rose-600 font-display text-lg">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-xl transition-all active:scale-95 ${
                isSubmitting
                  ? 'bg-slate-400 cursor-wait'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              {isSubmitting ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>CONFIRMAR PEDIDO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
