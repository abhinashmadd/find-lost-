import React, { useEffect } from "react";

/**
 * Accessible, responsive Confirmation Modal dialog.
 * Replaces unstyled window.confirm() dialogs with standardized, accessible UI.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently displayed
 * @param {string} props.title - Modal heading
 * @param {string} props.message - Descriptive body text explaining the consequence
 * @param {string} [props.confirmText="Confirm"] - Confirmation button text
 * @param {string} [props.cancelText="Cancel"] - Cancellation button text
 * @param {"danger"|"primary"|"warning"} [props.confirmVariant="primary"] - Action styling variant
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled or dismissed
 * @param {boolean} [props.loading=false] - Whether confirmation is currently processing
 */
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const confirmBtnClass =
    confirmVariant === "danger"
      ? "btn btn-danger"
      : confirmVariant === "warning"
      ? "btn btn-warning"
      : "btn btn-submit";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p id="modal-message" className="modal-message">
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={confirmBtnClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
