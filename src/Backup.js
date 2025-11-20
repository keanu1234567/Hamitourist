import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import "./App.css";

/* 🌱 Generic 3D Model Loader (NO auto-centering here) */
function ModelViewer({ url, scale = [0.2, 0.2, 0.2], position = [0, 0, 0] }) {
  const { scene } = useGLTF(url);

  // Reset rotation
  scene.rotation.set(0, 0, 0);

  // Apply scale and fixed position (no Box3 auto-centering)
  scene.scale.set(...scale);
  scene.position.set(...position);

  // Optional tweak for Lady Slipper Orchid (example)
  if (url.toLowerCase().includes("lady slipper orchid")) {
    scene.scale.set(0.2, 0.2, 0.2);
    scene.position.set(...position);
    scene.rotation.y = Math.PI / 2;
  }

  return <primitive object={scene} />;
}

/* 🎯 Main SpotView Component */
const SpotView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [hoverBack, setHoverBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState(null);
  const [blurPanorama, setBlurPanorama] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const panoramaRef = useRef(null);

  // Close model modal and reload to avoid WebGL conflicts
  const handleCloseModal = () => {
    setActiveModel(null);
    setBlurPanorama(false);
    setModelInfo(null);
    // small delay so React can unmount things before reload
  };

  /* 🧭 Fetch Firestore Data */
  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const ref = doc(db, "Spots", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setSpot(snap.data());
        else console.error("❌ Spot not found!");
      } catch (error) {
        console.error("🔥 Error fetching spot:", error);
      }
    };
    fetchSpot();
  }, [id]);

  /* 🌄 Initialize Panorama */
  useEffect(() => {
    if (!spot || !containerRef.current) return;

    // Dispose previous viewer if exists
    if (viewerRef.current) {
      try {
        viewerRef.current.dispose();
      } catch {}
      viewerRef.current = null;
      THREE.Cache.clear();
    }

    // Clear container
    containerRef.current.innerHTML = "";

    // Create panorama & viewer
    const panorama = new PANOLENS.ImagePanorama(spot.Image);
    panoramaRef.current = panorama;

    const viewer = new PANOLENS.Viewer({
      container: containerRef.current,
      autoRotate: true,
      autoRotateSpeed: 0.3,
      controlBar: true,
      cameraFov: 75,
      enableReticle: false,
      viewIndicator: true,
    });

    viewerRef.current = viewer;
    viewer.add(panorama);

    panorama.addEventListener("progress", () => setLoading(true));
    panorama.addEventListener("load", () => {
      setLoading(false);
      // use safer name detection (trim + lowercase)
      const name = (spot.Name || "").trim().toLowerCase();

      if (name.includes("black mountain")) addImageInsidePanorama(panorama, "BlackMountain");
      else if (name.includes("pygmy")) addImageInsidePanorama(panorama, "Pygmy Field");
      else if (name.includes("mossy")) addImageInsidePanorama(panorama, "Mossy Forest");
      else if (name.includes("peak")) addImageInsidePanorama(panorama, "Peak");
      // add more checks here if you have other spot names
    });

    const handleResize = () => viewer.onWindowResize();
    window.addEventListener("resize", handleResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        viewerRef.current?.dispose?.();
        panoramaRef.current?.dispose?.();
        THREE.Cache.clear();
      } catch {}
    };
  }, [spot]);

  /* 🖼️ Add Infospots for various spots (BlackMountain, Pygmy Field, Mossy Forest, Peak) */
  const addImageInsidePanorama = (panorama, type) => {
    /* ----------------- BLACK MOUNTAIN ----------------- */
    if (type === "BlackMountain") {
      const models = [
        "/3dmodels/Scaveola.glb",
        "/3dmodels/Wendlandia Nervosa.glb",
      ];

      const images = [
        "https://i.imgur.com/rtdNyCT.png", // Scaevola icon
        "https://i.imgur.com/c9KxAbm.png", // Wendladia Nervosa
      ];

      const positions = [
        [2500, -3600, -750], // Scaevola infospot
        [3000, -5000, -6000], // wendlandia infospot
      ];

      const sizes = [800, 3000];

      const modelSettings = [
        { scale: [0.25, 0.25, 0.25], position: [0, -2, 0] }, // Scaevola viewer position
        { scale: [0.3, 0.3, 0.3], position: [0, -1, 0] }, // Wendlandia viewer position
      ];

      const modelInfoList = [
        {
          name: "Scaevola taccada (Beach Naupaka)",
          description:
            "A native coastal shrub found along beaches and dunes. Known for its unique half-flowers and role in stabilizing sandy soils.",
          image: "https://imgur.com/yn2xxt7.jpeg",
        },
        {
          name: "Wendlandia Nervosa",
          description:
            "A rare butterfly species native to the Black Mountain region, known for its deep blue wings and role in pollination.",
          image: "https://i.imgur.com/8RSlcGE.jpeg",
        },
      ];

      models.forEach((model, i) => {
        const infospot = new PANOLENS.Infospot(sizes[i], images[i]);
        infospot.position.set(...positions[i]);
        infospot.addHoverText("Click to view 3D model");
        infospot.addEventListener("click", () => {
          setBlurPanorama(true);
          setActiveModel({
            url: model,
            scale: modelSettings[i].scale,
            position: modelSettings[i].position,
          });
          setModelInfo(modelInfoList[i]);
        });
        panorama.add(infospot);
      });
    }

    /* ----------------- PYGMY FIELD ----------------- */
    if (type === "Pygmy Field") {
      const pygmyModels = [
        "/3dmodels/Nepenthes micramphora.glb",
        "/3dmodels/philippine mock viper.glb",
        "/3dmodels/Lady Slipper Orchid.glb",
      ];

      const modelSettings = [
        { scale: [0.5, 0.5, 0.5], position: [-0, -1, 0] },
        { scale: [0.6, 0.6, 0.6], position: [0.5, -0.5, 0] },
        { scale: [0.1, 0.1, 0.1], position: [0, -7, -10] },
      ];

      const pygmyImages = [
        "https://i.imgur.com/HxNkUwr.png",
        "https://i.imgur.com/0mWD1dk.png",
        "https://i.imgur.com/XzOiUmN.png",
      ];

      const positions = [
        [1000, -800, 700],
        [1600, -1000, -1200],
        [500, -1800, 4000],
      ];

      const sizes = [350, 500, 1100];

      const modelInfoList = [
        {
          name: "Nepenthes micramphora",
          description:
            "A small, rare pitcher plant species endemic to the Philippines, found in Mt. Hamiguitan. It captures insects in its small, bulbous pitchers.",
          image: "https://i.imgur.com/r0HRn0k.jpeg",
        },
        {
          name: "Philippine Mock Viper (Psammodynastes pulverulentus)",
          description:
            "A mildly venomous snake found in the Philippines. Often mistaken for a true viper but harmless to humans.",
          image: "https://i.imgur.com/vBK0069.jpeg",
        },
        {
          name: "Lady Slipper Orchid (Paphiopedilum)",
          description:
            "Known for its slipper-shaped pouch, this orchid traps insects to aid in pollination. Native to mountain ranges in Mindanao.",
          image: "https://imgur.com/ozvq09B.jpeg",
        },
      ];

      pygmyModels.forEach((model, i) => {
        const infospot = new PANOLENS.Infospot(sizes[i], pygmyImages[i]);
        infospot.position.set(...positions[i]);
        infospot.addHoverText("Click to view 3D model");
        infospot.addEventListener("click", () => {
          setBlurPanorama(true);
          setActiveModel({
            url: model,
            scale: modelSettings[i].scale,
            position: modelSettings[i].position,
          });
          setModelInfo(modelInfoList[i]);
        });
        panorama.add(infospot);
      });
    }

    /* ----------------- MOSSY FOREST (4 infospots/models) ----------------- */
    if (type === "Mossy Forest") {
      const mossyModels = [
        "/3dmodels/Lindsea.glb",
        "/3dmodels/Nepenthes justinae.glb",
        "/3dmodels/pit viper.glb",
        "/3dmodels/Pulchrana grandocula.glb",
      ];

      const modelSettings = [
        { scale: [5, 5, 5], position: [1, -4.5, 0] }, // Lindsea
        { scale: [0.3, 0.3, 0.3], position: [-0.1, -1.5, 0] }, // Nepenthes justinae
        { scale: [0.2, 0.2, 0.2], position: [0, 0.5, 0.2] }, // Pit Viper
        { scale: [0.3, 0.3, 0.3], position: [0, -1, -1] }, // Pulchrana grandocula
      ];

      const images = [
        "https://i.imgur.com/8UwKbTf.png",
        "https://i.imgur.com/ewKb52P.png",
        "https://i.imgur.com/fOGjkwI.png",
        "https://i.imgur.com/ETCXQue.png",
      ];

      const positions = [
        [-1200, -1200, 2000],
        [2000, -500, -500],
        [1500, -3500, 4000],
        [4700, -4000, 500],
      ];

      const sizes = [1200, 700, 950, 1500];

      const modelInfoList = [
        {
          name: "Mossy Tree",
          description: "Thick old-growth tree covered in moss thriving in cold, humid mountain climates.",
          image: "https://imgur.com/7PKAuo0.jpeg",
        },
        {
          name: "Mountain Fern",
          description: "A fern species that grows in wet mossy forest environments.",
          image: "https://i.imgur.com/N3sxDPo.jpeg",
        },
        {
          name: "Forest Frog",
          description: "A small amphibian living under logs and wet forest floors.",
          image: "https://i.imgur.com/szpzG6n.jpeg",
        },
        {
          name: "Mountain Moss",
          description: "A rare moss species found only in high-altitude rain forests.",
          image: "https://imgur.com/1PftzG4.jpeg",
        },
      ];

      mossyModels.forEach((model, i) => {
        const infospot = new PANOLENS.Infospot(sizes[i], images[i]);
        infospot.position.set(...positions[i]);
        infospot.addHoverText("Click to view 3D model");
        infospot.addEventListener("click", () => {
          setBlurPanorama(true);
          setActiveModel({
            url: model,
            scale: modelSettings[i].scale,
            position: modelSettings[i].position,
          });
          setModelInfo(modelInfoList[i]);
        });
        panorama.add(infospot);
      });
    }

    /* ----------------- PEAK (2 infospots/models) ----------------- */
    if (type === "Peak") {
      const peakModels = [
        "/3dmodels/kopfii.glb",
        "/3dmodels/hamiguitan pitcher plant.glb",
      ];

      const modelSettings = [
        { scale: [0.1, 0.1, 0.1], position: [0, -1.2, 0.5] }, // kopfii
        { scale: [0.1, 0.1, 0.1], position: [0, -0.25, 0] }, // pitcher plant
      ];

      const images = [
        "https://i.imgur.com/7rVup0Z.png",
        "https://i.imgur.com/FZzh0ap.png",
      ];

      const positions = [
        [2700, -2500, -1200],
        [3000, -2700, -3700],
      ];

      const sizes = [1000, 1500];

      const modelInfoList = [
        {
          name: "Philippine Eagle",
          description: "The majestic raptor endemic to the Philippines, often seen near high mountain peaks.",
          image: "https://i.imgur.com/jIKS0I6.jpeg",
        },
        {
          name: "Peak Rock Formation",
          description: "A high-altitude rocky structure shaped by centuries of wind erosion.",
          image: "https://i.imgur.com/xdwtCcg.jpeg",
        },
      ];

      peakModels.forEach((model, i) => {
        const infospot = new PANOLENS.Infospot(sizes[i], images[i]);
        infospot.position.set(...positions[i]);
        infospot.addHoverText("Click to view 3D model");
        infospot.addEventListener("click", () => {
          setBlurPanorama(true);
          setActiveModel({
            url: model,
            scale: modelSettings[i].scale,
            position: modelSettings[i].position,
          });
          setModelInfo(modelInfoList[i]);
        });
        panorama.add(infospot);
      });
    }
  };

  if (!spot) return <p className="loading-text">Loading 360° view...</p>;

  return (
    <div className="spotview-container">
      <div
        ref={containerRef}
        className={`panorama-container ${blurPanorama ? "blurred" : ""}`}
      />

      {loading && <div className="loading-overlay">Loading panorama...</div>}

      {/* Spot header & back button */}
      {!activeModel && (
        <div className="spot-info">
          <h1 className="spot-title">{spot?.Name}</h1>
          <p className="spot-description">{spot?.Description}</p>

          <div
            className={`back-btn ${hoverBack ? "hover" : ""}`}
            onClick={() => {
              navigate("/tour");
              // small delay to ensure navigation then reload to avoid WebGL issues
              setTimeout(() => window.location.reload(), 140);
            }}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
          >
            ⬅ Back
          </div>
        </div>
      )}

      {/* 3D model modal */}
{/* 3D model modal */}
{/* 3D model modal */}
{activeModel && (
  <div className="model-modal">
    <button className="close-btn" onClick={handleCloseModal}>
      ✖
    </button>

    {/* Top-center model name */}
    {modelInfo && <h2 className="model-title-top">{modelInfo.name}</h2>}

    <div className="model-view-section">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 1.5, 5], fov: 45 }} className="canvas-view">
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <ModelViewer
            url={activeModel.url}
            scale={activeModel.scale}
            position={activeModel.position}
          />
        </Suspense>
        <OrbitControls target={[0, 0.5, 0]} />
      </Canvas>

      {/* Overlay info section */}
      {modelInfo && (
        <div className="model-info-section">
          <img src={modelInfo.image} alt={modelInfo.name} className="model-img" />
          <div className="model-text">
            <p className="model-description">{modelInfo.description}</p>
          </div>
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default SpotView;
