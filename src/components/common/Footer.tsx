import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Heart, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/constants';
import { getWhatsAppGeneralUrl } from '../../utils/whatsapp';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-28 md:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-xl shadow-lg">
                🍦
              </div>
              <span className="text-xl font-black text-white tracking-tight font-display">
                HELADOS <span className="text-rose-500">CARAM</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Helados artesanales cremosos, tinas 4.5 Litros familiares, cakes personalizados y dulcería fina con entregas a domicilio en Puerto Padre y zonas aledañas.
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Hecho con amor y pasión artesanal</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explorar Menú</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/app?category=helados-en-vasos" className="hover:text-rose-400 transition">
                  Helados en Vasos
                </Link>
              </li>
              <li>
                <Link to="/app?category=tinas-4-5-litros" className="hover:text-rose-400 transition">
                  Tinas Familiares 4.5 Litros
                </Link>
              </li>
              <li>
                <Link to="/app?category=cakes" className="hover:text-rose-400 transition">
                  Cakes y Tartas Especiales
                </Link>
              </li>
              <li>
                <Link to="/app?category=combos" className="hover:text-rose-400 transition">
                  Combos Fiesta & Ahorro
                </Link>
              </li>
              <li>
                <Link to="/app?category=dulceria" className="hover:text-rose-400 transition">
                  Dulcería & Marquesitas
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Info & Zones */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Zonas de Entrega</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Puerto Padre Centro y Malecón</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>La Boca & Playita</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>El Boquerón & Delicias</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Embalaje térmico garantizado</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contacto & Horarios</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{BUSINESS_CONFIG.openingHours}</span>
              </p>
              <a
                href={getWhatsAppGeneralUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs shadow-md shadow-emerald-900/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp de Pedidos</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Diseñado con</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>para Puerto Padre, Las Tunas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
