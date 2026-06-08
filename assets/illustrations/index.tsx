import React from 'react';
import Svg, { Path, Circle, Rect, G, Line, Text as SvgText, Ellipse } from 'react-native-svg';

// Onboarding illustration - two people greeting
export const IlluOnboarding = ({ width = 200, height = 180 }) => (
  <Svg width={width} height={height} viewBox="0 0 200 180">
    {/* Gray background circle */}
    <Ellipse cx="100" cy="120" rx="80" ry="40" fill="#C8C8C8" opacity="0.3" />

    {/* Left person - black */}
    <G>
      {/* Head */}
      <Circle cx="65" cy="40" r="18" fill="#111111" />
      {/* Hair */}
      <Path d="M 65 22 Q 75 20 80 30" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <Path d="M 65 58 L 65 95" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arm left */}
      <Path d="M 65 70 L 45 80" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arm right */}
      <Path d="M 65 70 L 85 80" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pants/legs */}
      <Path d="M 62 95 L 55 130" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 68 95 L 75 130" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Smile */}
      <Path d="M 63 45 Q 65 48 67 45" stroke="#111111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </G>

    {/* Right person - with green accent */}
    <G>
      {/* Head */}
      <Circle cx="135" cy="45" r="18" fill="#111111" />
      {/* Hair */}
      <Path d="M 135 27 Q 145 25 150 35" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Body - green shirt */}
      <Rect x="120" y="63" width="30" height="25" fill="#1DB886" rx="4" />
      {/* Arm left */}
      <Path d="M 120 75 L 100 85" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arm right */}
      <Path d="M 150 75 L 170 85" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <Path d="M 132 88 L 125 130" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 138 88 L 145 130" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyes happy */}
      <Circle cx="131" cy="43" r="1.5" fill="#111111" />
      <Circle cx="139" cy="43" r="1.5" fill="#111111" />
    </G>
  </Svg>
);

// Recruiter illustration - woman with laptop and resume
export const IlluRecruiter = ({ width = 200, height = 180 }) => (
  <Svg width={width} height={height} viewBox="0 0 200 180">
    {/* Woman sitting */}
    <G>
      {/* Head */}
      <Circle cx="100" cy="35" r="16" fill="#111111" />
      {/* Hair wavy */}
      <Path d="M 100 19 Q 110 15 115 22" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M 100 19 Q 90 15 85 22" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body - white shirt */}
      <Rect x="85" y="51" width="30" height="35" fill="#FFFFFF" stroke="#111111" strokeWidth="2" rx="3" />
      {/* Left arm with document */}
      <Path d="M 85 60 L 70 75" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right arm on laptop */}
      <Path d="M 115 65 L 130 85" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Laptop */}
    <G>
      <Rect x="110" y="85" width="55" height="40" fill="#111111" rx="2" />
      <Rect x="112" y="87" width="51" height="30" fill="#1DB886" rx="1" />
      <Rect x="110" y="125" width="55" height="3" fill="#111111" />
    </G>

    {/* Resume/Document */}
    <G>
      <Rect x="55" y="65" width="20" height="28" fill="#FFFFFF" stroke="#111111" strokeWidth="2" rx="2" />
      <Circle cx="62" cy="72" r="2.5" fill="#111111" />
      <Line x1="60" y1="78" x2="70" y2="78" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="60" y1="82" x2="70" y2="82" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="60" y1="86" x2="70" y2="86" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
    </G>

    {/* Green accent dot */}
    <Circle cx="165" cy="60" r="8" fill="#1DB886" />
  </Svg>
);

// Resume illustration - hand holding document with checkmark
export const IlluResume = ({ width = 180, height = 160 }) => (
  <Svg width={width} height={height} viewBox="0 0 180 160">
    {/* Hand */}
    <G>
      {/* Arm */}
      <Path d="M 30 100 L 30 50" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Palm */}
      <Rect x="22" y="50" width="16" height="18" fill="#111111" rx="2" />
      {/* Fingers */}
      <Path d="M 25 50 L 25 35" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 30 50 L 30 32" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 35 50 L 35 35" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Resume document */}
    <G>
      <Rect x="55" y="40" width="35" height="50" fill="#FFFFFF" stroke="#111111" strokeWidth="2" rx="3" />
      {/* Profile icon */}
      <Circle cx="72" cy="50" r="4" fill="#111111" />
      {/* Text lines */}
      <Line x1="62" y1="58" x2="82" y2="58" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="62" y1="63" x2="82" y2="63" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="62" y1="68" x2="82" y2="68" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="62" y1="73" x2="75" y2="73" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
    </G>

    {/* Green checkmark */}
    <G>
      <Circle cx="130" cy="70" r="12" fill="#1DB886" />
      <Path d="M 125 70 L 128 73 L 135 66" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>

    {/* Pen on left */}
    <G>
      <Rect x="12" y="95" width="2" height="20" fill="#7AE04A" transform="rotate(-45 13 105)" />
      <Circle cx="8" cy="110" r="2.5" fill="#111111" />
    </G>
  </Svg>
);

// Profile illustration - person holding profile card
export const IlluProfile = ({ width = 180, height = 160 }) => (
  <Svg width={width} height={height} viewBox="0 0 180 160">
    {/* Person - black */}
    <G>
      {/* Head */}
      <Circle cx="50" cy="35" r="14" fill="#111111" />
      {/* Hair */}
      <Path d="M 50 21 Q 58 18 62 25" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <Path d="M 50 49 L 50 85" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arms holding card */}
      <Path d="M 50 60 L 25 70" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 50 60 L 75 70" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <Path d="M 47 85 L 42 120" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 53 85 L 58 120" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Large profile card being held */}
    <G>
      <Rect x="70" y="65" width="50" height="65" fill="#7AE04A" stroke="#111111" strokeWidth="2" rx="4" />
      {/* Profile icon */}
      <Circle cx="95" cy="80" r="8" fill="#FFFFFF" />
      {/* Text lines */}
      <Line x1="82" y1="92" x2="108" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="82" y1="97" x2="108" y2="97" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="82" y1="102" x2="100" y2="102" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </G>

    {/* Green checkmark badge */}
    <G>
      <Circle cx="140" cy="50" r="10" fill="#1DB886" />
      <Path d="M 136 50 L 138.5 52.5 L 144 47" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </Svg>
);

// Search illustration - person pointing at dashboard
export const IlluSearch = ({ width = 180, height = 160 }) => (
  <Svg width={width} height={height} viewBox="0 0 180 160">
    {/* Woman - black shirt */}
    <G>
      {/* Head */}
      <Circle cx="45" cy="35" r="14" fill="#111111" />
      {/* Hair long */}
      <Path d="M 45 21 Q 52 18 56 28 Q 56 35 54 45" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body - black */}
      <Rect x="35" y="49" width="20" height="30" fill="#111111" rx="2" />
      {/* Left arm pointing */}
      <Path d="M 35 58 L 15 70" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right arm pointing at screen */}
      <Path d="M 55 58 L 95 50" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <Path d="M 40 79 L 38 120" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 50 79 L 52 120" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
    </G>

    {/* Dashboard/Screen */}
    <G>
      <Rect x="90" y="35" width="60" height="50" fill="#FFFFFF" stroke="#111111" strokeWidth="2" rx="3" />
      {/* Screen grid/chart */}
      <Rect x="95" y="40" width="50" height="40" fill="#1DB886" rx="2" opacity="0.3" />
      {/* Chart bars */}
      <Rect x="100" y="60" width="4" height="12" fill="#1DB886" />
      <Rect x="108" y="50" width="4" height="22" fill="#1DB886" />
      <Rect x="116" y="55" width="4" height="17" fill="#1DB886" />
      <Rect x="124" y="48" width="4" height="24" fill="#1DB886" />
      <Rect x="132" y="58" width="4" height="14" fill="#1DB886" />
    </G>

    {/* Green accent */}
    <Circle cx="160" cy="65" r="7" fill="#1DB886" opacity="0.5" />
  </Svg>
);

export default {
  IlluOnboarding,
  IlluRecruiter,
  IlluResume,
  IlluProfile,
  IlluSearch,
};
