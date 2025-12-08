import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { db } from "./firebase"; // make sure your firebase config is imported
import React, { useState, useRef, useEffect } from "react";
import "./Admin.css";

function AdminDashboard() {
  const videoRef = useRef(null);

  const [spots, setSpots] = useState([
    {
      id: "fTLAXWb7Cph8jqeHxlXT",
      name: "UNESCO Marker",
      img: "https://i.imgur.com/z2naEKO.jpeg",
      desc: "The official jump-off point of the Mt. Hamiguitan trail, marking the start of the climb into the UNESCO World Heritage Site.",
    },
    {
      id: "EFNFONngOYNOOFbqdloj",
      name: "Crossing Stampa",
      img: "https://i.imgur.com/VDlrFPZ.jpeg",
      desc: "A trail crossroad where trekkers usually regroup before heading deeper into the forest.",
    },
    {
      id: "sk2Dc8hJYl1NUr3bAEsj",
      name: "Puting Bato",
      img: "https://i.imgur.com/dLofKtJ.jpeg",
      desc: "A pale rock formation along the path, offering hikers a short rest stop and scenic view.",
    },
    {
      id: "IMcVNrMMCsgXbiLPe10T",
      name: "Lantawan 1",
      img: "https://i.imgur.com/U1UmFwr.jpeg",
      desc: "– A natural viewing deck where hikers can pause to admire the surrounding forest and slopes.",
    },
    {
      id: "MeD7yd6kVBnAJYJXND7c",
      name: "Camp 4",
      img: "https://i.imgur.com/jKc9S8B.jpeg",
      desc: "A designated resting campsite for trekkers, often used for overnight stays.",
    },
    {
      id: "68Q4aC5LVgIDYcU4rn0F",
      name: "Uwang-Uwang",
      img: "https://i.imgur.com/7JsMLdl.jpeg",
      desc: "Named after the local beetle (uwang), this spot is known for its rich insect and wildlife diversity.",
    },
    {
      id: "dIxy6t8cHc88lGY7eHTD",
      name: "Lantawan 2",
      img: "https://i.imgur.com/usYiedr.jpeg",
      desc: "Another scenic viewpoint, giving a higher perspective of the mountain terrain.",
    },
    {
      id: "YCEKhHOU6eNHSqx10qSr",
      name: "Camp 3",
      img: "http://i.imgur.com/61rtYFn.jpeg",
      desc: "A common campsite along the trail where hikers rest and prepare for the push toward higher elevation.",
    },
    {
      id: "q519aECmdG1TQF7D44Ld",
      name: "Pygmy Field",
      img: "https://i.imgur.com/1bgyovZ.jpeg",
      desc: "A unique bonsai forest, where centuries-old trees remain stunted due to the harsh soil and climate.",
    },
    {
      id: "rBS9OYsdZfgHCXMrWUNW",
      name: "Lantawan 3",
      img: "https://i.imgur.com/DGGOaxK.jpeg",
      desc: "The last viewing deck before reaching the higher mossy forest, offering breathtaking panoramas.",
    },
    {
      id: "Dke92cE9QOQBB6V9rHNw",
      name: "Tinagong Dagat",
      img: "https://i.imgur.com/RUZIkdP.jpeg",
      desc: "A ‘hidden sea’ that mysteriously changes water level.",
    },
    {
      id: "faYghVBuX9xcHpYLAgdH",
      name: "Mossy Forest",
      img: "https://i.imgur.com/aKFFyvd.jpeg",
      desc: "A mystical forest with trees covered in moss, orchids, and ferns, often shrouded in fog.",
    },
    {
      id: "V3USceTjPBw2EnQlXUN6",
      name: "Hidden Garden",
      img: "https://i.imgur.com/s6m3bpS.jpeg",
      desc: "A lush area teeming with wild orchids and rare plants.",
    },
    {
      id: "iNq6B4KSRrEnBcYOzYVX",
      name: "Peak",
      img: "https://imgur.com/3PZJPKJ.jpeg",
      desc: "The summit of Mt. Hamiguitan, rewarding climbers with stunning 360° views of Davao Oriental and beyond.",
    },
    {
      id: "5u8jnd3X4g9lYMy2OMpq",
      name: "Black Mountain",
      img: "https://imgur.com/WBZnjaY.jpeg",
      desc: "A ridge of darker rock and soil, distinct in color compared to other parts of the trail.",
    },
    {
      id: "QGRePSC5lFbcbJ8ICvtB",
      name: "Twin Falls",
      img: "https://i.imgur.com/DRxCa9i.jpeg",
      desc: "A pair of waterfalls cascading side by side, one of the refreshing natural highlights of the trek.",
    },
  ]);

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [tempImg, setTempImg] = useState("");
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (videoRef.current)
      videoRef.current.play().catch(() => console.log("Autoplay blocked"));
  }, []);

  const openModal = async (spot, index) => {
    setSelectedSpot({ ...spot, index });

    try {
      const firebaseRef = doc(db, "Spots", spot.id);
      const firebaseSnap = await getDoc(firebaseRef);

      if (firebaseSnap.exists()) {
        const data = firebaseSnap.data();
        setTempDesc(data.Description || ""); // Firestore field
        setTempImg(data.Image || ""); // Firestore field
      } else {
        console.error("Spot not found in Firestore!");
      }
    } catch (err) {
      console.error("Error fetching Firestore data:", err);
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSpot(null);
  };

  const handleUpdate = async () => {
    const updatedSpots = [...spots];
    updatedSpots[selectedSpot.index].desc = tempDesc;
    updatedSpots[selectedSpot.index].img = tempImg;
    setSpots(updatedSpots);

    // Update Firestore
    try {
      const spotRef = doc(db, "Spots", selectedSpot.id);
      await updateDoc(spotRef, {
        Description: tempDesc, // make sure it matches Firestore
        Image: tempImg, // make sure it matches Firestore
      });
      alert(`"${selectedSpot.name}" updated successfully in Firestore!`);
    } catch (err) {
      console.error("Error updating Firestore:", err);
      alert("Failed to update in Firestore. Check console for details.");
    }

    closeModal();
  };

  return (
    <div className="admin-dashboard-wrapper">
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

      {/* Account Icon */}
      <div
        className="account-icon"
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        <FaUserCircle className="users-icon" />
        {dropdownVisible && (
          <div className="dropdown-menu">
            <button
              className="dropdown-button"
              onClick={() => setConfirmLogout(true)}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="admin-overlay">
        <h1>HamiTour Admin Dashboard</h1>

        <div className="spots-grid">
          {spots.map((spot, index) => (
            <div className="spot-card" key={index}>
              <img src={spot.img} alt={spot.name} />
              <div className="spot-info">
                <h3>{spot.name}</h3>
                <button
                  className="update-btn"
                  onClick={() => openModal(spot, index)}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmLogout && (
        <div className="modal-overlay" onClick={() => setConfirmLogout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={() => navigate("/admin-login")}
              >
                Yes
              </button>
              <button
                className="cancel-btn"
                onClick={() => setConfirmLogout(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedSpot.name}</h2>
            <label>
              Description:
              <textarea
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
              />
            </label>
            <label>
              Image URL:
              <input
                type="text"
                value={tempImg}
                onChange={(e) => setTempImg(e.target.value)}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handleUpdate}>Save</button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
