import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Notification } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isAlertOnly: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  addToast: (title: string, message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  refreshNotifications: () => Promise<void>;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  showAlert: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isAlertOnly: false
  });

  const refreshNotifications = async () => {
    if (!organization) return;
    try {
      const list = await api.getNotifications(user?.role);
      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, organization]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Confirmation Required') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isAlertOnly: false
    });
  };

  const showAlert = (message: string, title = 'System Alert') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {},
      isAlertOnly: true
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        refreshNotifications,
        showConfirm,
        showAlert,
      }}
    >
      {children}

      {/* Centered Premium Global Dialog Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Styled Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              modal.isAlertOnly ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              {modal.isAlertOnly ? <AlertTriangle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-slate-900 font-extrabold text-sm tracking-tight">{modal.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{modal.message}</p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center gap-2 pt-2">
              {modal.isAlertOnly ? (
                <button
                  onClick={() => setModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, isAlertOnly: false })}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, isAlertOnly: false })}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      modal.onConfirm();
                      setModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, isAlertOnly: false });
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Confirm
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
