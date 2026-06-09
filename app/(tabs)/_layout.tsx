import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../../src/services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { View } from 'react-native';
import { useTheme } from '../../src/theme/ThemeContext';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      setIsAdmin(user?.email === adminEmail);
    });
    return unsubscribe;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 14,
          left: 14,
          right: 14,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          height: 66,
          borderTopWidth: 0, // remover borda original
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 8,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2B6010', // Primária Escura
        tabBarInactiveTintColor: '#AFAFBF',
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <FontAwesome name="search" size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          title: '', // Remove title para botão circular
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#7AE04A',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#7AE04A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 5,
              marginTop: 10,
            }}>
              <FontAwesome name="plus" size={18} color="#2B6010" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <FontAwesome name="heart" size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={19} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <FontAwesome name="lock" size={24} color={color} />,
          href: isAdmin ? '/admin' : null,
        }}
      />
    </Tabs>
  );
}
