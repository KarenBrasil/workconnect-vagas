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
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 35,
          height: 70,
          borderTopWidth: 0,
          borderColor: 'transparent',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor: '#2E9D4D',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarItemStyle: {
          height: 70,
          paddingTop: 8,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <FontAwesome name="search" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: '#2E9D4D',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#2E9D4D',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8,
              marginTop: -30,
              borderWidth: 4,
              borderColor: '#FFFFFF',
            }}>
              <FontAwesome name="plus" size={20} color="#FFFFFF" />
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
