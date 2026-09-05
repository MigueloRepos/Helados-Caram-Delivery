import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Bike,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import { fetchProducts, fetchCategories, upsertProduct, deleteProduct } from '../../services/productService';
import { updateOrderStatus, assignDeliveryDriver } from '../../services/orderService';
import { fetchDeliveryDrivers } from '../../services/profileService';
import { Product, Category, Order, OrderStatus, Profile } from '../../types';
import { ORDER_STATUS_CONFIG, DEFAULT_DELIVERY_ZONES } from '../../config/constants';
import { useNotifications } from '../../contexts/NotificationContext';
import { getWhatsAppOrderUrl } from '../../utils/whatsapp';
import { SalesAnalyticsChart } from '../../components/admin/SalesAnalyticsChart';
import { exportOrdersToCSV, exportOrdersToPDF } from '../../utils/reportExport';

interface AdminDashboardProps {
  initialTab?: 'orders' | 'products' | 'drivers' | 'analytics';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'orders' }) => {
  const { orders, refresh: refreshOrders } = useRealtimeOrders();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'drivers' | 'analytics'>(initialTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [p, c, d] = await Promise.all([fetchProducts(), fetchCategories(), fetchDeliveryDrivers()]);
      setProducts(p);
      setCategories(c);
      setDrivers(d);
    }
    loadData();
  }, []);

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing' || o.status === 'on_the_way'
  ).length;

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast({
        title: 'Estado actualizado',
        message: `Pedido ${orderId.slice(0, 8)} ahora está "${ORDER_STATUS_CONFIG[newStatus].label}"`,
        type: 'success',
      });
      refreshOrders();
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo actualizar el estado', type: 'error' });
    }
  };

  const handleDriverAssign = async (orderId: string, driverId: string) => {
    try {
      const driver = drivers.find((d) => d.id === driverId) || {
        id: driverId,
        full_name: 'Repartidor',
        phone: '+53 58000000',
        role: 'delivery' as const,
      };
      await assignDeliveryDriver(orderId, driverId, driver.full_name || 'Repartidor', driver.phone || '+53 58000000');
      showToast({
        title: 'Repartidor Asignado',
        message: `${driver.full_name || 'Repartidor'} asignado al pedido`,
        type: 'success',
      });
      refreshOrders();
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo asignar repartidor', type: 'error' });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.price) return;

    try {
      const payload: Partial<Product> = {
        ...editingProduct,
        price: Number(editingProduct.price),
        previous_price: editingProduct.previous_price ? Number(editingProduct.previous_price) : undefined,
        slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        is_available: editingProduct.is_available !== false,
      };

      await upsertProduct(payload);
      const updated = await fetchProducts();
      setProducts(updated);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showToast({
        title: 'Producto guardado',
        message: `${payload.name} actualizado en el catálogo`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({ title: 'Error', message: 'No se pudo guardar el producto', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast({
        title: 'Producto eliminado',
        message: `${name} fue retirado`,
        type: 'info',
      });
    } catch (e: any) {
      showToast({ title: 'Error', message: 'No se pudo eliminar', type: 'error' });
    }
  };

  const handleSetPreset = (preset: 'today' | '7days' | 'thisMonth' | 'all') => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7days') {
      const prev = new Date(now);
      prev.setDate(now.getDate() - 7);
      setStartDate(formatDate(prev));
      setEndDate(formatDate(now));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(now));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (orderFilter !== 'all' && o.status !== orderFilter) return false;

      // Date range filter
      if (startDate) {
        const orderDate = new Date(o.created_at);
        const start = new Date(`${startDate}T00:00:00`);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const orderDate = new Date(o.created_at);
        const end = new Date(`${endDate}T23:59:59.999`);
        if (orderDate > end) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.order_number?.toLowerCase().includes(q);
        const matchName = o.customer_name?.toLowerCase().includes(q);
        const matchPhone = o.customer_phone?.toLowerCase().includes(q);
        const matchAddr = o.shipping_address?.toLowerCase().includes(q);
        const matchZone = o.delivery_zone_name?.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone && !matchAddr && !matchZone) {
          return false;
        }
      }

      return true;
    });
  }, [orders, orderFilter, startDate, endDate, searchQuery]);

  const filteredTotalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      exportOrdersToCSV(filteredOrders, {
        startDate,
        endDate,
        statusFilter: orderFilter,
        searchQuery,
      });
      showToast({
        title: 'Reporte CSV Descargado',
        message: `Se exportaron exitosamente ${filteredOrders.length} pedidos.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Error de Exportación',
        message: err.message || 'No se pudo generar el archivo CSV',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportOrdersToPDF(filteredOrders, {
        startDate,
        endDate,
        statusFilter: orderFilter,
        searchQuery,
      });
      showToast({
        title: 'Reporte PDF Generado',
        message: `Documento ejecutivo con ${filteredOrders.length} pedidos listo.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Error de Exportación',
        message: err.message || 'No se pudo generar el archivo PDF',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
            Panel de Control • Helados Caram
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-0.5">
            Administración General
          </h1>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl flex-wrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'analytics' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Estadísticas & Ventas
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'products' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'drivers' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Repartidores
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ventas Totales</span>
            <span className="text-xl font-black text-slate-900 font-display">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pedidos Activos</span>
            <span className="text-xl font-black text-slate-900 font-display">{activeOrdersCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Entregados</span>
            <span className="text-xl font-black text-slate-900 font-display">{deliveredCount}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Productos Menú</span>
            <span className="text-xl font-black text-slate-900 font-display">{products.length}</span>
          </div>
        </div>
      </div>

      {/* SALES ANALYTICS CHART COMPONENT (Always visible or in analytics tab) */}
      <SalesAnalyticsChart orders={orders} />

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Main Controls Card: Search, Date Filter & Export Suite */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-600" />
                  <span>Gestión de Pedidos & Reportes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filtra pedidos por fecha y estado para exportar balances ejecutivos en CSV o PDF.
                </p>
              </div>

              {/* Action Export Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={isExporting || filteredOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 hover:border-emerald-300 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar datos en formato CSV para Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Descargar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting || filteredOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition shadow-sm shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generar e imprimir reporte formal en PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>

            {/* Filter inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
              {/* Search bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, teléfono, # de pedido, zona..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Start Date */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">
                      Desde
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none">
                      Hasta
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters */}
              <div className="md:col-span-1 flex items-center justify-end">
                {(startDate || endDate || searchQuery || orderFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSearchQuery('');
                      setOrderFilter('all');
                    }}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
                    title="Limpiar filtros"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Date Presets & Status Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                  Rangos Rápidos:
                </span>
                <button
                  type="button"
                  onClick={() => handleSetPreset('today')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset('7days')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Últimos 7 días
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset('thisMonth')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Este Mes
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset('all')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Todo
                </button>
              </div>

              {/* Counter summary */}
              <div className="text-xs font-semibold text-slate-600">
                <span className="font-bold text-slate-900">{filteredOrders.length}</span> pedidos encontrados
                {' • '}
                Total: <span className="font-bold text-rose-600">${filteredTotalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Status pills selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">
                Estado:
              </span>
              {['all', 'pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                    orderFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st === 'all' ? 'Todos' : ORDER_STATUS_CONFIG[st as OrderStatus]?.label || st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 text-slate-500 text-xs space-y-2">
                <p className="font-bold text-slate-700 text-sm">No se encontraron pedidos con estos filtros</p>
                <p className="text-slate-400">Intenta cambiar el rango de fechas o los términos de búsqueda.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusCfg = ORDER_STATUS_CONFIG[order.status];
                const waUrl = getWhatsAppOrderUrl(order);

                return (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4"
                  >
                    {/* Top Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-display">
                            #{order.order_number}
                          </span>
                          <span className="text-xs font-bold text-slate-700">• {order.customer_name}</span>
                          <span className="text-xs text-slate-400">({order.customer_phone})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Items & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Ítems ({order.items?.length || 0}):</span>
                        <ul className="space-y-1 text-slate-600">
                          {order.items?.map((it, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>
                                {it.quantity}x {it.product_name} {it.flavor ? `(${it.flavor})` : ''}
                              </span>
                              <span className="font-semibold">${it.total_price.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <div>
                          <span className="font-bold text-slate-700">Dirección: </span>
                          <span className="text-slate-600">{order.shipping_address}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Pago: </span>
                          <span className="text-slate-600 capitalize">{order.payment_method} ({order.payment_status})</span>
                        </div>
                        {order.notes && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-1">
                            Notas: {order.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Change Status & Assign Driver controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600">Cambiar Estado:</label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-800"
                        >
                          <option value="pending">Pendiente / Recibido</option>
                          <option value="accepted">Aceptado</option>
                          <option value="preparing">En Preparación (Cocina)</option>
                          <option value="on_the_way">En Camino (Delivery)</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600">Repartidor:</label>
                        <select
                          value={order.delivery_driver_id || ''}
                          onChange={(e) => handleDriverAssign(order.id, e.target.value)}
                          className="text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-800"
                        >
                          <option value="">Sin asignar</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.full_name || 'Repartidor'} ({d.phone || 'Sin tel.'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Total: </span>
                        <span className="text-sm font-black text-rose-600 font-display">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display">Catálogo de Productos & Precios</h2>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  description: '',
                  price: 5.0,
                  category_id: categories[0]?.id || '',
                  image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
                  unit: 'Vaso',
                  is_available: true,
                  is_featured: false,
                });
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{prod.name}</h3>
                    <p className="text-xs text-rose-600 font-black mt-0.5">${prod.price.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {prod.is_available ? 'Disponible' : 'Agotado'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsProductModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVERS MANAGEMENT */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display">Flota de Repartidores (Puerto Padre)</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {drivers.length} Repartidores registrados
            </span>
          </div>

          {drivers.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
              <Bike className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No hay repartidores registrados aún</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Los usuarios que se registren con el rol &quot;Repartidor&quot; en la base de datos aparecerán aquí para asignarles pedidos en Puerto Padre.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-xs">
                      🛵
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{driver.full_name || 'Repartidor'}</h3>
                      <p className="text-xs text-slate-500">{driver.email || 'reparto@heladoscaram.cu'}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{driver.phone || 'Sin teléfono'}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Activo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS EXTENDED VIEW */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment methods breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Ingresos por Método de Pago</span>
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'cash', label: 'Efectivo contra entrega', color: 'bg-emerald-500' },
                  { id: 'transfer', label: 'Transferencia (Transfermóvil / EnZona)', color: 'bg-blue-500' },
                  { id: 'zelle', label: 'Zelle (Familiares exterior)', color: 'bg-purple-500' },
                  { id: 'paypal', label: 'PayPal (Internacional)', color: 'bg-indigo-500' },
                ].map((pm) => {
                  const pmOrders = orders.filter((o) => o.payment_method === pm.id && o.status !== 'cancelled');
                  const pmTotal = pmOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                  const percentage = totalRevenue > 0 ? (pmTotal / totalRevenue) * 100 : 0;

                  return (
                    <div key={pm.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">{pm.label}</span>
                        <span className="text-slate-900 font-bold">${pmTotal.toFixed(2)} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pm.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Zones breakdown */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Demanda por Zona en Puerto Padre</span>
              </h3>

              <div className="space-y-3">
                {DEFAULT_DELIVERY_ZONES.map((zone) => {
                  const zoneOrders = orders.filter(
                    (o) => o.delivery_zone_id === zone.id && o.status !== 'cancelled'
                  );
                  const zoneCount = zoneOrders.length;
                  const percent = orders.length > 0 ? (zoneCount / orders.length) * 100 : 0;

                  return (
                    <div key={zone.id} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">{zone.name}</span>
                        <span className="text-slate-900 font-bold">{zoneCount} pedidos ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
              {editingProduct.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ej: Tina Helado Vainilla & Caramelo 4.5L"
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Precio Anterior (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.previous_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, previous_price: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Categoría</label>
                <select
                  value={editingProduct.category_id || categories[0]?.id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">URL de Imagen</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_available: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Disponible para la venta</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured === true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Destacado / Más Vendido</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase shadow-md transition"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
