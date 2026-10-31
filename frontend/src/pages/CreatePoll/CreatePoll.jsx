import { useState } from "react";
import "./CreatePoll.css";
import { FaPlus, FaTrashAlt, FaWhatsapp, FaQrcode, FaExternalLinkAlt, FaCheck, FaRobot } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../api/api";
import ShareModal from "../../components/ShareModal/ShareModal";

const CreatePoll = () => {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]); // minimum 2 options
  const [category, setCategory] = useState("Technology");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [maxVotesPerUser, setMaxVotesPerUser] = useState(1);
  const [showResultsMode, setShowResultsMode] = useState("always");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [topic, setTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) {
      // maximum 6 options ho sakte hai
      return;
    }

    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions(options.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (question.trim().length < 2 || question.trim().length > 300) {
      setErrorMsg("Question must be between 2 and 300 characters.");
      return false;
    }

    const cleanedOptions = options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (
      cleanedOptions.length < 2 ||
      cleanedOptions.length > 6 ||
      cleanedOptions.some((option) => option.length > 100) ||
      new Set(cleanedOptions.map((option) => option.toLocaleLowerCase())).size !== cleanedOptions.length
    ) {
      setErrorMsg("Add 2 to 6 unique options, each no longer than 100 characters.");
      return false;
    }

    if (!Number.isInteger(maxVotesPerUser) || maxVotesPerUser < 1 || maxVotesPerUser > 10) {
      setErrorMsg("Max votes per user must be between 1 and 10.");
      return false;
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      setErrorMsg("Expiry must be a future date.");
      return false;
    }

    setErrorMsg("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setShareLink("");
    if (!validateForm()) return;

    const cleanedOptions = options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const payload = {
      question: question.trim(),
      description: description.trim(),
      options: cleanedOptions,
      category,
      settings: {
        allowAnonymous,
        maxVotesPerUser,
        showResultsMode,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      },
    };

    try {
      setLoading(true);
      const res = await api.post("/poll", payload);

      setSuccessMsg("Poll created successfully!");
      const slug = res.data?.poll?.slug;
      if (slug) {
        const link = `${window.location.origin}/poll/${slug}`;
        setShareLink(link);
        setCreatedSlug(slug);
      }
      // optional: form reset
      // setQuestion("");
      // setOptions(["", ""]);
    } catch (err) {
      console.error("Create poll error:", err);
      if (err.response?.status === 401) {
        setErrorMsg("Session expired or not logged in. Please login again to create a poll.");
      } else {
        const msg =
          err.response?.data?.message ||
          "Failed to create poll. Make sure you are logged in.";
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = async (event) => {
    event.preventDefault();
    setAiError("");
    try {
      setAiLoading(true);
      const response = await api.post("/ai/generate-poll", { topic });
      const draft = response.data.draft;
      setQuestion(draft.question);
      setDescription(draft.description);
      setOptions(draft.options);
      setCategory(draft.category);

      const expiry = new Date(Date.now() + draft.suggestedDurationHours * 60 * 60 * 1000);
      const localExpiry = new Date(expiry.getTime() - expiry.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setExpiresAt(localExpiry);
    } catch (error) {
      setAiError(
        error.response?.data?.message || "Could not generate a poll draft. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <main className="page create-poll-page container">
      {/* SHARE MODAL WITH QR & SOCIALS */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        pollQuestion={question}
        pollSlug={createdSlug}
      />

      <h2 className="create-title">Create a new poll</h2>
      <p className="create-subtitle">
        Write your question, add options, set poll rules, and share it with a
        link.
      </p>

      <section className="ai-draft-box" aria-labelledby="ai-draft-heading">
        <div className="ai-draft-heading">
          <span className="ai-draft-icon"><FaRobot /></span>
          <div>
            <h3 id="ai-draft-heading">Start with AI</h3>
            <p>Turn a topic into an editable poll draft. You stay in control before publishing.</p>
          </div>
        </div>
        <form className="ai-draft-form" onSubmit={generateDraft}>
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. The future of remote work"
            aria-label="Topic for AI poll generation"
            minLength={3}
            maxLength={300}
            required
          />
          <button
            className="btn ai-generate-button"
            type="submit"
            disabled={aiLoading || !isAuthenticated}
          >
            <FaRobot />
            {aiLoading ? "Generating…" : isAuthenticated ? "Generate draft" : "Login to generate"}
          </button>
        </form>
        {!isAuthenticated && <Link className="ai-login-link" to="/auth">Sign in to use the AI poll generator</Link>}
        {aiError && <p className="ai-draft-error" role="alert">{aiError}</p>}
      </section>

      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
          {errorMsg.includes("login") && (
            <Link to="/auth" style={{ marginLeft: "10px", textDecoration: "underline", color: "#fff", fontWeight: "bold" }}>
              Login Now →
            </Link>
          )}
        </div>
      )}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form className="create-form" onSubmit={handleSubmit}>
        {/* question */}
        <div className="form-group">
          <label>Poll Question</label>
          <textarea
            rows="2"
            maxLength={300}
            placeholder="e.g. Which programming language do you prefer for web development?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="poll-description">Description <span className="optional-label">Optional</span></label>
          <textarea
            id="poll-description"
            rows="3"
            maxLength={1000}
            placeholder="Add context to help people make an informed choice"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {/* category */}
        <div className="form-group">
          <label>Poll Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="Technology">💻 Technology & Coding</option>
            <option value="Education">🎓 Education & Career</option>
            <option value="Business">💼 Business & Finance</option>
            <option value="Sports">⚽ Sports & Fitness</option>
            <option value="Entertainment">🎬 Entertainment & Gaming</option>
            <option value="General">🌍 General & Lifestyle</option>
          </select>
        </div>

        {/* pptions */}
        <div className="form-group">
          <label>Options</label>
          <div className="options-wrapper">
            {options.map((opt, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  maxLength={100}
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="icon-btn remove-btn"
                    onClick={() => removeOption(index)}
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              className="btn small-btn add-option-btn"
              onClick={addOption}
            >
              <FaPlus />
              <span>Add Option</span>
            </button>
          )}
        </div>

        {/* settings */}
        <div className="settings-grid">
          {/* anonymous toggle */}
          <div className="form-group">
            <label>Anonymous voting</label>
            <div className="toggle-row">
              <span>Allow people to vote without login</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* max votes */}
          <div className="form-group">
            <label>Max votes per user</label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxVotesPerUser}
              onChange={(e) => setMaxVotesPerUser(Number(e.target.value) || 1)}
            />
          </div>

          {/* show results mode */}
          <div className="form-group">
            <label>Show results</label>
            <select
              value={showResultsMode}
              onChange={(e) => setShowResultsMode(e.target.value)}
            >
              <option value="always">Always visible</option>
              <option value="afterVote">Only after voting</option>
              <option value="never">Hidden from voters</option>
            </select>
          </div>

          {/* expiry */}
          <div className="form-group">
            <label>Expiry (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <small className="hint">
              Leave empty if you don't want the poll to expire.
            </small>
          </div>
        </div>

        {/* submit */}
        <div className="form-actions">
          <button className="btn create-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>

        {/* share link */}
        {shareLink && (
          <div className="share-box">
            <div className="share-box-header">
              <h3>🎉 Your poll is live and ready!</h3>
              <p>Scan the QR code or share via WhatsApp to start collecting votes instantly.</p>
            </div>

            <div className="share-action-buttons">
              <button
                type="button"
                className="btn-share-act qr"
                onClick={() => setShowShareModal(true)}
              >
                <FaQrcode /> View QR Code & Share
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `📊 Vote on this poll:\n"${question}"\n\n👉 Click here to vote:\n${shareLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-share-act whatsapp"
              >
                <FaWhatsapp /> Share on WhatsApp
              </a>

              <Link to={`/poll/${createdSlug}`} className="btn-share-act view">
                <FaExternalLinkAlt /> View Live Poll
              </Link>
            </div>

            <div className="share-link-row">
              <input type="text" readOnly value={shareLink} />
              <button
                type="button"
                className="btn small-btn copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <>
                    <FaCheck /> Copied
                  </>
                ) : (
                  "Copy Link"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
};

export default CreatePoll;
