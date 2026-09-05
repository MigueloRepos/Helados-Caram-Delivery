import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Heart,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../services/productService';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/product/ProductCard';
import { useNotifications } from '../contexts/NotificationContext';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setIsCartDrawerOpen } = useCart();
  const { showToast } = useNotifications();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const prod = await fetchProductBySlug(slug);
        setProduct(prod);
        if (prod) {
          if (prod.flavors && prod.flavors.length > 0) {
            setSelectedFlavor(prod.flavors[0]);
          }
          const related = await fetchProducts({ categoryId: prod.category_id });
          setRelatedProducts(related.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } catch (e) {
        console.warn('Error fetching product detail:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !product.is_available) return;
    addItem(product, quantity, selectedFlavor || undefined, specialNotes.trim() || undefined);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartDrawerOpen(true);
    }, 600);
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Mira este delicioso producto de Helados Caram: ${product.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        title: 'Enlace copiado',
        message: '¡Comparte con tus amigos en Puerto Padre!',
        type: 'info',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-3xl bg-slate-200 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded-xl w-1/4 animate-pulse" />
            <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto">
          🍨
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Producto no encontrado</h2>
        <p className="text-xs text-slate-500">
          El producto solicitado no está disponible en este momento.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  const subtotalPrice = (Number(product.price) || 0) * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-rose-600 transition p-2 -ml-2 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Regresar</span>
        </button>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image Showcase */}
        <div className="lg:col-span-6">
          <div className="sticky top-24 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-rose-50 border border-slate-200 shadow-lg">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                {product.is_featured && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-600/95 backdrop-blur-xs px-3 py-1 text-xs font-black text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Favorito Caram</span>
                  </span>
                )}
                {product.unit && (
                  <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-800 shadow-sm border border-slate-100">
                    {product.unit}
                  </span>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                aria-label="Compartir producto"
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-600 shadow-md border border-white transition active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Delivery Guarantee Chips */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Empaque Frío</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>25-45 min</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Fresco</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
              Helados Caram • Puerto Padre
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-rose-600 font-display">
                ${product.price.toFixed(2)}
              </span>
              {product.previous_price && (
                <span className="text-sm text-slate-400 line-through font-semibold">
                  ${product.previous_price.toFixed(2)}
                </span>
              )}
              {product.is_available ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Disponible para hoy
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                  Agotado
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-slate-600 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Flavor Selection (if exists) */}
          {product.flavors && product.flavors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecciona Sabor / Combinación:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between border transition ${
                      selectedFlavor === flavor
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{flavor}</span>
                    {selectedFlavor === flavor && (
                      <Check className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Notas especiales o dedicatoria (opcional):
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Ej: 'Para el cumpleaños de Carlos', sirope de caramelo extra, etc."
              className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Quantity & Add to Cart Action Bar */}
          <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Subtotal:</span>
                <span className="text-xl font-black text-slate-900 font-display">
                  ${subtotalPrice.toFixed(2)}
                </span>
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.is_available}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 ${
                !product.is_available
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡AÑADIDO AL CARRITO!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>AGREGAR AL CARRITO • ${subtotalPrice.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 font-display">
              También te podría gustar
            </h3>
            <Link
              to={`/app?category=${product.category?.slug || 'all'}`}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Ver más en esta categoría
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
