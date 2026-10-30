import React from "react";
import "./Hero.css";
import { FaBolt, FaChartLine, FaQrcode, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero container">
      {/* left side */}
      <div className="hero-left">
        <div className="hero-badge">
          <FaBolt className="hero-badge-icon" />
          <span>For classes, events & group chats</span>
        </div>

        <h1 className="hero-title">
          Poll your group.
          <br />
          <span className="typed-text">See results live.</span>
        </h1>

        <p className="hero-subtitle">
          Create a poll in seconds, share it on WhatsApp or by QR, and let
          people vote anonymously without an account when anonymous voting is
          enabled. Poll creators sign in to publish.
        </p>

        <div className="hero-buttons">
          <Link to="/create" className="btn">
            Create a Poll
          </Link>
          <Link to="/polls" className="btn btn-outline">
            Explore Polls
          </Link>
        </div>
      </div>

      {/* right sidie  */}
      <div className="hero-right">
        <div className="hero-card">
          <div className="hero-card-header">
            <span>Example poll</span>
            <span>Shareable by link or QR</span>
          </div>

          <h3 className="hero-poll-q">What should our group do next?</h3>

          <ul className="hero-options">
            <li>
              <span className="hero-option-dot" />
              <span>Movie night</span>
            </li>
            <li>
              <span className="hero-option-dot" />
              <span>Game night</span>
            </li>
            <li>
              <span className="hero-option-dot" />
              <span>Go out to eat</span>
            </li>
          </ul>

          <div className="hero-footer">
            <span><FaQrcode /> QR Scan & Vote</span>
            <span><FaWhatsapp /> WhatsApp Share</span>
            <span><FaChartLine /> Live results</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
