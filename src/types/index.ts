export * from './database.types';

export interface CartItem {
  product: import('./database.types').Product;
  quantity: number;
  selectedFlavor?: string;
  specialNotes?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}
