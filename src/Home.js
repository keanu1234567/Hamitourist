import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function Home() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // slower video
    }

    // Try autoplaying the background audio when component mounts
     if (videoRef.current) {
    videoRef.current.playbackRate = 0.5; // slower video
  }

  // Try autoplaying the background audio when component mounts
  if (audioRef.current) {
    audioRef.current.volume = 0.2; // 🎵 Set volume to 20%
    audioRef.current.play().catch(() => {
      console.log("Autoplay was blocked by the browser. User interaction needed.");
    });
  }
}, []);

  return (
    <>
      {/* Hero Section */}
      <header id="home" className="hero">
  <video
    ref={videoRef}
    autoPlay
    loop
    muted
    playsInline
    className="hero-video"
  >
    <source src="hami.mov" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* 🌈 Gradient overlay above the video */}
  <div className="hero-gradient-overlay"></div>

  {/* Background Audio */}
  <audio ref={audioRef} loop autoPlay>
    <source src="wind.mp3" type="audio/mp3" />
    Your browser does not support the audio element.
  </audio>

  <div className="hero-overlay">
    <h1>Welcome to HamiTour</h1>
    <p>
      Discover the beauty, biodiversity, and wonders of Mt. Hamiguitan, a
      UNESCO World Heritage Site in the Philippines.
    </p>
    <Link to="/tour" className="btn">
      Virtual Tour
    </Link>
  </div>
</header>

      {/* Famous Spots Section */}
      <section id="spots" className="section">
        <h2>Spots with 3D Models in Mt. Hamiguitan</h2>
        <div className="card-container">
          <div className="card">
            <img src="pygmy.jpg" alt="Pygmy Forest" />
            <h3>Pygmy Field</h3>
            <p>
              A unique bonsai forest, where centuries-old trees remain stunted due to the harsh soil and climate.
            </p>
          </div>

          <div className="card">
            <img src="IMG_0782.jpg" alt="Peak" />
            <h3>Peak</h3>
            <p>
              The summit of Mt. Hamiguitan, rewarding climbers with stunning 360° views of Davao Oriental and beyond.
            </p>
          </div>

          <div className="card">
            <img src="IMG_0857.jpg" alt="Black Mountain" />
            <h3>Black Mountain</h3>
            <p>
              A ridge of darker rock and soil, distinct in color compared to other parts of the trail.
            </p>
          </div>
          <div className="card">
            <img src="IMG_0411.jpg" alt="Camp 3" />
            <h3>Camp 3</h3>
            <p>
              A common campsite along the trail where hikers rest and prepare for the push toward higher elevation.
            </p>
          </div>
          <div className="card">
            <img src="IMG_0582.jpg" alt="Mossy Forest" />
            <h3>Mossy Forest</h3>
            <p>
              A mystical forest with trees covered in moss, orchids, and ferns, often shrouded in fog.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 HamiTour | All Rights Reserved</p>
      </footer>
    </>
  );
}

export default Home;
