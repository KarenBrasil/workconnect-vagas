import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface IlluProps {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
}

const defaultStyle: ImageStyle = {
  resizeMode: 'contain',
};

// 1. Três pessoas olhando pra cima (Comunidade / Sobre Nós)
export const IlluCommunity = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_1.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 2. Mulher no notebook com currículo (Login / Cadastro)
export const IlluLogin = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_2.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 3. Mão tirando foto de perfil do celular (Criar Vaga / Post Job / Perfil)
export const IlluPostJob = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_3.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 4. Quatro pessoas no quebra-cabeça (Conexões / Matches)
export const IlluMatches = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_4.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 5. Prancheta com currículo e check (Vagas Salvas / Minhas Candidaturas)
export const IlluSavedJobs = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_5.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 6. Duas pessoas formando círculo ao redor do perfil (Recrutadores / Networking)
export const IlluNetworking = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_6.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 7. Mulher apresentando gráficos (Dashboard / Home Admin)
export const IlluDashboard = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_7.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// 8. Mãos segurando perfil com check (Sucesso / Onboarding final)
export const IlluSuccess = ({ style, width = 200, height = 180 }: IlluProps) => (
  <Image 
    source={require('../illustrations_png/png_transparente_8.png')} 
    style={[defaultStyle, { width, height }, style]} 
  />
);

// Retrocompatibilidade (para não quebrar telas que ainda usam os nomes antigos, mapeando para as novas imagens equivalentes)
export const IlluRecruiter = IlluLogin;
export const IlluOnboarding = IlluCommunity;
export const IlluResume = IlluSavedJobs;
export const IlluProfile = IlluPostJob;
export const IlluSearch = IlluDashboard;
