import { OrderStatus, PaymentMethod } from '../types';

export const BUSINESS_CONFIG = {
  name: import.meta.env.VITE_BUSINESS_NAME || 'Helados Caram',
  tagline: 'Heladería y Dulcería Artesanal',
  city: 'Puerto Padre',
  province: 'Las Tunas',
  country: 'Cuba',
  fullLocation: import.meta.env.VITE_BUSINESS_LOCATION || 'Puerto Padre, Las Tunas, Cuba',
  address: 'Calle Máximo Gómez e/ Ave. Libertad y Martí, Puerto Padre',
  phone: '+53 52000000',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '+5352000000',
  currency: '$',
  currencyCode: 'USD',
  openingHours: 'Lunes a Domingo: 10:00 AM – 10:00 PM',
};

export const DEFAULT_DELIVERY_ZONES = [
  {
    id: 'zone-centro',
    name: 'Puerto Padre Centro y Malecón',
    description: 'Casco urbano, Av. Libertad, Parques y Malecón',
    delivery_fee: 1.5,
    estimated_minutes: 25,
    is_active: true,
  },
  {
    id: 'zone-boca',
    name: 'La Boca / Playita',
    description: 'Sector costero y Reparto Militar',
    delivery_fee: 2.5,
    estimated_minutes: 35,
    is_active: true,
  },
  {
    id: 'zone-boqueron',
    name: 'El Boquerón / Boquerones',
    description: 'Carretera a Delicias y periferia este',
    delivery_fee: 3.0,
    estimated_minutes: 40,
    is_active: true,
  },
  {
    id: 'zone-delicias',
    name: 'Poblado Delicias (Central)',
    description: 'Comunidad azucarera y áreas circundantes',
    delivery_fee: 4.0,
    estimated_minutes: 45,
    is_active: true,
  },
  {
    id: 'zone-pickup',
    name: 'Recogida en Heladería (Pick-up)',
    description: 'Recoge gratis en nuestro local en Calle Máximo Gómez',
    delivery_fee: 0.0,
    estimated_minutes: 15,
    is_active: true,
  },
];

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; description: string; badge?: string }[] = [
  {
    id: 'cash',
    name: 'Efectivo contra entrega',
    description: 'Paga en CUP o USD en mano al recibir tu pedido en Puerto Padre.',
    badge: 'Popular',
  },
  {
    id: 'transfer',
    name: 'Transferencia (Transfermóvil / EnZona)',
    description: 'Pago por tarjeta magnética en CUP.',
    badge: 'Inmediato',
  },
  {
    id: 'zelle',
    name: 'Zelle (Familiares en el exterior)',
    description: 'Ideal para que tus familiares fuera de Cuba inviten helados a tu casa.',
    badge: 'Exterior',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pago internacional seguro con tarjeta de crédito o balance.',
    badge: 'Internacional',
  },
  {
    id: 'other',
    name: 'Otro acuerdo de pago',
    description: 'Coordinar con nuestro equipo por WhatsApp.',
  },
];

export const PAYMENT_METHOD_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  cash: {
    label: 'Efectivo contra entrega',
    icon: 'Banknote',
    description: 'Paga en mano en CUP o USD cuando recibas tu pedido.',
  },
  transfer: {
    label: 'Transferencia (Transfermóvil / EnZona)',
    icon: 'CreditCard',
    description: 'Transferencia bancaria local inmediata.',
  },
  zelle: {
    label: 'Zelle (Familiares en el exterior)',
    icon: 'Send',
    description: 'Envío directo por Zelle para familiares en el exterior.',
  },
  paypal: {
    label: 'PayPal',
    icon: 'Globe',
    description: 'Pago seguro internacional con tarjeta o saldo.',
  },
  other: {
    label: 'Otro acuerdo de pago',
    icon: 'HelpCircle',
    description: 'Coordinar con nuestro equipo por WhatsApp.',
  },
};

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; step: number; description: string }
> = {
  pending: {
    label: 'Pendiente',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    step: 1,
    description: 'Hemos recibido tu pedido y está a la espera de confirmación.',
  },
  accepted: {
    label: 'Aceptado',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    step: 2,
    description: 'Tu pedido ha sido aceptado por el equipo de Helados Caram.',
  },
  confirmed: {
    label: 'Confirmado',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    step: 2,
    description: 'Tu pedido ha sido aceptado por el equipo de Helados Caram.',
  },
  preparing: {
    label: 'Preparando',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    step: 3,
    description: 'Nuestros maestros heladeros y reposteros están preparando tus delicias.',
  },
  ready: {
    label: 'Listo',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    step: 4,
    description: 'Tu pedido está empacado en frío y listo para entrega.',
  },
  on_the_way: {
    label: 'En camino',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    step: 5,
    description: 'El repartidor va rumbo a tu dirección en Puerto Padre con empaque térmico.',
  },
  out_for_delivery: {
    label: 'En camino',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    step: 5,
    description: 'El repartidor va rumbo a tu dirección con empaque térmico.',
  },
  delivered: {
    label: 'Entregado',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    step: 6,
    description: '¡Disfruta de tu momento dulce!',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    step: 0,
    description: 'El pedido ha sido cancelado.',
  },
};

export const DEFAULT_DELIVERY_DRIVERS = [
  {
    id: 'driver-1',
    full_name: 'Carlos Leyva',
    phone: '+53 58123456',
    vehicle_info: 'Moto Suzuki Azul - Puerto Padre',
    status: 'active' as const,
  },
  {
    id: 'driver-2',
    full_name: 'Ernesto Martínez',
    phone: '+53 58987654',
    vehicle_info: 'Moto Eléctrica Águila Roja',
    status: 'active' as const,
  },
  {
    id: 'driver-3',
    full_name: 'Yoandry Almaguer',
    phone: '+53 58456789',
    vehicle_info: 'Moto Taeko Negra',
    status: 'active' as const,
  },
];
