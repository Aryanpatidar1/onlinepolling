import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  FaWhatsapp,
  FaTwitter,
  FaLinkedin,
  FaTelegramPlane,
  FaQrcode,
  FaDownload,
  FaCopy,
  FaCheck,
  FaTimes,
  FaShareAlt,
} from "react-icons/fa";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, pollQuestion, pollSlug }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const pollUrl = `${window.location.origin}/poll/${pollSlug}`;

  useEffect(() => {
    if (isOpen && pollSlug) {
      QRCode.toDataURL(
        pollUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (!err) {
            setQrCodeUrl(url);
          }
        }
      );
    }
  }, [isOpen, pollSlug, pollUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `poll-${pollSlug}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareText = `📊 Vote on this poll:\n"${pollQuestion}"\n\n👉 Click here to vote:\n${pollUrl}`;

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `📊 Vote on this poll: "${pollQuestion}"`
    )}&url=${encodeURIComponent(pollUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      pollUrl
    )}&text=${encodeURIComponent(`📊 "${pollQuestion}"`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      pollUrl
    )}`,
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div
        className="share-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="share-modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="share-modal-header">
          <div className="share-badge">
            <FaShareAlt /> Share & Scan
          </div>
          <h2 className="share-modal-title">Share this Poll</h2>
          <p className="share-modal-subtitle">
            "{pollQuestion}"
          </p>
        </div>

        {/* QR CODE CARD */}
        <div className="qr-section">
          <div className="qr-box">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Poll QR Code" className="qr-image" />
            ) : (
              <div className="qr-placeholder">Generating QR Code...</div>
            )}
            <div className="qr-scan-hint">
              <FaQrcode /> Scan with phone camera to vote
            </div>
          </div>
          <button className="btn-download-qr" onClick={downloadQR}>
            <FaDownload /> Download QR Code (PNG)
          </button>
        </div>

        {/* SOCIAL SHARE BUTTONS */}
        <div className="social-share-section">
          <p className="social-label">Share instantly via:</p>
          <div className="social-buttons-grid">
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn whatsapp"
            >
              <FaWhatsapp className="social-icon" />
              <span>WhatsApp</span>
            </a>

            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn telegram"
            >
              <FaTelegramPlane className="social-icon" />
              <span>Telegram</span>
            </a>

            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn twitter"
            >
              <FaTwitter className="social-icon" />
              <span>Twitter / X</span>
            </a>

            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn linkedin"
            >
              <FaLinkedin className="social-icon" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* COPY LINK SECTION */}
        <div className="copy-link-section">
          <p className="copy-label">Or copy direct link:</p>
          <div className="copy-input-row">
            <input type="text" readOnly value={pollUrl} className="copy-input" />
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <FaCheck /> Copied!
                </>
              ) : (
                <>
                  <FaCopy /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
