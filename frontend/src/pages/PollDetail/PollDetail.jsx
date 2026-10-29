import { useEffect, useState } from "react";
import "./PollDetail.css";
import api from "../../api/api";
import socket from "../../socket";
import confetti from "canvas-confetti";
import {
  FaChartBar,
  FaVoteYea,
  FaExclamationTriangle,
  FaClock,
  FaShareAlt,
  FaQrcode,
  FaWhatsapp,
  FaCheckCircle,
  FaBroadcastTower,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import ShareModal from "../../components/ShareModal/ShareModal";

const PollDetail = () => {
  const { slug } = useParams();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [expired, setExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  // Poll fetch by slug
  const fetchPoll = async () => {
    try {
      const res = await api.get(`/poll/${slug}`);
      const pollData = res.data.poll;
      setPoll(pollData);

      if (pollData?.isActive === false) {
        setExpired(true);
      }

      setResults(
        pollData.options.map((opt) => ({
          id: opt._id,
          text: opt.text,
          voteCount: opt.voteCount,
          percentage:
            pollData.totalVotes > 0
              ? ((opt.voteCount / pollData.totalVotes) * 100).toFixed(1)
              : 0,
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("Poll not found or server error.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [slug]);

  // Live WebSocket update using socket.io
  useEffect(() => {
    if (!poll?._id) return;

    socket.emit("joinPoll", poll._id);

    const handlePollUpdated = (data) => {
      if (data.pollId === poll._id) {
        setResults(data.results);
        setPoll((prev) => (prev ? { ...prev, totalVotes: data.totalVotes } : prev));
      }
    };

    socket.on("pollUpdated", handlePollUpdated);

    return () => {
      socket.off("pollUpdated", handlePollUpdated);
    };
  }, [poll?._id]);

  // Vote handler with celebratory Confetti!
  const handleVote = async (optionId) => {
    if (voted || expired) return;
    setErrorMsg("");

    try {
      const res = await api.post(`/votes/${poll._id}`, { optionId });

      setVoted(true);
      setVotedOptionId(optionId);
      setSuccessMsg("🎉 Vote cast successfully! Thank you for participating.");

      // Confetti celebration 🎉
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#10b981", "#38bdf8", "#f59e0b"],
      });

      // Update results
      setResults(res.data.results);
      setPoll((prev) =>
        prev ? { ...prev, totalVotes: res.data.totalVotes } : prev
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || "Unable to cast vote at the moment.";
      setErrorMsg(msg);
    }
  };

  const pollUrl = typeof window !== "undefined" ? `${window.location.origin}/poll/${slug}` : "";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `📊 Vote on this poll:\n"${poll?.question || ""}"\n\n👉 Click to vote:\n${pollUrl}`
  )}`;

  if (loading) {
    return (
      <main className="page poll-detail-page container">
        <div className="poll-loading-box">
          <div className="spinner"></div>
          <p>Loading live poll data...</p>
        </div>
      </main>
    );
  }

  if (!poll) {
    return (
      <main className="page poll-detail-page container">
        <div className="poll-card error-card">
          <p className="error">{errorMsg || "Poll not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page poll-detail-page container">
      {/* SHARE MODAL WITH QR CODE & SOCIALS */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pollQuestion={poll.question}
        pollSlug={poll.slug}
      />

      <div className="poll-card">
        {/* TOP STATUS BAR */}
        <div className="poll-top-bar">
          <div className="live-pill">
            <span className="live-dot"></span>
            <FaBroadcastTower /> LIVE SYNC (Socket.IO)
          </div>

          <div className="top-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action whatsapp-quick"
              title="Share on WhatsApp"
            >
              <FaWhatsapp /> Share
            </a>

            <button
              className="btn-action qr-quick"
              onClick={() => setShowShareModal(true)}
              title="View QR Code & Share"
            >
              <FaQrcode /> QR Code
            </button>

            <button
              className="btn-action share-quick"
              onClick={() => setShowShareModal(true)}
              title="All Share Options"
            >
              <FaShareAlt /> Share
            </button>
          </div>
        </div>

        {/* HEADER */}
        <div className="poll-header">
          <h1>{poll.question}</h1>

          {poll.category && (
            <span className="poll-category-tag">{poll.category}</span>
          )}

          {expired && (
            <div className="poll-expired">
              <FaClock />
              <span>Poll Expired</span>
            </div>
          )}
        </div>

        {/* ALERTS */}
        {successMsg && (
          <div className="alert alert-success vote-success">
            <FaCheckCircle /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-error vote-error">
            <FaExclamationTriangle /> {errorMsg}
          </div>
        )}

        {/* POLL OPTIONS */}
        <div className="poll-options">
          {results.map((opt) => {
            const isSelected = votedOptionId === opt.id;
            const showBars = voted || poll.settings.showResultsMode === "always";

            return (
              <div
                key={opt.id}
                className={`poll-option ${isSelected ? "selected" : ""}`}
              >
                <div className="option-top">
                  <span className="opt-text">
                    {opt.text}
                    {isSelected && (
                      <span className="voted-badge">
                        <FaCheckCircle /> Your Vote
                      </span>
                    )}
                  </span>

                  {showBars && (
                    <div className="opt-stats">
                      <span className="opt-count">{opt.voteCount} votes</span>
                      <span className="opt-percent">{opt.percentage}%</span>
                    </div>
                  )}
                </div>

                {/* ANIMATED RESULT BAR */}
                {showBars && (
                  <div className="result-bar">
                    <div
                      className="result-fill"
                      style={{ width: `${opt.percentage}%` }}
                    ></div>
                  </div>
                )}

                {/* VOTE BUTTON */}
                {!voted && !expired && (
                  <button
                    className="btn vote-btn"
                    onClick={() => handleVote(opt.id)}
                  >
                    <FaVoteYea />
                    <span>Vote for this option</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="poll-footer">
          <div className="total-votes">
            <FaChartBar />
            <span>Total Votes: <strong>{poll.totalVotes}</strong></span>
          </div>

          <button
            className="btn-open-share"
            onClick={() => setShowShareModal(true)}
          >
            <FaQrcode /> Scan QR to Vote on Phone
          </button>
        </div>
      </div>
    </main>
  );
};

export default PollDetail;
