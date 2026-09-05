import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, DeliveryZone } from '../types';
import { DEFAULT_DELIVERY_ZONES } from '../config/constants';
import { useNotifications } from './NotificationContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  selectedZone: DeliveryZone;
  setSelectedZone: (zone: DeliveryZone) => void;
  addItem: (product: Product, quantity?: number, selectedFlavor?: string, specialNotes?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedFlavor?: string) => void;
  removeItem: (productId: string, selectedFlavor?: string) => void;
  clearCart: () => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const LOCAL_CART_KEY = 'caram_shopping_cart';
const LOCAL_ZONE_KEY = 'caram_selected_zone';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useNotifications();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedZone, setSelectedZoneState] = useState<DeliveryZone>(DEFAULT_DELIVERY_ZONES[0]);
  const [discount, setDiscount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cart from local storage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      const storedZone = localStorage.getItem(LOCAL_ZONE_KEY);
      if (storedZone) {
        const parsed = JSON.parse(storedZone);
        const match = DEFAULT_DELIVERY_ZONES.find((z) => z.id === parsed.id) || parsed;
        setSelectedZoneState(match);
      }
    } catch (e) {
      console.warn('Error reading saved cart from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error writing cart to storage:', e);
    }
  }, [items, isLoaded]);

  const setSelectedZone = (zone: DeliveryZone) => {
    setSelectedZoneState(zone);
    try {
      localStorage.setItem(LOCAL_ZONE_KEY, JSON.stringify(zone));
    } catch (e) {
      console.warn('Error saving zone:', e);
    }
  };

  const addItem = (
    product: Product,
    quantity = 1,
    selectedFlavor?: string,
    specialNotes?: string
  ) => {
    const qty = Math.max(1, quantity);
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedFlavor === selectedFlavor
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + qty,
          specialNotes: specialNotes || next[existingIdx].specialNotes,
        };
        return next;
      } else {
        return [...prev, { product, quantity: qty, selectedFlavor, specialNotes }];
      }
    });

    showToast({
      title: '🍦 ¡Añadido al carrito!',
      message: `${qty}x ${product.name}`,
      type: 'success',
      duration: 3000,
    });
  };

  const updateQuantity = (productId: string, quantity: number, selectedFlavor?: string) => {
    if (quantity <= 0) {
      removeItem(productId, selectedFlavor);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedFlavor === selectedFlavor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (productId: string, selectedFlavor?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedFlavor === selectedFlavor)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setOrderNotes('');
    try {
      localStorage.removeItem(LOCAL_CART_KEY);
    } catch (e) {
      // ignore
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = items.length > 0 ? selectedZone.delivery_fee : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        total,
        selectedZone,
        setSelectedZone,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        orderNotes,
        setOrderNotes,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
