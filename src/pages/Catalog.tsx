import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Filter, X, Grid, ShoppingBag } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../services/productService';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'name'>('popular');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.warn('Error loading catalog data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter and sort products
  const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug);

  const filteredProducts = products.filter((product) => {
    // Category match
    if (selectedCategorySlug !== 'all' && selectedCategory) {
      if (product.category_id !== selectedCategory.id) return false;
    }

    // Availability
    if (availableOnly && !product.is_available) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchFlavor = product.flavors?.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchFlavor) return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // default 'popular' (featured first)
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-500/10 p-6 sm:p-8 border border-rose-200/70">
        <div className="max-w-2xl">
          <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">
            Catálogo Completo
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
            {selectedCategory ? selectedCategory.name : 'Menú & Especialidades'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {selectedCategory?.description ||
              'Helados en vasos térmicos, tinas de 4.5 Litros, cakes personalizados y dulcería fina con envíos en Puerto Padre.'}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar helado, cake, marquesita, sabor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Availability Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Solo disponibles</span>
            </label>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden"
              >
                <option value="popular">Más Populares</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name">Alfabético</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all active:scale-95 ${
              selectedCategorySlug === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🍨 Todos los Productos ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            No se encontraron productos
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta cambiar el término de búsqueda o selecciona otra categoría de nuestro menú.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              handleCategorySelect('all');
              setAvailableOnly(false);
            }}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
