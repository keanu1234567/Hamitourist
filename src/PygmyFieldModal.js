import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls } from "@react-three/drei";
import "./App.css";
import * as THREE from "three";

// ✨ Starfield background
const StarField = () => {
  const ref = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 300;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return arr;
  });

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.8}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// ✨ Glowing background gradient plane
const BackgroundGlow = () => (
  <mesh position={[0, 0, -80]}>
    <planeGeometry args={[500, 300]} />
    <meshBasicMaterial color={"#111133"} opacity={0.6} transparent />
  </mesh>
);

const Model = ({ url, rotation }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  const scaleRef = useRef(10);
  const baseY = -30;

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material.roughness = 0.8;
      child.material.metalness = 0.4;
      child.material.needsUpdate = true;
    }
  });
 scene.rotation.y = Math.PI / 2;
  useFrame(({ clock }) => {
    if (modelRef.current) {
      const t = clock.getElapsedTime();
      modelRef.current.rotation.y = rotation.current.y;
      modelRef.current.rotation.x = rotation.current.x;
      modelRef.current.position.y = baseY + Math.sin(t * 1.5) * 0.2;
      const scale = scaleRef.current + Math.sin(t * 1.5) * 0.005;
      modelRef.current.scale.set(scale, scale, scale);
    }
  });
 
  return <primitive ref={modelRef} object={scene} />;
};

// ✅ Main Modal
const PygmyFieldModal = ({ isOpen, onClose, modelURL, title, description }) => {
  const rotation = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseDown = (e) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => (dragging.current = false);
  const handleMouseMove = (e) => {
    if (dragging.current) {
      const deltaX = (e.clientX - lastPos.current.x) * 0.005;
      const deltaY = (e.clientY - lastPos.current.y) * 0.005;
      rotation.current.y += deltaX;
      rotation.current.x += deltaY;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  return (
     <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="modal-overlay"
    >
      <div className="modal-gradient" />
      <div className="modal-glow" />
    
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2 className="modal-title">{title}</h2>
    
        <div className="viewer-container">
          <Canvas camera={{ position: [10, 40, 90], fov: 45 }}>
            <color attach="background" args={["#050510"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} />
            <StarField />
            <BackgroundGlow />
            <Suspense fallback={<Html>Loading 3D model...</Html>}>
              <Model url={modelURL} rotation={rotation} />
            </Suspense>
            <OrbitControls enablePan={false} enableRotate={false} zoomSpeed={1.0} />
          </Canvas>
        </div>
    
        <p className="modal-description">{description}</p>
      </div>
    </div>
  );
};

export default PygmyFieldModal;
