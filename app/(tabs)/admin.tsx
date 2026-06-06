import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/theme/ThemeContext';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

export default function AdminDashboard() {
  const { colors } = useTheme();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      // Limite de 100 usuários por consulta para evitar sobrecarga no Firestore
      const q = query(collection(db, 'users'), orderBy('criadoEm', 'desc'), limit(100));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Usuario[];
      setUsuarios(lista);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Painel Admin</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gestão de Usuários da Plataforma</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card de Estatística */}
        <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <FontAwesome name="users" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : usuarios.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Usuários Cadastrados</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Lista de Usuários</Text>
          <TouchableOpacity onPress={carregarUsuarios}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.loadingBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Carregando dados...</Text>
          </View>
        ) : usuarios.length === 0 ? (
          <View style={[styles.loadingBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="user-times" size={32} color={colors.textSecondary} />
            <Text style={{ color: colors.textPrimary, marginTop: 10, fontWeight: 'bold' }}>Nenhum usuário encontrado</Text>
          </View>
        ) : (
          usuarios.map((user) => (
            <View key={user.id} style={[styles.userCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{user.nome ? user.nome.slice(0, 2).toUpperCase() : 'US'}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user.nome || 'Sem Nome'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user.email}
                </Text>
                <Text style={styles.userDate}>
                  Cadastrado em: {user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : 'Desconhecido'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  statCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16,
    borderWidth: 1, marginBottom: 24, gap: 16
  },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  loadingBox: { padding: 40, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 1, marginBottom: 10, gap: 14
  },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 4 },
  userDate: { fontSize: 11, color: '#A0A0A0' }
});
