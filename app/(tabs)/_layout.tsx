import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../../src/services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === 'admin@workconnect.com');
    });
    return unsubscribe;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ocultar o cabeçalho padrão, pois usamos um customizado na Home
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#EFEFEF', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#2E9D4D', // Verde Primário
        tabBarInactiveTintColor: '#83829A',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          title: 'Postar',
          tabBarIcon: ({ color }) => <FontAwesome name="plus-circle" size={24} color={color} />,
          href: isAdmin ? '/post-job' : null,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <FontAwesome name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
