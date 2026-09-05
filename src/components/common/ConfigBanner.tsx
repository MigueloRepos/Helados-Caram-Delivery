import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ChevronDown, Check, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const ConfigBanner: React.FC = () => {
  const { role, profile, switchDemoRole, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'customer', label: 'Cliente', desc: 'Ver catálogo, pedir y rastrear pedidos' },
    { role: 'admin', label: 'Administrador', desc: 'Dashboard, gestión de pedidos, productos y clientes' },
    { role: 'delivery', label: 'Repartidor', desc: 'Ver pedidos asignados, mapas y entrega' },
    { role: 'employee', label: 'Empleado / Cocina', desc: 'Preparación de helados y empaque' },
  ];

  return (
    <aside aria-label="Modo de prueba y roles" className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-b border-rose-200/50 py-1.5 px-3 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            Puerto Padre, Las Tunas
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-600 hidden md:inline flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-500" />
            {isConfigured ? 'Supabase Conectado' : 'Modo Demostración Rápida Activo'}
          </span>
        </div>

        {/* Role Switcher Pill for instant live preview */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 shadow-xs border border-rose-200 text-slate-800 font-bold hover:bg-rose-50 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Rol activo: <span className="text-rose-600 capitalize">{role}</span></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cambiar Rol para Pruebas
              </div>
              <div className="space-y-1 mt-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchDemoRole(r.role);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-start justify-between transition ${
                      role === r.role ? 'bg-rose-50 text-rose-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-[10px] text-slate-500 font-normal leading-tight">{r.desc}</p>
                    </div>
                    {role === r.role && <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
