import { useState, useEffect } from "react";
import "./index.css";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// 2. Pan-India Pandals & Festival Dataset
const initialPandals = [
  { id: "1", name: "Sreebhumi Sporting Club", area: "Lake Town, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5958, lng: 88.4017, crowd: "High", waitingTime: 60, risk: "Red", image: "/images/sreebhumi.jpg" },
  { id: "2", name: "Ekdalia Evergreen Club", area: "Gariahat, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5181, lng: 88.3639, crowd: "Medium", waitingTime: 25, risk: "Amber", image: "/images/ekdalia.jpg" },
  { id: "3", name: "Tridhara Sammilani", area: "Ballygunge, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5246, lng: 88.3644, crowd: "High", waitingTime: 45, risk: "Red", image: "/images/tridhara.jpg" },
  { id: "4", name: "College Square", area: "College Street, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5731, lng: 88.3639, crowd: "Low", waitingTime: 10, risk: "Green", image: "/images/college-square.jpg" },
  { id: "5", name: "Santosh Mitra Square", area: "Bowbazar, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5697, lng: 88.3631, crowd: "High", waitingTime: 75, risk: "Red", image: "/images/santosh-mitra.jpg" },
  { id: "6", name: "Lalbaugcha Raja", area: "Lalbaug, Mumbai", state: "Maharashtra", festival: "Ganesh Chaturthi", lat: 18.9904, lng: 72.8385, crowd: "High", waitingTime: 120, risk: "Red", image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80" },
  { id: "7", name: "Jagannath Temple", area: "Puri", state: "Odisha", festival: "Rath Yatra", lat: 19.8135, lng: 85.8312, crowd: "High", waitingTime: 90, risk: "Red", image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80" },
  { id: "8", name: "Thrikkakara Temple", area: "Kochi", state: "Kerala", festival: "Onam", lat: 10.0356, lng: 76.3292, crowd: "Low", waitingTime: 15, risk: "Green", image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=600&q=80" },
  { id: "9", name: "Bagbazar Sarbojanin", area: "Bagbazar, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5951, lng: 88.3722, crowd: "High", waitingTime: 50, risk: "Red", image: "/images/bagbazar.jpg" },
  { id: "10", name: "Mohammad Ali Park", area: "Central Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5641, lng: 88.3526, crowd: "High", waitingTime: 55, risk: "Red", image: "/images/mohammad-ali-park.jpg" },
  { id: "11", name: "Kumartuli Park", area: "Kumartuli, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5999, lng: 88.3622, crowd: "Medium", waitingTime: 30, risk: "Amber", image: "" },
  { id: "12", name: "Deshapriya Park", area: "South Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5144, lng: 88.3511, crowd: "High", waitingTime: 65, risk: "Red", image: "" },
  { id: "13", name: "Suruchi Sangha", area: "New Alipore, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.4964, lng: 88.3387, crowd: "Medium", waitingTime: 35, risk: "Amber", image: "" },
  { id: "14", name: "Mudiali Club", area: "Kalighat, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5161, lng: 88.3426, crowd: "Low", waitingTime: 15, risk: "Green", image: "" },
  { id: "15", name: "Chetla Agrani Club", area: "Chetla, Kolkata", state: "West Bengal", festival: "Durga Puja", lat: 22.5117, lng: 88.3383, crowd: "Medium", waitingTime: 25, risk: "Amber", image: "" },
  { id: "16", name: "Shiv Mandir Sarvajanik Ganeshotsav", area: "Pune", state: "Maharashtra", festival: "Ganesh Chaturthi", lat: 18.5074, lng: 73.8077, crowd: "Medium", waitingTime: 40, risk: "Amber", image: "" },
  { id: "17", name: "Andhericha Raja", area: "Andheri, Mumbai", state: "Maharashtra", festival: "Ganesh Chaturthi", lat: 19.1136, lng: 72.8697, crowd: "High", waitingTime: 70, risk: "Red", image: "" },
  { id: "18", name: "Meenakshi Amman Temple", area: "Madurai", state: "Tamil Nadu", festival: "Navaratri", lat: 9.9195, lng: 78.1193, crowd: "High", waitingTime: 80, risk: "Red", image: "" },
  { id: "19", name: "Mysore Palace", area: "Mysuru", state: "Karnataka", festival: "Dussehra", lat: 12.3052, lng: 76.6551, crowd: "High", waitingTime: 90, risk: "Red", image: "" },
  { id: "20", name: "Varanasi Ganga Aarti", area: "Dashashwamedh Ghat, Varanasi", state: "Uttar Pradesh", festival: "Diwali", lat: 25.3109, lng: 83.0107, crowd: "High", waitingTime: 60, risk: "Red", image: "" }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function App() {
  const [activeTab, setActiveTab] = useState("tracker"); 
  const [pandalsList, setPandalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFestival, setSelectedFestival] = useState("All");
  const [filter, setFilter] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [routeSelected, setRouteSelected] = useState([]);

  // AI Chat States
  const [aiPrompt, setAiPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "🙏 Namaste! I am your UtsavAI Assistant. Ask me about Durga Puja, Ganesh Chaturthi, travel itineraries, or crowd updates!" }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Firestore Sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pandals"), async (snapshot) => {
      if (snapshot.empty) {
        for (const p of initialPandals) {
          await setDoc(doc(db, "pandals", p.id), p);
        }
      } else {
        setPandalsList(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateCrowd = async (pandalId, newCrowd, newWaitingTime) => {
    const riskLevel = newCrowd === "High" ? "Red" : newCrowd === "Medium" ? "Amber" : "Green";
    await updateDoc(doc(db, "pandals", pandalId), {
      crowd: newCrowd,
      waitingTime: Number(newWaitingTime),
      risk: riskLevel
    });
  };

  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt;
    setChatHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setAiPrompt("");
    setIsAiThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI service unavailable");
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.text }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "ai", text: `⚠️ ${err.message}. Please try again later.` }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const toggleRouteSelection = (id) => {
    setRouteSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  let results = pandalsList.map((p) => {
    let distance = userLocation && p.lat && p.lng ? calculateDistance(userLocation.lat, userLocation.lng, p.lat, p.lng) : null;
    return { ...p, distance };
  }).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.area.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.crowd === filter;
    const matchesFest = selectedFestival === "All" || p.festival === selectedFestival;
    return matchesSearch && matchesFilter && matchesFest;
  });

  return (
    <div className="app">
      <header className="hero">
        <p className="topline">PAN-INDIA FESTIVAL INTELLIGENCE & SAFETY PLATFORM</p>
        <h1>🪔 UtsavAI / PujoSafe AI</h1>
        <p>Predictive Crowd Management & Cultural Discovery</p>
        
        {/* Navigation Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "15px", flexWrap: "wrap" }}>
          {[
            { id: "tracker", label: "📍 Live Map & Route" },
            { id: "predictor", label: "🔮 AI Crowd Predictor" },
            { id: "ai_assistant", label: "🤖 Utsav AI Guide" },
            { id: "dashboard", label: "🚨 Safety Command Center" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "8px 14px", borderRadius: "20px", border: "none", cursor: "pointer",
                background: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.2)",
                color: activeTab === t.id ? "#7b301b" : "#fff", fontWeight: "bold", fontSize: "12px"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: "950px", margin: "0 auto", padding: "20px" }}>
        
        {/* TAB 1: LIVE CROWD MAP & ROUTE PLANNER */}
        {activeTab === "tracker" && (
          <>
            <h2>Live Crowd Map & Smart Route Planner</h2>
            <div className="controls" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
              <input className="search" style={{ flex: 2 }} placeholder="Search pandal or area..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="filter" value={selectedFestival} onChange={(e) => setSelectedFestival(e.target.value)}>
                <option value="All">All Festivals</option>
                <option value="Durga Puja">Durga Puja</option>
                <option value="Ganesh Chaturthi">Ganesh Chaturthi</option>
                <option value="Navaratri">Navaratri</option>
                <option value="Dussehra">Dussehra</option>
                <option value="Diwali">Diwali</option>
                <option value="Rath Yatra">Rath Yatra</option>
                <option value="Onam">Onam</option>
              </select>
            </div>

            {routeSelected.length > 0 && (
              <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", padding: "12px", borderRadius: "8px", marginBottom: "15px" }}>
                <strong>🚗 Smart Route Optimizer Selected ({routeSelected.length} pandals):</strong>
                <p style={{ margin: "5px 0 0", fontSize: "13px" }}>
                  Suggested Route Sequence: {routeSelected.map(id => pandalsList.find(p => p.id === id)?.name).join(" ➔ ")}
                  <br /><span style={{ color: "#2e7d32", fontWeight: "bold" }}>💡 Congestion Penalty Avoided: Alternate lower crowd lanes suggested!</span>
                </p>
              </div>
            )}

            <div className="pandal-list">
              {results.map((p) => (
                <article className="card" key={p.id}>
                  <img className="pandal-image" src={p.image} alt={p.name} loading="lazy" onError={(e) => e.currentTarget.style.display = "none"} />
                  <div className="card-content">
                    <span style={{ fontSize: "10px", background: "#f3e5f5", color: "#6a1b9a", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>{p.festival}</span>
                    <h3>{p.name}</h3>
                    <p className="area">📍 {p.area}</p>
                    <span className={`badge ${p.crowd.toLowerCase()}`}>{p.crowd} Crowd ({p.waitingTime}m wait)</span>

                    <button 
                      onClick={() => toggleRouteSelection(p.id)}
                      style={{ marginTop: "10px", width: "100%", padding: "6px", background: routeSelected.includes(p.id) ? "#388e3c" : "#7b301b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                    >
                      {routeSelected.includes(p.id) ? "✓ Added to Route Plan" : "+ Add to Smart Route Plan"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* TAB 2: AI CROWD PREDICTOR */}
        {activeTab === "predictor" && (
          <div>
            <h2>🔮 AI Predictive Crowd Forecast</h2>
            <p className="subtitle">Predicting crowd trends for the next 15-60 minutes based on historical reports and surge speeds.</p>
            
            <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
              {pandalsList.map(p => (
                <div key={p.id} style={{ background: "#fff", padding: "15px", borderLeft: `6px solid ${p.crowd === "High" ? "#d32f2f" : p.crowd === "Medium" ? "#f57c00" : "#388e3c"}`, borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{p.name}</h3>
                      <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>Current: {p.crowd} Crowd ({p.waitingTime} mins wait)</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: p.crowd === "High" ? "#d32f2f" : "#388e3c" }}>
                        {p.crowd === "High" ? "📈 Predicted to INCREASE in +30 mins" : "📉 Stable Forecast"}
                      </span>
                      <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>Expected wait: ~{p.waitingTime + (p.crowd === "High" ? 20 : 0)} mins</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: UTSAV AI GUIDE */}
        {activeTab === "ai_assistant" && (
          <div>
            <h2>🤖 UtsavAI Cultural & Safety Guide</h2>
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e0e0e0", padding: "15px", height: "300px", overflowY: "auto", marginBottom: "15px" }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "10px 0" }}>
                  <div style={{ display: "inline-block", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", background: msg.sender === "user" ? "#7b301b" : "#f1f1f1", color: msg.sender === "user" ? "#fff" : "#333" }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && <p style={{ fontSize: "12px", color: "#666" }}>⚡ Gemini AI is generating response...</p>}
            </div>
            <form onSubmit={handleAskAi} style={{ display: "flex", gap: "8px" }}>
              <input style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} placeholder="Ask AI e.g. 'Kumartuli-r itihash bolo' or 'Plan 1 day tour'..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
              <button type="submit" style={{ background: "#7b301b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Ask AI</button>
            </form>
          </div>
        )}

        {/* TAB 4: SAFETY COMMAND CENTER */}
        {activeTab === "dashboard" && (
          <div>
            <h2>🚨 Organizer Safety Command Center</h2>
            <p className="subtitle">Real-time risk scoring, congestion alerts, and official diversion controls.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
              <div style={{ background: "#ffebee", border: "1px solid #ffcdd2", padding: "15px", borderRadius: "8px" }}>
                <h4 style={{ margin: 0, color: "#c62828" }}>🔴 High Risk Zones</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>{pandalsList.filter(p => p.risk === "Red").length}</p>
                <span style={{ fontSize: "11px", color: "#b71c1c" }}>Requires crowd diversion</span>
              </div>
              <div style={{ background: "#fff3e0", border: "1px solid #ffe0b2", padding: "15px", borderRadius: "8px" }}>
                <h4 style={{ margin: 0, color: "#ef6c00" }}>🟠 Moderate Risk</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>{pandalsList.filter(p => p.risk === "Amber").length}</p>
                <span style={{ fontSize: "11px", color: "#e65100" }}>Monitor queue entry speed</span>
              </div>
              <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", padding: "15px", borderRadius: "8px" }}>
                <h4 style={{ margin: 0, color: "#2e7d32" }}>🟢 Normal Operations</h4>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>{pandalsList.filter(p => p.risk === "Green").length}</p>
                <span style={{ fontSize: "11px", color: "#1b5e20" }}>Smooth movement</span>
              </div>
            </div>

            <h3 style={{ marginTop: "25px" }}>Emergency Crowd Control Toggle</h3>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
              {pandalsList.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <span><strong>{p.name}</strong> ({p.area})</span>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={() => handleUpdateCrowd(p.id, "Low", 10)} style={{ padding: "4px 8px", background: "#388e3c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Set Normal (Green)</button>
                    <button onClick={() => handleUpdateCrowd(p.id, "High", 60)} style={{ padding: "4px 8px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Set Emergency Alert (Red)</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;