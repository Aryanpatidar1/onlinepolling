import { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import "./Polls.css";
import { Link } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaShareAlt,
  FaQrcode,
  FaWhatsapp,
  FaSearch,
  FaFire,
  FaFilter,
} from "react-icons/fa";
import ShareModal from "../../components/ShareModal/ShareModal";

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, expired
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Share modal state
  const [activeSharePoll, setActiveSharePoll] = useState(null);

  const fetchPolls = async () => {
    try {
      const res = await api.get("/poll");
      setPolls(res.data.polls || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to load polls.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // Filtered polls
  const filteredPolls = useMemo(() => {
    return polls.filter((p) => {
      // search query
      const matchesSearch = p.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      // status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "expired" && !p.isActive);

      // category
      const matchesCategory =
        categoryFilter === "all" ||
        (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [polls, searchQuery, statusFilter, categoryFilter]);

  if (loading) {
    return (
      <main className="page polls-page container">
        <div className="polls-loading-box">
          <div className="spinner"></div>
          <p>Discovering community polls...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page polls-page container">
      {/* SHARE MODAL WITH QR & WHATSAPP */}
      {activeSharePoll && (
        <ShareModal
          isOpen={!!activeSharePoll}
          onClose={() => setActiveSharePoll(null)}
          pollQuestion={activeSharePoll.question}
          pollSlug={activeSharePoll.slug}
        />
      )}

      {/* HEADER */}
      <div className="polls-header">
        <div className="header-badge">
          <FaFire /> Explore Community Polls
        </div>
        <h1>Cast Your Vote & Make an Impact</h1>
        <p>Browse active public polls, vote in real-time, or scan QR to participate on mobile.</p>

        {/* SEARCH & FILTERS BAR */}
        <div className="filter-controls">
          {/* SEARCH INPUT */}
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search polls by question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* STATUS TABS */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({polls.length})
            </button>
            <button
              className={`filter-tab ${statusFilter === "active" ? "active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              🟢 Active ({polls.filter((p) => p.isActive).length})
            </button>
            <button
              className={`filter-tab ${statusFilter === "expired" ? "active" : ""}`}
              onClick={() => setStatusFilter("expired")}
            >
              🔴 Expired ({polls.filter((p) => !p.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* POLLS GRID */}
      {filteredPolls.length === 0 ? (
        <div className="no-polls-box">
          <p>No polls found matching your criteria.</p>
          <Link to="/create" className="btn create-first-btn">
            Create a New Poll
          </Link>
        </div>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => {
            const pollUrl = `${window.location.origin}/poll/${poll.slug}`;
            const whatsappText = `📊 Vote on this poll:\n"${poll.question}"\n\n👉 Click to vote:\n${pollUrl}`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
              whatsappText
            )}`;

            return (
              <div className="poll-card" key={poll._id}>
                <div className="poll-card-top">
                  <div className="poll-title-wrap">
                    <h3>{poll.question}</h3>
                    {poll.category && (
                      <span className="poll-category-pill">
                        {poll.category}
                      </span>
                    )}
                  </div>
                  <span
                    className={`status ${poll.isActive ? "active" : "inactive"}`}
                  >
                    {poll.isActive ? "Active" : "Expired"}
                  </span>
                </div>

                <div className="poll-meta">
                  <span>
                    <FaUsers /> <strong>{poll.totalVotes}</strong> votes
                  </span>
                  <span>
                    <FaCalendarAlt />{" "}
                    {new Date(poll.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="poll-actions">
                  <Link
                    className="btn small-btn view-poll-btn"
                    to={`/poll/${poll.slug}`}
                  >
                    <FaChartBar /> Vote / View
                  </Link>

                  <button
                    className="btn small-btn qr-btn"
                    onClick={() => setActiveSharePoll(poll)}
                    title="View QR Code & Share"
                  >
                    <FaQrcode /> QR Code
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn small-btn whatsapp-card-btn"
                    title="Share on WhatsApp"
                  >
                    <FaWhatsapp /> Share
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Polls;
