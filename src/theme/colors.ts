// src/theme/colors.ts

export const lightColors = {
  // Cores de fundo (Light Mode Premium)
  background: '#F8FAFC',       // Fundo cinza clarinho
  cardBackground: '#FFFFFF',   // Fundo dos cartões em branco puro
  tabBackground: '#FFFFFF',    // Fundo da barra inferior
  
  // Cores Principais (Conforme pedido: Verde e Roxo)
  primary: '#22C55E',          // Verde principal premium
  primaryLight: 'rgba(34, 197, 94, 0.1)', // Verde suave
  
  // Acentos
  secondary: '#8B5CF6',        // Roxo para destaques e ícones
  secondaryLight: 'rgba(139, 92, 246, 0.1)', // Roxo suave
  
  // Texto
  textPrimary: '#0F172A',      // Texto escuro
  textSecondary: '#64748B',    // Texto cinza secundário
  textInverse: '#FFFFFF',      // Texto sobre o verde/roxo
  
  // UI Elements
  border: '#E2E8F0',           // Bordas suaves
  danger: '#EF4444',           // Vermelho
  
  // Navegação
  tabActive: '#22C55E',
  tabInactive: '#94A3B8',
};

export const darkColors = {
  // Dark Mode Premium (Neon Tech)
  background: '#0B0F19',
  cardBackground: '#1A202C',
  tabBackground: '#1A202C',
  
  primary: '#4ADE80',          // Verde neon no escuro
  primaryLight: 'rgba(74, 222, 128, 0.15)',
  
  secondary: '#A78BFA',        // Roxo claro no escuro
  secondaryLight: 'rgba(167, 139, 250, 0.15)',
  
  textPrimary: '#F8FAFC',             
  textSecondary: '#94A3B8',    
  textInverse: '#0F172A',      
  
  border: '#2D3748',           
  danger: '#F87171',           
  
  tabActive: '#4ADE80',
  tabInactive: '#475569',
};

export type ThemeColors = typeof lightColors;
