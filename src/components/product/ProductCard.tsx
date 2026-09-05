import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.flavors && product.flavors.length > 0 ? product.flavors[0] : ''
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_available) return;

    addItem(product, 1, selectedFlavor || undefined);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-rose-300/80 transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-4/3 w-full overflow-hidden bg-rose-50/50 block"
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.is_featured && (
            <span className="flex items-center gap-1 rounded-full bg-rose-600/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Más Vendido</span>
            </span>
          )}
          {product.previous_price && (
            <span className="rounded-full bg-amber-500/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
              Oferta
            </span>
          )}
        </div>

        {!product.is_available && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-lg">
              <AlertCircle className="w-4 h-4" />
              Agotado Temporalmente
            </span>
          </div>
        )}

        {/* Unit Tag */}
        {product.unit && (
          <div className="absolute bottom-2.5 right-2.5 rounded-xl bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs">
            {product.unit}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-rose-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Flavor Selector if product has options */}
        {product.flavors && product.flavors.length > 1 && (
          <div className="mt-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sabor:
            </label>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              {product.flavors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Footer with Price and Quick Add */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-rose-600 font-display">
                ${product.price.toFixed(2)}
              </span>
              {product.previous_price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ${product.previous_price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block">Precio final</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.is_available}
            aria-label={`Añadir ${product.name} al carrito`}
            className={`flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-2xl font-bold shadow-sm transition-all duration-200 active:scale-90 ${
              !product.is_available
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 hover:rotate-3'
            }`}
          >
            {isAdded ? (
              <Check className="w-5 h-5 animate-scale-in" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
