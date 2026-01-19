import React, { useRef, useEffect } from "react";
import "./App.css";
import "./About.css";

function About() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.5;
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked, user interaction needed.");
      });
    }
  }, []);

  const spots = [
    { name: "UNESCO Marker", img: "https://i.imgur.com/z2naEKO.jpeg", desc: "The official jump-off point of the Mt. Hamiguitan trail, marking the start of the climb." },
    { name: "Crossing Stampa", img: "https://i.imgur.com/VDlrFPZ.jpeg", desc: "A trail crossroad where trekkers usually regroup before heading deeper into the forest." },
    { name: "Puting Bato", img: "https://i.imgur.com/dLofKtJ.jpeg", desc: "A pale rock formation along the path, offering hikers a short rest stop and scenic view." },
    { name: "Lantawan 1", img: "https://i.imgur.com/U1UmFwr.jpeg", desc: "– A natural viewing deck where hikers can pause to admire the surrounding forest and slopes." },
    { name: "Camp 4", img: "https://i.imgur.com/jKc9S8B.jpeg", desc: "A designated resting campsite for trekkers, often used for overnight stays." },
    { name: "Uwang-Uwang", img: "https://i.imgur.com/7JsMLdl.jpeg", desc: "Named after the local beetle (uwang), known for its rich insect and wildlife diversity." },
    { name: "Lantawan 2", img: "https://i.imgur.com/usYiedr.jpeg", desc: "Another scenic viewpoint, giving a higher perspective of the mountain terrain." },
    { name: "Camp 3", img: "http://i.imgur.com/61rtYFn.jpeg", desc: "A  common campsite where hikers rest and prepare for the push toward higher elevation." },
    { name: "Pygmy Field", img: "https://i.imgur.com/1bgyovZ.jpeg", desc: "A unique bonsai forest, where centuries-old trees remain stunted due to climate." },
    { name: "Lantawan 3", img: "https://i.imgur.com/DGGOaxK.jpeg", desc: "The last viewing deck before reaching the mossy forest, offers amazing view." },
    { name: "Tinagong Dagat", img: "https://i.imgur.com/RUZIkdP.jpeg", desc: "A ‘hidden sea’ that mysteriously changes water level." },
    { name: "Mossy Forest", img: "https://i.imgur.com/aKFFyvd.jpeg", desc: "A mystical forest with trees covered in moss, orchids, and ferns, often shrouded in fog." },
    { name: "Hidden Garden", img: "https://i.imgur.com/s6m3bpS.jpeg", desc: "A lush area teeming with wild orchids and rare plants." },
    { name: "Peak", img: "https://imgur.com/3PZJPKJ.jpeg", desc: "The peak of Mt. Hamiguitan, offer climbers with a stunning view of Davao Oriental." },
    { name: "Black Mountain", img: "https://imgur.com/WBZnjaY.jpeg", desc: "A ridge of darker rock and soil, distinct in color compared to other parts of the trail." },
    { name: "Twin Falls", img: "https://i.imgur.com/DRxCa9i.jpeg", desc: "A pair of waterfalls cascading side by side, one of the highlights of the trek." },
  ];

  return (
    <div className="about-page">
      {/* 🎥 Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src="hami.mov" type="video/mp4" />
      </video>

      <audio ref={audioRef} loop autoPlay>
        <source src="wind.mp3" type="audio/mp3" />
      </audio>

      {/* 📖 About Mt. Hamiguitan */}
      <section className="about-wrapper">
      <div className="about-content">
        <h1>About Mt. Hamiguitan</h1>
        <p>
          Mt. Hamiguitan Range Wildlife Sanctuary, located in Davao Oriental,
          Philippines, is a UNESCO World Heritage Site known for its unique
          ecosystem and rich biodiversity. It is home to various endemic species,
          including the Philippine eagle, bonsai trees, pitcher plants, and rare
          orchids that thrive in its mossy forests and pygmy fields.
        </p>

        <p>
          Rising over 1,600 meters above sea level, Mt. Hamiguitan is a living
          laboratory for scientists and nature lovers. Its diverse habitats —
          from montane to mossy and dipterocarp forests — showcase the delicate
          balance of nature and the importance of protecting our environment.
        </p>

        <h2>What’s in Mt. Hamiguitan?</h2>
        <p>
          The mountain features natural attractions such as the Pygmy Forest,
          Twin Falls, Mossy Forest, and Hidden Garden. Each site offers a glimpse
          of the sanctuary’s ecological beauty and cultural significance to the
          people of Davao Oriental.
        </p>

        <h2>About HamiTour</h2>
        <p>
          <strong>HamiTour</strong> is an interactive virtual tour system designed
          to bring the wonders of Mt. Hamiguitan to anyone, anywhere. Through
          immersive 360° panoramas and educational content, HamiTour allows
          students, tourists, and researchers to explore the protected mountain
          virtually while learning about its biodiversity and conservation efforts.
        </p>

        <h2>System Goal</h2>
        <p>
          The goal of HamiTour is to promote environmental awareness and
          biodiversity conservation through digital exploration. By combining
          technology and environmental education, this system inspires users to
          appreciate and protect the natural heritage of Mt. Hamiguitan.
        </p>
      </div>
      </section>

      {/* 🌿 Spots Gallery */}
      <section className="spots-section">
        <h2>Explore the Wonders of Mt. Hamiguitan</h2>
        <p className="spots-desc">
          Each trail and viewpoint tells a story — from lush mossy forests to
          hidden waterfalls, Mt. Hamiguitan offers an unforgettable journey of
          discovery.
        </p>

        <div className="spots-grid">
          {spots.map((spot, i) => (
            <div className="spot-card" key={i}>
              <img src={spot.img} alt={spot.name} />
              <div className="spot-info">
                <h3>{spot.name}</h3>
                <p>{spot.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🦶 Footer */}
      <footer className="footer">
        <p>© 2025 HamiTour | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default About;
