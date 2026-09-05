import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { updateOrderStatus } from '../../services/orderService';
import { useNotifications } from '../../contexts/NotificationContext';
import { ORDER_STATUS_CONFIG } from '../../config/constants';
import { OrderStatus } from '../../types';

export const EmployeeDashboard: React.FC = () => {
  const { orders, refresh, isLoading } = useRealtimeOrders();
  const { showToast } = useNotifications();

  // Kitchen orders that need action
  const kitchenOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing'
  );

  const handleNextStage = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'accepted';
    if (currentStatus === 'pending') nextStatus = 'accepted';
    else if (currentStatus === 'accepted') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'on_the_way';

    try {
      await updateOrderStatus(orderId, nextStatus);
      showToast({
        title: 'Comanda actualizada',
        message: `Estado cambiado a ${ORDER_STATUS_CONFIG[nextStatus].label}`,
        type: 'success',
      });
      refresh();
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo actualizar comanda', type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-600/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
              Helados Caram • Cocina & Empaque
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Comandero de Preparación
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
          <span className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-black">
            {kitchenOrders.length} {kitchenOrders.length === 1 ? 'comanda activa' : 'comandas activas'}
          </span>
        </div>
      </div>

      {/* Comanda Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
            🍨
          </div>
          <h2 className="text-lg font-bold text-slate-800">¡Todo al día en cocina!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay comandas pendientes de preparación en este momento. Las nuevas órdenes de Puerto Padre se reflejarán aquí en tiempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            const statusCfg = ORDER_STATUS_CONFIG[order.status];

            let nextLabel = 'Aceptar Comanda';
            let nextColor = 'bg-blue-600 hover:bg-blue-700 text-white';
            if (order.status === 'accepted') {
              nextLabel = 'Comenzar Preparación';
              nextColor = 'bg-amber-600 hover:bg-amber-700 text-white';
            } else if (order.status === 'preparing') {
              nextLabel = 'Listo para Delivery';
              nextColor = 'bg-emerald-600 hover:bg-emerald-700 text-white';
            }

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-md flex flex-col justify-between space-y-5 hover:border-amber-400 transition"
              >
                {/* Comanda Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-lg font-black text-slate-900 font-display">
                        #{order.order_number}
                      </span>
                      <p className="text-xs font-bold text-slate-600">{order.customer_name}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Time and Notes */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
                      ⚠️ {order.notes}
                    </div>
                  )}

                  {/* Items list */}
                  <div className="mt-4 space-y-3">
                    {order.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between font-black">
                          <span className="text-sm font-display text-slate-900">
                            {it.quantity}x {it.product_name}
                          </span>
                        </div>
                        {it.flavor && (
                          <p className="text-xs font-bold text-rose-600">
                            🍦 Sabor: {it.flavor}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-[11px] text-slate-500 italic">
                            Nota: "{it.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comanda Action Button */}
                <button
                  onClick={() => handleNextStage(order.id, order.status)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-2 ${nextColor}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{nextLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
