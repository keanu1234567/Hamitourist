import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/hamitourlogo.png";
import "./App.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // error state
  const videoRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!password) {
      showError("⚠️ Please enter a password");
      return;
    }

    if (password === "admin123") {
      navigate("/admin-dashboard");
    } else {
      showError("❌ Incorrect password");
    }
  };

  // Show error for 2 seconds
  const showError = (message) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 2000); // disappears after 2 seconds
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => console.log("Autoplay blocked"));
    }
  }, []);

  return (
    <div className="admin-login-wrapper">
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="login-background-video"
      >
        <source src="hami.mov" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="login-overlay">
        {/* Logo and title */}
        <div className="login-logo-title">
          <img src={logo} alt="HamiTour Logo" className="login-logo" />
          <h1>HamiTour Admin</h1>
        </div>

        {/* Login Form */}
        <div className="login-container">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Back Button */}
          <button className="back-button" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
