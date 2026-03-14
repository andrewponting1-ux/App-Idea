import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(false);
  const [sparkles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 200,
      size: Math.random() * 10 + 6,
      delay: Math.random() * 2,
      duration: Math.random() * 1.5 + 1,
    }))
  );

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(true), 300);
    const doneTimer = setTimeout(() => onComplete(), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      overflow: "hidden",
      zIndex: 9999,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Baloo+2:wght@800&display=swap');
        @keyframes twinkle    { from { opacity: 0.2; } to { opacity: 1; } }
        @keyframes float      { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes sparkle    { 0%,100% { opacity:0; transform:scale(0); } 50% { opacity:1; transform:scale(1); } }
        @keyframes glow       { 0%,100% { filter: drop-shadow(0 0 10px #ffdd00) drop-shadow(0 0 20px #ff6600); } 50% { filter: drop-shadow(0 0 25px #ffdd00) drop-shadow(0 0 50px #ff6600) drop-shadow(0 0 80px #ff0066); } }
        @keyframes pulse      { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes slideIn    { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes loadFill   { from { width: 0%; } to { width: 100%; } }
        .logo-text { font-family: 'Fredoka One', 'Baloo 2', cursive; }
      `}</style>

      {/* Background gradient — only visible once faded in */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #0d0d2b 0%, #1a1040 40%, #0d1f3c 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease",
      }} />

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          background: "white",
          borderRadius: "50%",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: visible ? Math.random() * 0.8 + 0.2 : 0,
          transition: "opacity 1.2s ease",
          animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`,
        }} />
      ))}

      {/* Main content — fades and slides in */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, #1e1b4b 0%, #2d1b69 50%, #1e3a5f 100%)",
          borderRadius: 32,
          padding: "48px 60px",
          border: "3px solid rgba(255,200,50,0.4)",
          boxShadow: "0 0 60px rgba(255,150,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          position: "relative",
          maxWidth: 520,
          width: "90vw",
          animation: visible ? "slideIn 0.8s ease-out" : "none",
        }}>
          {/* Sparkle dots */}
          {sparkles.map(s => (
            <div key={s.id} style={{
              position: "absolute",
              left: s.x,
              top: s.y - 40,
              width: s.size,
              height: s.size,
              background: ["#FFD700","#FF6B6B","#4ECDC4","#A855F7","#FB923C"][s.id % 5],
              borderRadius: "50%",
              animation: `sparkle ${s.duration}s ${s.delay}s infinite`,
              pointerEvents: "none",
            }} />
          ))}

          {/* Crown + Shield icon */}
          <div style={{ textAlign: "center", marginBottom: 8, animation: "float 2.5s ease-in-out infinite" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: "glow 2s ease-in-out infinite" }}>
              <path d="M40 8 L68 20 L68 44 Q68 62 40 74 Q12 62 12 44 L12 20 Z"
                fill="url(#shieldGrad)" stroke="#FFD700" strokeWidth="2.5"/>
              <path d="M24 36 L24 28 L31 34 L40 22 L49 34 L56 28 L56 36 L52 36 L52 46 L28 46 L28 36 Z"
                fill="#FFD700" stroke="#FF8C00" strokeWidth="1.5"/>
              <circle cx="40" cy="52" r="7" fill="white" stroke="#333" strokeWidth="1.5"/>
              <circle cx="40" cy="52" r="4" fill="#FF4444" stroke="#333" strokeWidth="1"/>
              <circle cx="40" cy="52" r="1.5" fill="white"/>
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Main title */}
          <div style={{ textAlign: "center", animation: "pulse 2s ease-in-out infinite" }}>
            <div className="logo-text" style={{
              fontSize: 64,
              lineHeight: 1,
              background: "linear-gradient(180deg, #FFE566 0%, #FF9A00 50%, #FF4500 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: 2,
              display: "block",
              filter: "drop-shadow(0 4px 8px rgba(255,100,0,0.5))",
            }}>
              POCKET
            </div>
            <div className="logo-text" style={{
              fontSize: 72,
              lineHeight: 0.95,
              background: "linear-gradient(180deg, #ffffff 0%, #a5f3fc 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: 4,
              display: "block",
              filter: "drop-shadow(0 4px 12px rgba(56,189,248,0.6))",
            }}>
              CLASH
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            letterSpacing: 3,
            marginTop: 12,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}>
            Collect · Battle · Evolve · Conquer
          </div>

          {/* Badges */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 24,
            flexWrap: "wrap",
          }}>
            {[
              { emoji: "⚔️", label: "Clash",  color: "#FF6B35" },
              { emoji: "👑", label: "Royale", color: "#FFD700" },
              { emoji: "🔮", label: "PokéMon",color: "#FF4488" },
              { emoji: "🥚", label: "Tama",   color: "#4ECDC4" },
            ].map((b, i) => (
              <div key={i} style={{
                background: `${b.color}22`,
                border: `2px solid ${b.color}88`,
                borderRadius: 20,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <span style={{ fontSize: 14 }}>{b.emoji}</span>
                <span style={{ color: b.color, fontSize: 11, fontWeight: "bold", letterSpacing: 1 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading bar — fixed to bottom, always animating from mount */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "0 24px 36px",
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease 0.5s",
      }}>
        <div style={{
          height: 10,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 5,
          overflow: "hidden",
          border: "1px solid rgba(255,200,50,0.3)",
          boxShadow: "0 0 10px rgba(255,150,0,0.15)",
        }}>
          <div style={{
            height: "100%",
            borderRadius: 5,
            background: "linear-gradient(90deg, #FF4500, #FF9A00, #FFD700)",
            boxShadow: "0 0 8px rgba(255,180,0,0.6)",
            animation: "loadFill 5s linear forwards",
            width: "0%",
          }} />
        </div>
        <div style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
          letterSpacing: 3,
          marginTop: 10,
          fontFamily: "Georgia, serif",
        }}>
          LOADING...
        </div>
      </div>
    </div>
  );
}
