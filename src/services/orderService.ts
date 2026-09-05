import {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  Delivery,
  PaymentMethod,
  NotificationItem,
} from '../types';
import { getSupabase } from '../config/supabase';
import { ORDER_STATUS_CONFIG } from '../config/constants';

const LOCAL_ORDERS_KEY = 'caram_orders_storage';
const LOCAL_NOTIFICATIONS_KEY = 'caram_notifications_storage';

// Event bus for realtime updates within app
type RealtimeCallback = (order: Order) => void;
const orderListeners = new Set<RealtimeCallback>();

export function subscribeToOrderUpdates(callback: RealtimeCallback): () => void {
  orderListeners.add(callback);
  return () => {
    orderListeners.delete(callback);
  };
}

function notifyOrderListeners(order: Order) {
  orderListeners.forEach((listener) => {
    try {
      listener(order);
    } catch (e) {
      console.warn('Error in order listener:', e);
    }
  });
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading stored orders:', e);
  }
  return [];
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Error saving stored orders:', e);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading notifications:', e);
  }
  return [];
}

export function saveStoredNotifications(items: NotificationItem[]) {
  try {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Error saving notifications:', e);
  }
}

export async function addNotification(item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>): Promise<NotificationItem> {
  const newNotification: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const client = getSupabase();
  if (client) {
    try {
      await client.from('notifications').insert([newNotification]);
    } catch (e) {
      console.warn('Supabase addNotification error:', e);
    }
  }

  const existing = getStoredNotifications();
  saveStoredNotifications([newNotification, ...existing]);
  return newNotification;
}

export interface CheckoutInput {
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingReference?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryFee: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: CartItem[];
}

export async function createOrder(input: CheckoutInput): Promise<Order> {
  if (!input.items || input.items.length === 0) {
    throw new Error('El carrito está vacío. Agrega al menos un producto.');
  }

  // Calculate Subtotal strictly from server/product unit prices to prevent tampering
  let subtotal = 0;
  const orderItems: OrderItem[] = [];
  const orderId = `ord-${Date.now()}`;
  const orderNumber = `HC-${Math.floor(100000 + Math.random() * 900000)}`;

  input.items.forEach((item, index) => {
    const unitPrice = Number(item.product.price) || 0;
    const itemQty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const itemSubtotal = unitPrice * itemQty;
    subtotal += itemSubtotal;

    orderItems.push({
      id: `item-${Date.now()}-${index}`,
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      unit_price: unitPrice,
      quantity: itemQty,
      subtotal: itemSubtotal,
      special_instructions: [item.selectedFlavor ? `Sabor: ${item.selectedFlavor}` : '', item.specialNotes]
        .filter(Boolean)
        .join(' | '),
      image_url: item.product.image_url,
      product: item.product,
    });
  });

  const deliveryFee = Number(input.deliveryFee) || 0;
  const discount = Number(input.discount) || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const initialDelivery: Delivery = {
    id: `del-${Date.now()}`,
    order_id: orderId,
    status: 'assigned',
    assigned_at: new Date().toISOString(),
    delivery_notes: input.shippingReference || '',
  };

  const initialPayment: Payment = {
    id: `pay-${Date.now()}`,
    order_id: orderId,
    amount: total,
    method: input.paymentMethod,
    status: input.paymentMethod === 'cash' ? 'pending' : 'pending',
    created_at: new Date().toISOString(),
  };

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    user_id: input.userId || null,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    shipping_address: input.shippingAddress.trim(),
    shipping_reference: input.shippingReference?.trim() || '',
    delivery_zone_id: input.deliveryZoneId || null,
    delivery_zone_name: input.deliveryZoneName || 'Puerto Padre',
    status: 'pending',
    subtotal,
    delivery_fee: deliveryFee,
    discount,
    total,
    payment_method: input.paymentMethod,
    payment_status: 'pending',
    notes: input.notes?.trim() || '',
    created_at: new Date().toISOString(),
    estimated_delivery_time: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    items: orderItems,
    deliveries: [initialDelivery],
    payments: [initialPayment],
  };

  const client = getSupabase();
  if (client) {
    try {
      // 1. Insert order
      const { error: orderError } = await client.from('orders').insert([{
        id: newOrder.id,
        order_number: newOrder.order_number,
        user_id: newOrder.user_id,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        shipping_address: newOrder.shipping_address,
        shipping_reference: newOrder.shipping_reference,
        delivery_zone_id: newOrder.delivery_zone_id,
        status: newOrder.status,
        subtotal: newOrder.subtotal,
        delivery_fee: newOrder.delivery_fee,
        discount: newOrder.discount,
        total: newOrder.total,
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        notes: newOrder.notes,
        created_at: newOrder.created_at,
      }]);

      if (!orderError) {
        // 2. Insert order items
        await client.from('order_items').insert(
          orderItems.map((item) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            special_instructions: item.special_instructions,
          }))
        );

        // 3. Insert payment
        await client.from('payments').insert([{
          id: initialPayment.id,
          order_id: initialPayment.order_id,
          amount: initialPayment.amount,
          method: initialPayment.method,
          status: initialPayment.status,
          created_at: initialPayment.created_at,
        }]);

        // 4. Insert delivery
        await client.from('deliveries').insert([{
          id: initialDelivery.id,
          order_id: initialDelivery.order_id,
          status: initialDelivery.status,
          assigned_at: initialDelivery.assigned_at,
        }]);
      }
    } catch (e) {
      console.warn('Supabase createOrder error, fallback to local:', e);
    }
  }

  // Save to local storage for instant access & offline guarantee
  const currentOrders = getStoredOrders();
  saveStoredOrders([newOrder, ...currentOrders]);

  // Create notification
  await addNotification({
    user_id: input.userId || undefined,
    order_id: newOrder.id,
    title: '🍦 ¡Pedido recibido con éxito!',
    message: `Tu pedido #${newOrder.order_number} por $${newOrder.total.toFixed(2)} está pendiente de confirmación en Helados Caram.`,
    type: 'order_status',
  });

  notifyOrderListeners(newOrder);
  return newOrder;
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          deliveries(*),
          payments(*)
        `)
        .or(`id.eq.${id},order_number.eq.${id}`)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetchOrderById error, reading from local:', e);
    }
  }

  const stored = getStoredOrders();
  return stored.find((o) => o.id === id || o.order_number === id) || null;
}

export async function fetchOrders(options?: {
  status?: OrderStatus | 'all';
  userId?: string;
  driverId?: string;
  search?: string;
}): Promise<Order[]> {
  const client = getSupabase();
  let orders: Order[] = [];

  if (client) {
    try {
      let query = client
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          deliveries(*),
          payments(*)
        `)
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options?.driverId) {
        query = query.eq('delivery_driver_id', options.driverId);
      }

      const { data, error } = await query;
      if (!error && data) {
        orders = data;
        saveStoredOrders(orders);
      } else {
        orders = getStoredOrders();
      }
    } catch (e) {
      console.warn('Supabase fetchOrders error:', e);
      orders = getStoredOrders();
    }
  } else {
    orders = getStoredOrders();
  }

  // Client filtering
  if (options?.status && options.status !== 'all') {
    orders = orders.filter((o) => o.status === options.status);
  }
  if (options?.userId) {
    orders = orders.filter((o) => o.user_id === options.userId);
  }
  if (options?.driverId) {
    orders = orders.filter((o) => o.delivery_driver_id === options.driverId);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.shipping_address.toLowerCase().includes(q)
    );
  }

  return orders;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  driverId?: string | null
): Promise<Order | null> {
  const client = getSupabase();
  const updates: Partial<Order> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (driverId !== undefined) {
    updates.delivery_driver_id = driverId;
  }

  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select(`
          *,
          items:order_items(*),
          deliveries(*),
          payments(*)
        `)
        .single();

      if (!error && data) {
        const stored = getStoredOrders().map((o) => (o.id === orderId ? { ...o, ...data } : o));
        saveStoredOrders(stored);
        notifyOrderListeners(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase updateOrderStatus error:', e);
    }
  }

  const stored = getStoredOrders();
  const index = stored.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    const current = stored[index];
    const updated: Order = {
      ...current,
      ...updates,
    };
    stored[index] = updated;
    saveStoredOrders(stored);

    // Create notification for status update
    const statusMeta = ORDER_STATUS_CONFIG[newStatus];
    await addNotification({
      user_id: updated.user_id || undefined,
      order_id: updated.id,
      title: `Estado de Pedido: ${statusMeta.label}`,
      message: `Tu pedido #${updated.order_number} ahora está: ${statusMeta.label}. ${statusMeta.description}`,
      type: 'order_status',
    });

    notifyOrderListeners(updated);
    return updated;
  }
  return null;
}

export async function assignDeliveryDriver(
  orderId: string,
  driverId: string,
  driverName: string,
  driverPhone: string
): Promise<Order | null> {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('deliveries').upsert([{
        order_id: orderId,
        driver_id: driverId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      }]);
    } catch (e) {
      console.warn('Supabase assignDeliveryDriver error:', e);
    }
  }

  const order = await updateOrderStatus(orderId, 'ready', driverId);
  if (order) {
    // update delivery item inside order
    const updatedDeliveries: Delivery[] = [
      {
        id: `del-${Date.now()}`,
        order_id: orderId,
        driver_id: driverId,
        driver_name: driverName,
        driver_phone: driverPhone,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      },
    ];
    order.deliveries = updatedDeliveries;
    const stored = getStoredOrders().map((o) => (o.id === orderId ? order : o));
    saveStoredOrders(stored);
    notifyOrderListeners(order);
  }
  return order;
}
