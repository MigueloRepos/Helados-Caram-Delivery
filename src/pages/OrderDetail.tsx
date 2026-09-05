import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Bike,
  Phone,
  MessageCircle,
  MapPin,
  Sparkles,
  ShoppingBag,
  ChefHat,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { fetchOrderById, subscribeToOrderUpdates } from '../services/orderService';
import { Order, OrderStatus } from '../types';
import { ORDER_STATUS_CONFIG, PAYMENT_METHODS } from '../config/constants';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await fetchOrderById(id);
        setOrder(data);
      } catch (e) {
        console.warn('Error loading order detail:', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();

    // Subscribe to live order status updates
    const unsubscribe = subscribeToOrderUpdates((updatedOrder) => {
      if (updatedOrder.id === id) {
        setOrder(updatedOrder);
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 bg-slate-200 rounded-2xl w-1/3 animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
          🍨
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Pedido no encontrado</h2>
        <p className="text-xs text-slate-500">
          No pudimos localizar la información del pedido solicitado.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs uppercase shadow-md hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Pedidos</span>
        </Link>
      </div>
    );
  }

  const statusCfg = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-800',
    description: '',
  };

  const waUrl = getWhatsAppOrderUrl(order);

  // Status timeline steps
  const steps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'pending', label: 'Recibido', icon: Clock },
    { status: 'accepted', label: 'Aceptado', icon: CheckCircle2 },
    { status: 'preparing', label: 'Preparando', icon: ChefHat },
    { status: 'on_the_way', label: 'En Camino', icon: Bike },
    { status: 'delivered', label: 'Entregado', icon: PackageCheck },
  ];

  const currentStepIdx = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-rose-600 transition p-2 -ml-2 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar</span>
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>

      {/* 1. Live Timeline Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
              Helados Caram • Rastreo en Tiempo Real
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-display mt-0.5">
              Pedido #{order.order_number}
            </h1>
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${statusCfg.color} shadow-xs`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Progress Bar / Stepper */}
        {order.status !== 'cancelled' ? (
          <div className="pt-4 pb-2">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIdx / (steps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Step points */}
              <div className="relative z-10 flex items-center justify-between">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-rose-200 scale-110' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-semibold ${
                          isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-center text-slate-500 mt-6 bg-slate-50 py-2.5 px-4 rounded-2xl border border-slate-100">
              {statusCfg.description}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Este pedido fue cancelado. Comunícate con el soporte si tienes alguna duda.</span>
          </div>
        )}
      </div>

      {/* 2. Driver Info Card (if assigned) */}
      {order.delivery_driver && (
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md">
              🛵
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Repartidor Asignado
              </span>
              <p className="text-sm font-bold text-slate-900">{order.delivery_driver.full_name}</p>
              <p className="text-xs text-slate-500">
                {order.delivery_driver.vehicle_info || 'Moto Helados Caram'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.delivery_driver.phone && (
              <a
                href={`tel:${order.delivery_driver.phone}`}
                className="p-3 rounded-2xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
                title="Llamar al repartidor"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 3. Items & Summary Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
        <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
          Detalle de la Orden
        </h2>

        {/* Items list */}
        <div className="space-y-4 divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">{item.product_name}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Cant: {item.quantity}</span>
                    {item.flavor && (
                      <span className="text-rose-600 font-semibold">• Sabor: {item.flavor}</span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Nota: {item.notes}</p>
                  )}
                </div>
              </div>

              <span className="text-xs sm:text-sm font-black text-slate-900 font-display">
                ${item.total_price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Destination & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Dirección de Entrega:</span>
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">{order.shipping_address}</p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-1">Método de Pago:</span>
            <p className="text-slate-700 font-medium capitalize">
              {PAYMENT_METHODS.find((p) => p.id === order.payment_method)?.name || order.payment_method}
            </p>
            {order.notes && (
              <p className="text-[11px] text-slate-400 mt-1">Notas: {order.notes}</p>
            )}
          </div>
        </div>

        {/* Financial Calculation */}
        <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
          <div className="flex justify-between">
            <span>Subtotal Productos:</span>
            <span className="font-semibold text-slate-800">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Costo de Entrega:</span>
            <span className="font-semibold text-slate-800">
              {order.delivery_fee === 0 ? 'Gratis' : `$${order.delivery_fee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
            <span>TOTAL:</span>
            <span className="text-rose-600 font-display text-lg">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
