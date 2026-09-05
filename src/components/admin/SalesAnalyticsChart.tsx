import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Order } from '../../types';

interface SalesAnalyticsChartProps {
  orders: Order[];
}

interface DailySalesData {
  dayName: string;
  dayShort: string;
  dateKey: string;
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
}

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const SalesAnalyticsChart: React.FC<SalesAnalyticsChartProps> = ({ orders }) => {
  const [chartMode, setChartMode] = useState<'comparison' | 'orders_revenue'>('comparison');

  // Calculate this week and previous week data
  const { chartData, currentWeekTotal, previousWeekTotal, growthRate, avgTicket, bestDay } = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    const now = new Date();
    // Get start of current week (Monday)
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon...
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - distanceToMonday);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const endOfPreviousWeek = new Date(startOfCurrentWeek);
    endOfPreviousWeek.setMilliseconds(-1);

    // Initialize 7 days array (Monday to Sunday)
    const daysData: DailySalesData[] = [];

    for (let i = 0; i < 7; i++) {
      const curDate = new Date(startOfCurrentWeek);
      curDate.setDate(startOfCurrentWeek.getDate() + i);

      const prevDate = new Date(startOfPreviousWeek);
      prevDate.setDate(startOfPreviousWeek.getDate() + i);

      const dayIdx = curDate.getDay();

      // Find orders matching curDate
      const curOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return (
          d.getDate() === curDate.getDate() &&
          d.getMonth() === curDate.getMonth() &&
          d.getFullYear() === curDate.getFullYear()
        );
      });

      // Find orders matching prevDate
      const prevOrders = validOrders.filter((o) => {
        const d = new Date(o.created_at);
        return (
          d.getDate() === prevDate.getDate() &&
          d.getMonth() === prevDate.getMonth() &&
          d.getFullYear() === prevDate.getFullYear()
        );
      });

      const currentRev = curOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      const previousRev = prevOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

      daysData.push({
        dayName: DAYS_ES[dayIdx],
        dayShort: DAYS_SHORT_ES[dayIdx],
        dateKey: curDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        currentRevenue: Number(currentRev.toFixed(2)),
        previousRevenue: Number(previousRev.toFixed(2)),
        currentOrders: curOrders.length,
        previousOrders: prevOrders.length,
      });
    }

    const curTotal = daysData.reduce((acc, d) => acc + d.currentRevenue, 0);
    const prevTotal = daysData.reduce((acc, d) => acc + d.previousRevenue, 0);
    const totalCurrentOrders = daysData.reduce((acc, d) => acc + d.currentOrders, 0);

    const growth =
      prevTotal > 0
        ? ((curTotal - prevTotal) / prevTotal) * 100
        : curTotal > 0
        ? 100
        : 0;

    const avg = totalCurrentOrders > 0 ? curTotal / totalCurrentOrders : 0;

    // Find best day of this week
    let maxRev = -1;
    let peakDay = 'N/A';
    daysData.forEach((d) => {
      if (d.currentRevenue > maxRev) {
        maxRev = d.currentRevenue;
        peakDay = `${d.dayName} ($${d.currentRevenue.toFixed(2)})`;
      }
    });

    return {
      chartData: daysData,
      currentWeekTotal: curTotal,
      previousWeekTotal: prevTotal,
      growthRate: growth,
      avgTicket: avg,
      bestDay: peakDay,
    };
  }, [orders]);

  // Custom Chart Tooltip
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailySalesData;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[190px]">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
            <span>{data.dayName}</span>
            <span className="text-[10px] text-slate-400">{data.dateKey}</span>
          </p>

          {chartMode === 'comparison' ? (
            <>
              <div className="flex justify-between items-center text-rose-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Esta Semana:
                </span>
                <span className="font-black">${data.currentRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  Semana Anterior:
                </span>
                <span className="font-medium">${data.previousRevenue.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                <span>Pedidos esta semana:</span>
                <span className="font-bold text-slate-700">{data.currentOrders}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center text-rose-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Ingresos ($):
                </span>
                <span className="font-black">${data.currentRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-blue-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Cantidad Pedidos:
                </span>
                <span className="font-black">{data.currentOrders}</span>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
      {/* Top Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display">
              Ventas Diarias & Comparativa Semanal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Análisis de ingresos por día en Puerto Padre (Semana Actual vs Semana Anterior)
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('comparison')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              chartMode === 'comparison'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparativa Semanal
          </button>
          <button
            type="button"
            onClick={() => setChartMode('orders_revenue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              chartMode === 'orders_revenue'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ingresos vs Pedidos
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Esta Semana
          </span>
          <p className="text-xl font-black text-rose-700 font-display">
            ${currentWeekTotal.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            {growthRate >= 0 ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{growthRate.toFixed(1)}%
              </span>
            ) : (
              <span className="text-rose-600 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> {growthRate.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400 font-normal">vs anterior</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Semana Anterior
          </span>
          <p className="text-xl font-black text-slate-800 font-display">
            ${previousWeekTotal.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Total 7 días previos</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            Ticket Promedio
          </span>
          <p className="text-xl font-black text-amber-700 font-display">
            ${avgTicket.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Por pedido realizado</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
            Día Más Fuerte
          </span>
          <p className="text-sm font-black text-purple-900 truncate mt-1">
            {bestDay}
          </p>
          <p className="text-[11px] text-slate-400">Pico de ventas semanal</p>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'comparison' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="currentWeekGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayShort"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              {/* Previous Week as subtle Gray/Slate Bars */}
              <Bar
                dataKey="previousRevenue"
                name="Semana Anterior ($)"
                fill="#cbd5e1"
                radius={[8, 8, 0, 0]}
                maxBarSize={32}
              />
              {/* Current Week as Rose Gradient Area + Line */}
              <Area
                type="monotone"
                dataKey="currentRevenue"
                name="Esta Semana ($)"
                stroke="#e11d48"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#currentWeekGrad)"
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="dayShort"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#3b82f6', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Bar
                yAxisId="left"
                dataKey="currentRevenue"
                name="Ingresos ($)"
                fill="url(#revenueBarGrad)"
                radius={[8, 8, 0, 0]}
                maxBarSize={36}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="currentOrders"
                name="Cantidad Pedidos"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
