import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// ATENÇÃO: A equipe de banco de dados deve colar a URL e a KEY aqui
// Estas chaves você pega no painel do Supabase em Project Settings -> API
const supabaseUrl = "https://gixziwlugirkmjobsefx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeHppd2x1Z2lya21qb2JzZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTMwNzIsImV4cCI6MjA5NDcyOTA3Mn0.RBD797TIrR57WeLh1Rxi25_t3XiNaMgGiGGIazPYnBM";

// Trava de segurança: Evita o erro 'window is not defined' no ambiente do servidor (SSR)
const isWebWorkerOrServer = () => {
  return Platform.OS === "web" && typeof window === "undefined";
};

const customLocalStorage = {
  getItem: async (key) => {
    if (isWebWorkerOrServer()) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (isWebWorkerOrServer()) return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (isWebWorkerOrServer()) return;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customLocalStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
