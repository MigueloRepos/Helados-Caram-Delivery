import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem, ToastMessage } from '../types';
import { getStoredNotifications, saveStoredNotifications } from '../services/orderService';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  addNotificationItem: (item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 3500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const addNotificationItem = (item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...notifications];
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAllAsRead,
        markAsRead,
        addNotificationItem,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
