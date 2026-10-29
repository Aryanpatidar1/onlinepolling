import React, { useEffect, useState } from "react";
import "./FeaturedPolls.css";
import { FaChartPie, FaBolt, FaFire } from "react-icons/fa";
import api from "../../api/api";
import { Link } from "react-router-dom";

const FeaturedPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeatured = async () => {
    try {
      const res = await api.get("/poll/featured");
      setPolls(res.data.polls || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to load polls.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return (
    <section className="featured container">
      <h2 className="featured-heading">
        <FaFire className="icon-fire" />
        Featured Polls
      </h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="featured-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="featured-card skeleton" />
            ))
          : polls.map((poll) => (
              <div key={poll._id} className="featured-card">
                <div className="featured-card-top">
                  {/* <span className="featured-category">
                    {poll.category || "General"}
                  </span> */}
                  <span className="featured-votes">{poll.totalVotes} votes</span>
                </div>

                <h3 className="featured-title">{poll.question}</h3>

                <div className="featured-footer">
                  <div className="trend-box">
                    <FaBolt className="trend-icon" />
                    <span>New</span>
                  </div>

                  <Link className="btn small-btn" to={`/poll/${poll.slug}`}>
                    <FaChartPie />
                    <span>View Poll</span>
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};

export default FeaturedPolls;
