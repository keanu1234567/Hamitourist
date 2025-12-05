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


  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);


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
      } catch { }
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
      } catch { }
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
            "Scientific Name: Scaveola micrantha\n\n" + "This Goodeniaceae shrub or small tree grows up to 10 m with smooth bark and 15 cm leaves. It is native to the Philippines, Taiwan, and Borneo and thrives on ultramafic soils, especially in the mossy-pygmy “bonsai” forests of Mt. Hamiguitan at 1,160–1,600 m. The species is an indicator of ultrabasic ecosystems, adapted to nutrient-poor, iron- and magnesium-rich soils. It is listed as Least Concern, but its specialized habitat makes it vulnerable. Ecologically, it supports biodiversity, stabilizes soil, and helps indicate forest health. Conservation efforts include habitat protection, monitoring, and regulated tourism.",
          image: "https://imgur.com/yn2xxt7.jpeg",
        },
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Wendlandia nervosa\n\n" + "This flowering shrub or small tree is endemic to the Black Mountain area of Mt. Hamiguitan in Mindanao. It grows on nutrient-poor, acidic ultramafic soils and has opposite elliptic to oblong leaves with prominent veins. It produces fragrant tubular flowers in cymose or paniculiform clusters, often white, purple, or red. As part of the montane and ultramafic pygmy forest, it contributes to Mt. Hamiguitan’s high endemism and biodiversity. The species is Vulnerable due to its restricted ultramafic habitat and sensitivity to disturbance. Protection within the Mt. Hamiguitan Range Wildlife Sanctuary helps reduce threats such as deforestation. Ecologically, it supports pollinators, boosts plant diversity, provides habitat for small fauna, and serves as an indicator of ultramafic forest health. Conservation includes strict habitat protection, biodiversity monitoring, regulated eco-tourism, and environmental education.",
          image: "https://i.imgur.com/8RSlcGE.jpeg",
        },
      ];

      // ✅✅✅ CORRECT SOUND PATH
      const clickSounds = [
        "/sounds/click.mp3",
        "/sounds/click.mp3",
      ];

      // ✅✅✅ PRELOAD SOUNDS TO AVOID BLOCKING
      const preloadedSounds = clickSounds.map(src => {
        const audio = new Audio(src);
        audio.load();
        audio.volume = 1.0;
        return audio;
      });

      models.forEach((model, i) => {
        const size = 256;
        const textHeight = 50;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 10;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          ctx.drawImage(img, 0, 0, size, size);

          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 25);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

          // ✅✅✅ CLICK EVENT WITH GUARANTEED SOUND PLAYBACK
          infospot.addEventListener("click", () => {
            const audio = preloadedSounds[i];
            audio.currentTime = 0; // allow rapid clicking
            audio.play().catch(err => console.log("Sound failed:", err));

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
            "Scientific Name: Nepenthes micramphora\n" + "\n" + "This tropical pitcher plant, endemic to Mount Hamiguitan, grows at 1,100–1,635 m in ultramafic montane forests. It has narrow, funnel-shaped pitchers (4–6.7 cm) with a pronounced peristome and lid, and smooth stems and leaves. Found with other Nepenthes species, it is Critically Endangered due to its very limited range, habitat loss, and risks of overcollection. Ecologically, it controls insect populations, obtains nutrients from trapped prey in nutrient-poor soils, and supports a specialized micro-ecosystem. In the Mt. Hamiguitan Range Wildlife Sanctuary, it is protected through strict habitat conservation, population monitoring, regulated tourism, and education efforts, all essential for its survival.",
          image: "https://i.imgur.com/r0HRn0k.jpeg",
        },
        {
          name: "Philippine Mock Viper",
          description:
            "Scientific Name: Psammodynastes pulverulentus\n" + "\n" + "The Philippine Mock Viper is a small, harmless snake (65–77 cm) with brown or gray patterns and a Y-shaped head marking. It lives near streams and moist forest floors, is active day and night, and eats frogs, geckos, and skinks. It is native to many Philippine islands up to 2,100 m elevation Though listed as Least Concern, it depends on intact forests, making protected areas like Mt. Hamiguitan important. It helps control small vertebrates and serves as prey, supporting the forest food chain. In the sanctuary, it benefits from habitat protection, monitoring, and regulated tourism.",
          image: "https://i.imgur.com/vBK0069.jpeg",
        },
        {
          name: "Lady Slipper Orchid",
          description:
            "This rare orchid, endemic to the Philippines and found in the Pygmy Field of Mt. Hamiguitan, grows on soil or rocks in montane forests (300–1,830 m). It has a single slipper-shaped flower with fine hairs and spotted petals, and narrow, tessellated leaves. Fewer than 2,500 mature individuals remain due to habitat disturbance and overcollection. Classified as Endangered, it is threatened by habitat loss, illegal collection, and its slow growth. It supports specialized pollinators, maintains soil microhabitats, and indicates healthy forest ecosystems. In the Mt. Hamiguitan Range Wildlife Sanctuary, it benefits from strict habitat protection, zero-extraction rules, monitoring, controlled tourism, and education efforts, all vital for its survival.",
          image: "https://imgur.com/ozvq09B.jpeg",
        },
      ];

      // ✅ ✅ ✅ CLICK SOUND FROM PUBLIC
      const clickSounds = [
        "/sounds/click.mp3",
        "/sounds/click.mp3",
        "/sounds/click.mp3",
      ];

      // ✅ ✅ ✅ PRELOAD SOUNDS
      const preloadedSounds = clickSounds.map(src => {
        const audio = new Audio(src);
        audio.load();
        audio.volume = 1.0;
        return audio;
      });

      pygmyModels.forEach((model, i) => {
        const size = 256;
        const textHeight = 50;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = pygmyImages[i];

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Glow
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 10;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Image
          ctx.drawImage(img, 0, 0, size, size);

          // Text
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

          // ✅ ✅ ✅ CLICK EVENT WITH SOUND
          infospot.addEventListener("click", () => {
            const audio = preloadedSounds[i];
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Sound failed:", err));

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
            "Scientific Name: Lindsaea hamiguitanensis\n\nThis small terrestrial fern is endemic to Mt. Hamiguitan, Mindanao, growing at 1,100–1,200 m in lower montane rainforest. It has short-creeping rhizomes, long quadrangular petioles, and triangular bipinnate to tripinnate fronds with continuous sori along the pinnule margins. Discovered in 2009, it is restricted to the ultramafic pygmy forests alongside other endemic ferns. Classified as Endangered, it is threatened by its limited distribution and fragile habitat. Ecologically, it stabilizes soil, provides microhabitats for invertebrates, and supports biodiversity in the Pygmy Forest. Conservation includes habitat protection, monitoring, regulated tourism, and research, ensuring its survival.",
          image: "https://imgur.com/7PKAuo0.jpeg",
        },
        {
          name: "No widely recognized common name",
          description:
            "Scientific Name: Nepenthes justinae\n\nThis tropical pitcher plant is endemic to Mt. Hamiguitan, Mindanao, growing at 1,000–1,620 m in montane and pygmy ultramafic forests. It has climbing stems up to 4 m, coriaceous leaves, and distinctive lower and upper pitchers, growing terrestrially or as an epiphyte and sometimes hybridizing with other Nepenthes species. Classified as Vulnerable, it is threatened by its limited range, slow growth, and sensitive habitat, though legal protection in the Mt. Hamiguitan Range Wildlife Sanctuary helps safeguard it. Ecologically, it traps insects for nutrients, supports specialized invertebrates, and enhances plant biodiversity. Conservation includes habitat protection, monitoring, regulated eco-tourism, and education to preserve the species and ecosystem balance.",
          image: "https://i.imgur.com/N3sxDPo.jpeg",
        },
        {
          name: "Philippine Pit Viper",
          description:
            "Scientific Name: Trimeresurus flavomaculatus\n\nThe Philippine Pit Viper is a medium-sized, venomous snake endemic to the Philippines, green to yellow-green with yellow spots, living in low to mid-elevation forests (200–1,160 m). It is nocturnal, arboreal, and feeds on small vertebrates. Classified as Least Concern, it is threatened by habitat loss, making Mt. Hamiguitan protection important. It regulates prey populations, serves as prey, and helps maintain the forest food web. Conservation includes habitat protection, monitoring, and education.",
          image: "https://i.imgur.com/szpzG6n.jpeg",
        },
        {
          name: "Big-eyed Frog",
          description:
            "Scientific Name: Pulchrana grandocula\n\nThe Big-eyed Frog is endemic to the southern Philippines, living in streams below 1,500 m. Males call near pools, females stay in understory or caves, and tadpoles cling to debris. It controls insects and serves as prey. Classified as Least Concern, it is threatened by habitat loss and pollution. Conservation in Mt. Hamiguitan includes stream protection, monitoring, and education to maintain healthy populations and ecosystems.",
          image: "https://imgur.com/1PftzG4.jpeg",
        },
      ];

      // ✅ ✅ ✅ CLICK SOUND FROM PUBLIC
      const clickSounds = [
        "/sounds/click.mp3",
        "/sounds/click.mp3",
        "/sounds/click.mp3",
        "/sounds/click.mp3",
      ];

      // ✅ ✅ ✅ PRELOAD SOUNDS
      const preloadedSounds = clickSounds.map(src => {
        const audio = new Audio(src);
        audio.load();
        audio.volume = 1.0;
        return audio;
      });

      mossyModels.forEach((model, i) => {
        const size = 256;
        const textHeight = 50;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Glow
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 20;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Image
          ctx.drawImage(img, 0, 0, size, size);

          // Text
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

          // ✅ ✅ ✅ CLICK EVENT WITH SOUND
          infospot.addEventListener("click", () => {
            const audio = preloadedSounds[i];
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Sound failed:", err));

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
            "Scientific Name: Dendrochilum kopfii\n\nThis orchid is endemic to Mt. Hamiguitan, growing at 1,200–2,000 m in shaded montane forests. It has arching inflorescences with small brown, white, or red flowers and lance-shaped leaves from pseudobulbs, thriving in cool, humid habitats. Classified as Vulnerable, it is threatened by limited range and habitat disturbance, but protected within the Mt. Hamiguitan Range Wildlife Sanctuary. Ecologically, it provides nectar and microhabitats for pollinators, supports biodiversity, and indicates forest health. Conservation includes habitat protection, monitoring, regulated tourism, and education",
          image: "https://i.imgur.com/jIKS0I6.jpeg",
        },
        {
          name: "Hamiguitan Pitcher Plant",
          description:
            "Scientific Name: Nepenthes hamiguitanensis\n\nThe Hamiguitan Pitcher Plant is a tropical climbing Nepenthes endemic to Mt. Hamiguitan, growing at 1,200–1,600 m, mostly above 1,400 m. It has upper pitchers up to 20 cm, elliptic-oblong leaves, and hairy stems, and grows terrestrially in primary montane forests and edges. Classified as Vulnerable, it is threatened by limited range, specialized habitat, and slow growth. Ecologically, it traps insects, provides microhabitats, and boosts plant diversity. Conservation includes habitat protection, monitoring, controlled tourism, and education.",
          image: "https://i.imgur.com/xdwtCcg.jpeg",
        },
      ];

      // ✅ ✅ ✅ CLICK SOUND FROM PUBLIC
      const clickSounds = [
        "/sounds/click.mp3",
        "/sounds/click.mp3",
      ];

      // ✅ ✅ ✅ PRELOAD SOUNDS
      const preloadedSounds = clickSounds.map((src) => {
        const audio = new Audio(src);
        audio.load();
        audio.volume = 1.0;
        return audio;
      });

      peakModels.forEach((model, i) => {
        const size = 256;
        const textHeight = 50;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Glow
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 20;
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();

          // Image
          ctx.drawImage(img, 0, 0, size, size);

          // Text
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

          // ✅ ✅ ✅ CLICK EVENT WITH SOUND
          infospot.addEventListener("click", () => {
            const audio = preloadedSounds[i];
            audio.currentTime = 0;
            audio.play().catch((err) => console.log("Sound failed:", err));

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

      const sizes = [2500, 1400, 800];

      const modelInfoList = [
        {
          name: "Davao Waterside Skink",
          description: "Scientific Name: Tropidophorus davaoensis\n\nThis small, semi-aquatic skink is endemic to southern Mindanao, living in lowland forest streams among rocks, leaf litter, and aquatic vegetation. It is ovoviviparous and has distinctive scale patterns, remaining largely cryptic and specialized for riparian habitats. Classified as Least Concern, it depends on healthy streams, threatened by pollution and deforestation. Ecologically, it controls insects, serves as prey, supports freshwater habitat health, and indicates riparian ecosystem quality. Conservation includes stream protection, monitoring, regulated tourism, and education.",
          image: "https://i.imgur.com/JBj0E3H.jpeg",
        },
        {
          name: "Mindanao Horned Frog",
          description: "Scientific Name: Pelobatrachus stejnegeri\n\nThe Mindanao Horned Frog is a medium-sized, nocturnal frog endemic to Mindanao, living in moist lowland and montane forests near streams. It has horn-like eye projections and mottled skin, with tadpoles developing on submerged debris. Classified as Vulnerable, it is threatened by habitat loss, water pollution, and climate change, making Mt. Hamiguitan protection essential. Ecologically, it controls insects, serves as prey, aids nutrient cycling, and indicates forest-floor and freshwater health. Conservation includes habitat protection, monitoring, regulated tourism, and education.",
          image: "https://i.imgur.com/3AwsOpM.jpeg",
        },
        {
          name: "No widely recognized common name",
          description: "Scientific Name: Hoya josseteae\n\nThis epiphytic vine is endemic to the Philippines, with leathery dark green leaves and pale pink to white star-shaped flowers in fragrant umbels. It grows in shaded, humid forests, anchoring to host trees with aerial roots, and blooms mainly in warmer months. Classified as Vulnerable, it is threatened by restricted range, habitat loss, and overcollection, making Mt. Hamiguitan protection essential. Ecologically, it provides nectar, supports canopy biodiversity, indicates forest health, and adds aesthetic value. Conservation includes forest protection, monitoring, regulated tourism, and education.",
        },
      ];

      // ✅ CLICK SOUND FROM PUBLIC
      const clickSounds = [
        "/sounds/click.mp3",
        "/sounds/click.mp3",
        "/sounds/click.mp3",
      ];

      // ✅ PRELOAD SOUNDS
      const preloadedSounds = clickSounds.map(src => {
        const audio = new Audio(src);
        audio.load();
        audio.volume = 1.0;
        return audio;
      });

      camp3Models.forEach((model, i) => {
        const size = 256; // canvas resolution
        const textHeight = 50;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size + textHeight;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = images[i];

        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Maintain aspect ratio
          const aspect = img.width / img.height;
          let drawWidth = size;
          let drawHeight = size;

          if (aspect > 1) {
            drawHeight = size / aspect;
          } else {
            drawWidth = size * aspect;
          }

          const offsetX = (size - drawWidth) / 2;
          const offsetY = (size - drawHeight) / 2;

          // Draw halo/glow behind image
          ctx.save();
          ctx.shadowColor = "white";
          ctx.shadowBlur = 20;
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          ctx.restore();

          // Draw always-visible text below image
          ctx.font = "bold 20px Poppins";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.fillText("Click to view 3D model", size / 2, size + 30);

          const strokedImageURL = canvas.toDataURL();
          const infospot = new PANOLENS.Infospot(sizes[i], strokedImageURL);
          infospot.position.set(...positions[i]);

          // ✅ CLICK EVENT WITH SOUND
          infospot.addEventListener("click", () => {
            const audio = preloadedSounds[i];
            audio.currentTime = 0;
            audio.play().catch(err => console.log("Sound failed:", err));

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