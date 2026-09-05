export type UserRole = 'admin' | 'employee' | 'delivery' | 'customer';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'transfer' | 'zelle' | 'paypal' | 'other';

export interface Profile {
  id: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  previous_price?: number | null;
  sku?: string;
  stock: number;
  image_url: string;
  is_featured: boolean;
  is_available: boolean;
  unit?: string; // e.g., 'vaso', 'tina 4.5L', 'unidad', 'porción'
  flavors?: string[];
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface Address {
  id: string;
  user_id?: string;
  recipient_name: string;
  phone: string;
  street: string;
  reference?: string;
  neighborhood?: string;
  city: string; // Puerto Padre
  delivery_zone_id?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  delivery_fee: number;
  estimated_minutes: number;
  is_active: boolean;
}

export interface DeliveryDriver {
  id: string;
  full_name: string;
  phone: string;
  vehicle_info?: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_reference?: string;
  delivery_type?: 'delivery' | 'pickup';
  delivery_zone_id?: string | null;
  delivery_zone_name?: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  estimated_delivery_time?: string;
  delivery_driver_id?: string | null;
  delivery_driver?: DeliveryDriver;
  items?: OrderItem[];
  deliveries?: Delivery[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  special_instructions?: string;
  image_url?: string;
  product?: Product;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id?: string | null;
  driver_name?: string;
  driver_phone?: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  delivery_notes?: string;
  tracking_url?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  order_id?: string;
  title: string;
  message: string;
  type: 'order_status' | 'promo' | 'system';
  is_read: boolean;
  created_at: string;
}
