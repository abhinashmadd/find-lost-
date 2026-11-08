import React from "react";
import { Link } from "react-router-dom";

// ItemCard: Displays a summary card for an item in the grid
export default function ItemCard({ item }) {
  // SVG placeholder when no image was uploaded
  const placeholderImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200' fill='%23e2e8f0'><rect width='300' height='200'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='16'>No Photo Available</text></svg>";

  const isLost = item.type === "lost";
  const formattedDate = item.dateOfEvent
    ? new Date(item.dateOfEvent).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link to={`/items/${item._id}`} className="item-card">
      <div className="card-image-wrap">
        <img
          src={item.imageUrl || placeholderImage}
          alt={item.title}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
        <span className={`badge ${isLost ? "badge-lost" : "badge-found"}`}>
          {isLost ? "Lost" : "Found"}
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-category">📁 {item.category}</p>
        <p className="card-location">📍 {item.location}</p>
        <p className="card-date">📅 {formattedDate}</p>
      </div>
    </Link>
  );
}

