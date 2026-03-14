import React from 'react';
import { EvolutionVariant } from '../../types';

export type SpriteState = 'idle' | 'attack' | 'hurt' | 'victory';

interface PetSpriteProps {
  speciesId: string;
  stage?: string;
  size?: number;
  state?: SpriteState;
  flip?: boolean;
  className?: string;
  variant?: EvolutionVariant;
}

const VARIANT_FILTER: Record<EvolutionVariant, string> = {
  stellar: 'brightness(1.18) saturate(1.4) drop-shadow(0 0 7px rgba(255,210,40,0.65))',
  normal:  'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  feral:   'brightness(0.76) saturate(0.5) hue-rotate(-15deg) drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
};

function StellarOverlay() {
  return (
    <>
      <ellipse cx="50" cy="12" rx="20" ry="5" fill="rgba(255,215,0,0.28)" />
      <text x="16" y="22" fontSize="10" fill="#FFD700" opacity="0.9">★</text>
      <text x="73" y="19" fontSize="9"  fill="#FFD700" opacity="0.85">★</text>
      <text x="10" y="62" fontSize="8"  fill="#FFD700" opacity="0.7">✦</text>
      <text x="79" y="64" fontSize="8"  fill="#FFD700" opacity="0.7">✦</text>
    </>
  );
}

function FeralOverlay() {
  return (
    <>
      <line x1="36" y1="31" x2="44" y2="42" stroke="#8B0000" strokeWidth="2" opacity="0.75" strokeLinecap="round" />
      <line x1="44" y1="31" x2="36" y2="42" stroke="#8B0000" strokeWidth="2" opacity="0.75" strokeLinecap="round" />
      <line x1="56" y1="33" x2="62" y2="41" stroke="#6B0000" strokeWidth="1.4" opacity="0.6" strokeLinecap="round" />
    </>
  );
}

function Shadow() {
  return <ellipse cx="50" cy="114" rx="26" ry="6" fill="rgba(0,0,0,0.28)" />;
}

function EggSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-egg" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fffce0" />
          <stop offset="55%" stopColor="#f0d97a" />
          <stop offset="100%" stopColor="#b89830" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="73" rx="23" ry="28" fill="url(#rg-egg)" stroke="#a08820" strokeWidth="1.5" />
      <circle cx="43" cy="63" r="2.2" fill="rgba(140,110,20,0.35)" />
      <circle cx="58" cy="72" r="1.8" fill="rgba(140,110,20,0.35)" />
      <circle cx="46" cy="81" r="2" fill="rgba(140,110,20,0.35)" />
      <ellipse cx="40" cy="59" rx="9" ry="12" fill="rgba(255,255,255,0.28)" />
    </>
  );
}

function AquapupSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-aq-body" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#2d8fd4" />
          <stop offset="100%" stopColor="#1260a0" />
        </radialGradient>
        <radialGradient id="rg-aq-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#93e0ff" />
          <stop offset="55%" stopColor="#3ba5e8" />
          <stop offset="100%" stopColor="#1a6bb0" />
        </radialGradient>
      </defs>
      {/* Floppy ears */}
      <ellipse cx="29" cy="57" rx="11" ry="17" fill="#2d8fd4" stroke="#1260a0" strokeWidth="1" transform="rotate(-12 29 57)" />
      <ellipse cx="71" cy="57" rx="11" ry="17" fill="#2d8fd4" stroke="#1260a0" strokeWidth="1" transform="rotate(12 71 57)" />
      <ellipse cx="29" cy="58" rx="6.5" ry="11" fill="#5abfee" transform="rotate(-12 29 58)" />
      <ellipse cx="71" cy="58" rx="6.5" ry="11" fill="#5abfee" transform="rotate(12 71 58)" />
      {/* Body */}
      <ellipse cx="50" cy="88" rx="26" ry="22" fill="url(#rg-aq-body)" stroke="#1260a0" strokeWidth="1.5" />
      {/* Belly */}
      <ellipse cx="50" cy="90" rx="14" ry="14" fill="#93e0ff" opacity="0.5" />
      {/* Paws */}
      <ellipse cx="36" cy="106" rx="8" ry="5" fill="#2d8fd4" stroke="#1260a0" strokeWidth="1" />
      <ellipse cx="64" cy="106" rx="8" ry="5" fill="#2d8fd4" stroke="#1260a0" strokeWidth="1" />
      {/* Head */}
      <circle cx="50" cy="55" r="26" fill="url(#rg-aq-head)" stroke="#1260a0" strokeWidth="1.5" />
      {/* Snout */}
      <ellipse cx="50" cy="67" rx="11" ry="8" fill="#6ec6f0" />
      {/* Nose */}
      <ellipse cx="50" cy="61" rx="4.5" ry="3.5" fill="#0d4a7a" />
      {/* Eyes */}
      <circle cx="40" cy="51" r="7" fill="white" stroke="#0d4a7a" strokeWidth="0.5" />
      <circle cx="60" cy="51" r="7" fill="white" stroke="#0d4a7a" strokeWidth="0.5" />
      <circle cx="40.5" cy="51" r="5" fill="#1455a4" />
      <circle cx="60.5" cy="51" r="5" fill="#1455a4" />
      <circle cx="41" cy="51" r="3" fill="#051d3a" />
      <circle cx="61" cy="51" r="3" fill="#051d3a" />
      <circle cx="43" cy="49" r="1.5" fill="white" />
      <circle cx="63" cy="49" r="1.5" fill="white" />
      {/* Head highlight */}
      <ellipse cx="39" cy="43" rx="10" ry="8" fill="rgba(255,255,255,0.22)" />
      {/* Water drop on forehead */}
      <path d="M50 33 Q54 39 50 44 Q46 39 50 33" fill="#93e0ff" stroke="#5abfee" strokeWidth="0.5" />
    </>
  );
}

function LeafbearSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-lb-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="55%" stopColor="#22a855" />
          <stop offset="100%" stopColor="#0f6630" />
        </radialGradient>
        <radialGradient id="rg-lb-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#a7f3c0" />
          <stop offset="55%" stopColor="#34c068" />
          <stop offset="100%" stopColor="#147840" />
        </radialGradient>
      </defs>
      {/* Round ears */}
      <circle cx="31" cy="40" r="12" fill="#22a855" stroke="#0f6630" strokeWidth="1.5" />
      <circle cx="69" cy="40" r="12" fill="#22a855" stroke="#0f6630" strokeWidth="1.5" />
      <circle cx="31" cy="40" r="7" fill="#86efac" />
      <circle cx="69" cy="40" r="7" fill="#86efac" />
      {/* Body */}
      <ellipse cx="50" cy="87" rx="28" ry="24" fill="url(#rg-lb-body)" stroke="#0f6630" strokeWidth="1.5" />
      {/* Belly */}
      <ellipse cx="50" cy="91" rx="15" ry="16" fill="#a7f3c0" opacity="0.5" />
      {/* Paws */}
      <ellipse cx="35" cy="107" rx="9" ry="5.5" fill="#22a855" stroke="#0f6630" strokeWidth="1" />
      <ellipse cx="65" cy="107" rx="9" ry="5.5" fill="#22a855" stroke="#0f6630" strokeWidth="1" />
      {/* Head */}
      <circle cx="50" cy="56" r="25" fill="url(#rg-lb-head)" stroke="#0f6630" strokeWidth="1.5" />
      {/* Muzzle */}
      <ellipse cx="50" cy="67" rx="13" ry="10" fill="#34c068" />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="5" ry="4" fill="#063a1e" />
      {/* Eyes */}
      <circle cx="40" cy="53" r="7" fill="white" stroke="#063a1e" strokeWidth="0.5" />
      <circle cx="60" cy="53" r="7" fill="white" stroke="#063a1e" strokeWidth="0.5" />
      <circle cx="40" cy="53" r="5" fill="#5a3a1a" />
      <circle cx="60" cy="53" r="5" fill="#5a3a1a" />
      <circle cx="40" cy="53" r="3" fill="#1a0a00" />
      <circle cx="60" cy="53" r="3" fill="#1a0a00" />
      <circle cx="42" cy="51" r="1.5" fill="white" />
      <circle cx="62" cy="51" r="1.5" fill="white" />
      {/* Leaf marking on forehead */}
      <path d="M50 32 Q58 40 50 46 Q42 40 50 32" fill="#a7f3c0" opacity="0.65" />
      {/* Head highlight */}
      <ellipse cx="39" cy="45" rx="9" ry="7" fill="rgba(255,255,255,0.22)" />
    </>
  );
}

function FirefoxenSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-fx-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="55%" stopColor="#ea6820" />
          <stop offset="100%" stopColor="#9a2d00" />
        </radialGradient>
        <radialGradient id="rg-fx-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fcd4a0" />
          <stop offset="55%" stopColor="#f07a30" />
          <stop offset="100%" stopColor="#a83500" />
        </radialGradient>
      </defs>
      {/* Tail */}
      <path d="M72 95 Q90 80 88 60 Q90 50 82 48" fill="none" stroke="#9a2d00" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 95 Q90 80 88 60 Q90 50 82 48" fill="none" stroke="#ea6820" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M72 95 Q88 82 86 63 Q88 54 80 52" fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="47" r="9" fill="#fef08a" stroke="#e8b400" strokeWidth="1" />
      <circle cx="82" cy="47" r="5" fill="#fde047" />
      {/* Pointy ears */}
      <path d="M33 42 L27 22 L43 36 Z" fill="#ea6820" stroke="#9a2d00" strokeWidth="1.2" />
      <path d="M33 42 L30 28 L40 37 Z" fill="#fde8d0" />
      <path d="M61 40 L67 20 L51 35 Z" fill="#ea6820" stroke="#9a2d00" strokeWidth="1.2" />
      <path d="M61 40 L64 26 L54 36 Z" fill="#fde8d0" />
      {/* Body */}
      <ellipse cx="46" cy="88" rx="24" ry="22" fill="url(#rg-fx-body)" stroke="#9a2d00" strokeWidth="1.5" />
      {/* Chest */}
      <ellipse cx="46" cy="90" rx="12" ry="15" fill="#fde8d0" opacity="0.6" />
      {/* Paws */}
      <ellipse cx="33" cy="107" rx="8" ry="5" fill="#ea6820" stroke="#9a2d00" strokeWidth="1" />
      <ellipse cx="59" cy="107" rx="8" ry="5" fill="#ea6820" stroke="#9a2d00" strokeWidth="1" />
      {/* Head */}
      <circle cx="47" cy="54" r="25" fill="url(#rg-fx-head)" stroke="#9a2d00" strokeWidth="1.5" />
      {/* Muzzle */}
      <ellipse cx="47" cy="66" rx="12" ry="9" fill="#fde8d0" />
      {/* Nose */}
      <ellipse cx="47" cy="61" rx="4" ry="3" fill="#3d0f00" />
      {/* Eyes */}
      <circle cx="38" cy="50" r="7" fill="white" stroke="#3d0f00" strokeWidth="0.5" />
      <circle cx="57" cy="50" r="7" fill="white" stroke="#3d0f00" strokeWidth="0.5" />
      <circle cx="38" cy="50" r="5" fill="#d97a00" />
      <circle cx="57" cy="50" r="5" fill="#d97a00" />
      <circle cx="38" cy="50" r="3" fill="#1a0500" />
      <circle cx="57" cy="50" r="3" fill="#1a0500" />
      <circle cx="40" cy="48" r="1.5" fill="white" />
      <circle cx="59" cy="48" r="1.5" fill="white" />
      {/* Head highlight */}
      <ellipse cx="37" cy="43" rx="10" ry="8" fill="rgba(255,255,255,0.2)" />
    </>
  );
}

function ShockratSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-sr-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#e8b400" />
          <stop offset="100%" stopColor="#a07800" />
        </radialGradient>
        <radialGradient id="rg-sr-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="55%" stopColor="#f5c800" />
          <stop offset="100%" stopColor="#b08800" />
        </radialGradient>
      </defs>
      {/* Lightning tail */}
      <path d="M70 95 L82 75 L74 75 L86 55 L78 55 L92 35" fill="none" stroke="#a07800" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 95 L82 75 L74 75 L86 55 L78 55 L92 35" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Big round ears */}
      <circle cx="32" cy="38" r="14" fill="#e8b400" stroke="#a07800" strokeWidth="1.5" />
      <circle cx="32" cy="38" r="9" fill="#fef08a" />
      <circle cx="32" cy="38" r="6" fill="#f9a8d4" opacity="0.55" />
      <circle cx="68" cy="38" r="14" fill="#e8b400" stroke="#a07800" strokeWidth="1.5" />
      <circle cx="68" cy="38" r="9" fill="#fef08a" />
      <circle cx="68" cy="38" r="6" fill="#f9a8d4" opacity="0.55" />
      {/* Body */}
      <ellipse cx="46" cy="87" rx="22" ry="20" fill="url(#rg-sr-body)" stroke="#a07800" strokeWidth="1.5" />
      {/* White belly */}
      <ellipse cx="46" cy="90" rx="11" ry="13" fill="#fffde7" opacity="0.6" />
      {/* Paws */}
      <ellipse cx="34" cy="104" rx="7" ry="4.5" fill="#e8b400" stroke="#a07800" strokeWidth="1" />
      <ellipse cx="58" cy="104" rx="7" ry="4.5" fill="#e8b400" stroke="#a07800" strokeWidth="1" />
      {/* Head */}
      <circle cx="50" cy="57" r="23" fill="url(#rg-sr-head)" stroke="#a07800" strokeWidth="1.5" />
      {/* Snout */}
      <ellipse cx="50" cy="68" rx="10" ry="7" fill="#fef9c3" />
      {/* Nose */}
      <ellipse cx="50" cy="63" rx="3.5" ry="3" fill="#3a1a00" />
      {/* Eyes */}
      <circle cx="41" cy="53" r="6" fill="white" stroke="#3a1a00" strokeWidth="0.5" />
      <circle cx="59" cy="53" r="6" fill="white" stroke="#3a1a00" strokeWidth="0.5" />
      <circle cx="41" cy="53" r="4" fill="#1a0000" />
      <circle cx="59" cy="53" r="4" fill="#1a0000" />
      <circle cx="43" cy="51" r="1.5" fill="white" />
      <circle cx="61" cy="51" r="1.5" fill="white" />
      {/* Lightning bolt on forehead */}
      <path d="M52 36 L47 46 L51 46 L46 56 L55 44 L51 44 Z" fill="#fef08a" stroke="#a07800" strokeWidth="0.5" />
      {/* Highlight */}
      <ellipse cx="40" cy="47" rx="9" ry="7" fill="rgba(255,255,255,0.2)" />
    </>
  );
}

function StormeagleSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-se-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="55%" stopColor="#4a7fb5" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </radialGradient>
        <radialGradient id="rg-se-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="55%" stopColor="#5a8fc8" />
          <stop offset="100%" stopColor="#243f6a" />
        </radialGradient>
      </defs>
      {/* Wings */}
      <path d="M14 72 Q3 55 6 38 Q18 36 28 60 Z" fill="#4a7fb5" stroke="#1e3a5f" strokeWidth="1.2" />
      <path d="M14 72 Q5 57 9 43 Q18 43 26 62 Z" fill="#93c5fd" opacity="0.45" />
      <path d="M86 72 Q97 55 94 38 Q82 36 72 60 Z" fill="#4a7fb5" stroke="#1e3a5f" strokeWidth="1.2" />
      <path d="M86 72 Q95 57 91 43 Q82 43 74 62 Z" fill="#93c5fd" opacity="0.45" />
      {/* Body */}
      <ellipse cx="50" cy="85" rx="22" ry="20" fill="url(#rg-se-body)" stroke="#1e3a5f" strokeWidth="1.5" />
      {/* Chest feathers */}
      <ellipse cx="50" cy="88" rx="13" ry="16" fill="#e0f2ff" opacity="0.5" />
      {/* Talons */}
      <path d="M38 104 Q34 110 30 113 M38 104 Q36 113 34 116 M38 104 Q38 113 37 117 M38 104 Q40 113 42 116" stroke="#8a6a00" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 104 Q66 110 70 113 M62 104 Q64 113 66 116 M62 104 Q62 113 63 117 M62 104 Q60 113 58 116" stroke="#8a6a00" strokeWidth="2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="50" cy="55" r="22" fill="url(#rg-se-head)" stroke="#1e3a5f" strokeWidth="1.5" />
      {/* White crown */}
      <ellipse cx="50" cy="44" rx="16" ry="12" fill="white" opacity="0.65" />
      {/* Beak */}
      <path d="M42 66 L50 74 L58 66 Q50 69 42 66 Z" fill="#e8a500" stroke="#a07000" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="38" cy="53" r="8" fill="#fef3c7" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="62" cy="53" r="8" fill="#fef3c7" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="38" cy="53" r="6" fill="#d97706" />
      <circle cx="62" cy="53" r="6" fill="#d97706" />
      <circle cx="38" cy="53" r="4" fill="#1a0000" />
      <circle cx="62" cy="53" r="4" fill="#1a0000" />
      <circle cx="40" cy="51" r="2" fill="white" />
      <circle cx="64" cy="51" r="2" fill="white" />
      {/* Head highlight */}
      <ellipse cx="39" cy="44" rx="9" ry="7" fill="rgba(255,255,255,0.25)" />
    </>
  );
}

function StonedrakSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-sd-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#d4b896" />
          <stop offset="55%" stopColor="#8b6840" />
          <stop offset="100%" stopColor="#4a3018" />
        </radialGradient>
        <radialGradient id="rg-sd-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#e8cfa8" />
          <stop offset="55%" stopColor="#a07848" />
          <stop offset="100%" stopColor="#5a3820" />
        </radialGradient>
      </defs>
      {/* Back spikes */}
      <path d="M34 62 L30 44 L38 60 Z" fill="#6a4828" stroke="#4a3018" strokeWidth="1" />
      <path d="M44 55 L42 37 L50 53 Z" fill="#6a4828" stroke="#4a3018" strokeWidth="1" />
      <path d="M56 55 L58 37 L50 53 Z" fill="#6a4828" stroke="#4a3018" strokeWidth="1" />
      <path d="M66 62 L70 44 L62 60 Z" fill="#6a4828" stroke="#4a3018" strokeWidth="1" />
      {/* Body */}
      <ellipse cx="50" cy="87" rx="30" ry="24" fill="url(#rg-sd-body)" stroke="#4a3018" strokeWidth="1.5" />
      {/* Belly plates */}
      <ellipse cx="50" cy="90" rx="18" ry="18" fill="#d4b896" opacity="0.45" />
      <path d="M36 83 Q50 78 64 83 Q64 96 50 101 Q36 96 36 83 Z" fill="#c8a878" opacity="0.35" />
      {/* Small arms */}
      <ellipse cx="24" cy="84" rx="8" ry="10" fill="#8b6840" stroke="#4a3018" strokeWidth="1" transform="rotate(20 24 84)" />
      <ellipse cx="76" cy="84" rx="8" ry="10" fill="#8b6840" stroke="#4a3018" strokeWidth="1" transform="rotate(-20 76 84)" />
      {/* Stubby legs */}
      <ellipse cx="37" cy="108" rx="10" ry="6" fill="#8b6840" stroke="#4a3018" strokeWidth="1" />
      <ellipse cx="63" cy="108" rx="10" ry="6" fill="#8b6840" stroke="#4a3018" strokeWidth="1" />
      {/* Head */}
      <ellipse cx="50" cy="57" rx="22" ry="19" fill="url(#rg-sd-head)" stroke="#4a3018" strokeWidth="1.5" />
      {/* Snout */}
      <ellipse cx="50" cy="68" rx="14" ry="9" fill="#c8a878" />
      {/* Nostrils */}
      <circle cx="45" cy="67" r="2" fill="#3a1800" />
      <circle cx="55" cy="67" r="2" fill="#3a1800" />
      {/* Eyes */}
      <ellipse cx="38" cy="54" rx="6" ry="5" fill="white" stroke="#3a1800" strokeWidth="0.5" />
      <ellipse cx="62" cy="54" rx="6" ry="5" fill="white" stroke="#3a1800" strokeWidth="0.5" />
      <ellipse cx="38" cy="54" rx="4" ry="3.5" fill="#6a3800" />
      <ellipse cx="62" cy="54" rx="4" ry="3.5" fill="#6a3800" />
      <ellipse cx="38" cy="54" rx="2.5" ry="2.5" fill="#1a0800" />
      <ellipse cx="62" cy="54" rx="2.5" ry="2.5" fill="#1a0800" />
      <circle cx="40" cy="52" r="1.5" fill="white" />
      <circle cx="64" cy="52" r="1.5" fill="white" />
      {/* Head highlight */}
      <ellipse cx="38" cy="46" rx="9" ry="7" fill="rgba(255,255,255,0.2)" />
    </>
  );
}

function ShadowcatSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-sc-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#7c4fa0" />
          <stop offset="55%" stopColor="#3b1260" />
          <stop offset="100%" stopColor="#1a0030" />
        </radialGradient>
        <radialGradient id="rg-sc-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#9b6ec0" />
          <stop offset="55%" stopColor="#4a1878" />
          <stop offset="100%" stopColor="#200040" />
        </radialGradient>
      </defs>
      {/* Tail */}
      <path d="M72 95 Q92 85 93 68 Q95 52 84 47" fill="none" stroke="#1a0030" strokeWidth="9" strokeLinecap="round" />
      <path d="M72 95 Q92 85 93 68 Q95 52 84 47" fill="none" stroke="#7c4fa0" strokeWidth="5" strokeLinecap="round" />
      {/* Cat ears */}
      <path d="M31 44 L24 23 L43 38 Z" fill="#3b1260" stroke="#1a0030" strokeWidth="1.2" />
      <path d="M31 44 L28 30 L39 39 Z" fill="#7c4fa0" />
      <path d="M63 42 L70 21 L52 38 Z" fill="#3b1260" stroke="#1a0030" strokeWidth="1.2" />
      <path d="M63 42 L67 28 L56 38 Z" fill="#7c4fa0" />
      {/* Body */}
      <ellipse cx="47" cy="87" rx="24" ry="21" fill="url(#rg-sc-body)" stroke="#1a0030" strokeWidth="1.5" />
      {/* Dark stripes */}
      <path d="M36 80 Q47 75 64 80" stroke="rgba(26,0,48,0.55)" strokeWidth="2.5" fill="none" />
      <path d="M36 88 Q47 83 64 88" stroke="rgba(26,0,48,0.55)" strokeWidth="2.5" fill="none" />
      {/* Paws */}
      <ellipse cx="34" cy="106" rx="8" ry="5" fill="#3b1260" stroke="#1a0030" strokeWidth="1" />
      <ellipse cx="60" cy="106" rx="8" ry="5" fill="#3b1260" stroke="#1a0030" strokeWidth="1" />
      {/* Head */}
      <circle cx="47" cy="53" r="24" fill="url(#rg-sc-head)" stroke="#1a0030" strokeWidth="1.5" />
      {/* Muzzle */}
      <ellipse cx="47" cy="64" rx="11" ry="8" fill="#4a1878" />
      {/* Nose */}
      <path d="M44 60 Q47 58 50 60 Q47 63 44 60 Z" fill="#ff69b4" />
      {/* Glowing purple eyes */}
      <circle cx="37" cy="49" r="9" fill="rgba(168,85,247,0.2)" />
      <circle cx="57" cy="49" r="9" fill="rgba(168,85,247,0.2)" />
      <circle cx="37" cy="49" r="7" fill="#200040" />
      <circle cx="57" cy="49" r="7" fill="#200040" />
      <ellipse cx="37" cy="49" rx="4" ry="6" fill="#a855f7" />
      <ellipse cx="57" cy="49" rx="4" ry="6" fill="#a855f7" />
      <circle cx="37" cy="49" r="2.5" fill="white" opacity="0.9" />
      <circle cx="57" cy="49" r="2.5" fill="white" opacity="0.9" />
      {/* Head highlight */}
      <ellipse cx="37" cy="41" rx="9" ry="7" fill="rgba(255,255,255,0.15)" />
    </>
  );
}

function LunabunSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-lu-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="55%" stopColor="#c8e8ff" />
          <stop offset="100%" stopColor="#7ec0ea" />
        </radialGradient>
        <radialGradient id="rg-lu-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#ddf0ff" />
          <stop offset="100%" stopColor="#92ccf0" />
        </radialGradient>
      </defs>
      {/* Long bunny ears */}
      <ellipse cx="34" cy="30" rx="9" ry="24" fill="#c8e8ff" stroke="#7ec0ea" strokeWidth="1.2" />
      <ellipse cx="66" cy="30" rx="9" ry="24" fill="#c8e8ff" stroke="#7ec0ea" strokeWidth="1.2" />
      <ellipse cx="34" cy="30" rx="5.5" ry="18" fill="#fcc2e8" />
      <ellipse cx="66" cy="30" rx="5.5" ry="18" fill="#fcc2e8" />
      {/* Body */}
      <ellipse cx="50" cy="88" rx="26" ry="22" fill="url(#rg-lu-body)" stroke="#7ec0ea" strokeWidth="1.5" />
      {/* Star belly */}
      <path d="M50 82 L52 88 L58 88 L53 92 L55 98 L50 94 L45 98 L47 92 L42 88 L48 88 Z" fill="#fef9c3" opacity="0.8" />
      {/* Paws */}
      <ellipse cx="35" cy="107" rx="8" ry="5" fill="#c8e8ff" stroke="#7ec0ea" strokeWidth="1" />
      <ellipse cx="65" cy="107" rx="8" ry="5" fill="#c8e8ff" stroke="#7ec0ea" strokeWidth="1" />
      {/* Head */}
      <circle cx="50" cy="57" r="24" fill="url(#rg-lu-head)" stroke="#7ec0ea" strokeWidth="1.5" />
      {/* Cheek blush */}
      <circle cx="37" cy="62" r="7" fill="#fca5a5" opacity="0.35" />
      <circle cx="63" cy="62" r="7" fill="#fca5a5" opacity="0.35" />
      {/* Snout */}
      <ellipse cx="50" cy="67" rx="11" ry="8" fill="#ddf0ff" />
      {/* Nose */}
      <path d="M47 63 Q50 61 53 63 Q50 66 47 63 Z" fill="#fca5a5" />
      {/* Eyes */}
      <circle cx="40" cy="53" r="7" fill="white" stroke="#7ec0ea" strokeWidth="0.5" />
      <circle cx="60" cy="53" r="7" fill="white" stroke="#7ec0ea" strokeWidth="0.5" />
      <circle cx="40" cy="53" r="5" fill="#38bdf8" />
      <circle cx="60" cy="53" r="5" fill="#38bdf8" />
      <circle cx="40" cy="53" r="3" fill="#075985" />
      <circle cx="60" cy="53" r="3" fill="#075985" />
      <circle cx="42" cy="51" r="1.5" fill="white" />
      <circle cx="62" cy="51" r="1.5" fill="white" />
      <circle cx="43.5" cy="52.5" r="0.8" fill="white" />
      <circle cx="63.5" cy="52.5" r="0.8" fill="white" />
      {/* Stars around head */}
      <path d="M20 45 L21 48 L24 48 L21.5 50 L22.5 53 L20 51 L17.5 53 L18.5 50 L16 48 L19 48 Z" fill="#fef08a" opacity="0.8" />
      <path d="M80 38 L81 41 L84 41 L81.5 43 L82.5 46 L80 44 L77.5 46 L78.5 43 L76 41 L79 41 Z" fill="#fef08a" opacity="0.8" />
      {/* Head highlight */}
      <ellipse cx="39" cy="45" rx="10" ry="8" fill="rgba(255,255,255,0.35)" />
    </>
  );
}

function VoidwyrmSprite() {
  return (
    <>
      <Shadow />
      <defs>
        <radialGradient id="rg-vw-body" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#6b2fa0" />
          <stop offset="50%" stopColor="#2d0f4a" />
          <stop offset="100%" stopColor="#0d0018" />
        </radialGradient>
        <radialGradient id="rg-vw-head" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#8040c0" />
          <stop offset="50%" stopColor="#380d60" />
          <stop offset="100%" stopColor="#100020" />
        </radialGradient>
      </defs>
      {/* Wings */}
      <path d="M15 75 Q2 55 5 34 Q16 24 29 48 Q22 60 20 75 Z" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1.5" />
      <path d="M15 75 Q4 57 8 40 Q16 32 26 52 Z" fill="#6b2fa0" opacity="0.4" />
      <path d="M8 40 L22 62 M12 52 L24 65" stroke="#6b2fa0" strokeWidth="1" opacity="0.6" />
      <path d="M85 75 Q98 55 95 34 Q84 24 71 48 Q78 60 80 75 Z" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1.5" />
      <path d="M85 75 Q96 57 92 40 Q84 32 74 52 Z" fill="#6b2fa0" opacity="0.4" />
      <path d="M92 40 L78 62 M88 52 L76 65" stroke="#6b2fa0" strokeWidth="1" opacity="0.6" />
      {/* Body */}
      <ellipse cx="50" cy="85" rx="25" ry="22" fill="url(#rg-vw-body)" stroke="#0d0018" strokeWidth="1.5" />
      {/* Belly scales */}
      <ellipse cx="50" cy="88" rx="14" ry="17" fill="#380d60" opacity="0.5" />
      <path d="M40 82 Q50 78 60 82 Q58 90 50 93 Q42 90 40 82 Z" fill="#6b2fa0" opacity="0.3" />
      {/* Tail */}
      <path d="M70 98 Q86 108 89 119" stroke="#2d0f4a" strokeWidth="9" strokeLinecap="round" />
      <path d="M70 98 Q86 108 89 119" stroke="#6b2fa0" strokeWidth="5" strokeLinecap="round" />
      {/* Legs */}
      <ellipse cx="36" cy="105" rx="10" ry="6" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1" />
      <ellipse cx="64" cy="105" rx="10" ry="6" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1" />
      {/* Claws */}
      <path d="M30 109 L27 115 M34 110 L33 116 M38 110 L38 116" stroke="#0d0018" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 109 L55 115 M62 110 L61 116 M66 110 L67 116" stroke="#0d0018" strokeWidth="1.5" strokeLinecap="round" />
      {/* Horns */}
      <path d="M40 38 L34 18 L43 35 Z" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1.2" />
      <path d="M60 38 L66 18 L57 35 Z" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1.2" />
      {/* Head */}
      <ellipse cx="50" cy="53" rx="23" ry="20" fill="url(#rg-vw-head)" stroke="#0d0018" strokeWidth="1.5" />
      {/* Snout */}
      <path d="M36 62 L50 74 L64 62 Z" fill="#2d0f4a" stroke="#0d0018" strokeWidth="1" />
      <ellipse cx="50" cy="65" rx="12" ry="7" fill="#380d60" />
      {/* Nostrils with void glow */}
      <circle cx="44" cy="64" r="2.5" fill="#0d0018" />
      <circle cx="56" cy="64" r="2.5" fill="#0d0018" />
      <circle cx="44" cy="60" r="3.5" fill="rgba(168,85,247,0.3)" />
      <circle cx="56" cy="60" r="3.5" fill="rgba(168,85,247,0.3)" />
      {/* Fierce eyes */}
      <ellipse cx="39" cy="49" rx="10" ry="8" fill="rgba(168,85,247,0.15)" />
      <ellipse cx="61" cy="49" rx="10" ry="8" fill="rgba(168,85,247,0.15)" />
      <ellipse cx="39" cy="49" rx="7" ry="6" fill="#0d0018" />
      <ellipse cx="61" cy="49" rx="7" ry="6" fill="#0d0018" />
      <ellipse cx="39" cy="49" rx="5" ry="4" fill="#dc2626" />
      <ellipse cx="61" cy="49" rx="5" ry="4" fill="#dc2626" />
      <ellipse cx="39" cy="49" rx="2.5" ry="4" fill="#fef08a" />
      <ellipse cx="61" cy="49" rx="2.5" ry="4" fill="#fef08a" />
      <circle cx="39" cy="49" r="1.5" fill="white" />
      <circle cx="61" cy="49" r="1.5" fill="white" />
      {/* Head highlight */}
      <ellipse cx="38" cy="42" rx="9" ry="7" fill="rgba(255,255,255,0.12)" />
    </>
  );
}

const SPRITE_MAP: Record<string, React.ReactNode> = {
  aquapup: <AquapupSprite />,
  leafbear: <LeafbearSprite />,
  firefoxen: <FirefoxenSprite />,
  shockrat: <ShockratSprite />,
  stormeagle: <StormeagleSprite />,
  stonedrak: <StonedrakSprite />,
  shadowcat: <ShadowcatSprite />,
  lunabun: <LunabunSprite />,
  voidwyrm: <VoidwyrmSprite />,
};

const STAGE_SCALE: Record<string, number> = {
  egg: 0.72,
  baby: 0.82,
  teen: 0.92,
  adult: 1.0,
  elder: 1.0,
};

const ANIM_CLASS: Record<SpriteState, string> = {
  idle: 'animate-sprite-idle',
  attack: 'animate-sprite-attack',
  hurt: 'animate-sprite-hurt',
  victory: 'animate-sprite-victory',
};

export default function PetSprite({
  speciesId,
  stage = 'adult',
  size = 80,
  state = 'idle',
  flip = false,
  className = '',
  variant,
}: PetSpriteProps) {
  const isEgg = stage === 'egg';
  const spriteContent = isEgg ? <EggSprite /> : (SPRITE_MAP[speciesId] ?? <EggSprite />);
  const stageScale = STAGE_SCALE[stage] ?? 1.0;
  const effectiveSize = Math.round(size * stageScale);
  const svgFilter = variant ? VARIANT_FILTER[variant] : VARIANT_FILTER.normal;

  return (
    <div
      className={`inline-flex items-end justify-center ${ANIM_CLASS[state]} ${className}`}
      style={{
        width: size,
        height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 100 120"
        width={effectiveSize}
        height={effectiveSize}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', filter: svgFilter }}
      >
        {spriteContent}
        {variant === 'stellar' && <StellarOverlay />}
        {variant === 'feral'   && <FeralOverlay />}
      </svg>
    </div>
  );
}
