import React from "react";

// Reusable alert banner for success, error, or info messages
export default function Alert({ type = "error", message, onClose }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className={`alert-box ${isSuccess ? "alert-success" : "alert-error"}`}>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button type="button" className="alert-close-btn" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
}

