import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { 
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.warn("Erro ao carregar fontes:", error);
      // Evitamos dar throw error aqui para não causar tela preta em produção
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

import { View, Platform, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { ThemeProvider as CustomThemeProvider } from '../src/theme/ThemeContext';
import { LanguageProvider } from '../src/theme/LanguageContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <CustomThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={styles.webContainer}>
              <ProtectedLayout />
            </View>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </CustomThemeProvider>
  );
}

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password';
    const isProtected = segments[0] === '(tabs)' || segments[0] === 'job';
    
    if (!user && isProtected) {
      // Se não estiver logado e tentar acessar área restrita, manda pro login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Se estiver logado e tentar acessar login/register, manda pras abas
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="job/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="feedback" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 480,
      width: '100%',
      marginHorizontal: 'auto',
      backgroundColor: '#FAFAFC',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      overflow: 'hidden',
    }),
  },
});
