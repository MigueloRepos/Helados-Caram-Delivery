import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { DEFAULT_DELIVERY_ZONES } from '../config/constants';

export const CartPage: React.FC = () => {
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
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-4xl mx-auto shadow-inner">
          🍨
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Tu carrito está vacío</h1>
        <p className="text-xs text-slate-500">
          Añade tus sabores favoritos de helado, tinas familiares o cakes para realizar tu pedido con entrega a domicilio en Puerto Padre.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-rose-600/25 hover:bg-rose-700 transition active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explorar Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Carrito de Compras ({itemCount})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 font-bold hover:underline"
        >
          Vaciar todo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Items List */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item, idx) => {
            const itemTotal = (Number(item.product.price) || 0) * item.quantity;
            return (
              <div
                key={`${item.product.id}-${item.selectedFlavor || idx}`}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex gap-4"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{item.product.name}</h3>
                      {item.selectedFlavor && (
                        <p className="text-xs text-rose-600 font-semibold mt-0.5">
                          Sabor: {item.selectedFlavor}
                        </p>
                      )}
                      {item.specialNotes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Nota: {item.specialNotes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedFlavor)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-black text-slate-900 font-display">
                      ${itemTotal.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedFlavor)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedFlavor)}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-md space-y-5">
            <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100">
              Resumen de la Orden
            </h2>

            {/* Delivery Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Zona de Entrega (Puerto Padre):</span>
              </label>
              <select
                value={selectedZone.id}
                onChange={(e) => {
                  const z = DEFAULT_DELIVERY_ZONES.find((zone) => zone.id === e.target.value);
                  if (z) setSelectedZone(z);
                }}
                className="w-full text-xs font-semibold py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
              >
                {DEFAULT_DELIVERY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.delivery_fee === 0 ? 'Gratis' : `+$${z.delivery_fee.toFixed(2)}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Costs Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}):</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío:</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFee === 0 ? 'Gratis' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>TOTAL ESTIMADO:</span>
                <span className="text-rose-600 font-display">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>CONTINUAR AL CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
