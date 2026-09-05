import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Truck,
  Heart,
  Cake,
  Clock,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Star,
  MapPin,
} from 'lucide-react';
import { fetchCategories, fetchProducts } from '../services/productService';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { BUSINESS_CONFIG } from '../config/constants';
import { PWAInstallButton } from '../components/common/PWAInstallButton';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({ featuredOnly: true }),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods);
      } catch (e) {
        console.warn('Error loading home data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-10">
        {/* Soft Background Liquid Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-rose-200/40 via-amber-200/30 to-pink-200/30 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Delivery Rápido en Puerto Padre, Las Tunas</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-display leading-[1.08]">
                Tu momento más <span className="text-rose-600">dulce</span> comienza aquí
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Helados, cakes y dulcería preparados con cariño para cada ocasión. Disfruta de la mejor textura artesanal directo a la puerta de tu casa.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/app"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>PEDIR AHORA</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/app"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>VER MENÚ COMPLETO</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Empaque térmico</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Entrega en 25–45 min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Calidad artesanal Caram</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (Glass Showcase) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Image Container */}
                <div className="aspect-4/3 sm:aspect-square rounded-[36px] overflow-hidden shadow-2xl border-4 border-white/80 bg-rose-100 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&auto=format&fit=crop&q=80"
                    alt="Helados Caram Selección Suprema"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                  {/* Floating badge inside image */}
                  <div className="absolute bottom-5 left-5 right-5 glass-panel p-3.5 rounded-2xl flex items-center justify-between text-slate-900">
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                        Especialidad de la Casa
                      </span>
                      <span className="text-sm font-black font-display text-slate-900">
                        Copa Suprema & Mantecado 4.5L
                      </span>
                    </div>
                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      Frescura Total
                    </span>
                  </div>
                </div>

                {/* Floating Glass Pill decoration */}
                <div className="absolute -top-4 -right-2 sm:-right-4 glass-panel py-2.5 px-4 rounded-2xl shadow-xl border border-white flex items-center gap-2.5 animate-bounce duration-1000">
                  <span className="text-xl">🎂</span>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-none">Cakes a Pedido</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Para cumpleaños</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider block">
              Explora Nuestro Catálogo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              Categorías de Productos
            </h2>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <span>Ver todas las categorías</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/app?category=${cat.slug}`}
              className="group relative flex flex-col rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all duration-300 overflow-hidden text-center"
            >
              {/* Category Image */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-rose-50 mb-3 relative">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BESTSELLERS / MÁS VENDIDOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Favoritos de Puerto Padre</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Los Más Vendidos
            </h2>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <span>Ver menú completo</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE HELADOS CARAM? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-rose-500/5 p-6 sm:p-10 lg:p-14 border border-rose-200/70">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider block">
              Garantía de Sabor y Puntualidad
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
              ¿Por qué elegir Helados Caram?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Llevamos la auténtica dulzura cubana a tu hogar con ingredientes de primera y servicio impecable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* 1. Productos Deliciosos */}
            <div className="rounded-3xl bg-white/95 p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                🍦
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Productos Deliciosos
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Recetas cremosas tradicionales, frutas naturales y dulce de leche artesanal elaborado a fuego lento.
              </p>
            </div>

            {/* 2. Delivery */}
            <div className="rounded-3xl bg-white/95 p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-4 shadow-inner">
                🚚
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Delivery Rápido & Térmico
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Repartidores en moto con aislamiento térmico para que tus helados lleguen perfectamente congelados.
              </p>
            </div>

            {/* 3. Cakes Personalizados */}
            <div className="rounded-3xl bg-white/95 p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                🎂
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Cakes Personalizados
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Elaboramos tartas de cumpleaños, quinceañeras y celebraciones con dedicatorias y decorados a tu gusto.
              </p>
            </div>

            {/* 4. Hecho con Cariño */}
            <div className="rounded-3xl bg-white/95 p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4 shadow-inner">
                ❤️
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Hecho con Cariño
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Un negocio local en Puerto Padre atendido por una familia dedicada a endulzar tus mejores momentos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[36px] bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Ambient circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-400/20 blur-2xl" />

          <div className="relative max-w-2xl mx-auto text-center space-y-5">
            <span className="inline-block text-3xl sm:text-4xl animate-bounce">🍦</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display leading-tight">
              ¿Listo para darte un gusto?
            </h2>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed max-w-lg mx-auto">
              Haz tu pedido en menos de un minuto. Aceptamos efectivo, transferencias locales, Zelle y PayPal.
            </p>
            <div className="pt-3">
              <Link
                to="/app"
                className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl bg-white text-rose-600 font-black text-sm uppercase tracking-wider shadow-2xl hover:bg-rose-50 transition-all active:scale-95 group"
              >
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <span>PEDIR AHORA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
