import React from "react";
import { Link } from "react-router-dom";

/**
 * Standardized Empty State component for lists, search queries, and dashboard tabs.
 * 
 * @param {Object} props
 * @param {string} [props.icon="📭"] - Leading emoji or icon
 * @param {string} props.title - Summary heading
 * @param {string} [props.message] - Explanatory message
 * @param {string} [props.actionLabel] - CTA button label
 * @param {string} [props.actionLink] - React Router navigation target
 * @param {Function} [props.onAction] - Button click handler (if not a Link)
 * @param {string} [props.className=""] - Additional class name
 */
export default function EmptyState({
  icon = "📭",
  title,
  message,
  actionLabel,
  actionLink,
  onAction,
  className = "",
}) {
  return (
    <div className={`empty-state-card ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-submit empty-state-btn">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-secondary empty-state-btn"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
