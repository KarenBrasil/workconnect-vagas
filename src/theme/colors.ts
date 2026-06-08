// src/theme/colors.ts

export const lightColors = {
  // Cores de fundo (Light Mode Clean)
  background: '#F5F6FA',       // Fundo gelo/cinza clarinho (Base do Insightlancer)
  cardBackground: '#FFFFFF',   // Fundo dos cartões
  tabBackground: '#FFFFFF',    // Fundo da barra inferior
  
  // Cores Principais
  primary: '#0D2B5A',          // Azul Profundo / Marinho Escuro (Cor central da referência)
  primaryLight: '#E8EDF5',     // Fundo suave para botões/ícones ativos
  
  // Acentos (mantendo o verde/roxo do app, mas em tons mais brandos)
  accent: '#22C55E',           // Verde suave para 'Completed' ou 'Success'
  accentPurple: '#8B5CF6',     // Roxo para detalhes secundários
  
  // Texto
  text: '#1A1A1A',             // Texto principal (Quase preto)
  textSecondary: '#7A7A7A',    // Subtítulos e descrições (Cinza)
  textInverse: '#FFFFFF',      // Texto sobre o fundo Azul Profundo
  
  // UI Elements
  border: '#EAECEF',           // Bordas muito suaves
  danger: '#EF4444',           // Vermelho para erros
  
  // Navegação
  tabActive: '#0D2B5A',
  tabInactive: '#A0AEC0',
};

// O Dark mode será uma versão invertida, mas mantendo a classe do azul
export const darkColors = {
  background: '#0B0F19',
  cardBackground: '#1A202C',
  tabBackground: '#1A202C',
  
  primary: '#3B82F6',          // Azul mais claro no dark mode para contraste
  primaryLight: '#1E3A8A',     
  
  accent: '#22C55E',           
  accentPurple: '#8B5CF6',     
  
  text: '#F3F4F6',             
  textSecondary: '#9CA3AF',    
  textInverse: '#FFFFFF',      
  
  border: '#2D3748',           
  danger: '#F87171',           
  
  tabActive: '#3B82F6',
  tabInactive: '#4A5568',
};
