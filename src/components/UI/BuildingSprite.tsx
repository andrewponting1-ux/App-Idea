import { BuildingType } from '../../types';

export type BuildingState = 'idle' | 'selected' | 'ghost';

interface BuildingSpriteProps {
  type: BuildingType;
  level?: number;
  size?: number;
  state?: BuildingState;
}

let stylesInjected = false;
function injectBuildingStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes bldg-idle     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
    @keyframes bldg-crystal  { 0%,100%{opacity:0.72} 50%{opacity:1} }
    @keyframes bldg-magic    { 0%,100%{opacity:0.55} 50%{opacity:1} }
    @keyframes bldg-heartbeat{ 0%,100%{opacity:0.28} 50%{opacity:0.62} }
    @keyframes bldg-flame    { 0%,100%{opacity:0.9;transform:scaleY(1) translateY(0)} 50%{opacity:1;transform:scaleY(1.12) translateY(-1px)} }
    @keyframes bldg-smoke    { 0%{opacity:0.5;transform:translate(-1px,0) scale(0.8)} 50%{opacity:0.3;transform:translate(1px,-4px) scale(1)} 100%{opacity:0;transform:translate(-1px,-8px) scale(1.2)} }
  `;
  document.head.appendChild(s);
  stylesInjected = true;
}

const ANIM_DELAY: Record<BuildingType, string> = {
  nest: '0s',
  garden: '0.4s',
  arena: '0.8s',
  breeding_den: '1.2s',
  gem_mine: '1.6s',
  lab: '2.0s',
};

// ── SVG bodies (viewBox 0 0 100 100) ────────────────────────────────────────
// 3D convention: front face bright, right-side face 30-40% darker, top face slightly darker
// Buildings occupy roughly x=24-82, y=10-95 within the 100×100 viewBox

const NestSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="34" ry="6" fill="rgba(0,0,0,0.35)" />

    {/* Stone foundation – top face */}
    <polygon points="26,83 72,83 82,78 36,78" fill="#9a8a6a" />
    {/* Foundation – right side */}
    <polygon points="72,83 82,78 82,91 72,91" fill="#3a2a1a" />
    {/* Foundation – front face */}
    <rect x="26" y="83" width="46" height="8" rx="1" fill="#6a5040" />

    {/* Wall – right side (darker) */}
    <polygon points="72,36 82,31 82,78 72,83" fill="#5C3B1E" />
    {/* Wall – front face */}
    <rect x="26" y="36" width="46" height="47" fill="#8B5E3C" />
    {/* Wood planks hint on front */}
    <line x1="26" y1="52" x2="72" y2="52" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    <line x1="26" y1="68" x2="72" y2="68" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />

    {/* Roof – right side */}
    <polygon points="72,36 82,31 60,9 50,14" fill="#4a2810" />
    {/* Roof – front face */}
    <polygon points="26,36 72,36 50,14" fill="#7B4A2A" />
    {/* Roof ridge highlight */}
    <line x1="26" y1="36" x2="50" y2="14" stroke="#A0724A" strokeWidth="1.2" />

    {/* Chimney */}
    <rect x="59" y="12" width="9" height="22" rx="1" fill="#6B4226" />
    <rect x="57" y="10" width="13" height="5" rx="1" fill="#4a2c14" />
    {/* Smoke puffs */}
    <circle cx="64" cy="7" r="3.5" fill="rgba(210,210,210,0.45)"
      style={{ animation: 'bldg-smoke 2s ease-out 0.2s infinite' }} />
    <circle cx="62" cy="4" r="2.5" fill="rgba(210,210,210,0.3)"
      style={{ animation: 'bldg-smoke 2s ease-out 0.8s infinite' }} />

    {/* Door */}
    <rect x="39" y="57" width="15" height="26" rx="3" fill="#2a1508" />
    {/* Door arch */}
    <path d="M39,67 Q46.5,52 54,67" fill="#3a2010" />
    {/* Door knob */}
    <circle cx="52" cy="71" r="1.5" fill="#f5a623" />

    {/* Left window */}
    <rect x="28" y="43" width="11" height="10" rx="1" fill="#B0D8F0" />
    <line x1="33.5" y1="43" x2="33.5" y2="53" stroke="#7a9aaa" strokeWidth="0.8" />
    <line x1="28" y1="48" x2="39" y2="48" stroke="#7a9aaa" strokeWidth="0.8" />
    {/* Right window (front wall) */}
    <rect x="61" y="43" width="11" height="10" rx="1" fill="#B0D8F0" />
    <line x1="66.5" y1="43" x2="66.5" y2="53" stroke="#7a9aaa" strokeWidth="0.8" />
    <line x1="61" y1="48" x2="72" y2="48" stroke="#7a9aaa" strokeWidth="0.8" />

    {/* Heart emblem above door */}
    <path
      d="M47,53 C47,51 44,50 44,52.5 C44,54.5 47,57 47,57 C47,57 50,54.5 50,52.5 C50,50 47,51 47,53Z"
      fill="#f5a623"
    />
    {/* Ivy on wall corners */}
    <circle cx="29" cy="62" r="2.5" fill="#3d8020" opacity="0.7" />
    <circle cx="71" cy="60" r="2.5" fill="#3d8020" opacity="0.7" />
  </>
);

const GardenSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="38" ry="6" fill="rgba(0,0,0,0.3)" />

    {/* Fence posts */}
    <rect x="16" y="60" width="4" height="28" rx="1" fill="#7B4A2A" />
    <rect x="80" y="60" width="4" height="28" rx="1" fill="#7B4A2A" />
    <rect x="60" y="62" width="4" height="24" rx="1" fill="#7B4A2A" />
    <rect x="36" y="62" width="4" height="24" rx="1" fill="#7B4A2A" />
    {/* Fence rails */}
    <rect x="18" y="64" width="64" height="3" rx="1" fill="#A07040" />
    <rect x="18" y="73" width="64" height="3" rx="1" fill="#A07040" />

    {/* Soil patch – right side */}
    <polygon points="78,75 88,70 88,88 78,88" fill="#3a1808" />
    {/* Soil patch – front face */}
    <rect x="14" y="75" width="64" height="13" rx="2" fill="#5a2e10" />
    {/* Soil patch – top face */}
    <polygon points="14,75 78,75 88,70 24,70" fill="#6B4226" />
    {/* Soil texture on top */}
    <ellipse cx="50" cy="72" rx="30" ry="9" fill="#7a5030" />
    <ellipse cx="50" cy="72" rx="26" ry="7" fill="#8B5E3C" opacity="0.6" />

    {/* Plant 1 – left leafy bush */}
    <line x1="30" y1="71" x2="30" y2="48" stroke="#3a6018" strokeWidth="2" />
    <ellipse cx="30" cy="44" rx="9" ry="7" fill="#4CAF50" />
    <ellipse cx="23" cy="50" rx="6" ry="4" fill="#66BB6A"
      transform="rotate(-25 23 50)" />
    <ellipse cx="37" cy="50" rx="6" ry="4" fill="#66BB6A"
      transform="rotate(25 37 50)" />

    {/* Plant 2 – centre sunflower */}
    <line x1="50" y1="71" x2="50" y2="38" stroke="#3a6018" strokeWidth="2" />
    {/* Petals */}
    <ellipse cx="50" cy="29" rx="5" ry="4" fill="#FFF176" />
    <ellipse cx="50" cy="47" rx="5" ry="4" fill="#FFF176" />
    <ellipse cx="41" cy="38" rx="4" ry="5" fill="#FFF176" />
    <ellipse cx="59" cy="38" rx="4" ry="5" fill="#FFF176" />
    <ellipse cx="43" cy="31" rx="4" ry="5" fill="#FFEE58"
      transform="rotate(-45 43 31)" />
    <ellipse cx="57" cy="31" rx="4" ry="5" fill="#FFEE58"
      transform="rotate(45 57 31)" />
    <ellipse cx="43" cy="45" rx="4" ry="5" fill="#FFEE58"
      transform="rotate(45 43 45)" />
    <ellipse cx="57" cy="45" rx="4" ry="5" fill="#FFEE58"
      transform="rotate(-45 57 45)" />
    {/* Flower centre */}
    <circle cx="50" cy="38" r="7" fill="#F57F17" />
    <circle cx="50" cy="38" r="5" fill="#8B4513" />
    <circle cx="48" cy="36" r="1.5" fill="#6B3410" />
    <circle cx="52" cy="37" r="1.2" fill="#6B3410" />
    <circle cx="49" cy="40" r="1.2" fill="#6B3410" />

    {/* Plant 3 – right leafy bush */}
    <line x1="70" y1="71" x2="70" y2="48" stroke="#3a6018" strokeWidth="2" />
    <ellipse cx="70" cy="44" rx="9" ry="7" fill="#4CAF50" />
    <ellipse cx="63" cy="50" rx="6" ry="4" fill="#66BB6A"
      transform="rotate(-25 63 50)" />
    <ellipse cx="77" cy="50" rx="6" ry="4" fill="#66BB6A"
      transform="rotate(25 77 50)" />

    {/* Small mushrooms at soil edge */}
    <rect x="22" y="68" width="3" height="4" rx="0.5" fill="#ddd" />
    <ellipse cx="23.5" cy="68" rx="5" ry="3" fill="#e88" />
    <circle cx="22" cy="67" r="0.8" fill="white" />
    <circle cx="25" cy="66.5" r="0.8" fill="white" />
  </>
);

const ArenaSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="38" ry="6" fill="rgba(0,0,0,0.35)" />

    {/* Platform – right side */}
    <polygon points="78,62 88,57 88,90 78,90" fill="#3a3828" />
    {/* Platform – front face */}
    <rect x="14" y="62" width="64" height="28" rx="2" fill="#7A7060" />
    {/* Platform – top face */}
    <polygon points="14,62 78,62 88,57 24,57" fill="#9a9080" />
    {/* Stone block lines on front */}
    <line x1="14" y1="72" x2="78" y2="72" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <line x1="38" y1="62" x2="38" y2="90" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <line x1="62" y1="62" x2="62" y2="90" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />

    {/* Flag pole at back */}
    <rect x="82" y="18" width="3" height="44" rx="1" fill="#5C3B1E" />
    <polygon points="85,18 99,25 85,32" fill="#CC2200" />
    <line x1="85" y1="22" x2="96" y2="27" stroke="#aa1800" strokeWidth="0.5" />

    {/* Left torch post */}
    <rect x="19" y="28" width="4" height="35" rx="1" fill="#5C3B1E" />
    {/* Left torch base ring */}
    <rect x="17" y="56" width="8" height="4" rx="2" fill="#7B4A2A" />
    {/* Left flame */}
    <ellipse cx="21" cy="25" rx="5.5" ry="7" fill="#FF6B1A"
      style={{ animation: 'bldg-flame 0.75s ease-in-out infinite' }} />
    <ellipse cx="21" cy="24" rx="3" ry="5" fill="#FFD700"
      style={{ animation: 'bldg-flame 0.75s ease-in-out 0.1s infinite' }} />
    <ellipse cx="21" cy="23" rx="1.5" ry="3" fill="#FFF9C4"
      style={{ animation: 'bldg-flame 0.75s ease-in-out 0.2s infinite' }} />

    {/* Right torch post */}
    <rect x="77" y="28" width="4" height="35" rx="1" fill="#5C3B1E" />
    <rect x="75" y="56" width="8" height="4" rx="2" fill="#7B4A2A" />
    {/* Right flame */}
    <ellipse cx="79" cy="25" rx="5.5" ry="7" fill="#FF6B1A"
      style={{ animation: 'bldg-flame 0.75s ease-in-out 0.3s infinite' }} />
    <ellipse cx="79" cy="24" rx="3" ry="5" fill="#FFD700"
      style={{ animation: 'bldg-flame 0.75s ease-in-out 0.4s infinite' }} />
    <ellipse cx="79" cy="23" rx="1.5" ry="3" fill="#FFF9C4"
      style={{ animation: 'bldg-flame 0.75s ease-in-out 0.5s infinite' }} />

    {/* Shield emblem on platform */}
    <polygon points="50,44 62,50 58,66 50,70 42,66 38,50"
      fill="rgba(80,65,30,0.5)" stroke="#f5a623" strokeWidth="1.2" />
    {/* Sword 1 – diagonal left */}
    <rect x="42" y="35" width="3.5" height="30" rx="1" fill="#C0C0C8"
      transform="rotate(-28 43.75 50)" />
    <rect x="39" y="59" width="12" height="4" rx="1" fill="#8B5E3C"
      transform="rotate(-28 45 61)" />
    <circle cx="39" cy="38" r="3" fill="#f5a623"
      transform="rotate(-28 43.75 50)" />
    {/* Sword 2 – diagonal right */}
    <rect x="54.5" y="35" width="3.5" height="30" rx="1" fill="#C0C0C8"
      transform="rotate(28 56.25 50)" />
    <rect x="49" y="59" width="12" height="4" rx="1" fill="#8B5E3C"
      transform="rotate(28 55 61)" />
    <circle cx="61" cy="38" r="3" fill="#f5a623"
      transform="rotate(28 56.25 50)" />
  </>
);

const BreedingDenSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="34" ry="6" fill="rgba(0,0,0,0.35)" />

    {/* Earth base – right side */}
    <polygon points="74,78 84,73 84,91 74,91" fill="#2e1808" />
    {/* Earth base – front */}
    <rect x="18" y="78" width="56" height="13" rx="3" fill="#5a2e10" />
    {/* Earth base – top */}
    <polygon points="18,78 74,78 84,73 28,73" fill="#6B4226" />

    {/* Earth mound body */}
    <ellipse cx="48" cy="58" rx="34" ry="26" fill="#5a2e10" />
    <ellipse cx="48" cy="56" rx="32" ry="24" fill="#6B4226" />
    <ellipse cx="46" cy="54" rx="29" ry="22" fill="#7B5030" />

    {/* Log supports */}
    <rect x="22" y="54" width="7" height="30" rx="2" fill="#4a2810" />
    <rect x="72" y="54" width="7" height="30" rx="2" fill="#4a2810" />
    {/* Wood grain on logs */}
    <line x1="23" y1="62" x2="29" y2="62" stroke="#3a2008" strokeWidth="1" />
    <line x1="23" y1="70" x2="29" y2="70" stroke="#3a2008" strokeWidth="1" />
    <line x1="73" y1="62" x2="79" y2="62" stroke="#3a2008" strokeWidth="1" />

    {/* Beam over entrance */}
    <rect x="21" y="52" width="58" height="6" rx="2" fill="#5C3B1E" />

    {/* Cave entrance */}
    <ellipse cx="48" cy="72" rx="16" ry="13" fill="#1a0a05" />

    {/* Warm amber glow inside */}
    <ellipse cx="48" cy="74" rx="12" ry="9" fill="rgba(255,140,30,0.38)"
      style={{ animation: 'bldg-heartbeat 2.2s ease-in-out infinite' }} />

    {/* Heart carved on beam */}
    <path
      d="M46,54 C46,52 43,51.5 43,54 C43,56 46,58.5 46,58.5 C46,58.5 49,56 49,54 C49,51.5 46,52 46,54Z"
      fill="#ff6060"
    />

    {/* Left flowers */}
    <circle cx="24" cy="49" r="3.5" fill="#ff9090" />
    <circle cx="20" cy="53" r="2.5" fill="#ff7070" />
    <circle cx="28" cy="52" r="2.5" fill="#ff9060" />
    <circle cx="24" cy="49" r="2" fill="#fff0f0" />
    {/* Flower stem */}
    <line x1="24" y1="52" x2="24" y2="58" stroke="#4CAF50" strokeWidth="1.2" />
    <ellipse cx="21" cy="55" rx="4" ry="2.5" fill="#4CAF50" opacity="0.75"
      transform="rotate(-20 21 55)" />

    {/* Right flowers */}
    <circle cx="74" cy="49" r="3.5" fill="#ff9090" />
    <circle cx="70" cy="53" r="2.5" fill="#ff9060" />
    <circle cx="78" cy="52" r="2.5" fill="#ff7070" />
    <circle cx="74" cy="49" r="2" fill="#fff0f0" />
    <line x1="74" y1="52" x2="74" y2="58" stroke="#4CAF50" strokeWidth="1.2" />
    <ellipse cx="77" cy="55" rx="4" ry="2.5" fill="#4CAF50" opacity="0.75"
      transform="rotate(20 77 55)" />

    {/* Paw prints near entrance */}
    <circle cx="40" cy="85" r="1.5" fill="rgba(255,200,150,0.5)" />
    <circle cx="45" cy="87" r="1.5" fill="rgba(255,200,150,0.5)" />
    <circle cx="56" cy="86" r="1.5" fill="rgba(255,200,150,0.5)" />
  </>
);

const GemMineSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="34" ry="6" fill="rgba(0,0,0,0.35)" />

    {/* Rock base – right side */}
    <polygon points="74,74 84,69 84,90 74,90" fill="#1e1e1e" />
    {/* Rock base – front */}
    <rect x="18" y="74" width="56" height="16" rx="2" fill="#3a3a3a" />
    {/* Rock base – top */}
    <polygon points="18,74 74,74 84,69 28,69" fill="#4e4e4e" />

    {/* Rock face – right side */}
    <polygon points="74,18 84,13 84,69 74,74" fill="#1e1e1e" />
    {/* Rock face – front */}
    <rect x="18" y="18" width="56" height="56" fill="#3a3a3a" />
    {/* Rock texture cracks */}
    <path d="M28,28 L36,42 L30,58" fill="none" stroke="#2a2a2a" strokeWidth="1.8" />
    <path d="M56,22 L64,40 L58,62" fill="none" stroke="#2a2a2a" strokeWidth="1.5" />
    <path d="M22,50 L32,65" fill="none" stroke="#2a2a2a" strokeWidth="1.5" />

    {/* A-frame wooden supports */}
    <rect x="30" y="36" width="5.5" height="42" rx="1" fill="#7B4A2A"
      transform="rotate(-18 32.75 57)" />
    <rect x="64.5" y="36" width="5.5" height="42" rx="1" fill="#7B4A2A"
      transform="rotate(18 67.25 57)" />
    {/* Horizontal beam */}
    <rect x="27" y="32" width="46" height="6" rx="2" fill="#6B4226" />
    {/* Bolt/nail dots on beam */}
    <circle cx="32" cy="35" r="1.5" fill="#3a2010" />
    <circle cx="50" cy="35" r="1.5" fill="#3a2010" />
    <circle cx="68" cy="35" r="1.5" fill="#3a2010" />

    {/* Mine entrance */}
    <rect x="33" y="37" width="34" height="36" rx="3" fill="#141010" />

    {/* Rail tracks */}
    <line x1="36" y1="70" x2="64" y2="70" stroke="#7a7068" strokeWidth="2.2" />
    <line x1="36" y1="73" x2="64" y2="73" stroke="#7a7068" strokeWidth="2.2" />
    <line x1="39" y1="70" x2="39" y2="73" stroke="#7a7068" strokeWidth="1.2" />
    <line x1="47" y1="70" x2="47" y2="73" stroke="#7a7068" strokeWidth="1.2" />
    <line x1="55" y1="70" x2="55" y2="73" stroke="#7a7068" strokeWidth="1.2" />
    <line x1="63" y1="70" x2="63" y2="73" stroke="#7a7068" strokeWidth="1.2" />

    {/* Crystals inside mine (animated glow) */}
    <g style={{ animation: 'bldg-crystal 1.8s ease-in-out infinite' }}>
      {/* Crystal 1 – blue (left) */}
      <polygon points="40,70 37,52 43,52" fill="#64B5F6" />
      <polygon points="40,70 43,52 46,68" fill="#42A5F5" />
      <polygon points="39,55 37,52 43,52 41,55" fill="#90CAF9" />
      {/* Crystal 2 – purple (centre, tallest) */}
      <polygon points="50,70 46,42 54,42" fill="#9575CD" />
      <polygon points="50,70 54,42 57,67" fill="#7E57C2" />
      <polygon points="48,46 46,42 54,42 52,46" fill="#B39DDB" />
      {/* Crystal 3 – lavender (right) */}
      <polygon points="60,70 57,50 63,50" fill="#CE93D8" />
      <polygon points="60,70 63,50 65,68" fill="#BA68C8" />
      <polygon points="59,54 57,50 63,50 61,54" fill="#E1BEE7" />
    </g>

    {/* Pickaxe on wall */}
    <line x1="22" y1="60" x2="32" y2="48" stroke="#8B5E3C" strokeWidth="2" />
    <path d="M22,58 L17,53 L23,50 Z" fill="#9a9088" />
    <path d="M22,58 L25,64 L30,61 Z" fill="#9a9088" />

    {/* Crystal glow at top of entrance */}
    <circle cx="50" cy="36" r="4" fill="rgba(100,180,255,0.4)"
      style={{ animation: 'bldg-crystal 1.8s ease-in-out 0.5s infinite' }} />
  </>
);

const LabSVG = (
  <>
    {/* Ground shadow */}
    <ellipse cx="50" cy="96" rx="30" ry="6" fill="rgba(0,0,0,0.35)" />

    {/* Tower base – right side */}
    <polygon points="68,80 78,75 78,90 68,90" fill="#4a3a1a" />
    {/* Tower base – front */}
    <rect x="30" y="80" width="38" height="10" rx="1" fill="#7a6a4a" />
    {/* Tower base – top */}
    <polygon points="30,80 68,80 78,75 40,75" fill="#9a8a6a" />

    {/* Tower body – right side */}
    <polygon points="68,20 78,15 78,75 68,80" fill="#6a5a3a" />
    {/* Tower body – front */}
    <rect x="30" y="20" width="38" height="60" fill="#8D7B5A" />
    {/* Stonework horizontal lines */}
    <line x1="30" y1="33" x2="68" y2="33" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <line x1="30" y1="46" x2="68" y2="46" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <line x1="30" y1="59" x2="68" y2="59" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    <line x1="30" y1="72" x2="68" y2="72" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    {/* Vertical mortar line */}
    <line x1="49" y1="20" x2="49" y2="80" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />

    {/* Crenellations (battlements) */}
    <rect x="30" y="12" width="11" height="12" rx="1" fill="#8D7B5A" />
    <rect x="30" y="12" width="11" height="12" rx="1" stroke="#6a5a3a" strokeWidth="0.6" fill="none" />
    <rect x="44" y="12" width="11" height="12" rx="1" fill="#8D7B5A" />
    <rect x="57" y="12" width="11" height="12" rx="1" fill="#8D7B5A" />
    {/* Gaps between battlements (dark sky visible) */}
    <rect x="41" y="14" width="3" height="10" fill="rgba(0,0,0,0.45)" />
    <rect x="55" y="14" width="2" height="10" fill="rgba(0,0,0,0.45)" />

    {/* Arched windows with magic glow */}
    {/* Left window */}
    <rect x="33" y="47" width="11" height="15" rx="5" fill="#120830" />
    <ellipse cx="38.5" cy="52" rx="5" ry="7" fill="rgba(123,31,162,0.6)"
      style={{ animation: 'bldg-magic 2.5s ease-in-out infinite' }} />
    {/* Right window */}
    <rect x="55" y="47" width="11" height="15" rx="5" fill="#120830" />
    <ellipse cx="60.5" cy="52" rx="5" ry="7" fill="rgba(100,150,255,0.6)"
      style={{ animation: 'bldg-magic 2.5s ease-in-out 0.8s infinite' }} />
    {/* Lower window */}
    <rect x="42" y="64" width="14" height="12" rx="4" fill="#120830" />
    <ellipse cx="49" cy="70" rx="6" ry="5" fill="rgba(140,60,200,0.5)"
      style={{ animation: 'bldg-magic 2.5s ease-in-out 1.4s infinite' }} />

    {/* Magic orb staff / pedestal */}
    <rect x="46" y="12" width="5" height="6" rx="1" fill="#9a8a6a" />

    {/* Magic orb (above battlements) */}
    <g style={{ animation: 'bldg-magic 1.8s ease-in-out infinite' }}>
      <circle cx="49" cy="6" r="11" fill="rgba(100,130,255,0.25)" />
      <circle cx="49" cy="6" r="8" fill="#6A1B9A" />
      <circle cx="49" cy="6" r="6" fill="#8E24AA" />
      <circle cx="49" cy="6" r="4" fill="#AB47BC" />
      {/* Orb highlight */}
      <circle cx="46" cy="3.5" r="2" fill="rgba(255,255,255,0.45)" />
    </g>

    {/* Floating sparkles around orb */}
    <circle cx="40" cy="4" r="1.8" fill="#CE93D8" opacity="0.8"
      style={{ animation: 'bldg-magic 1.8s ease-in-out 0.3s infinite' }} />
    <circle cx="58" cy="5" r="1.5" fill="#90CAF9" opacity="0.8"
      style={{ animation: 'bldg-magic 1.8s ease-in-out 0.9s infinite' }} />
    <circle cx="55" cy="0" r="1.2" fill="#E1BEE7" opacity="0.7"
      style={{ animation: 'bldg-magic 1.8s ease-in-out 0.6s infinite' }} />
    <circle cx="43" cy="0" r="1.2" fill="#B3E5FC" opacity="0.7"
      style={{ animation: 'bldg-magic 1.8s ease-in-out 1.2s infinite' }} />
  </>
);

const BUILDING_SVGS: Record<BuildingType, JSX.Element> = {
  nest:          NestSVG,
  garden:        GardenSVG,
  arena:         ArenaSVG,
  breeding_den:  BreedingDenSVG,
  gem_mine:      GemMineSVG,
  lab:           LabSVG,
};

export default function BuildingSprite({
  type,
  size = 80,
  state = 'idle',
}: BuildingSpriteProps) {
  injectBuildingStyles();

  const isSelected = state === 'selected';
  const isGhost    = state === 'ghost';

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        animation: `bldg-idle 3s ease-in-out ${ANIM_DELAY[type]} infinite`,
        opacity: isGhost ? 0.62 : 1,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible',
          filter: isSelected
            ? 'drop-shadow(0 0 10px rgba(245,166,35,1)) drop-shadow(0 0 4px rgba(245,166,35,0.7))'
            : isGhost
            ? 'drop-shadow(0 0 10px rgba(100,180,255,0.9))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.65))',
        }}
      >
        {BUILDING_SVGS[type]}
      </svg>
    </div>
  );
}
