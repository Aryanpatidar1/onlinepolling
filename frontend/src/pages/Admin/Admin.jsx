import React, { useEffect, useState } from "react";
import "./Admin.css";
import { FaUsers, FaPoll, FaTrash, FaBan, FaCheckCircle,FaUserShield } from "react-icons/fa";
import api from "../../api/api";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setUsers(res.data.users);
      setPolls(res.data.polls);
      setLoading(false);
    } catch (err) {
      console.log("Admin Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // user block and unblock
  const toggleBlockUser = async (id) => {
    try {
      const res = await api.put(`/admin/user/${id}`);
      fetchAdminData();
    } catch (err) {
      console.log(err);
    }
  };

  // delete poll
  const deletePoll = async (id) => {
    try {
      await api.delete(`/admin/polls/${id}`);
      fetchAdminData();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading)
    return (
      <main className="admin-page container">
        <p>Loading admin dashboard...</p>
      </main>
    );

  return (
    <main className="admin-page">

  {/* SIDEBAR */}
  <aside className="admin-sidebar">
    <h2 className="side-logo">PrimeAdmin</h2>

    <ul className="side-links">
      <li className="active">Dashboard</li>
      <li>Users</li>
      <li>Polls</li>
      <li>Settings</li>
      <li className="logout">Logout</li>
    </ul>
  </aside>

  {/* MAIN CONTENT */}
  <div className="admin-main">

    {/* TOPBAR */}
    <header className="admin-topbar">
      <h1>Admin Dashboard</h1>
      <div className="admin-profile">A</div>
    </header>

    {/* STATS */}
    <div className="admin-stats2">
      <div className="stat-card2 users">
        <h3>{users.length}</h3>
        <p>Total Users</p>
      </div>

      <div className="stat-card2 polls">
        <h3>{polls.length}</h3>
        <p>Total Polls</p>
      </div>

      <div className="stat-card2 active">
        <h3>{polls.filter(p => p.isActive).length}</h3>
        <p>Active Polls</p>
      </div>
    </div>

    {/* GRID TABLES */}
    <div className="grid-container">

      {/* USERS LIST */}
      <section className="data-card">
        <h2>Users</h2>

        <div className="list-wrapper">
          {users.map(u => (
            <div className="list-item" key={u._id}>
              <div>
                <h4>{u.name}</h4>
                <p>{u.email}</p>
              </div>

              <button
                className={`status-btn ${u.isBlocked ? "blocked" : "active"}`}
                onClick={() => toggleBlockUser(u._id)}
              >
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* POLLS LIST */}
      <section className="data-card">
        <h2>Polls</h2>

        <div className="list-wrapper">
          {polls.map(p => (
            <div className="list-item" key={p._id}>
              <div>
                <h4>{p.question}</h4>
                <p>{p.totalVotes} votes</p>
              </div>

              <button
                className="delete-btn"
                onClick={() => deletePoll(p._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  </div>
</main>

  );
};

export default Admin;
