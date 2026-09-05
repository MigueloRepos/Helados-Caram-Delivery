import { useEffect, useState } from 'react';
import { Order } from '../types';
import { getSupabase } from '../config/supabase';
import { fetchOrders, subscribeToOrderUpdates } from '../services/orderService';

export function useRealtimeOrders(options?: {
  status?: string;
  userId?: string;
  driverId?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders(options as any);
      setOrders(data);
    } catch (e) {
      console.warn('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // 1. Subscribe to internal event bus
    const unsubscribeBus = subscribeToOrderUpdates((updatedOrder) => {
      setOrders((prev) => {
        const index = prev.findIndex((o) => o.id === updatedOrder.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = updatedOrder;
          return next;
        }
        return [updatedOrder, ...prev];
      });
    });

    // 2. Subscribe to Supabase Realtime Channel if configured
    const client = getSupabase();
    let channel: any = null;

    if (client) {
      try {
        channel = client
          .channel('public:orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              loadOrders();
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription error:', e);
      }
    }

    return () => {
      unsubscribeBus();
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, [options?.status, options?.userId, options?.driverId]);

  return { orders, isLoading, refresh: loadOrders };
}
