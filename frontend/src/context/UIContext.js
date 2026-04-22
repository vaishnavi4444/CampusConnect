import React, { createContext, useState, useCallback, useRef } from 'react';

export const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const toastTimeout = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type, id: Date.now() });
    toastTimeout.current = setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(null);
  }, []);

  const showSuccess = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg) => showToast(msg, 'error'), [showToast]);
  const showInfo = useCallback((msg) => showToast(msg, 'info'), [showToast]);

  return (
    <UIContext.Provider
      value={{
        toast,
        globalLoading,
        setGlobalLoading,
        showToast,
        hideToast,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}
