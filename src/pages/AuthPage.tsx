import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  LogOut,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, role, signIn, signUp, signOut, resetPassword, updateCurrentUserProfile } = useAuth();
  const { showToast } = useNotifications();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+53 ');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile edit states when logged in
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editAddress, setEditAddress] = useState(profile?.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const redirectByRole = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'delivery':
        navigate('/delivery');
        break;
      case 'employee':
        navigate('/employee');
        break;
      case 'customer':
      default:
        navigate('/app');
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showToast({
          title: '¡Bienvenido!',
          message: 'Sesión iniciada correctamente',
          type: 'success',
        });
        redirectByRole(res.role || 'customer');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signUp(email, password, fullName, phone, selectedRole);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showToast({
          title: '¡Cuenta creada!',
          message: 'Tu perfil de Helados Caram está listo',
          type: 'success',
        });
        redirectByRole(res.role || selectedRole);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        showToast({
          title: 'Enlace enviado',
          message: 'Revisa tu correo para restablecer la contraseña',
          type: 'info',
        });
        setMode('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateCurrentUserProfile({
        full_name: editName,
        phone: editPhone,
        address: editAddress,
      });
      showToast({
        title: 'Perfil actualizado',
        message: 'Tus datos se guardaron con éxito',
        type: 'success',
      });
    } catch (e: any) {
      showToast({
        title: 'Error',
        message: 'No se pudo actualizar el perfil',
        type: 'error',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // IF USER IS ALREADY LOGGED IN -> Show Profile & Role Dashboards
  if (profile || user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-rose-500/20">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Cuenta de Usuario
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  {profile?.full_name || 'Usuario Caram'}
                </h1>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold capitalize">
                Rol: {role}
              </span>
              <button
                onClick={() => signOut()}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Direct Jump */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Acceso Rápido según tu Rol:</p>
              <p className="text-[11px] text-slate-500">
                {role === 'admin' && 'Administración de productos, pedidos y reportes.'}
                {role === 'delivery' && 'Panel de rutas y entregas asignadas en Puerto Padre.'}
                {role === 'employee' && 'Comandas y preparación en cocina.'}
                {role === 'customer' && 'Catálogo de helados y tus pedidos.'}
              </p>
            </div>
            <button
              onClick={() => redirectByRole(role)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
            >
              Ir a mi Panel
            </button>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <h2 className="text-sm font-bold text-slate-900">Mis Datos de Entrega</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Dirección Habitual (Puerto Padre)
              </label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Calle, No., entre calles y reparto"
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
              >
                {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // AUTH FORMS (LOGIN / REGISTER / FORGOT)
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-xl shadow-rose-500/20">
          🍦
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-display">
          HELADOS <span className="text-rose-600">CARAM</span>
        </h1>
        <p className="text-xs text-slate-500">
          {mode === 'login' && 'Ingresa con tu cuenta para pedir o administrar'}
          {mode === 'register' && 'Crea tu cuenta de cliente o repartidor'}
          {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="p-1 rounded-2xl bg-slate-100 flex text-xs font-bold text-slate-600">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-xl transition ${
            mode === 'login' ? 'bg-white text-rose-600 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-xl transition ${
            mode === 'register' ? 'bg-white text-rose-600 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Card container */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xl">
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@heladoscaram.cu"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-600">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  ¿Olvidaste contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>{loading ? 'Ingresando...' : 'Entrar a Helados Caram'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="María González"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@gmail.com"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono (+53) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+53 58123456"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Rol de Usuario</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold"
              >
                <option value="customer">Cliente (Hacer pedidos en Puerto Padre)</option>
                <option value="delivery">Repartidor (Delivery en Moto)</option>
                <option value="employee">Empleado de Cocina / Heladería</option>
                <option value="admin">Administrador General</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>{loading ? 'Creando cuenta...' : 'Registrarme'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Correo Registrado</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@heladoscaram.cu"
                  className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition"
            >
              <span>{loading ? 'Enviando...' : 'Recuperar Contraseña'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 pt-2"
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
