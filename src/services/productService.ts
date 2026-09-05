import { Category, Product } from '../types';
import { getSupabase } from '../config/supabase';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './mockData';

const LOCAL_PRODUCTS_KEY = 'caram_products_cache';
const LOCAL_CATEGORIES_KEY = 'caram_categories_cache';

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored products cache:', e);
  }
  return [];
}

function saveStoredProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving stored products cache:', e);
  }
}

function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored categories cache:', e);
  }
  return [];
}

function saveStoredCategories(categories: Category[]) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving stored categories cache:', e);
  }
}

/**
 * Ensures initial categories and products exist in Supabase if the tables are empty
 */
export async function seedSupabaseIfEmpty(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { count: catCount, error: catErr } = await client
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (!catErr && (catCount === null || catCount === 0)) {
      console.log('Inicializando categorías en Supabase...');
      await client.from('categories').insert(INITIAL_CATEGORIES);
    }

    const { count: prodCount, error: prodErr } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (!prodErr && (prodCount === null || prodCount === 0)) {
      console.log('Inicializando productos del menú en Supabase...');
      await client.from('products').insert(INITIAL_PRODUCTS);
    }

    return true;
  } catch (e) {
    console.warn('Error al verificar/sembrar datos iniciales en Supabase:', e);
    return false;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        if (data.length === 0) {
          // Attempt seed once
          await seedSupabaseIfEmpty();
          const { data: seeded } = await client
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });
          if (seeded && seeded.length > 0) {
            saveStoredCategories(seeded);
            return seeded;
          }
        }
        saveStoredCategories(data);
        return data;
      }
      if (error) {
        console.error('Error de Supabase al obtener categorías:', error.message);
      }
    } catch (err) {
      console.error('Excepción al consultar categorías en Supabase:', err);
    }
  }

  // Fallback cache
  const cached = getStoredCategories();
  if (cached.length > 0) return cached;
  return INITIAL_CATEGORIES;
}

export async function fetchProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  availableOnly?: boolean;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'name';
}): Promise<Product[]> {
  const client = getSupabase();

  if (client) {
    try {
      let query = client.from('products').select('*, category:categories(*)');

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options?.featuredOnly) {
        query = query.eq('is_featured', true);
      }
      if (options?.availableOnly) {
        query = query.eq('is_available', true);
      }
      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      if (options?.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (options?.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (options?.sortBy === 'name') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        if (data.length === 0 && !options?.categoryId && !options?.search) {
          // Attempt seed once
          await seedSupabaseIfEmpty();
          const { data: seeded } = await client.from('products').select('*, category:categories(*)');
          if (seeded && seeded.length > 0) {
            saveStoredProducts(seeded);
            return seeded;
          }
        }
        saveStoredProducts(data);
        return data;
      }
      if (error) {
        console.error('Error de Supabase al obtener productos:', error.message);
      }
    } catch (err) {
      console.error('Excepción al consultar productos en Supabase:', err);
    }
  }

  const cached = getStoredProducts();
  if (cached.length > 0) return cached;
  return INITIAL_PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('products')
        .select('*, category:categories(*)')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.error('Error al consultar producto por slug en Supabase:', err);
    }
  }

  const stored = getStoredProducts();
  return stored.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    category_id: product.category_id || 'cat-vasos',
    name: product.name || 'Nuevo Producto',
    slug: product.slug || `producto-${Date.now()}`,
    description: product.description || '',
    price: Number(product.price) || 0,
    previous_price: product.previous_price ? Number(product.previous_price) : null,
    sku: product.sku || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
    stock: Number(product.stock) || 10,
    image_url:
      product.image_url ||
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80',
    is_featured: Boolean(product.is_featured),
    is_available: product.is_available !== false,
    unit: product.unit || 'Unidad',
    flavors: product.flavors || [],
    created_at: new Date().toISOString(),
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('products').insert([newProduct]).select().single();
      if (!error && data) {
        const stored = getStoredProducts();
        saveStoredProducts([data, ...stored]);
        return data;
      }
      if (error) {
        console.error('Error insertando producto en Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al crear producto en Supabase:', e);
    }
  }

  const current = getStoredProducts();
  const updated = [newProduct, ...current];
  saveStoredProducts(updated);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const stored = getStoredProducts().map((p) => (p.id === id ? { ...p, ...data } : p));
        saveStoredProducts(stored);
        return data;
      }
      if (error) {
        console.error('Error actualizando producto en Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al actualizar producto en Supabase:', e);
    }
  }

  const stored = getStoredProducts();
  const idx = stored.findIndex((p) => p.id === id);
  if (idx !== -1) {
    stored[idx] = { ...stored[idx], ...updates, updated_at: new Date().toISOString() };
    saveStoredProducts(stored);
    return stored[idx];
  }
  return null;
}

export async function upsertProduct(product: Partial<Product>): Promise<Product> {
  if (product.id) {
    const updated = await updateProduct(product.id, product);
    if (updated) return updated;
  }
  return createProduct(product);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from('products').delete().eq('id', id);
      if (!error) {
        const stored = getStoredProducts().filter((p) => p.id !== id);
        saveStoredProducts(stored);
        return true;
      }
      if (error) {
        console.error('Error eliminando producto de Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al eliminar producto en Supabase:', e);
    }
  }

  const stored = getStoredProducts().filter((p) => p.id !== id);
  saveStoredProducts(stored);
  return true;
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: category.name || 'Nueva Categoría',
    slug: category.slug || `categoria-${Date.now()}`,
    description: category.description || '',
    icon: category.icon || 'IceCream',
    image_url: category.image_url || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80',
    display_order: Number(category.display_order) || 99,
    is_active: category.is_active !== false,
    created_at: new Date().toISOString(),
  };

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('categories').insert([newCat]).select().single();
      if (!error && data) {
        const stored = getStoredCategories();
        saveStoredCategories([...stored, data]);
        return data;
      }
      if (error) {
        console.error('Error insertando categoría en Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al crear categoría en Supabase:', e);
    }
  }

  const stored = getStoredCategories();
  const updated = [...stored, newCat];
  saveStoredCategories(updated);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const stored = getStoredCategories().map((c) => (c.id === id ? { ...c, ...data } : c));
        saveStoredCategories(stored);
        return data;
      }
      if (error) {
        console.error('Error actualizando categoría en Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al actualizar categoría en Supabase:', e);
    }
  }

  const stored = getStoredCategories();
  const idx = stored.findIndex((c) => c.id === id);
  if (idx !== -1) {
    stored[idx] = { ...stored[idx], ...updates };
    saveStoredCategories(stored);
    return stored[idx];
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const client = getSupabase();
  if (client) {
    try {
      const { error } = await client.from('categories').delete().eq('id', id);
      if (!error) {
        const stored = getStoredCategories().filter((c) => c.id !== id);
        saveStoredCategories(stored);
        return true;
      }
      if (error) {
        console.error('Error eliminando categoría en Supabase:', error.message);
      }
    } catch (e) {
      console.error('Excepción al eliminar categoría en Supabase:', e);
    }
  }

  const stored = getStoredCategories().filter((c) => c.id !== id);
  saveStoredCategories(stored);
  return true;
}

export async function uploadProductImage(file: File): Promise<string> {
  const client = getSupabase();
  if (client) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data } = client.storage.from('products').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (e) {
      console.error('Storage upload exception:', e);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

