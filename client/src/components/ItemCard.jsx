import React from "react";
import { Link } from "react-router-dom";
import { ITEM_TYPES } from "../constants";
import { PLACEHOLDER_ITEM_IMAGE } from "../constants/assets";
import { formatDate } from "../utils/formatters";

// ItemCard: Displays a summary card for an item in the grid
export default function ItemCard({ item }) {
  const isLost = item.type === ITEM_TYPES.LOST;
  const formattedDate = formatDate(item.dateOfEvent);

  return (
    <Link to={`/items/${item._id}`} className="item-card">
      <div className="card-image-wrap">
        <img
          src={item.imageUrl || PLACEHOLDER_ITEM_IMAGE}
          alt={item.title}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_ITEM_IMAGE;
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

