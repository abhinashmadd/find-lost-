import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import itemService from "../services/itemService";
import ItemCard from "../components/ItemCard";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

export default function Home() {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        setLoading(true);
        const data = await itemService.listItems({ status: "open", limit: 6 });
        setRecentItems(data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load recent items");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Campus Lost and Found Portal</h1>
          <p className="hero-subtitle">
            Lost an item on campus? Found something that belongs to someone else?
            Report it immediately or search our verified campus database to reunite belongings with their rightful owners.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-hero-lost"
              onClick={() => navigate("/report?type=lost")}
            >
              😢 I Lost Something
            </button>
            <button
              className="btn btn-hero-found"
              onClick={() => navigate("/report?type=found")}
            >
              🤝 I Found Something
            </button>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="recent-section">
        <div className="section-header">
          <h2>Latest Open Listings</h2>
          <Link to="/items" className="link-view-all">
            View All Items &rarr;
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <Loader text="Loading recent listings..." />
        ) : recentItems.length > 0 ? (
          <div className="items-grid">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <p className="no-items-text">No active items reported at the moment.</p>
        )}
      </section>
    </div>
  );
}
