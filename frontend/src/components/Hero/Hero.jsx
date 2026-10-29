import React from "react";
import "./Hero.css";
import { ReactTyped } from "react-typed";
import { FaBolt, FaChartLine, FaLink, FaUserSecret, FaQrcode, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero container">
      {/* left side */}
      <div className="hero-left">
        <div className="hero-badge">
          <FaBolt className="hero-badge-icon" />
          <span>Realtime Polling System</span>
        </div>

        <h1 className="hero-title">
          Create polls.  
          <br />
          Collect <span className="typed-text">
            <ReactTyped
              strings={[
                "Honest Opinions.",
                "Live Insights.",
                "Real Feedback.",
                "Anonymous Votes.",
              ]}
              typeSpeed={50}
              backSpeed={30}
              loop
            />
          </span>
        </h1>

        <p className="hero-subtitle">
          Conduct fast, simple, and anonymous polls with live results.  
          Fully secure, real-time, and beautifully designed.
        </p>

        <div className="hero-buttons">
          <Link to="/create" className="btn">
            Create Poll
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            View Dashboard
          </Link>
        </div>
      </div>

      {/* right sidie  */}
      <div className="hero-right">
        <div className="hero-card">
          <div className="hero-card-header">
            <span>Live Preview</span>
            <span className="hero-status-dot"></span>
          </div>

          <h3 className="hero-poll-q">Which feature do you like most?</h3>

          <ul className="hero-options">
            <li>
              <span>Anonymous Voting</span>
              <div className="bar"><div style={{ width: "70%" }}></div></div>
              <span>70%</span>
            </li>
            <li>
              <span>Live Insights</span>
              <div className="bar"><div style={{ width: "55%" }}></div></div>
              <span>55%</span>
            </li>
            <li>
              <span>Shareable Link</span>
              <div className="bar"><div style={{ width: "40%" }}></div></div>
              <span>40%</span>
            </li>
          </ul>

          <div className="hero-footer">
            <span><FaQrcode /> QR Scan & Vote</span>
            <span><FaWhatsapp /> WhatsApp Share</span>
            <span><FaChartLine /> Realtime Socket.IO</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
