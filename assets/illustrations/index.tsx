import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Rect, Text, Line } from 'react-native-svg';

// IlluOnboarding - 200x180
export const IlluOnboarding = () => (
  <Svg width={200} height={180} viewBox="0 0 200 180">
    <Circle cx={100} cy={130} r={50} fill="#C8C8C8" opacity={0.3} />
    
    {/* Pessoa 1 */}
    <Circle cx={70} cy={60} r={15} fill="#111111" />
    <Path d="M 50 85 Q 60 75 80 80 L 75 120 M 60 90 L 50 125" stroke="#111111" strokeWidth={2.5} fill="none" />
    <Path d="M 80 90 L 95 125" stroke="#111111" strokeWidth={2.5} fill="none" />
    
    {/* Pessoa 2 - Verde */}
    <Circle cx={130} cy={60} r={15} fill="#111111" />
    <Path d="M 110 85 Q 120 75 140 80 L 135 120 M 120 90 L 110 125" stroke="#111111" strokeWidth={2.5} fill="none" />
    <Path d="M 140 90 L 155 125" stroke="#111111" strokeWidth={2.5} fill="none" />
    <Rect x={110} y={95} width={30} height={25} rx={4} fill="#1DB886" />
  </Svg>
);

// IlluRecruiter - 200x180
export const IlluRecruiter = () => (
  <Svg width={200} height={180} viewBox="0 0 200 180">
    {/* Pessoa sentada */}
    <Circle cx={80} cy={50} r={14} fill="#111111" />
    <Rect x={65} y={70} width={30} height={35} rx={3} fill="#FFFFFF" stroke="#111111" strokeWidth={2} />
    <Path d="M 65 105 L 55 140 M 95 105 L 105 140" stroke="#111111" strokeWidth={2.5} />
    
    {/* Laptop */}
    <Rect x={110} y={100} width={50} height={30} rx={3} fill="#111111" />
    <Rect x={115} y={105} width={40} height={20} fill="#1DB886" />
    
    {/* Documento */}
    <Rect x={75} y={30} width={25} height={35} rx={2} fill="#FFFFFF" stroke="#111111" strokeWidth={2} />
    <Line x1={80} y1={45} x2={95} y2={45} stroke="#111111" strokeWidth={1.5} />
    <Line x1={80} y1={55} x2={95} y2={55} stroke="#111111" strokeWidth={1.5} />
  </Svg>
);

// IlluResume - 180x160
export const IlluResume = () => (
  <Svg width={180} height={160} viewBox="0 0 180 160">
    {/* Mão */}
    <Path d="M 50 80 L 40 40 L 50 35 L 55 45 L 60 40 L 65 50 L 70 45 L 75 55 L 70 80" fill="#111111" stroke="#111111" strokeWidth={2} />
    
    {/* Documento */}
    <Rect x={70} y={40} width={60} height={80} rx={4} fill="#FFFFFF" stroke="#111111" strokeWidth={2.5} />
    
    {/* Ícone perfil no documento */}
    <Circle cx={100} cy={55} r={6} stroke="#111111" strokeWidth={1.5} fill="none" />
    <Path d="M 95 70 Q 100 65 105 70" stroke="#111111" strokeWidth={1.5} fill="none" />
    
    {/* Linhas de texto */}
    <Line x1={75} y1={80} x2={125} y2={80} stroke="#111111" strokeWidth={1.5} />
    <Line x1={75} y1={90} x2={125} y2={90} stroke="#111111" strokeWidth={1.5} />
    <Line x1={75} y1={100} x2={115} y2={100} stroke="#111111" strokeWidth={1.5} />
    
    {/* Check verde */}
    <Circle cx={135} cy={45} r={12} fill="#1DB886" />
    <Path d="M 131 47 L 134 50 L 138 44" stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
    
    {/* Caneta */}
    <Path d="M 45 100 L 50 105 L 60 75" stroke="#111111" strokeWidth={2.5} fill="none" />
  </Svg>
);

// IlluProfile - 180x160
export const IlluProfile = () => (
  <Svg width={180} height={160} viewBox="0 0 180 160">
    {/* Homem */}
    <Circle cx={60} cy={50} r={14} fill="#111111" />
    <Path d="M 45 70 L 40 110 M 75 70 L 80 110" stroke="#111111" strokeWidth={2.5} />
    <Rect x={45} y={70} width={30} height={25} rx={2} fill="#111111" />
    
    {/* Cartão grande com perfil */}
    <Rect x={90} y={60} width={50} height={60} rx={6} fill="#1DB886" stroke="#111111" strokeWidth={2} />
    <Circle cx={115} cy={75} r={6} stroke="#FFFFFF" strokeWidth={1.5} fill="none" />
    <Path d="M 110 88 Q 115 84 120 88" stroke="#FFFFFF" strokeWidth={1.5} fill="none" />
    
    {/* Check */}
    <Circle cx={125} cy={55} r={10} fill="#FFFFFF" stroke="#111111" strokeWidth={2} />
    <Path d="M 122 56 L 124 59 L 128 52" stroke="#111111" strokeWidth={2} fill="none" />
  </Svg>
);

// IlluSearch - 180x160
export const IlluSearch = () => (
  <Svg width={180} height={160} viewBox="0 0 180 160">
    {/* Mulher */}
    <Circle cx={50} cy={50} r={14} fill="#111111" />
    <Rect x={40} y={70} width={20} height={30} rx={2} fill="#111111" />
    <Path d="M 40 100 L 35 135 M 60 100 L 65 135" stroke="#111111" strokeWidth={2.5} />
    
    {/* Braço apontando */}
    <Path d="M 60 80 L 100 60" stroke="#111111" strokeWidth={2.5} />
    <Circle cx={102} cy={58} r={3} fill="#111111" />
    
    {/* Gráfico/Dashboard */}
    <Rect x={110} y={50} width={50} height={40} rx={4} fill="#FFFFFF" stroke="#111111" strokeWidth={2} />
    
    {/* Barras do gráfico */}
    <Rect x={120} y={75} width={6} height={10} fill="#1DB886" />
    <Rect x={130} y={68} width={6} height={17} fill="#1DB886" />
    <Rect x={140} y={60} width={6} height={25} fill="#1DB886" />
    
    {/* Linha X */}
    <Line x1={115} y1={87} x2={155} y2={87} stroke="#111111" strokeWidth={1.5} />
  </Svg>
);

