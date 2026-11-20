import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

/**
 * Global Toast / Notification State Provider.
 * Allows any component to dispatch notifications that persist across route navigation.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    if (!message) return;

    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, "success", duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, "info", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Toast Container component rendering active notifications in fixed overlay.
 */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <aside className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type}`}
            role="status"
          >
            <span className="toast-icon">
              {isSuccess ? (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : isError ? (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        );
      })}
    </aside>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
