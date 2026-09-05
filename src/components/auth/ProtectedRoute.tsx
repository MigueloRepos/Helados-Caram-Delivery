import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">Verificando credenciales...</p>
          <p className="text-xs text-slate-500">Consultando permisos en Supabase</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Verify role if specific roles are required
  const userRole: UserRole = profile?.role || role || 'customer';

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Determine the user's correct dashboard
    let targetPath = '/app';
    if (userRole === 'admin') targetPath = '/admin';
    else if (userRole === 'delivery') targetPath = '/delivery';
    else if (userRole === 'employee') targetPath = '/employee';

    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 font-display">Acceso no autorizado</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu cuenta tiene el rol <strong className="capitalize text-slate-900">{userRole}</strong> y no cuenta con permisos para ver este módulo.
          </p>
        </div>
        <div className="pt-2">
          <Navigate to={targetPath} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
