import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const resetMessage = () => {
    setMsg("");
    setErr("");
  };

  // handle form submition
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessage();

    try {
      if (isLogin) {
        // ḷogin karenge
        const res = await api.post("/auth/login", { email, password });
        
        localStorage.setItem("user", JSON.stringify(res.data.user));

        localStorage.setItem("token", res.data.token);

        window.dispatchEvent(new Event("userLoggedIn"));

        setMsg("Login Successfull..");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        // register karenge
        const res = await api.post("/auth/register", {
          name,
          email,
          password,
        });

        setMsg("Signup successfull! Please login.");
        setIsLogin(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong.";
      setErr(message);
    }
  };

  return (
    <main className="auth-page container">
      <div className="auth-card">
        {/* Header */}
        <h2 className="auth-title">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Login to continue polling."
            : "Sign up to start creating polls."}
        </p>

        {/* Alerts */}
        {err && <div className="alert alert-error">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        {/* FORM */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Enter strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="btn auth-btn" type="submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* SWITCH LINK */}
        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="switch-link"
            onClick={() => {
              resetMessage();
              setIsLogin(!isLogin);
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </main>
  );
};

export default Auth;
