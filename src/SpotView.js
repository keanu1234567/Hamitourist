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
function ModelViewer({
  url,
  scale = [0.2, 0.2, 0.2],
  position = [0, 0, 0],
  setModelError,
  setModelLoading,
}) {
  const { scene } = useGLTF(url, true);

  useEffect(() => {
    try {
      scene.rotation.set(0, 0, 0);
      scene.scale.set(...scale);
      scene.position.set(...position);

      // 🔥 Notify parent: model is loaded
      if (setModelLoading) setModelLoading(false);
    } catch (err) {
      console.error("🔥 Error loading 3D model:", err);
      if (setModelError) setModelError("⚠ Failed to load 3D model.");
    }
  }, [scene, scale, position, setModelError, setModelLoading]);

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
  const [error, setError] = useState(null);
  const [modelError, setModelError] = useState(null);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const panoramaRef = useRef(null);
  const [modelLoading, setModelLoading] = useState(true);

  // --- Add this useEffect HERE ---
  useEffect(() => {
    if (activeModel?.url) {
      setModelLoading(true); // Start loader every time a new model opens
    }
  }, [activeModel?.url]);

  // Close model modal
  const handleCloseModal = () => {
    setActiveModel(null);
    setBlurPanorama(false);
    setModelInfo(null);
    setModelError(null);
  };

  /* 🧭 Fetch Firestore Data */
  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const ref = doc(db, "Spots", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSpot(snap.data());
          setError(null); // Clear any previous errors
        } else {
          setError("❌ Spot not found!");
          console.error("❌ Spot not found!");
        }
      } catch (err) {
        setError("🔥 Error fetching spot data!");
        console.error("🔥 Error fetching spot:", err);
      }
    };

    fetchSpot();
  }, [id]);

  /* 🌄 Initialize Panorama */
  useEffect(() => {
    if (!spot || !containerRef.current) return;

    if (viewerRef.current) {
      try {
        viewerRef.current.dispose();
      } catch {}
      viewerRef.current = null;
      THREE.Cache.clear();
    }

    containerRef.current.innerHTML = "";

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

      const name = (spot.Name || "").trim().toLowerCase();

      // Existing spot checks
      if (name.includes("black mountain"))
        addImageInsidePanorama(panorama, "BlackMountain");
      else if (name.includes("pygmy"))
        addImageInsidePanorama(panorama, "Pygmy Field");
      else if (name.includes("mossy"))
        addImageInsidePanorama(panorama, "Mossy Forest");
      else if (name.includes("peak")) addImageInsidePanorama(panorama, "Peak");
      else if (name.includes("camp iii"))
        addImageInsidePanorama(panorama, "Camp III");
      else if (name.includes("camp 3"))
        addCamp3Teleport(panorama); // ✅ Add Camp 3 teleport
      else if (name.includes("camp iv"))
        addImageInsidePanorama(panorama, "Camp IV");
      else if (name.includes("camp 4")) addCamp4Teleport(panorama); // ✅ Add Camp 3 teleport
    });

    const handleResize = () => viewer.onWindowResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        viewerRef.current?.dispose?.();
        panoramaRef.current?.dispose?.();
        THREE.Cache.clear();
      } catch {}
    };
  }, [spot]);

  /* ------------------ Camp 3 teleport to inside panorama ------------------ */
  const addCamp3Teleport = (panorama) => {
    const size = 256; // canvas resolution
    const textHeight = 50; // extra space inside canvas for text
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size + textHeight; // room for text
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://i.imgur.com/uTh9cBK.png"; // arrow icon
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the arrow image on top
      ctx.drawImage(img, 0, 0, size, size);

      // Draw always-visible bold text below the arrow
      ctx.font = "bold 20px Poppins";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Enter Camp 3", size / 2, size + 30);

      const strokedImageURL = canvas.toDataURL();
      const teleportSpot = new PANOLENS.Infospot(500, strokedImageURL); // size of arrow
      teleportSpot.position.set(2000, -500, 1600);
      teleportSpot.addEventListener("click", () => {
        navigate(`/Spots/${"zvuINqT41VhWCKpenjZw"}`);
        setTimeout(() => window.location.reload(), 100);
      });

      panorama.add(teleportSpot);
    };
  };

  /* ------------------ Back to Camp 3 teleport inside Camp 3 ------------------ */
  const addBackToCamp3 = (panorama) => {
    const size = 256; // canvas resolution for arrow
    const textHeight = 50; // extra space inside canvas for text
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size + textHeight;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://i.imgur.com/uTh9cBK.png"; // arrow icon
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arrow image on top
      ctx.drawImage(img, 0, 0, size, size);

      // Draw always-visible bold text below arrow
      ctx.font = "bold 20px Poppins";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Exit", size / 2, size + 30);

      const strokedImageURL = canvas.toDataURL();
      const backSpot = new PANOLENS.Infospot(1000, strokedImageURL); // size of arrow
      backSpot.position.set(-5000, -800, 400);
      backSpot.addEventListener("click", () => {
        navigate(`/Spots/${"YCEKhHOU6eNHSqx10qSr"}`); // previous panorama ID
        setTimeout(() => window.location.reload(), 100);
      });

      panorama.add(backSpot);
    };
  };

  /* ------------------ Camp 4 teleport to inside panorama ------------------ */
  const addCamp4Teleport = (panorama) => {
    const size = 256; // canvas resolution for arrow
    const textHeight = 50; // extra space inside canvas for text
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size + textHeight;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://i.imgur.com/uTh9cBK.png"; // arrow icon
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arrow image on top
      ctx.drawImage(img, 0, 0, size, size);

      // Draw always-visible bold text below arrow
      ctx.font = "bold 20px Poppins";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Enter Camp 4", size / 2, size + 30);

      const strokedImageURL = canvas.toDataURL();
      const teleportSpot = new PANOLENS.Infospot(500, strokedImageURL); // size of arrow
      teleportSpot.position.set(2000, -500, -600);
      teleportSpot.addEventListener("click", () => {
        navigate(`/Spots/${"8us4vrBVTMIDiCXXWHlY"}`);
        setTimeout(() => window.location.reload(), 100);
      });

      panorama.add(teleportSpot);
    };
  };

  /* ------------------ Back to Camp 4 teleport inside Camp 3 ------------------ */
  const addBackToCamp4 = (panorama) => {
    const size = 256; // canvas resolution for arrow
    const textHeight = 50; // extra space inside canvas for text
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size + textHeight;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://i.imgur.com/uTh9cBK.png"; // arrow icon
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arrow image on top
      ctx.drawImage(img, 0, 0, size, size);

      // Draw always-visible bold text below arrow
      ctx.font = "bold 20px Poppins";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Exit", size / 2, size + 30);

      const strokedImageURL = canvas.toDataURL();
      const backSpot = new PANOLENS.Infospot(200, strokedImageURL); // size of arrow
      backSpot.position.set(-1000, -300, 650);
      backSpot.addEventListener("click", () => {
        navigate(`/Spots/${"MeD7yd6kVBnAJYJXND7c"}`); // previous panorama ID
        setTimeout(() => window.location.reload(), 100);
      });

      panorama.add(backSpot);
    };
  };

  /* 🖼️ Add Infospots for existing models */
  const addImageInsidePanorama = (panorama, type) => {
    /* ----------------- BLACK MOUNTAIN ----------------- */
    if (type === "BlackMountain") {
      const models = [
        "/3dmodels/Scaveola.glb",
        "/3dmodels/Wendlandia Nervosa.glb",
      ];
      const images = [
        "https://i.imgur.com/rtdNyCT.png",
        "https://i.imgur.com/c9KxAbm.png",
      ];
      const positions = [
        [2500, -4000, -1200],
        [3200, -5300, -6000],
      ];
      const sizes = [1800, 3500];
      const modelSettings = [
        { scale: [0.25, 0.25, 0.25], position: [0, -2, 0] },
        { scale: [0.3, 0.3, 0.3], position: [0, -0.5, 0] },
      ];
      const modelInfoList = [
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Scaveola micrantha\n" +
            "\n" +
            'A shrub or small tree in the family Goodeniaceae, growing up to 10mtall with smooth green to grey bark and oblanceolate to obovate leaves up to 15cmlong. Native to the Philippines, Taiwan, and Borneo, it thrives on ultramafic soils, particularly in the mossy-pygmy "bonsai" forests of Mount Hamiguitan at 1,160–1,600m elevation. This species is an indicator of ultrabasic ecosystems, adaptedtonutrient-poor, iron- and magnesium-rich soils. It contributes to the unique stuntedforest community alongside other endemic species and is classified as Least Concern by the IUCN.',
          image: "https://imgur.com/yn2xxt7.jpeg",
        },
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Wendlandia nervosa\n" +
            "\n" +
            "A flowering shrub or small tree endemic to the Black Mountain site of Mount Hamiguitan, Mindanao. It grows on nutrient-poor, acidic ultramafic soils, with opposite elliptic to oblong leaves featuring prominent veins. The species produces fragrant, tubular flowers in cymose or paniculiform clusters, often white, purple, or red. Part of the montane forest vegetation, it contributes to the high plant endemismand biodiversity of Mount Hamiguitan, especially within the ultramafic pygmy forest community. Its unique adaptation to challenging soils highlights the ecological importance of the sanctuary",
          image: "https://i.imgur.com/8RSlcGE.jpeg",
        },
      ];

      models.forEach((model, i) => {
        const size = 256;
        const textHeight = 50; // extra space for text
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight; // make room for text
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw halo behind the image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 10;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Draw image
          ctx.drawImage(img, 0, 0, size, size);

          // Draw always-visible text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 25); // inside canvas

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

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
        };
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
        { scale: [0.4, 0.4, 0.4], position: [-0.5, 0, 0] },
        { scale: [0.6, 0.6, 0.6], position: [-0.2, 0.3, 0] },
        { scale: [0.3, 0.3, 0.3], position: [0, -9, 0] },
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
      const sizes = [500, 700, 1300];
      const modelInfoList = [
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Nepenthes micramphora\n" +
            "\n" +
            "A tropical pitcher plant endemic to Mount Hamiguitan, Mindanao, growing at 1,100–1,635 m in ultramafic montane forests. It has narrow, funnel-shaped pitchers (4–6.7 cm) with a prominent peristome and lid, and smooth stems and leaves. Found alongside other Nepenthes species, it is critically endangered due to its limited range and habitat threats",
          image: "https://i.imgur.com/r0HRn0k.jpeg",
        },
        {
          name: "Philippine Mock Viper",
          description:
            "Scientific Name: Psammodynastes pulverulentus\n" +
            "\n" +
            "A small, harmless “mock viper” snake (65–77 cm) with variable brown or gray patterns and distinctive Y-shaped head markings. Solitary and active day and night, it lives near streams and rivers, feeding on frogs, geckos, and skinks. Native to many Philippine islands and found up to 2,100 m elevation.",
          image: "https://i.imgur.com/vBK0069.jpeg",
        },
        {
          name: "Lady Slipper Orchid",
          description:
            "Scientific Name: Paphiopedilum ciliolare\n" +
            "\n" +
            "A rare orchid endemic to the Philippines, notably found in the PygmyField of Mount Hamiguitan. It grows terrestrially or on rocks in montane forests (300–1,830 m) with nutrient-poor soils. Each plant produces a single slipper-shaped flower with fine hairs and spotted petals. The leaves are narrow with a tessellated green pattern. Threatened by habitat disturbance and over collection, its wild population is estimated below 2,500 mature individuals.",
          image: "https://imgur.com/ozvq09B.jpeg",
        },
      ];

      pygmyModels.forEach((model, i) => {
        const size = 256;
        const textHeight = 50; // extra space for text
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = pygmyImages[i];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw halo behind image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 10;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Draw image
          ctx.drawImage(img, 0, 0, size, size);

          // Draw always-visible text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30); // text inside canvas

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

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
        };
      });
    }

    /* ----------------- MOSSY FOREST ----------------- */
    if (type === "Mossy Forest") {
      const mossyModels = [
        "/3dmodels/Lindsea.glb",
        "/3dmodels/Nepenthes justinae.glb",
        "/3dmodels/pit viper.glb",
        "/3dmodels/Pulchrana grandocula.glb",
      ];
      const modelSettings = [
        { scale: [5, 5, 5], position: [1, -4, 0] },
        { scale: [0.3, 0.3, 0.3], position: [0, -1, 0] },
        { scale: [0.2, 0.2, 0.2], position: [0, 0.5, 0.2] },
        { scale: [0.3, 0.3, 0.3], position: [0, -0.5, 0] },
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
        [2500, -3500, 4000],
        [8000, -6000, 1000],
      ];
      const sizes = [1000, 700, 2000, 3300];
      const modelInfoList = [
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Lindsaea hamiguitanensis\n\nA small terrestrial fern endemic to Mount Hamiguitan, Mindanao, growing at 1,100–1,200 m in lower montane rainforest. It has short-creeping rhizomes, long quadrangular petioles, and triangular fronds that are bipinnatetobasally tripinnate. The fronds feature 4–6 primary pinnae per side, with2–5herbaceous, light green pinnules per pinna, and continuous sori along the pinnulemargins. First discovered in 2009, it is restricted to the ultramafic forests of Mount Hamiguitan, which also host the Philippines’ largest pygmy “bonsai forest” andseveral other endemic fern species. Its unique morphology distinguishes it fromrelated Lindsaea species.",
          image: "https://imgur.com/7PKAuo0.jpeg",
        },
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Nepenthes justinae\n\nA tropical pitcher plant endemic to Mount Hamiguitan, Mindanao, growing at 1,000–1,620 m in montane and pygmy forests on ultramafic soils. It hasclimbing stems up to 4 m, coriaceous leaves, and distinctive lower and upper pitchers with specialized lids. Often found growing terrestrially or as an epiphyte, it coexists with other Nepenthes species, with possible hybridization. Restricted to its mountain habitat, it is vulnerable but legally protected within the Mount Hamiguitan Range Wildlife Sanctuary.",
          image: "https://i.imgur.com/N3sxDPo.jpeg",
        },
        {
          name: "Philippine Pit Viper",
          description:
            "Scientific Name: Trimeresurus flavomaculatus\n\nA medium-sized, venomous pit viper endemic to the Philippines, typically green to yellow-green with yellow spots for camouflage. Found at lowtomid- elevation forests (200–1,160 m), it is nocturnal, arboreal, and solitary, feeding on small mammals, lizards, frogs, and birds. Females are larger than males and give birth to 10–20 live young. Two subspecies exist, and the species is classified as Least Concern, though habitat loss and human activities pose threats.",
          image: "https://i.imgur.com/szpzG6n.jpeg",
        },
        {
          name: "Big-eyed Frog",
          description:
            "Scientific Name: Pulchrana grandocula\n\nA medium-sized, venomous pit viper endemic to the Philippines, typically green to yellow-green with yellow spots for camouflage. Found at lowtomid- elevation forests (200–1,160 m), it is nocturnal, arboreal, and solitary, feeding on small mammals, lizards, frogs, and birds. Females are larger than males and give birth to 10–20 live young. Two subspecies exist, and the species is classified as Least Concern, though habitat loss and human activities pose threats.",
          image: "https://imgur.com/1PftzG4.jpeg",
        },
      ];

      mossyModels.forEach((model, i) => {
        const size = 256; // canvas resolution
        const textHeight = 50; // space for text below image
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw halo/glow behind the image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 10;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Draw image
          ctx.drawImage(img, 0, 0, size, size);

          // Draw always-visible bold text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

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
        };
      });
    }

    /* ----------------- PEAK ----------------- */
    if (type === "Peak") {
      const peakModels = [
        "/3dmodels/kopfii.glb",
        "/3dmodels/hamiguitan pitcher.glb",
      ];
      const modelSettings = [
        { scale: [0.1, 0.1, 0.1], position: [0, -1.2, 0.5] },
        { scale: [0.2, 0.2, 0.2], position: [0, -0.7, 0] },
      ];
      const images = [
        "https://i.imgur.com/7rVup0Z.png",
        "https://i.imgur.com/pLIOyYx.png",
      ];
      const positions = [
        [2700, -3000, 1200],
        [3000, -2700, -2000],
      ];
      const sizes = [1500, 1800];
      const modelInfoList = [
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Dendrochilum kopfii\n\nAn epiphytic and terrestrial orchid endemic to Mount Hamiguitan, Mindanao, growing at 1,200–2,000 m in misty, shaded montane forests. It hasarching inflorescence spikes with numerous small, delicate flowers in shades of brown, white, or red and white, and lance-shaped leaves arising from pseudobulbs. Thriving in cool, humid, and well-ventilated habitats, it is valued for its compact formand floriferous spiral flower arrangement.",
          image: "https://i.imgur.com/jIKS0I6.jpeg",
        },
        {
          name: "Hamiguitan Pitcher Plant",
          description:
            "Scientific Name: Nepenthes hamiguitanensis\n\nA tropical climbing pitcher plant endemic to the summit ridge of Mount Hamiguitan, Mindanao, growing at 1,200–1,600 m, most common above 1,400m. It produces squat, infundibular-cylindrical upper pitchers up to 20 cm high, with ribbed peristomes and broad, cordate lids. Mature plants reach 4 m, with elliptic-oblong leaves and hairy stems and leaf margins. Terrestrial and found in primary montaneforests and forest edges, it prefers humus-rich soils in partial shade. Coexists withother Nepenthes species but no natural hybrids.",
          image: "https://i.imgur.com/xdwtCcg.jpeg",
        },
      ];

      peakModels.forEach((model, i) => {
        const size = 256; // canvas resolution
        const textHeight = 50; // extra space for text
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw halo/glow behind the image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 5;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Draw image
          ctx.drawImage(img, 0, 0, size, size);

          // Draw always-visible bold text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

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
        };
      });
    }
    /* ----------------- CAMP 3 INSIDE ----------------- */
    if (type === "Camp III") {
      addBackToCamp3(panorama); // adds the back arrow
    }

    // ----------------- CAMP 3 INSIDE -----------------
    if (type === "Camp III") {
      const camp3Models = [
        "/3dmodels/Tropidophorus davaoensis.glb",
        "/3dmodels/horned frog.glb",
        "/3dmodels/hoya josseteae.glb",
      ];

      const modelSettings = [
        { scale: [0.3, 0.3, 0.3], position: [0, 1, 0] },
        { scale: [0.1, 0.1, 0.1], position: [0, 1, -1] },
        { scale: [0.3, 0.3, 0.3], position: [0, 0.5, 0] },
      ];

      const images = [
        "https://i.imgur.com/wdf4LFU.png", // Tropidophorus Davaoensis
        "https://i.imgur.com/M9ZKf3y.png", // Horned Frog
        "https://i.imgur.com/fzEjaLW.png", // Hoya Josseteae
      ];

      const positions = [
        [6500, -5000, 500],
        [-1000, -3000, -3000],
        [-1300, 200, -800],
      ];

      const sizes = [2300, 1200, 650];

      const modelInfoList = [
        {
          name: "Davao Waterside Skink",
          description:
            "Scientific Name: Tropidophorus davaoensis\n\nA small, semi-aquatic skink endemic to southern Mindanao, Philippines. It inhabits lowland forest streams, hiding among rocks, leaf litter, and aquatic vegetation. The species is ovoviviparous and distinguished by unique scale patterns, including separated prefrontals and two anterior loreals. First described near Malabutuan, Davao, it remains largely cryptic and specialized for riparian habitats. Classified as Least Concern by the IUCN, it reflects the rich semi-aquatic reptile biodiversity of Mindanao",
          image: "https://i.imgur.com/JBj0E3H.jpeg",
        },
        {
          name: "Mindanao Horned Frog",
          description:
            "Scientific Name: Pelobatrachus stejnegeri\n\nA medium-sized frog endemic to Mindanao, Philippines, inhabiting moist lowland and montane forests near rivers and streams. Recognizable by hornlike projections above the eyes and mottled, camouflaged skin, it is mostly nocturnal. Tadpoles develop in shallow freshwater, attaching to submerged debris. Sensitive to habitat loss and climate change, it highlights the importance of conserving forest-floor and freshwater ecosystems for species survival.",
          image: "https://i.imgur.com/3AwsOpM.jpeg",
        },
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Hoya josseteae\n\nA recently described epiphytic vine endemic to the Philippines. It hasleathery, dark green leaves and produces pale pink to white, star-shaped flowers in large umbels with a sweet fragrance. Unique corolla ridges and beaked coronascales distinguish it from related species. Growing in shaded, humid tropical forests, it anchors to host trees with aerial roots. Thriving in well-drained substrates, it blooms mainly in warmer months and contributes to forest ecology while being valued for it shorticultural appeal.",
          image: "https://i.imgur.com/Amgwvg4.jpeg",
        },
      ];

      camp3Models.forEach((model, i) => {
        const size = 256; // canvas resolution
        const textHeight = 50; // space for text below image
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw halo/glow behind the image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 50;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Draw image
          ctx.drawImage(img, 0, 0, size, size);

          // Draw always-visible bold text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

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
        };
      });

      // Add back arrow
      addBackToCamp3(panorama);
    }

    if (type === "Camp IV") {
      addBackToCamp4(panorama); // adds the back arrow
    }
  };

  if (error) return <p className="error-text">{error}</p>;
  if (!spot)
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="spotview-container">
      <div
        ref={containerRef}
        className={`panorama-container ${blurPanorama ? "blurred" : ""}`}
      />
      {loading && <div className="loading-overlay">Loading panorama...</div>}

      {!activeModel && (
        <div className="spot-info">
          <h1 className="spot-title">{spot?.Name}</h1>
          <p className="spot-description">{spot?.Description}</p>
          <div
            className={`back-btn ${hoverBack ? "hover" : ""}`}
            onClick={() => {
              navigate("/tour");
              setTimeout(() => window.location.reload(), 140);
            }}
            onMouseEnter={() => setHoverBack(true)}
            onMouseLeave={() => setHoverBack(false)}
          >
            ⬅ Back
          </div>
        </div>
      )}

      {activeModel && (
        <div className="model-modal">
          <button className="close-btn" onClick={handleCloseModal}>
            ✖
          </button>

          {modelInfo && <h2 className="model-title-top">{modelInfo.name}</h2>}
          {modelError && <p className="model-error">{modelError}</p>}

          {/* 3D MODEL BOX */}
          <div className="model-3d-box">
            <div className="model-view-section">
              {/* LOADING SPINNER */}
              {modelLoading && (
                <div className="model-loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
              <Canvas
                camera={{ position: [0, 1.5, 5], fov: 45 }}
                className="canvas-view"
              >
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} intensity={1.2} />

                <Suspense fallback={null}>
                  <ModelViewer
                    url={activeModel.url}
                    scale={activeModel.scale}
                    position={activeModel.position}
                    setModelError={setModelError}
                    setModelLoading={setModelLoading}
                  />
                </Suspense>

                <OrbitControls target={[0, 1, 0]} />
              </Canvas>
            </div>
          </div>

          {/* MODEL INFO SECTION - OUTSIDE THE 3D BOX */}
          {modelInfo && (
            <div
              className="model-info-section"
              onWheel={(e) => e.stopPropagation()}
            >
              <img
                src={modelInfo.image}
                alt={modelInfo.name}
                className="model-img"
              />
              <div className="model-text">
                <p className="model-description">
                  {modelInfo.description.split("\n").map((line, index) => {
                    if (line.startsWith("Scientific Name:")) {
                      const parts = line.split(":");
                      return (
                        <span key={index}>
                          Scientific Name: <i>{parts[1].trim()}</i>
                          <br />
                        </span>
                      );
                    }

                    return (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    );
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotView;
