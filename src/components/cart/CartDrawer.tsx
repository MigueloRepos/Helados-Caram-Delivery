import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { DEFAULT_DELIVERY_ZONES } from '../../config/constants';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    selectedZone,
    setSelectedZone,
    updateQuantity,
    removeItem,
    clearCart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside aria-label="Carrito de compras" className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Tu Carrito Caram</h2>
                <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-white transition"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl shadow-inner">
                  🍨
                </div>
                <h3 className="font-bold text-slate-800 text-base">Tu carrito está vacío</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Explora nuestros helados cremosos, tinas familiares y cakes artesanales listos para delivery en Puerto Padre.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/app');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 transition active:scale-95"
                >
                  Explorar Menú
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemTotal = (Number(item.product.price) || 0) * item.quantity;
                return (
                  <div key={`${item.product.id}-${item.selectedFlavor || idx}`} className="pt-4 first:pt-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-18 h-18 rounded-2xl object-cover border border-slate-100 shrink-0 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedFlavor)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded-md hover:bg-rose-50 transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.selectedFlavor && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                            Sabor: {item.selectedFlavor}
                          </p>
                        )}
                        {item.specialNotes && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Nota: {item.specialNotes}
                          </p>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-display">
                          ${itemTotal.toFixed(2)}
                        </span>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedFlavor)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition shadow-xs text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedFlavor)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition shadow-xs text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-600" />
                  <span>Zona de entrega (Puerto Padre):</span>
                </label>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const zone = DEFAULT_DELIVERY_ZONES.find((z) => z.id === e.target.value);
                    if (zone) setSelectedZone(zone);
                  }}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-xs focus:ring-2 focus:ring-rose-500/20"
                >
                  {DEFAULT_DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.delivery_fee === 0 ? 'Gratis' : `+$${z.delivery_fee.toFixed(2)}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({selectedZone.name.split(' ')[0]}):</span>
                  <span className="font-semibold text-slate-800">
                    {deliveryFee === 0 ? 'Gratis' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-rose-600 font-display text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <span>CONTINUAR AL CHECKOUT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
