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
  FaRobot,
  FaUsers,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import ShareModal from "../../components/ShareModal/ShareModal";

const getWinner = (results) => {
  const leadingCount = Math.max(0, ...results.map((result) => result.voteCount));
  const leaders = results.filter((result) => result.voteCount === leadingCount);
  return leadingCount > 0 && leaders.length === 1 ? leaders[0] : null;
};

const PollDetail = () => {
  const { slug } = useParams();
  const [poll, setPoll] = useState(null);
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [results, setResults] = useState([]);
  const [voted, setVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [votePending, setVotePending] = useState(false);
  const [expired, setExpired] = useState(false);
  const [winner, setWinner] = useState(null);
  const [participants, setParticipants] = useState(0);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [insights, setInsights] = useState(null);
  const pollId = poll?._id;

  useEffect(() => {
    let cancelled = false;
    api.get(`/poll/${slug}`)
      .then((response) => {
        if (cancelled) return;
        const pollData = response.data.poll;
        setPoll(pollData);
        setErrorMsg("");
        setSuccessMsg("");
        setInsights(null);
        setExpired(pollData?.isActive === false);
        setVoted(Boolean(pollData.hasVoted));
        setVotedOptionId(pollData.votedOptionId || null);
        const pollResults = pollData.options.map((option) => ({
            id: option._id,
            text: option.text,
            voteCount: option.voteCount,
            percentage: pollData.totalVotes
              ? Number(((option.voteCount / pollData.totalVotes) * 100).toFixed(1))
              : 0,
          }));
        setResults(pollResults);
        setWinner(
          pollData.settings.showResultsMode === "always" ||
            pollData.settings.showResultsMode === "afterVote" && pollData.hasVoted
            ? getWinner(pollResults)
            : null
        );
        setLoadedSlug(slug);
      })
      .catch((error) => {
        if (cancelled) return;
        setPoll(null);
        setErrorMsg(error.response?.data?.message || "Poll not found or server error.");
        setLoadedSlug(slug);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!pollId) return undefined;

    const handlePollUpdated = (data) => {
      if (data.pollId !== pollId) return;
      if (Array.isArray(data.results)) setResults(data.results);
      setPoll((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          ...(typeof data.totalVotes === "number" ? { totalVotes: data.totalVotes } : {}),
          isActive: data.isActive,
        };
      });
      if ("winner" in data) setWinner(data.winner || null);
      if (data.isActive === false) setExpired(true);
    };
    const handlePollStatus = (data) => {
      if (data.pollId === pollId && data.isActive === false) {
        setExpired(true);
        setPoll((previous) => previous ? { ...previous, isActive: false } : previous);
      }
    };
    const handlePresence = (data) => {
      if (data.pollId === pollId) setParticipants(data.participants);
    };
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("pollUpdated", handlePollUpdated);
    socket.on("pollStatusUpdated", handlePollStatus);
    socket.on("pollPresence", handlePresence);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.emit("joinPoll", pollId, (response) => {
      if (response?.ok) setParticipants(response.participants);
    });

    return () => {
      socket.off("pollUpdated", handlePollUpdated);
      socket.off("pollStatusUpdated", handlePollStatus);
      socket.off("pollPresence", handlePresence);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [pollId]);

  const handleVote = async (optionId) => {
    if (voted || votePending || expired) return;
    setErrorMsg("");
    setVotePending(true);

    try {
      let response;
      try {
        response = await api.post(`/votes/${poll._id}`, { optionId });
      } catch (error) {
        if (error.response?.status !== 428) throw error;
        response = await api.post(`/votes/${poll._id}`, { optionId });
      }

      setVoted(true);
      setVotedOptionId(optionId);
      setSuccessMsg("Vote cast successfully. Thank you for participating!");
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#10b981", "#38bdf8", "#f59e0b"],
      });
      setResults(response.data.results);
      setPoll((previous) =>
        previous
          ? { ...previous, totalVotes: response.data.totalVotes, isActive: response.data.isActive }
          : previous
      );
      setWinner(response.data.winner || null);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to cast vote at the moment.";
      setErrorMsg(message);
      if (error.response?.status === 409 || error.response?.status === 400) {
        setVoted(true);
      }
    } finally {
      setVotePending(false);
    }
  };

  const generateInsights = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      const response = await api.post(`/ai/polls/${poll._id}/insights`);
      setInsights(response.data);
    } catch (error) {
      setAiError(error.response?.data?.message || "Could not generate insights.");
    } finally {
      setAiLoading(false);
    }
  };

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }
  const isPollOwner =
    currentUser &&
    (currentUser.id === poll?.createdBy || currentUser.role === "admin");
  const pollUrl =
    typeof window !== "undefined" ? `${window.location.origin}/poll/${slug}` : "";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Vote on this poll:\n"${poll?.question || ""}"\n\nVote here:\n${pollUrl}`
  )}`;
  const loading = loadedSlug !== slug;

  if (loading) {
    return (
      <main className="page poll-detail-page container">
        <div className="poll-loading-box" role="status">
          <div className="spinner" />
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
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pollQuestion={poll.question}
        pollSlug={poll.slug}
      />

      <div className="poll-card">
        <div className="poll-top-bar">
          <div className={`live-pill ${socketConnected ? "" : "disconnected"}`}>
            <span className="live-dot" />
            <FaBroadcastTower /> {socketConnected ? "LIVE SYNC" : "RECONNECTING"}
          </div>
          <div className="top-actions">
            <span className="live-participants"><FaUsers /> {participants} here</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-action whatsapp-quick">
              <FaWhatsapp /> Share
            </a>
            <button className="btn-action qr-quick" onClick={() => setShowShareModal(true)}>
              <FaQrcode /> QR Code
            </button>
            <button className="btn-action share-quick" onClick={() => setShowShareModal(true)}>
              <FaShareAlt /> Share
            </button>
          </div>
        </div>

        <div className="poll-header">
          <h1>{poll.question}</h1>
          {poll.category && <span className="poll-category-tag">{poll.category}</span>}
          {poll.description && <p className="poll-description">{poll.description}</p>}
          {expired && (
            <div className="poll-expired"><FaClock /><span>Poll closed</span></div>
          )}
        </div>

        {successMsg && <div className="alert alert-success vote-success"><FaCheckCircle /> {successMsg}</div>}
        {errorMsg && <div className="alert alert-error vote-error"><FaExclamationTriangle /> {errorMsg}</div>}
        {winner && (
          <div className="poll-winner">
            <FaCheckCircle /> Leading option: <strong>{winner.text}</strong>
          </div>
        )}

        <div className="poll-options">
          {results.map((option) => {
            const isSelected = votedOptionId === option.id;
            const showBars =
              isPollOwner ||
              (poll.settings.showResultsMode !== "never" &&
                (voted || poll.settings.showResultsMode === "always"));

            return (
              <div key={option.id} className={`poll-option ${isSelected ? "selected" : ""}`}>
                <div className="option-top">
                  <span className="opt-text">
                    {option.text}
                    {isSelected && <span className="voted-badge"><FaCheckCircle /> Your Vote</span>}
                  </span>
                  {showBars && (
                    <div className="opt-stats">
                      <span className="opt-count">{option.voteCount} votes</span>
                      <span className="opt-percent">{option.percentage}%</span>
                    </div>
                  )}
                </div>
                {showBars && (
                  <div className="result-bar">
                    <div className="result-fill" style={{ width: `${option.percentage}%` }} />
                  </div>
                )}
                {!voted && !expired && (
                  <button
                    className="btn vote-btn"
                    onClick={() => handleVote(option.id)}
                    disabled={votePending}
                  >
                    <FaVoteYea />
                    <span>{votePending ? "Submitting vote…" : "Vote for this option"}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="poll-footer">
          <div className="total-votes">
            <FaChartBar />
            <span>Total votes: <strong>{poll.totalVotes}</strong></span>
          </div>
          <button className="btn-open-share" onClick={() => setShowShareModal(true)}>
            <FaQrcode /> Scan QR to vote on your phone
          </button>
        </div>
      </div>

      {isPollOwner && (
        <section className="ai-insights-card" aria-labelledby="ai-insights-title">
          <div className="ai-insights-header">
            <div className="ai-insights-mark"><FaRobot /></div>
            <div>
              <span className="ai-insights-eyebrow">GEMINI POWERED</span>
              <h2 id="ai-insights-title">AI poll intelligence</h2>
              <p>Interpret the current results and recent voting activity.</p>
            </div>
            <button className="ai-insights-button" onClick={generateInsights} disabled={aiLoading}>
              <FaRobot /> {aiLoading ? "Analyzing…" : "Generate insights"}
            </button>
          </div>
          {aiError && <p className="ai-insights-error" role="alert">{aiError}</p>}
          {insights && (
            <div className="ai-insights-content">
              <p className="ai-insights-summary">{insights.insights.summary}</p>
              <div className="ai-option-highlights">
                <p><strong>Most popular:</strong> {insights.insights.mostPopular.join(", ") || "No votes yet"}</p>
                <p><strong>Least popular:</strong> {insights.insights.leastPopular.join(", ") || "No votes yet"}</p>
              </div>
              <div className="ai-insights-columns">
                <div>
                  <h3>Voting patterns</h3>
                  <ul>{insights.insights.trends.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                </div>
                <div>
                  <h3>Recommendations</h3>
                  <ul>{insights.insights.recommendations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                </div>
              </div>
              {insights.insights.caveats.length > 0 && (
                <p className="ai-insights-caveats">{insights.insights.caveats.join(" ")}</p>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default PollDetail;
