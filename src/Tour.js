import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Line, Text } from "@react-three/drei";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";
import "./App.css";

// 3D Map Model
function Model({ url }) {
  const { scene } = useGLTF(url);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.roughness = 5;
      child.material.metalness = 0.5;
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
  const meshRef = useRef();
  const textRef = useRef();

  const lineHeight = 8; // vertical offset for the text above marker
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, lineHeight, 0)
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1.2 + Math.sin(t * 2) * 0.2;

    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = pulse * 1.2;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }

    if (textRef.current) {
      // Make text always face the camera
      textRef.current.lookAt(state.camera.position);
      textRef.current.material.opacity = 0.7 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Sphere marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="green"
          emissive="green"
          emissiveIntensity={0.5}
          roughness={1}
        />
      </mesh>

      {/* Vertical red line */}
      <Line points={points} color="white" lineWidth={1} dashed={false} />

      {/* Label text */}
      <Text
        ref={textRef}
        position={[0, lineHeight, 0]}
        fontSize={1.8}
        color="white"
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
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const [imageModal, setImageModal] = useState({
    isOpen: false,
    img: "",
    title: ""
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
    }
  }, []);

  const markers = [
    { position: [15, 11, -48], label: "Unesco Marker", id: "fTLAXWb7Cph8jqeHxlXT" },
    { position: [15, 13, -45], label: "Crossing Stampa", id: "EFNFONngOYNOOFbqdloj" },
    { position: [10, 15, -40], label: "Puting Bato", id: "sk2Dc8hJYl1NUr3bAEsj" },
    { position: [2, 11.5, -35], label: "Lantawan 1", id: "IMcVNrMMCsgXbiLPe10T" },
    { position: [12, 15, -28], label: "Camp 4", id: "MeD7yd6kVBnAJYJXND7c" },
    { position: [19, 17, -18], label: "Uwang Uwang", id: "68Q4aC5LVgIDYcU4rn0F" },
    { position: [22, 19.5, -16], label: "Lantawan 2", id: "dIxy6t8cHc88lGY7eHTD" },
    { position: [10, 19.5, 1], label: "Camp 3", id: "YCEKhHOU6eNHSqx10qSr" },
    { position: [4, 12.5, 8], label: "Pygmy Field", id: "q519aECmdG1TQF7D44Ld" },
    { position: [-4, 11, 15], label: "Lantawan 3", id: "rBS9OYsdZfgHCXMrWUNW" },

    // ⭐ SPECIAL MARKERS with image modal
    {
      position: [-10, 7, 24],
      label: "Tinagong Dagat",
      onClick: () =>
        setImageModal({
          isOpen: true,
          img: "/images/Tinagong Dagat .JPG",
          title: "Tinagong Dagat"
        })
    },
    {
      position: [-17, 6, 28],
      label: "Hidden Garden",
      onClick: () =>
        setImageModal({
          isOpen: true,
          img: "/images/Hidden Garden.jpeg",
          title: "Hidden Garden"
        })
    },

    { position: [-5, 8, 20], label: "Mossy Forest", id: "faYghVBuX9xcHpYLAgdH" },
    { position: [24.5, 25, 1], label: "Peak", id: "iNq6B4KSRrEnBcYOzYVX" },
    { position: [11, 20, -3], label: "Black Mountain", id: "5u8jnd3X4g9lYMy2OMpq" },
    { position: [7, 17, -2], label: "Twin Falls", id: "QGRePSC5lFbcbJ8ICvtB" }
  ];

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
<Canvas
  className="tour-canvas"
  shadows
  camera={{ position: [-2500, 1000, -10], fov: 40 }}
  gl={{ antialias: false, alpha: true }}
>
  
  <ambientLight intensity={0.6} />
  <directionalLight position={[30, 60, 30]} intensity={1.3} castShadow />
  
  <Suspense fallback={null}>
    <Model url="/3dmap/Map.glb" />
  </Suspense>

  {markers.map((m, i) => (
    <Marker
      key={i}
      position={m.position}
      label={m.label}
      onClick={m.onClick ? m.onClick : () => navigate(`/Spots/${m.id}`)}
    />
  ))}

  <OrbitControls
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
  />
</Canvas>

      </div>

      <Link to="/" className="back-button">⬅ Back</Link>

      <footer className="tour-footer">
        <p>© 2025 Mt. HamiTour | All Rights Reserved</p>
      </footer>

      {/* ⭐ IMAGE MODAL */}
      {imageModal.isOpen && (
        <div className="flat-modal">
          <div className="flat-content">
            {/* Close Button */}
            <button
              className="close-flat"
              onClick={() => setImageModal({ isOpen: false, img: "", title: "" })}
            >
              ✕
            </button>

            {/* Image */}
            <img src={imageModal.img} alt="" className="flat-img" />

            {/* Overlay Text */}
            <div className="modal-text-overlay">{imageModal.title + " Panorama Unavailable"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tour;
