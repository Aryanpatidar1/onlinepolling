import { Link, NavLink } from "react-router-dom";
import { FaPoll, FaPlusCircle, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const syncUser = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    syncUser();

    // Login/logout aur storage updates listen karo
    window.addEventListener("userLoggedIn", syncUser);
    window.addEventListener("userLoggedOut", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("userLoggedIn", syncUser);
      window.removeEventListener("userLoggedOut", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [syncUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/auth");
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-innner">
        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <FaPoll />
          </div>
          <span className="logo-text">PrimePoll</span>
        </Link>

        {/* HAMBURGER */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* NAV LINKS */}
        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" className="nav-links" onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/polls" className="nav-links" onClick={() => setMenuOpen(false)}>
            Polls
          </NavLink>
          <NavLink
            to="/create"
            className="nav-links with-icon"
            onClick={() => setMenuOpen(false)}
          >
            <FaPlusCircle className="nav-icon" />
            Create Poll
          </NavLink>
          <NavLink
            to="/dashboard"
            className="nav-links"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>

          {/* AUTH (Mobile) */}
          <div className="mobile-auth">
            {user ? (
              <>
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" className="nav-profile-btn" onClick={() => setMenuOpen(false)}>
                Login / Signup
              </NavLink>
            )}
          </div>
        </nav>

        {/* AUTH (Desktop) */}
        <div className="navbar-auth desktop-auth">
          {user ? (
            <div className="logged-user">
              <FaUserCircle className="nav-icon" />
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className="nav-profile-btn">
              <FaUserCircle className="nav-icon" />
              <span>Login / Signup</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
