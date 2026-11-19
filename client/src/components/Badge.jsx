import React from "react";

/**
 * Reusable Badge component for entity statuses, types, roles, and states.
 * 
 * @param {Object} props
 * @param {string} props.variant - Variant key: lost | found | open | returned | pending | approved | rejected | admin | user | active | inactive
 * @param {string} [props.label] - Custom display label (defaults to capitalized variant)
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.isCardBadge] - Whether this badge is pinned absolutely to an ItemCard image
 */
export default function Badge({
  variant,
  label,
  className = "",
  isCardBadge = false,
}) {
  const variantClassMap = {
    lost: "badge-lost",
    found: "badge-found",
    open: "badge-open",
    returned: "badge-returned",
    pending: "badge-claim-pending",
    approved: "badge-claim-approved",
    rejected: "badge-claim-rejected",
    admin: "badge-admin",
    user: "badge-user",
    active: "badge-active",
    inactive: "badge-inactive",
  };

  const variantClass = variantClassMap[variant] || "";
  const positionClass = isCardBadge ? "" : "badge-inline";
  const displayLabel = label || (variant ? variant.charAt(0).toUpperCase() + variant.slice(1) : "");

  return (
    <span className={`badge ${variantClass} ${positionClass} ${className}`.trim()}>
      {displayLabel}
    </span>
  );
}
