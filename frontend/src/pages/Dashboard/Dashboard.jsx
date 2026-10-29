import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { FaPoll, FaTrash, FaChartBar, FaPlusCircle, FaQrcode } from "react-icons/fa";
import api from "../../api/api";
import { Link, Navigate } from "react-router-dom";
import ShareModal from "../../components/ShareModal/ShareModal";

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSharePoll, setActiveSharePoll] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const fetchMyPolls = async () => {
    try {
      const res = await api.get("/poll/mine");
      setPolls(res.data.polls || []);
    } catch (err) {
      console.log("Fetch dashboard error:", err);
      if (err.response?.status === 401) {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleLogout = () => setCurrentUser(null);
    window.addEventListener("userLoggedOut", handleLogout);

    const token = localStorage.getItem("token");
    if (currentUser && token) {
      fetchMyPolls();
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener("userLoggedOut", handleLogout);
  }, []);

  // ❌ NOT LOGGED IN SCREEN
  if (!currentUser) {
    return (
      <main className="page dashboard-page container">
        <div className="no-polls">
          <FaPoll className="no-icon" />
          <h2>You are not logged in</h2>
          <p>Please login to access your dashboard.</p>
          <Link to="/auth" className="btn">
            Login Now
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page dashboard-page container">
        <p className="loading">Loading your dashboard...</p>
      </main>
    );
  }

  // DELETE POLL
  const deleteMyPoll = async (id) => {
    try {
      await api.delete(`/poll/${id}`);
      fetchMyPolls();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main className="page dashboard-page container">
      <div className="dashboard-header">
        <h1>Your Polls</h1>
        <Link to="/create" className="btn create-btn">
          <FaPlusCircle /> Create Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="no-polls">
          <FaPoll className="no-icon" />
          <h2>No polls created yet</h2>
          <p>Create your first poll and start collecting votes!</p>
          <Link to="/create" className="btn">
            Create Poll
          </Link>
        </div>
      ) : (
        <div className="polls-table-box">
          <table className="polls-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Votes</th>
                <th>Status</th>
                <th>Created</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {polls.map((poll) => (
                <tr key={poll._id}>
                  <td>{poll.question}</td>
                  <td>{poll.totalVotes}</td>
                  <td>
                    {poll.isActive ? (
                      <span className="status active">Active</span>
                    ) : (
                      <span className="status inactive">Expired</span>
                    )}
                  </td>
                  <td>
                    {new Date(poll.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="action-col">
                    <Link
                      className="btn small-btn view-btn"
                      to={`/poll/${poll.slug}`}
                    >
                      <FaChartBar /> View
                    </Link>
                    <button
                      className="btn small-btn qr-btn"
                      onClick={() => setActiveSharePoll(poll)}
                      title="Share & QR Code"
                    >
                      <FaQrcode /> QR
                    </button>
                    <button
                      className="btn small-btn delete-btn"
                      onClick={() => deleteMyPoll(poll._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SHARE MODAL */}
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
