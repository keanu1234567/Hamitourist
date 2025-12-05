import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./Home";
import Tour from "./Tour";
import SpotView from "./SpotView";
import About from "./About";
import Conservation from "./Conservation";
import logo from "./assets/hamitourlogo.png";
import "./App.css"; // 👈 import the new About page

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/Spots/");

  return (
    <div className="App">
      {!hideNavbar && (
        <nav className="navbar">
          <div className="logo">
            <img src={logo} alt="HamiTour Logo" className="logo-img" />
            <span>HamiTour</span>
          </div>
          <ul className="nav-links">
            <li className="nav-list">
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/tour">Virtual Tour</NavLink>
            </li>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>{" "}
            {/* ✅ Link to About */}
            <li>
              <NavLink to="/conservation">Conservation</NavLink>
            </li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={<Tour />} />
        <Route path="/about" element={<About />} /> {/* ✅ Add About route */}
        <Route path="/conservation" element={<Conservation />} />
        <Route
          path="/Spots/:id"
          element={<SpotView key={location.pathname} />}
        />
      </Routes>
    </div>
  );
}

export default App;
