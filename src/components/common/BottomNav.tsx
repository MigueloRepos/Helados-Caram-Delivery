import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Clock, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const BottomNav: React.FC = () => {
  const { itemCount, setIsCartDrawerOpen } = useCart();

  return (
    <nav aria-label="Navegación móvil" className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav safe-bottom">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] leading-none">Inicio</span>
        </NavLink>

        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Grid className="w-5 h-5" />
          <span className="text-[11px] leading-none">Menú</span>
        </NavLink>

        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 relative transition"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-slate-900 shadow-sm">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold leading-none text-slate-700">Carrito</span>
        </button>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span className="text-[11px] leading-none">Pedidos</span>
        </NavLink>

        <NavLink
          to="/auth"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] leading-none">Perfil</span>
        </NavLink>
      </div>
    </nav>
  );
};
