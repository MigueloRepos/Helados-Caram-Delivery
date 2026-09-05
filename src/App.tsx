import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/ToastContainer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';

// Pages
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
              {/* Desktop Sticky Header */}
              <Navbar />

              {/* Toast & Offline Alerts */}
              <ToastContainer />
              <OfflineIndicator />

              {/* Sliding Cart Drawer */}
              <CartDrawer />

              {/* Main App Routes */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/app" element={<Catalog />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/auth" element={<AuthPage />} />

                  {/* Portals with Supabase role verification */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard initialTab="orders" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard initialTab="analytics" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard initialTab="products" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/drivers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard initialTab="drivers" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery"
                    element={
                      <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                        <DeliveryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee"
                    element={
                      <ProtectedRoute allowedRoles={['employee', 'admin']}>
                        <EmployeeDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* WhatsApp Floating launcher */}
              <WhatsAppFloatingButton />

              {/* Mobile Bottom Navigation */}
              <BottomNav />

              {/* Footer */}
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}
