import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import "./Conservation.css";

function Conservation() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.5;
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
    }
  }, []);

  const rules = [
    {
      icon: "🛂",
      title: "No Permit, No Entry",
      desc: "Only authorized visitors are allowed inside. Permits must be obtained before entry to ensure protection of the sanctuary."
    },
    {
      icon: "🚯",
      title: "Proper Garbage Disposal",
      desc: "Carry your trash and hand it over to your guide. Never litter on trails or campsites to preserve the environment."
    },
    {
      icon: "🦜",
      title: "No Poaching or Collecting",
      desc: "Collecting or possessing plants/animals without permit is illegal. Respect wildlife and their habitats."
    },
    {
      icon: "🚭",
      title: "No Smoking",
      desc: "Smoking is strictly prohibited in all areas to prevent forest fires and protect air quality."
    },
    {
      icon: "🍳",
      title: "Designated Cooking Areas",
      desc: "Cooking is allowed only in assigned areas. Check stoves for safety and avoid damaging the soil."
    },
    {
      icon: "💧",
      title: "Water Safety",
      desc: "Avoid polluting water sources with soap, shampoo, or detergents to protect aquatic life."
    },
    {
      icon: "🔇",
      title: "Respect Noise Levels",
      desc: "Maintain quietness to preserve the natural tranquility and prevent disturbing wildlife."
    },
    {
      icon: "❌",
      title: "No Vandalism",
      desc: "Do not deface trees, rocks, signs, or facilities. Respect the natural and cultural heritage."
    },
    {
      icon: "⚠️",
      title: "Avoid Damaging Facilities",
      desc: "Help maintain trails, shelters, and other facilities by using them responsibly."
    },
    {
      icon: "🛤️",
      title: "Stay on Designated Trails",
      desc: "Do not wander outside official trails or campsites unless permitted for research purposes."
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="conservation-page">
      {/* 🎥 Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src="/hami.mov" type="video/mp4" />
      </video>

      <audio ref={audioRef} loop autoPlay>
        <source src="/wind.mp3" type="audio/mp3" />
      </audio>

      {/* Hero Header */}
      <section className="conservation-header">
        <h1>Conservation at Mt. Hamiguitan</h1>
        <h3>UNESCO World Heritage Site & ASEAN Heritage Park</h3>
        <p>
          Protecting the biodiversity and cultural heritage of Mt. Hamiguitan is our top priority.
          Follow these rules to help preserve the sanctuary for future generations.
        </p>
      </section>

      {/* Rules Section */}
      <section className="rules-section">
        {rules.map((rule, index) => (
          <div
            className={`rule-card ${openIndex === index ? "open" : ""}`}
            key={index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="rule-header">
              <span className="rule-icon">{rule.icon}</span>
              <h3>{rule.title}</h3>
              <span className="toggle-icon">{openIndex === index ? "▲" : "▼"}</span>
            </div>
            <p className="rule-desc">{rule.desc}</p>
          </div>
        ))}
      </section>

      {/* Did You Know Section */}
      <section className="did-you-know">
        <h2>Did You Know?</h2>
        <p>
          Mt. Hamiguitan Range Wildlife Sanctuary is home to unique species like the 
          Philippine eagle, pygmy forest trees, and rare pitcher plants.
        </p>
        <p>
          The sanctuary spans different ecosystems including mossy forests, montane forests, 
          and dipterocarp forests. Each provides habitat for endemic wildlife, including 
          reptiles, birds, and invertebrates found nowhere else on Earth.
        </p>
        <p>
          Local communities actively participate in conservation through guided tours, 
          research, and monitoring programs, ensuring that traditional knowledge and 
          biodiversity protection go hand in hand.
        </p>
        <p>
          The Protected Area Management Office strictly enforces rules for visitors, 
          making Mt. Hamiguitan a safe and educational destination for ecotourism.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 HamiTour | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default Conservation;
