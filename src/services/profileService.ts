import { Profile, UserRole, Order } from '../types';
import { getSupabase } from '../config/supabase';
import { fetchOrders } from './orderService';

const LOCAL_PROFILES_KEY = 'caram_profiles_cache';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (!error && data) {
        const verifiedRole: UserRole = (data.role || data.user_role || 'customer') as UserRole;
        const normalized: Profile = {
          ...data,
          id: data.id || userId,
          role: verifiedRole,
        };
        return normalized;
      }
      if (error) {
        console.error('Error fetching profile from Supabase profiles table:', error.message);
      }
    } catch (e) {
      console.error('Supabase fetchProfile error:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (raw) {
      const list: Profile[] = JSON.parse(raw);
      const found = list.find((p) => p.id === userId || p.user_id === userId);
      if (found) return found;
    }
  } catch (e) {
    console.error('LocalStorage profile read error:', e);
  }

  return null;
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
  const client = getSupabase();
  if (client) {
    try {
      const payload: any = {
        ...profile,
        user_id: profile.user_id || profile.id,
        role: profile.role,
        user_role: profile.role, // provide both for schema compatibility
      };

      const { data, error } = await client
        .from('profiles')
        .upsert([payload])
        .select()
        .single();
      if (!error && data) {
        const verifiedRole: UserRole = (data.role || data.user_role || profile.role) as UserRole;
        return {
          ...data,
          role: verifiedRole,
        };
      }
      if (error) {
        console.error('Error upserting profile in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase upsertProfile error:', e);
    }
  }

  let list: Profile[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const idx = list.findIndex((p) => p.id === profile.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...profile };
  } else {
    list.push(profile);
  }
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(list));
  return profile;
}

export async function fetchDeliveryDrivers(): Promise<Profile[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('role', 'delivery')
        .order('full_name', { ascending: true });

      if (!error && data) return data;
      if (error) {
        console.error('Error fetching delivery drivers from Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase fetchDeliveryDrivers error:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (raw) {
      const list: Profile[] = JSON.parse(raw);
      return list.filter((p) => p.role === 'delivery');
    }
  } catch (e) {
    // ignore
  }

  return [];
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase fetchAllProfiles error:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  return [];
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (!error) return true;
      if (error) {
        console.error('Error updating role in Supabase:', error.message);
      }
    } catch (e) {
      console.error('Supabase updateUserRole error:', e);
    }
  }
  return false;
}

export interface CustomerAnalytics {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  recentOrders: Order[];
}

export async function fetchCustomerAnalytics(): Promise<CustomerAnalytics[]> {
  const orders = await fetchOrders();
  const customerMap = new Map<string, CustomerAnalytics>();

  orders.forEach((order) => {
    const key = order.customer_phone || order.customer_name || 'Cliente';
    const existing = customerMap.get(key);

    if (!existing) {
      customerMap.set(key, {
        name: order.customer_name,
        phone: order.customer_phone,
        orderCount: 1,
        totalSpent: order.total,
        lastOrderDate: order.created_at,
        recentOrders: [order],
      });
    } else {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.created_at;
      }
      existing.recentOrders.push(order);
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

