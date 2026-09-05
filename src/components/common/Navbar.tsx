import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, IceCream, User, LayoutDashboard, Bike, ChefHat, PhoneCall } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { profile, role } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
            aria-label="Ir a inicio de Helados Caram"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-md shadow-rose-500/20 group-hover:rotate-6 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-xl">🍦</span>
              </div>
            </div>
            <div>
              <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 font-display block leading-none">
                HELADOS <span className="text-rose-600">CARAM</span>
              </span>
              <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-amber-700/90 uppercase block mt-0.5">
                Delivery Puerto Padre
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100/70'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/app"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/app')
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100/70'
              }`}
            >
              Categorías & Menú
            </Link>
            <Link
              to="/orders"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/orders')
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100/70'
              }`}
            >
              Mis Pedidos
            </Link>

            {/* Quick access for staff/admin */}
            {role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
            {role === 'delivery' && (
              <Link
                to="/delivery"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Repartidor</span>
              </Link>
            )}
            {role === 'employee' && (
              <Link
                to="/employee"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Cocina</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            <PWAInstallButton variant="compact" />

            <NotificationCenter />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 p-2.5 md:px-4 md:py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm shadow-md shadow-rose-600/20 transition-all active:scale-95"
              aria-label={`Ver carrito con ${itemCount} productos`}
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-black text-rose-600 shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Profile / Auth Avatar */}
            <Link
              to="/auth"
              className="flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-2xl hover:bg-slate-100 text-slate-700 transition"
              title={profile ? `Sesión de ${profile.full_name || profile.email}` : 'Iniciar sesión'}
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs overflow-hidden border border-slate-300">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                  {profile?.full_name?.split(' ')[0] || 'Mi Cuenta'}
                </span>
                <span className="block text-[10px] text-slate-500 capitalize leading-none">
                  {role}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
