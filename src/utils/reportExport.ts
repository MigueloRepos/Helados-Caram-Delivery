import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { ORDER_STATUS_CONFIG, PAYMENT_METHODS } from '../config/constants';

export interface ReportFilterMeta {
  startDate?: string;
  endDate?: string;
  statusFilter?: string;
  searchQuery?: string;
}

/**
 * Exports filtered orders to CSV formatted with UTF-8 BOM for full Excel/Spanish compatibility.
 */
export function exportOrdersToCSV(orders: Order[], meta?: ReportFilterMeta): void {
  if (!orders || orders.length === 0) {
    throw new Error('No hay pedidos en el rango seleccionado para exportar.');
  }

  const headers = [
    'Nº Pedido',
    'Fecha',
    'Hora',
    'Cliente',
    'Teléfono',
    'Dirección de Entrega',
    'Zona',
    'Tipo de Entrega',
    'Estado',
    'Método de Pago',
    'Subtotal ($)',
    'Costo Envío ($)',
    'Total ($)',
    'Cantidad Productos',
    'Detalle de Productos / Sabores',
    'Notas / Referencia',
  ];

  const rows = orders.map((order) => {
    const dateObj = new Date(order.created_at);
    const dateStr = dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeStr = dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusLabel = ORDER_STATUS_CONFIG[order.status]?.label || order.status;
    const paymentLabel =
      PAYMENT_METHODS.find((pm) => pm.id === order.payment_method)?.name ||
      order.payment_method ||
      'Efectivo';

    const itemsSummary =
      order.items
        ?.map((item) => {
          const flavor = item.special_instructions || '';
          return `${item.quantity}x ${item.product_name || 'Helado'} ${flavor ? `(${flavor})` : ''}`;
        })
        .join('; ') || 'N/A';

    const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

    const escapeCsvField = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    };

    return [
      escapeCsvField(order.order_number),
      escapeCsvField(dateStr),
      escapeCsvField(timeStr),
      escapeCsvField(order.customer_name),
      escapeCsvField(order.customer_phone),
      escapeCsvField(order.shipping_address),
      escapeCsvField(order.delivery_zone_name || 'Puerto Padre'),
      escapeCsvField(order.delivery_type === 'pickup' ? 'Recogida Local' : 'Domicilio'),
      escapeCsvField(statusLabel),
      escapeCsvField(paymentLabel),
      escapeCsvField((order.subtotal || 0).toFixed(2)),
      escapeCsvField((order.delivery_fee || 0).toFixed(2)),
      escapeCsvField((order.total || 0).toFixed(2)),
      escapeCsvField(itemCount),
      escapeCsvField(itemsSummary),
      escapeCsvField(order.shipping_reference || order.notes || ''),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const startSlug = meta?.startDate ? meta.startDate : 'inicio';
  const endSlug = meta?.endDate ? meta.endDate : 'actual';
  link.setAttribute('download', `helados_caram_pedidos_${startSlug}_a_${endSlug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, branded PDF report for Helados Caram orders.
 */
export function exportOrdersToPDF(orders: Order[], meta?: ReportFilterMeta): void {
  if (!orders || orders.length === 0) {
    throw new Error('No hay pedidos en el rango seleccionado para exportar.');
  }

  // Create document in portrait or landscape (landscape fits more columns)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const reportDateStr = now.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate totals
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingCount = orders.filter((o) => ['pending', 'accepted', 'preparing', 'on_the_way'].includes(o.status)).length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  // Header Banner
  doc.setFillColor(225, 29, 72); // Rose-600 Caram Primary
  doc.rect(0, 0, 297, 24, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HELADOS CARAM • REPORTE EJECUTIVO DE PEDIDOS', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Heladería & Dulcería Artesanal • Puerto Padre, Las Tunas, Cuba', 14, 18);

  doc.setFontSize(8);
  doc.text(`Generado: ${reportDateStr}`, 283, 18, { align: 'right' });

  // Metadata Box (Filters & KPI Summary)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 28, 269, 20, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Rango del Reporte:', 18, 35);
  doc.setFont('helvetica', 'normal');
  const dateRangeText =
    meta?.startDate && meta?.endDate
      ? `Del ${meta.startDate} al ${meta.endDate}`
      : meta?.startDate
      ? `Desde ${meta.startDate}`
      : meta?.endDate
      ? `Hasta ${meta.endDate}`
      : 'Historial Completo';
  doc.text(dateRangeText, 52, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Filtro Estado:', 18, 42);
  doc.setFont('helvetica', 'normal');
  const filterStatusText = meta?.statusFilter && meta.statusFilter !== 'all'
    ? ORDER_STATUS_CONFIG[meta.statusFilter as any]?.label || meta.statusFilter
    : 'Todos los Estados';
  doc.text(filterStatusText, 52, 42);

  // Metrics on right side of header box
  doc.setFont('helvetica', 'bold');
  doc.text('Total Registros:', 130, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`${orders.length} pedidos`, 160, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Ventas Válidas:', 130, 42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`$${totalRevenue.toFixed(2)} USD/CUP`, 160, 42);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`(Entregados: ${deliveredCount} | Activos: ${pendingCount} | Cancelados: ${cancelledCount})`, 212, 42);

  // Table Data
  const tableData = orders.map((o) => {
    const dateObj = new Date(o.created_at);
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const statusMeta = ORDER_STATUS_CONFIG[o.status]?.label || o.status;
    const paymentMeta =
      PAYMENT_METHODS.find((pm) => pm.id === o.payment_method)?.name || o.payment_method || 'Efectivo';
    const itemsShort =
      o.items
        ?.map((it) => `${it.quantity}x ${it.product_name}`)
        .join(', ') || 'Productos';

    return [
      o.order_number,
      dateStr,
      o.customer_name,
      o.customer_phone,
      o.delivery_zone_name || 'Puerto Padre',
      itemsShort,
      statusMeta,
      paymentMeta,
      `$${(Number(o.total) || 0).toFixed(2)}`,
    ];
  });

  // Generate Table
  autoTable(doc, {
    startY: 52,
    head: [
      [
        'Nº Pedido',
        'Fecha/Hora',
        'Cliente',
        'Teléfono',
        'Zona Entrega',
        'Productos',
        'Estado',
        'Método Pago',
        'Total ($)',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [51, 65, 85],
      lineColor: [241, 245, 249],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 26 },
      2: { cellWidth: 34 },
      3: { cellWidth: 26 },
      4: { cellWidth: 28 },
      5: { cellWidth: 55 },
      6: { cellWidth: 24 },
      7: { cellWidth: 30 },
      8: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Helados Caram • Puerto Padre, Las Tunas • Sistema de Control de Pedidos',
        14,
        doc.internal.pageSize.height - 8
      );
      doc.text(str, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 8);
    },
  });

  // Download PDF
  const startSlug = meta?.startDate ? meta.startDate : 'inicio';
  const endSlug = meta?.endDate ? meta.endDate : 'actual';
  doc.save(`helados_caram_reporte_pedidos_${startSlug}_a_${endSlug}.pdf`);
}
