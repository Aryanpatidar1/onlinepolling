import React from "react";
import "./Footer.css";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaPoll,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col large-col">
          <div className="footer-logo">
            <FaPoll className="footer-logo-icon" />
            <span>PrimePoll</span>
          </div>

          <p className="footer-about">
            PrimePoll is a realtime polling platform designed to gather instant
            feedback, conduct anonymous voting, and visualize live results with
            speed, accuracy, and a modern UI experience.
          </p>

          <p className="footer-mini-text">
            Trusted by creators, teams, students, and businesses for fast and
            honest opinions.
          </p>

          <div className="footer-socials">
            <a href="#">
              <FaGithub />
            </a>
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Product</h3>
          <ul className="footer-links">
            <li>
              <Link to="/create">Create Poll</Link>
            </li>
            <li>
              <a href="#">Live Analytics</a>
            </li>
            <li>
              <a href="#">Realtime Voting</a>
            </li>
            <li>
              <a href="#">Anonymous Mode</a>
            </li>
            <li>
              <a href="#">Poll Sharing</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Company</h3>
          <ul className="footer-links">
            <li>
              <Link to='/about'>About Us</Link>
            </li>
            <li>
              <Link to='/team'>Team</Link>
            </li>
            <li>
              <a href="#">Our Mission</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
            <li>
              <a href="#">Press Info</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">Support</h3>
          <ul className="footer-links">
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Terms of Use</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Report an Issue</a>
            </li>
          </ul>
        </div>
      </div>


      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} PrimePoll</p>
      </div>
    </footer>
  );
};

export default Footer;
