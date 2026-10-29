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
            <span>Fast . Simple . Realtime</span>
          </div>

          <h2 className="cta-title">
            Ready to collect <span>honest opinions?</span>
          </h2>

          <p className="cta-text">
            Create your first poll in seconds. No signup required for voters.
            Instant analytics. Completely free.
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
