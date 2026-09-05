import React, { useState } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
  Navigation,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { updateOrderStatus } from '../../services/orderService';
import { useNotifications } from '../../contexts/NotificationContext';
import { ORDER_STATUS_CONFIG } from '../../config/constants';
import { getWhatsAppOrderUrl } from '../../utils/whatsapp';

export const DeliveryDashboard: React.FC = () => {
  const { orders, refresh } = useRealtimeOrders();
  const { showToast } = useNotifications();
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  // Filter orders that need delivery or are on the way
  const activeDeliveries = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'on_the_way' || o.status === 'accepted'
  );

  const completedDeliveries = orders.filter((o) => o.status === 'delivered');

  const displayedOrders = filter === 'active' ? activeDeliveries : completedDeliveries;

  const handleStartDelivery = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'on_the_way');
      showToast({
        title: '¡Ruta iniciada!',
        message: 'Pedido marcado en camino al cliente',
        type: 'info',
      });
      refresh();
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo actualizar', type: 'error' });
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'delivered');
      showToast({
        title: '¡Entrega completada!',
        message: 'Pedido entregado exitosamente al cliente',
        type: 'success',
      });
      refresh();
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo actualizar', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/20">
            🛵
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              Helados Caram • Puerto Padre
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Panel del Repartidor
            </h1>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Activos ({activeDeliveries.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Entregados ({completedDeliveries.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            🏁
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {filter === 'active' ? 'No tienes entregas pendientes' : 'Aún no hay entregas finalizadas'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {filter === 'active'
              ? 'Nuevos pedidos en Puerto Padre aparecerán automáticamente aquí cuando la cocina los prepare.'
              : 'Las entregas finalizadas quedarán registradas en este historial.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const statusCfg = ORDER_STATUS_CONFIG[order.status];
            const waUrl = getWhatsAppOrderUrl(order);

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4"
              >
                {/* Top: Order info & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 font-display">
                      #{order.order_number}
                    </span>
                    <span className="text-xs font-bold text-slate-800">• {order.customer_name}</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Delivery Address Banner */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs text-slate-800">
                  <div className="flex items-start gap-2 font-bold text-amber-900">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>Dirección de Entrega:</span>
                  </div>
                  <p className="pl-6 text-slate-700 leading-relaxed font-medium">
                    {order.shipping_address}
                  </p>
                </div>

                {/* Products check */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-rose-600" />
                    <span>Productos a Entregar:</span>
                  </span>
                  <div className="pl-5 space-y-0.5 text-slate-600">
                    {order.items?.map((it, idx) => (
                      <p key={idx}>
                        • <strong className="text-slate-800">{it.quantity}x</strong> {it.product_name}{' '}
                        {it.flavor ? `(${it.flavor})` : ''}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Payment & notes */}
                <div className="flex flex-wrap justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700">Cobro: </span>
                    <span className="font-black text-slate-900 text-sm">${order.total.toFixed(2)}</span>
                    <span className="text-slate-400 capitalize"> ({order.payment_method})</span>
                  </div>

                  {/* Customer Quick Call and WhatsApp */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Llamar</span>
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  {order.status !== 'on_the_way' && order.status !== 'delivered' && (
                    <button
                      onClick={() => handleStartDelivery(order.id)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Iniciar Viaje (En Camino)</span>
                    </button>
                  )}

                  {order.status === 'on_the_way' && (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar como Entregado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
