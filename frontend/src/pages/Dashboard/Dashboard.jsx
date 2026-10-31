import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import {
  FaChartLine,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaPlusCircle,
  FaPoll,
  FaQrcode,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import api from "../../api/api";
import { Link } from "react-router-dom";
import ShareModal from "../../components/ShareModal/ShareModal";

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSharePoll, setActiveSharePoll] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleLogout = () => setCurrentUser(null);
    const handleLogin = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener("userLoggedOut", handleLogout);
    window.addEventListener("userLoggedIn", handleLogin);
    return () => {
      window.removeEventListener("userLoggedOut", handleLogout);
      window.removeEventListener("userLoggedIn", handleLogin);
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !localStorage.getItem("token")) return undefined;

    let cancelled = false;
    const fetchMyPolls = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const response = await api.get("/poll/mine");
        if (!cancelled) {
          setPolls(response.data.polls || []);
          setAnalytics(response.data.analytics || null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMsg(
            error.response?.data?.message || "Could not load your dashboard."
          );
          if (error.response?.status === 401) setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMyPolls();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const summary = useMemo(() => {
    const totalPolls = analytics?.totalPolls ?? polls.length;
    const totalVotes =
      analytics?.totalVotes ??
      polls.reduce((total, poll) => total + (poll.totalVotes || 0), 0);
    const activePolls =
      analytics?.activePolls ??
      polls.filter((poll) => poll.isActive).length;
    const completedPolls = analytics?.completedPolls ?? totalPolls - activePolls;
    return {
      totalPolls,
      totalVotes,
      activePolls,
      completedPolls,
      totalParticipants: analytics?.totalParticipants ?? 0,
    };
  }, [analytics, polls]);

  const deleteMyPoll = async (id) => {
    if (!window.confirm("Delete this poll? This action cannot be undone.")) return;
    let deleted = false;
    try {
      await api.delete(`/poll/${id}`);
      deleted = true;
      setPolls((existing) => existing.filter((poll) => poll._id !== id));
      setAnalytics(null);
      const response = await api.get("/poll/mine");
      setPolls(response.data.polls || []);
      setAnalytics(response.data.analytics || null);
    } catch (error) {
      setErrorMsg(
        deleted
          ? "Poll deleted, but dashboard analytics could not be refreshed."
          : error.response?.data?.message || "Could not delete this poll."
      );
    }
  };

  if (!currentUser) {
    return (
      <main className="page dashboard-page container">
        <div className="dashboard-empty">
          <FaPoll className="dashboard-empty-icon" />
          <h2>Sign in to view your workspace</h2>
          <p>Manage your polls and see how your audience is participating.</p>
          <Link to="/auth" className="btn dashboard-primary-button">
            Login Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page dashboard-page container">
        <div className="dashboard-loading" role="status">
          Loading your workspace…
        </div>
      </main>
    );
  }

  const activity = analytics?.activity || [];
  const peak = Math.max(1, ...activity.map((day) => day.votes));
  const chartPoints = activity
    .map((day, index) => {
      const x = activity.length > 1 ? (index / (activity.length - 1)) * 660 + 10 : 10;
      const y = 138 - (day.votes / peak) * 112;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <main className="page dashboard-page container">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">POLLING WORKSPACE</span>
          <h1>Good to see you, {currentUser.name?.split(" ")[0] || "there"}</h1>
          <p>Track poll performance and understand how people are voting.</p>
        </div>
        <Link to="/create" className="btn dashboard-primary-button">
          <FaPlusCircle /> Create a poll
        </Link>
      </header>

      {errorMsg && (
        <div className="dashboard-alert" role="alert">
          {errorMsg}
        </div>
      )}

      <section className="dashboard-stat-grid" aria-label="Polling overview">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-icon indigo"><FaPoll /></span>
          <div><p>Total polls</p><strong>{summary.totalPolls}</strong></div>
          <span className="dashboard-stat-note">Created by you</span>
        </article>
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-icon teal"><FaCheckCircle /></span>
          <div><p>Total votes</p><strong>{summary.totalVotes.toLocaleString()}</strong></div>
          <span className="dashboard-stat-note">Across your polls</span>
        </article>
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-icon blue"><FaChartLine /></span>
          <div><p>Active polls</p><strong>{summary.activePolls}</strong></div>
          <span className="dashboard-stat-note">{summary.completedPolls} completed</span>
        </article>
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-icon violet"><FaUsers /></span>
          <div><p>Participants</p><strong>{summary.totalParticipants.toLocaleString()}</strong></div>
          <span className="dashboard-stat-note">Unique voters</span>
        </article>
      </section>

      <section className="dashboard-insights-grid" aria-label="Voting activity">
        <article className="dashboard-panel activity-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-eyebrow">LAST 14 DAYS</span>
              <h2>Voting activity</h2>
            </div>
            <span className="dashboard-chart-legend"><i /> Votes</span>
          </div>
          {activity.length ? (
            <div className="dashboard-chart">
              <svg
                viewBox="0 0 680 160"
                role="img"
                aria-label="Daily vote activity for the last 14 days"
                preserveAspectRatio="none"
              >
                {[30, 66, 102, 138].map((y) => (
                  <line key={y} x1="0" x2="680" y1={y} y2={y} className="chart-grid-line" />
                ))}
                <polyline points={chartPoints} className="chart-line" />
                {activity.map((day, index) => {
                  const x = activity.length > 1 ? (index / (activity.length - 1)) * 660 + 10 : 10;
                  const y = 138 - (day.votes / peak) * 112;
                  return <circle key={day.date} cx={x} cy={y} r="3" className="chart-point" />;
                })}
              </svg>
              <div className="dashboard-chart-labels">
                <span>{activity[0].date.slice(5)}</span>
                <span>{activity[Math.floor((activity.length - 1) / 2)].date.slice(5)}</span>
                <span>{activity.at(-1).date.slice(5)}</span>
              </div>
            </div>
          ) : (
            <p className="dashboard-muted">Voting activity will appear here as people participate.</p>
          )}
        </article>

        <article className="dashboard-panel popular-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-eyebrow">BY VOTE COUNT</span>
              <h2>Most popular</h2>
            </div>
          </div>
          {(analytics?.mostPopular || []).length ? (
            <ol className="popular-poll-list">
              {analytics.mostPopular.map((poll, index) => (
                <li key={poll.id}>
                  <span className="popular-rank">{String(index + 1).padStart(2, "0")}</span>
                  <Link to={`/poll/${poll.slug}`}>{poll.question}</Link>
                  <strong>{poll.totalVotes}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="dashboard-muted">Your top-performing polls will show up here.</p>
          )}
        </article>
      </section>

      <section className="dashboard-panel polls-panel">
        <div className="dashboard-panel-heading">
          <div>
            <span className="dashboard-eyebrow">YOUR CONTENT</span>
            <h2>Your polls <span className="dashboard-count">{polls.length}</span></h2>
          </div>
          {polls.length > 0 && <Link to="/polls" className="dashboard-text-link">Explore polls <FaExternalLinkAlt /></Link>}
        </div>

        {polls.length ? (
          <div className="polls-table-scroll">
            <table className="polls-table">
              <thead>
                <tr>
                  <th>Poll</th>
                  <th>Votes</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="action-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => {
                  const isActive =
                    poll.isActive &&
                    (!poll.settings?.expiresAt || new Date(poll.settings.expiresAt) > new Date());
                  return (
                    <tr key={poll._id}>
                      <td data-label="Poll">
                        <Link className="poll-question-link" to={`/poll/${poll.slug}`}>
                          {poll.question}
                        </Link>
                        <span className="poll-category-label">{poll.category || "General"}</span>
                      </td>
                      <td data-label="Votes">{(poll.totalVotes || 0).toLocaleString()}</td>
                      <td data-label="Status">
                        <span className={`status ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "Active" : "Completed"}
                        </span>
                      </td>
                      <td data-label="Created">{new Date(poll.createdAt).toLocaleDateString()}</td>
                      <td className="action-col" data-label="Actions">
                        <Link className="dashboard-icon-button" to={`/poll/${poll.slug}`} aria-label="View poll">
                          <FaExternalLinkAlt />
                        </Link>
                        <button
                          className="dashboard-icon-button"
                          onClick={() => setActiveSharePoll(poll)}
                          aria-label="Share poll and view QR code"
                        >
                          <FaQrcode />
                        </button>
                        <button
                          className="dashboard-icon-button delete"
                          onClick={() => deleteMyPoll(poll._id)}
                          aria-label="Delete poll"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-inline">
            <FaPoll />
            <h3>Your first poll starts here</h3>
            <p>Create a question, share it with your audience, and watch responses arrive live.</p>
            <Link to="/create" className="btn dashboard-primary-button">Create your first poll</Link>
          </div>
        )}
      </section>

      {activeSharePoll && (
        <ShareModal
          isOpen={!!activeSharePoll}
          onClose={() => setActiveSharePoll(null)}
          pollQuestion={activeSharePoll.question}
          pollSlug={activeSharePoll.slug}
        />
      )}
    </main>
  );
};

export default Dashboard;
