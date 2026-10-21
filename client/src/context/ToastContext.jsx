// ToastContext — any component can show a short success/error message
// without passing callbacks down through props.
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Toaster from '../components/ui/Toaster.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { type = 'success', duration = 3500, action } = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, message, type, action }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      show,
      success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => show(msg, { duration: 6000, ...opts, type: 'error' }),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
