import React from "react";
import "./CTA.css";
import { FaPlusCircle, FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="cta-section container">
      <div className="cta-card">
        <div className="cta-left">
          <div className="cta-badge">
            <FaBolt />
            <span>Quick polls for groups</span>
          </div>

          <h2 className="cta-title">
            Get your group&apos;s <span>opinion—live.</span>
          </h2>

          <p className="cta-text">
            Create a poll in seconds and share it on WhatsApp or by QR. Voters
            can respond anonymously without an account when anonymous voting
            is enabled. Poll creators sign in to publish.
          </p>

          <div className="cta-actions">
            <Link to="/create" className="btn cta-btn">
              <FaPlusCircle />
              <span>Create a Poll</span>
            </Link>

            
          </div>
        </div>

        <div className="cta-right">
          <div className="cta-circle"></div>
          <div className="cta-circle-sm"></div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
