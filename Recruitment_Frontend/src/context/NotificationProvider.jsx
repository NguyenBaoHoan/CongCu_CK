import { useState } from 'react';
import { NotificationContext } from './NotificationContext';

// ...existing code...
export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showNotification = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      autoHide: options.autoHide !== false,
      duration: options.duration || 3000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  };

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications: () => setNotifications([]),
    showSuccess: (msg, opts) => showNotification('success', msg, opts),
    showError: (msg, opts) => showNotification('error', msg, opts),
    showInfo: (msg, opts) => showNotification('info', msg, opts),
    showWarning: (msg, opts) => showNotification('warning', msg, opts)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}