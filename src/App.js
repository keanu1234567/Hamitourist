import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import Home from "./Home";
import Tour from "./Tour";
import SpotView from "./SpotView";
import About from "./About";
import Conservation from "./Conservation";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

import logo from "./assets/hamitourlogo.png";
import "./App.css";

function App() {
  const location = useLocation();
  const hideNavbar = 
  location.pathname.startsWith("/Spots/")||
  location.pathname.startsWith("/admin-login") ||
  location.pathname.startsWith("/admin-dashboard");
  const [showDropdown, setShowDropdown] = useState(false);

  const accountRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="App">
      {!hideNavbar && (
        <nav className="navbar">
          <div className="logo">
            <img src={logo} alt="HamiTour Logo" className="logo-img" />
            <span>HamiTour</span>
          </div>

          <ul className="nav-links">
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/tour">Virtual Tour</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/conservation">Conservation</NavLink>
            </li>

            {/* 👤 Account Icon */}
            <li
              ref={accountRef}
              className="account-icon"
              onClick={(e) => {
                e.stopPropagation(); // stop closing immediately
                setShowDropdown(!showDropdown);
              }}
            >
              <FaUserCircle className="user-icon" />

              {/* 🔽 Dropdown */}
              {showDropdown && (
                <div className="dropdown-menu">
                  <NavLink
                    to="/admin-login"
                    className="dropdown-button"
                    onClick={() => setShowDropdown(false)}
                  >
                    Login as Admin
                  </NavLink>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={<Tour />} />
        <Route path="/about" element={<About />} />
        <Route path="/conservation" element={<Conservation />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route
          path="/Spots/:id"
          element={<SpotView key={location.pathname} />}
        />
      </Routes>
    </div>
  );
}

export default App;
