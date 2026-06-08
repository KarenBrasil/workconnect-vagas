import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'pt' | 'en';

interface LanguageContextData {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Auth
    'auth.welcome': 'Bem-vindo de volta',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.login': 'Entrar',
    'auth.google': 'Entrar com Google',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.registerHere': 'Registre-se aqui',
    'auth.createAccount': 'Criar Conta',
    'auth.name': 'Nome Completo',
    'auth.register': 'Cadastrar',
    'auth.hasAccount': 'Já tem uma conta?',
    'auth.loginHere': 'Entre aqui',
    
    // Home
    'home.greeting': 'Olá',
    'home.searchPlaceholder': 'Buscar...',
    'home.welcomeCard.title': 'Bem-vindo!',
    'home.welcomeCard.subtitle': 'Encontre e publique vagas no seu ritmo',
    'home.ongoingProjects': 'Vagas em Destaque',
    'home.viewAll': 'Ver todas',
    'home.progress': 'Status',
    'home.completed': 'Finalizado',
    
    // Search
    'search.title': 'Explorar Vagas',
    'search.global': 'Globais',
    'search.internal': 'Locais',
    'search.all': 'Todas',
    'search.remote': 'Remoto',
    'search.hybrid': 'Híbrido',
    
    // Post Job
    'post.title': 'Criar Vaga',
    'post.jobTitle': 'Título da Vaga',
    'post.company': 'Empresa',
    'post.salary': 'Salário (Opcional)',
    'post.description': 'Descrição',
    'post.submit': 'Publicar Vaga',
    
    // Profile & Settings
    'profile.folders': 'Links Profissionais',
    'profile.myTeam': 'Configurações',
    'profile.edit': 'Editar Perfil',
    'profile.save': 'Salvar',
    'profile.darkMode': 'Modo Escuro',
    'profile.language': 'Idioma',
    'profile.logout': 'Sair',
    
    // Admin Metrics
    'admin.metrics': 'Painel de Métricas',
    'admin.totalFinished': 'Pesquisas Finalizadas',
    'admin.detailedResponses': 'Respostas Detalhadas',
  },
  en: {
    // Auth
    'auth.welcome': 'Welcome back',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Sign In',
    'auth.google': 'Sign in with Google',
    'auth.noAccount': "Don't have an account?",
    'auth.registerHere': 'Register here',
    'auth.createAccount': 'Create Account',
    'auth.name': 'Full Name',
    'auth.register': 'Sign Up',
    'auth.hasAccount': 'Already have an account?',
    'auth.loginHere': 'Log in here',
    
    // Home
    'home.greeting': 'Hi',
    'home.searchPlaceholder': 'Search...',
    'home.welcomeCard.title': 'Welcome!',
    'home.welcomeCard.subtitle': 'Find and post jobs at your pace',
    'home.ongoingProjects': 'Featured Jobs',
    'home.viewAll': 'view all',
    'home.progress': 'Progress',
    'home.completed': 'Completed',
    
    // Search
    'search.title': 'Explore Jobs',
    'search.global': 'Global',
    'search.internal': 'Internal',
    'search.all': 'All',
    'search.remote': 'Remote',
    'search.hybrid': 'Hybrid',
    
    // Post Job
    'post.title': 'Post a Job',
    'post.jobTitle': 'Job Title',
    'post.company': 'Company',
    'post.salary': 'Salary (Optional)',
    'post.description': 'Description',
    'post.submit': 'Publish Job',
    
    // Profile & Settings
    'profile.folders': 'Professional Links',
    'profile.myTeam': 'Settings',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save',
    'profile.darkMode': 'Dark Mode',
    'profile.language': 'Language',
    'profile.logout': 'Sign Out',
    
    // Admin Metrics
    'admin.metrics': 'Metrics Dashboard',
    'admin.totalFinished': 'Completed Surveys',
    'admin.detailedResponses': 'Detailed Responses',
  }
};

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('@language');
      if (stored === 'en' || stored === 'pt') {
        setLanguageState(stored);
      }
    } catch (e) {
      console.log('Error loading language', e);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('@language', lang);
    } catch (e) {
      console.log('Error saving language', e);
    }
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
