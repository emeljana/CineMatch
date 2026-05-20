/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/Toast/Toast';

const TOAST_DURATION_MS = 4000;
const TOAST_VARIANTS = ['error', 'success', 'info'];

const ToastContext = createContext(null);

function createToast(message, variant) {
  return {
    id: crypto.randomUUID(),
    message,
    variant: TOAST_VARIANTS.includes(variant) ? variant : 'info',
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const closeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, variant = 'info') => {
    const toast = createToast(message, variant);
    setToasts((currentToasts) => [...currentToasts, toast]);
    window.setTimeout(() => closeToast(toast.id), TOAST_DURATION_MS);
    return toast.id;
  }, [closeToast]);

  const value = useMemo(
    () => ({
      showToast,
      closeToast,
      error: (message) => showToast(message, 'error'),
      success: (message) => showToast(message, 'success'),
      info: (message) => showToast(message, 'info'),
    }),
    [closeToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
