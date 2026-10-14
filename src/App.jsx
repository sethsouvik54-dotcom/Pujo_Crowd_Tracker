import { useState } from "react";
import "./index.css";

// ১. প্রতিটি প্যান্ডেলের সঠিক ল্যাটিটিউড (lat) ও লংটিউড (lng) সহ ডেটাসেট
const pandals = [
  {
    id: 1,
    name: "Sreebhumi Sporting Club",
    area: "Lake Town",
    lat: 22.5958,
    lng: 88.4017,
    crowd: "High",
    waitingTime: 60,
    image: "/images/sreebhumi.jpg"
  },
  {
    id: 2,
    name: "Ekdalia Evergreen Club",
    area: "Gariahat",
    lat: 22.5181,
    lng: 88.3639,
    crowd: "Medium",
    waitingTime: 25,
    image: "/images/ekdalia.jpg"
  },
  {
    id: 3,
    name: "Tridhara Sammilani",
    area: "Ballygunge",
    lat: 22.5246,
    lng: 88.3644,
    crowd: "High",
    waitingTime: 45,
    image: "/images/tridhara.jpg"
  },
  {
    id: 4,
    name: "College Square",
    area: "College Street",
    lat: 22.5731,
    lng: 88.3639,
    crowd: "Low",
    waitingTime: 10,
    image: "/images/college-square.jpg"
  },
  {
    id: 5,
    name: "Bagbazar Sarbojanin",
    area: "Bagbazar",
    lat: 22.6017,
    lng: 88.3713,
    crowd: "Medium",
    waitingTime: 20,
    image: "/images/bagbazar.jpg"
  },
  {
    id: 6,
    name: "Mohammad Ali Park",
    area: "Central Kolkata",
    lat: 22.5761,
    lng: 88.3595,
    crowd: "Low",
    waitingTime: 12,
    image: "/images/mohammad-ali-park.jpg"
  }
];

// ২. দুটি জিপিএস পয়েন্টের মধ্যে দূরত্ব কিলোমিটার (KM)-এ বের করার ফর্মুলা (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function App() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default"); // 'default', 'waiting', 'distance'
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  // ৩. ইউজারের জিপিএস লোকেশন নেওয়ার ফাংশন
  const handleGetLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
          setLoadingLocation(false);
        },
        (error) => {
          setLocationError("Location permission denied or unavailable.");
          setLoadingLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
    }
  };

  // ৪. প্রতিটি প্যান্ডেলের সাথে দূরত্ব হিসাব করা এবং সার্চ/ফিল্টার অ্যাপ্লাই করা
  let results = pandals.map((p) => {
    let distance = null;
    if (userLocation) {
      distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        p.lat,
        p.lng
      );
    }
    return { ...p, distance };
  }).filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || p.crowd === filter;

    return matchesSearch && matchesFilter;
  });

  // ৫. সর্টিং হ্যান্ডেল করা (Waiting Time বা Distance অনুযায়ী)
  if (sortBy === "waiting") {
    results.sort((a, b) => a.waitingTime - b.waitingTime);
  } else if (sortBy === "distance" && userLocation) {
    results.sort((a, b) => a.distance - b.distance);
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="topline">KOLKATA · DURGA PUJA</p>
        <h1>🪔 PujoTracker</h1>
        <p>Find your next pandal with less waiting.</p>
        <span className="demo-label">
          DEMO DATA · NOT LIVE
        </span>
      </header>

      {/* নতুন লোকেশন বার (Location Bar) */}
      <div style={{ background: "#fff1d9", padding: "12px 20px", textAlign: "center", borderBottom: "1px solid #e4d8c8" }}>
        {userLocation ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#84351c", fontWeight: "bold" }}>
              📍 Location active! Showing distances from you.
            </span>
            <button 
              onClick={() => setUserLocation(null)}
              style={{ background: "transparent", border: "1px solid #84351c", color: "#84351c", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
            >
              Reset Location
            </button>
          </div>
        ) : (
          <button
            onClick={handleGetLocation}
            style={{ background: "#7b301b", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
          >
            {loadingLocation ? "Detecting location..." : "📍 Find Pandals Near Me"}
          </button>
        )}
        {locationError && <p style={{ color: "#a62d2d", fontSize: "12px", margin: "5px 0 0" }}>{locationError}</p>}
      </div>

      <main>
        <h2>Explore Pandals</h2>
        <p className="subtitle">
          Discover pandals, check sample crowd levels, and view distances.
        </p>

        <input
          className="search"
          placeholder="Search pandal or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="controls">
          <select
            className="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All crowd levels</option>
            <option value="Low">Low crowd</option>
            <option value="Medium">Medium crowd</option>
            <option value="High">High crowd</option>
          </select>

          {/* সর্টিং ড্রপডাউন বা বাটন */}
          <select
            className="filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default order</option>
            <option value="waiting">Least waiting first</option>
            {userLocation && <option value="distance">Nearest to me first</option>}
          </select>
        </div>

        <p className="count">{results.length} pandals found</p>

        <div className="pandal-list">
          {results.map((p) => (
            <article className="card" key={p.id}>
              <img
                className="pandal-image"
                src={p.image}
                alt={p.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="card-content">
                <div className="card-top">
                  <div>
                    <h3>{p.name}</h3>
                    <p className="area">📍 {p.area}</p>
                    {/* ইউজার লোকেশন অন থাকলে দূরত্ব (KM) দেখাবে */}
                    {p.distance !== null && (
                      <p style={{ fontSize: "12px", color: "#b94b24", fontWeight: "bold", margin: "4px 0 0" }}>
                        🚗 ~{p.distance.toFixed(1)} km away from you
                      </p>
                    )}
                  </div>

                  <span className={`badge ${p.crowd.toLowerCase()}`}>
                    {p.crowd}
                  </span>
                </div>

                <div className="waiting">
                  <span>Estimated waiting time</span>
                  <strong>{p.waitingTime} minutes</strong>
                </div>

                <a
                  className="map-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " Kolkata")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Google Maps ↗
                </a>

                <p className="note">
                  Sample estimate · Not live data
                </p>
              </div>
            </article>
          ))}
        </div>

        {results.length === 0 && (
          <p className="empty">
            No pandals found. Try another search.
          </p>
        )}

        <footer>
          🪔 PujoTracker · Plan your Puja, beat the queues!
        </footer>
      </main>
    </div>
  );
}

export default App;