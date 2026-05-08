import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../../src/services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { getCurrentUserSession, clearCurrentUserSession, UserSession } from '../../utils/userSession';

export default function Profile() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getCurrentUserSession().then(setUserSession);
  }, []);

  const executeLogout = async () => {
    try {
      await clearCurrentUserSession();
      if (auth.currentUser) await signOut(auth);
      router.replace('/login');
    } catch (e) {
      if (Platform.OS === 'web') window.alert('Não foi possível sair.');
      else Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair da sua conta?')) {
        executeLogout();
      }
    } else {
      Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: executeLogout }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Perfil</Text>
      </View>

      <View style={styles.userInfoCard}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={36} color="#2E9D4D" />
        </View>
        <Text style={styles.userName}>
          {userSession?.name || auth.currentUser?.email?.split('@')[0] || 'Usuário'}
        </Text>
        <Text style={styles.userEmail}>
          {userSession?.email || auth.currentUser?.email || 'usuario@email.com'}
        </Text>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#EFEFEF' }]}>
              <FontAwesome name="bell" size={16} color="#312651" />
            </View>
            <Text style={styles.settingText}>Notificações</Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#83829A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#EFEFEF' }]}>
              <FontAwesome name="lock" size={16} color="#312651" />
            </View>
            <Text style={styles.settingText}>Privacidade e Segurança</Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color="#83829A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
              <FontAwesome name="sign-out" size={16} color="#DC2626" />
            </View>
            <Text style={[styles.settingText, { color: '#DC2626' }]}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EFEFEF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#312651' },
  userInfoCard: { backgroundColor: '#FFFFFF', margin: 24, padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#312651', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#83829A' },
  settingsContainer: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#312651', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EFEFEF' },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingText: { fontSize: 16, fontWeight: '500', color: '#312651' },
});
