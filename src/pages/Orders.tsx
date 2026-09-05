import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  ChevronRight,
  Truck,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Calendar,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { ORDER_STATUS_CONFIG } from '../config/constants';
import { OrderStatus } from '../types';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

export const Orders: React.FC = () => {
  const { user, profile } = useAuth();
  const { orders, isLoading } = useRealtimeOrders();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter for this user
  const userOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Seguimiento de Pedidos
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-0.5">
            Historial de Pedidos
          </h1>
        </div>

        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wide shadow-md hover:bg-rose-700 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Hacer Nuevo Pedido</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Todos ({orders.length})
        </button>

        <button
          onClick={() => setFilterStatus('preparing')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            filterStatus === 'preparing'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          En Preparación
        </button>

        <button
          onClick={() => setFilterStatus('on_the_way')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            filterStatus === 'on_the_way'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          En Camino
        </button>

        <button
          onClick={() => setFilterStatus('delivered')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            filterStatus === 'delivered'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Entregados
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : userOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
            🍨
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">No hay pedidos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando realices una orden en Helados Caram, podrás seguir su estado de preparación y entrega en tiempo real aquí.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs uppercase shadow-md hover:bg-rose-700 transition"
          >
            <span>Ver Menú</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const statusCfg = ORDER_STATUS_CONFIG[order.status] || {
              label: order.status,
              color: 'bg-slate-100 text-slate-800',
              description: '',
            };
            const waUrl = getWhatsAppOrderUrl(order);

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Order Number, Date, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 font-display">
                      #{order.order_number}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Middle: Items & Address summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Productos:</span>
                    <p className="line-clamp-2">
                      {order.items?.map((it) => `${it.quantity}x ${it.product_name}`).join(', ') ||
                        'Productos seleccionados de Helados Caram'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Dirección de Entrega:</span>
                    <p className="line-clamp-2 truncate">{order.shipping_address}</p>
                  </div>
                </div>

                {/* Bottom Row: Total & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-500">Total:</span>
                    <span className="text-base font-black text-rose-600 font-display">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Rastreo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
