import React from "react";

// Reusable spinner loader component
export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

