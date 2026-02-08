import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  Line,
  Text,
} from "@react-three/drei";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";
import "./App.css";

// 3D Map Model
function Model({ url }) {
  const { scene } = useGLTF(url);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.roughness = 5;
      child.material.metalness = 0.2;
      child.material.needsUpdate = true;
    }
  });

  return <primitive object={scene} scale={0.1} position={[25, -120, -35]} />;
}

// Background image for the scene
function BackgroundImage() {
  const texture = useTexture("/sky.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;
  return <primitive attach="background" object={texture} />;
}

// Marker with vertical red line and label
function Marker({ position, label, onClick }) {
  // These markers have 3D models → green
  const specialMarkers = [
    "Black Mountain",
    "Camp 3",
    "Peak",
    "Pygmy Field",
    "Mossy Forest",
  ];

  const meshRef = useRef();
  const textRef = useRef();
  const lineHeight = 8;

  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, lineHeight, 0),
  ];

  const GREEN = "#00f900"; // bright green for 3D model markers

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1.5 + Math.sin(t * 3) * 0.3;

    if (meshRef.current) {
      meshRef.current.scale.set(pulse, pulse, pulse);
      meshRef.current.material.emissive.set(
        specialMarkers.includes(label) ? GREEN : "#ffffff",
      );
      meshRef.current.material.emissiveIntensity = pulse * 0.5;
    }

    if (textRef.current) {
      textRef.current.lookAt(state.camera.position);
      textRef.current.material.opacity = 0.7 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={specialMarkers.includes(label) ? "#4bd050" : "#ffffff"}
          emissive={
            specialMarkers.includes(label)
              ? new THREE.Color("#4bd050")
              : new THREE.Color("#ffffff")
          }
          roughness={1}
        />
      </mesh>

      <Line points={points} color="white" lineWidth={1} dashed={false} />

      <Text
        ref={textRef}
        position={[0, lineHeight, 0]}
        fontSize={1.8}
        color={specialMarkers.includes(label) ? "#4bd050" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.2}
        outlineColor="black"
        rotation={[0, -Math.PI / 2, 0]}
      >
        {label}
      </Text>
    </group>
  );
}

// Main Tour component
const Tour = () => {
  const cameraRef = useRef();
  const controlsRef = useRef();

  const audioRef = useRef(null);
  const navigate = useNavigate();

  const [isInteracting, setIsInteracting] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    img: "",
    title: "",
  });

  const playZoomVideo = (afterAction) => {
    setZoomAfterAction(() => afterAction); // store the action
    setZoomVideoVisible(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
    }
  }, []);

  const markers = [
    {
      position: [15, 11, -48],
      label: "Unesco Marker",
      id: "fTLAXWb7Cph8jqeHxlXT",
    },
    {
      position: [15, 13, -45],
      label: "Crossing Stampa",
      id: "EFNFONngOYNOOFbqdloj",
    },
    {
      position: [10, 15, -40],
      label: "Puting Bato",
      id: "sk2Dc8hJYl1NUr3bAEsj",
    },
    {
      position: [2, 11.5, -35],
      label: "Lantawan 1",
      id: "IMcVNrMMCsgXbiLPe10T",
    },
    { position: [12, 15, -28], label: "Camp 4", id: "MeD7yd6kVBnAJYJXND7c" },
    {
      position: [19, 17, -18],
      label: "Uwang Uwang",
      id: "68Q4aC5LVgIDYcU4rn0F",
    },
    {
      position: [22, 19.5, -16],
      label: "Lantawan 2",
      id: "dIxy6t8cHc88lGY7eHTD",
    },
    { position: [10, 19.5, 1], label: "Camp 3", id: "YCEKhHOU6eNHSqx10qSr" },
    {
      position: [4, 12.5, 8],
      label: "Pygmy Field",
      id: "q519aECmdG1TQF7D44Ld",
    },
    { position: [-4, 11, 15], label: "Lantawan 3", id: "rBS9OYsdZfgHCXMrWUNW" },

    // ⭐ SPECIAL MARKERS with image modal
    {
      position: [-10, 7, 24],
      label: "Tinagong Dagat",
      onClick: () =>
        setImageModal({
          isOpen: true,
          img: "/images/Tinagong Dagat .JPG",
          title: "Tinagong Dagat",
        }),
    },
    {
      position: [-17, 6, 28],
      label: "Hidden Garden",
      onClick: () =>
        setImageModal({
          isOpen: true,
          img: "/images/Hidden Garden.jpeg",
          title: "Hidden Garden",
        }),
    },

    {
      position: [-5, 8, 20],
      label: "Mossy Forest",
      id: "faYghVBuX9xcHpYLAgdH",
    },
    { position: [24.5, 25, 1], label: "Peak", id: "iNq6B4KSRrEnBcYOzYVX" },
    {
      position: [11, 20, -3],
      label: "Black Mountain",
      id: "5u8jnd3X4g9lYMy2OMpq",
    },
    { position: [7, 17, -2], label: "Twin Falls", id: "QGRePSC5lFbcbJ8ICvtB" },
  ];

  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowGuide(false), 3500); // auto hide after 3.5s
    return () => clearTimeout(timer);
  }, []);

  const [zoomVideoVisible, setZoomVideoVisible] = useState(false);
  const [zoomAfterAction, setZoomAfterAction] = useState(null);

  const flyToCamera = (targetPosition, afterFly) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();

    // end position (move slightly above and in front of the marker)
    const endPos = new THREE.Vector3(
      targetPosition[0] + 5,
      targetPosition[1] + 8,
      targetPosition[2] + 12,
    );

    const endTarget = new THREE.Vector3(
      targetPosition[0],
      targetPosition[1],
      targetPosition[2],
    );

    let progress = 0;
    const duration = 1.2; // seconds

    const animate = () => {
      progress += 0.02;
      const t = Math.min(progress / duration, 1);

      camera.position.lerpVectors(startPos, endPos, t);
      controls.target.lerpVectors(startTarget, endTarget, t);
      controls.update();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        afterFly(); // run the next action (play zoom-effect.mov)
      }
    };

    animate();
  };

  // 🚶 Trail connections (by label)
  const trailConnections = [
    { from: "Unesco Marker", to: "Crossing Stampa", height: 0.8 },
    { from: "Crossing Stampa", to: "Puting Bato", height: 0.5 },
    { from: "Puting Bato", to: "Lantawan 1", height: 0.5 },
    { from: "Lantawan 1", to: "Camp 4", height: 0.7 },
    { from: "Camp 4", to: "Uwang Uwang", height: 2.4 },
    { from: "Uwang Uwang", to: "Lantawan 2", height: 0.5 },
    { from: "Lantawan 2", to: "Camp 3", height: 0.4 },

    // branches
    { from: "Camp 3", to: "Peak", height: 0.3 },
    { from: "Camp 3", to: "Black Mountain", height: 0.4 },
    { from: "Camp 3", to: "Twin Falls", height: 0.1 },
    { from: "Camp 3", to: "Pygmy Field", height: 0.1 },

    { from: "Pygmy Field", to: "Lantawan 3", height: -0.9 },
    { from: "Lantawan 3", to: "Mossy Forest", height: 0.2 },
    { from: "Mossy Forest", to: "Tinagong Dagat", height: 0.1 },
    { from: "Tinagong Dagat", to: "Hidden Garden", height: 0.1 },
  ];

  const getMarkerPosition = (label) => {
    const marker = markers.find((m) => m.label === label);
    return marker ? marker.position : null;
  };

  return (
    <div className="tour-wrapper">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/hami.mov" type="video/mp4" />
      </video>

      <audio ref={audioRef} loop autoPlay>
        <source src="forest.mp3" type="audio/mp3" />
      </audio>

      <div className="tour-overlay">
        <h1>Mt. Hamiguitan 3D Virtual Tour</h1>
        <p>Explore the UNESCO World Heritage Site in an interactive 3D map.</p>
      </div>

      <div className="tour-box">
        {showGuide && (
          <div className="guide-popup">
            <p>
              Click the markers to start the Virtual Tour!
              <span className="hand-click">👆</span>
            </p>
          </div>
        )}

        {/* Plain text overlay inside Canvas area */}
        <div className="map-title">San Isidro Trail</div>

        <Canvas
          className="tour-canvas"
          shadows
          camera={{ position: [-2500, 1000, -10], fov: 40 }}
          gl={{ antialias: false, alpha: true }}
          onCreated={({ camera }) => {
            cameraRef.current = camera;
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[30, 60, 30]}
            intensity={1.3}
            castShadow
          />

          <Suspense fallback={null}>
            <Model url="/3dmap/HMap.glb" />
          </Suspense>
          {/* 🟤 ACTUAL TRAIL LINES */}
          {trailConnections.map(({ from, to, height }, index) => {
            const start = getMarkerPosition(from);
            const end = getMarkerPosition(to);
            if (!start || !end) return null;

            // Calculate the middle point
            const midX = (start[0] + end[0]) / 2;
            const midY = (start[1] + end[1]) / 2 + height; // height raises or lowers middle
            const midZ = (start[2] + end[2]) / 2;

            return (
              <Line
                key={index}
                points={[
                  new THREE.Vector3(start[0], start[1], start[2]), // start
                  new THREE.Vector3(midX, midY, midZ), // middle (adjustable height)
                  new THREE.Vector3(end[0], end[1], end[2]), // end
                ]}
                color="#8b5a2b"
                lineWidth={2.5}
                transparent
                opacity={0.9}
              />
            );
          })}

          {markers.map((m, i) => (
            <Marker
              key={i}
              position={m.position}
              label={m.label}
              onClick={() =>
                flyToCamera(m.position, () =>
                  playZoomVideo(
                    m.onClick ? m.onClick : () => navigate(`/Spots/${m.id}`),
                  ),
                )
              }
            />
          ))}

          <OrbitControls
            ref={controlsRef}
            target={[10, 10, 0]}
            enablePan
            enableRotate
            enableZoom
            zoomSpeed={1.2}
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={150}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2}
            onStart={() => setIsInteracting(true)} // user started interacting
            onEnd={() => setIsInteracting(false)} // user stopped interacting
          />
        </Canvas>

        {/* INSERT LEGEND HERE */}
        <div
          className="legend"
          style={{
            opacity: isInteracting ? 0.2 : 1, // reduce opacity when interacting
            transition: "opacity 0.3s ease", // smooth fade
          }}
        >
          <h4>Map Feature:</h4>
          <div className="legend-item">
            <div className="legend-dot green"></div>
            <span>360° panorama with 3D models</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot white"></div>
            <span>360° panorama only</span>
          </div>
        </div>
      </div>

      <footer className="tour-footer">
        <p>© 2025 Mt. HamiTour | All Rights Reserved</p>
      </footer>

      {zoomVideoVisible && (
        <video
          className="zoom-video-overlay"
          src="/zoom-effect.mov"
          autoPlay
          muted
          playsInline
          onEnded={() => {
            setZoomVideoVisible(false); // hide video
            if (zoomAfterAction) zoomAfterAction(); // run the marker action
          }}
        />
      )}

      {/* ⭐ IMAGE MODAL */}
      {imageModal.isOpen && (
        <div className="flat-modal">
          <div className="flat-content">
            {/* Close Button */}
            <button
              className="close-flat"
              onClick={() =>
                setImageModal({ isOpen: false, img: "", title: "" })
              }
            >
              ✕
            </button>

            {/* Image */}
            <img src={imageModal.img} alt="" className="flat-img" />

            {/* Overlay Text */}
            <div className="modal-text-overlay">
              {imageModal.title + " Panorama Unavailable"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tour;
