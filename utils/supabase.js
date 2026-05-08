import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: A equipe de banco de dados deve colar a URL e a KEY aqui
// Estas chaves você pega no painel do Supabase em Project Settings -> API
const supabaseUrl = 'SUA_SUPABASE_URL_AQUI';
const supabaseAnonKey = 'SUA_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
