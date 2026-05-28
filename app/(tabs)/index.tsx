import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache } from '../../src/services/vagasExternas';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [userName, setUserName] = useState('');
  const [totalVagas, setTotalVagas] = useState(0);
  const [vagasSalvas, setVagasSalvas] = useState(0);
  const [propostas, setPropostas] = useState(0);
  
  const [vagasRecentes, setVagasRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.displayName) {
      setUserName(user.displayName.split(' ')[0]); // Pega só o primeiro nome
    }

    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Busca quantidade total de vagas (Internas + Externas)
      const snapInternas = await getDocs(collection(db, 'vagas'));
      const ext = await buscarVagasComCache();
      setTotalVagas(snapInternas.docs.length + ext.length);

      // Busca recentes (apenas as 3 últimas internas para demonstração na Home)
      const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(3));
      const snapRecentes = await getDocs(q);
      const recentes = snapRecentes.docs.map(d => ({ id: d.id, ...d.data() }));
      setVagasRecentes(recentes);

      // TODO: Buscar "Vagas Salvas" reais de uma coleção "favoritos" quando implementada
      setVagasSalvas(0);
      setPropostas(0);
    } catch (e) {
      console.log('Erro ao carregar dados da Home', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header (Greeting) */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>Olá, {userName || 'Visitante'} 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Encontre o projeto perfeito para você</Text>
          </View>
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push('/profile')}>
            <FontAwesome name="bell-o" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Fake Search Bar -> Vai para a tela de Buscar */}
        <TouchableOpacity style={styles.searchRow} onPress={() => router.push('/search')}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="search" size={16} color={colors.textSecondary} style={{ marginHorizontal: 12 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 15, flex: 1 }}>Qual vaga você procura?</Text>
          </View>
          <View style={[styles.filterBtn, { backgroundColor: colors.primary }]}>
            <FontAwesome name="sliders" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Estatísticas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="briefcase" size={18} color={colors.primary} style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : totalVagas.toLocaleString('pt-BR')}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vagas Ativas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="heart-o" size={18} color={colors.secondary} style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : vagasSalvas}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vagas Salvas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="comment-o" size={18} color="#0ea5e9" style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : propostas}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Propostas</Text>
          </View>
        </ScrollView>

        {/* Vagas Populares (Carrossel Horizontal) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vagas Populares</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularContainer}>
            {vagasRecentes.map(vaga => (
              <TouchableOpacity key={vaga.id} style={[styles.popularCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push(`/job/${vaga.id}` as any)}>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryLight, marginBottom: 16 }]}>
                  <FontAwesome name="building" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.empresa, { color: colors.textSecondary }]}>{vaga.empresa}</Text>
                <Text style={[styles.titulo, { color: colors.textPrimary }]} numberOfLines={2}>{vaga.titulo}</Text>
                <Text style={[styles.contrato, { color: colors.textSecondary }]}>{vaga.contrato}</Text>
                <Text style={[styles.salario, { color: colors.secondary, marginTop: 12 }]}>{vaga.salario}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Adicionadas Recentemente (Lista Vertical) */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Adicionadas Recentemente</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          vagasRecentes.slice(0, 3).map(vaga => (
            <TouchableOpacity key={vaga.id} style={[styles.recentCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push(`/job/${vaga.id}` as any)}>
              <View style={[styles.recentIcon, { backgroundColor: colors.primary }]}>
                <FontAwesome name="desktop" size={16} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.titulo, { color: colors.textPrimary, marginBottom: 4 }]} numberOfLines={1}>{vaga.titulo}</Text>
                <Text style={[styles.empresa, { color: colors.textSecondary }]}>{vaga.empresa} • {vaga.contrato}</Text>
              </View>
              <Text style={[styles.salario, { color: colors.secondary }]}>{vaga.salario}</Text>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, height: 56 },
  filterBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { gap: 12, paddingBottom: 10, marginBottom: 16 },
  statCard: { width: 110, padding: 16, borderRadius: 16, borderWidth: 1 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  popularContainer: { gap: 16, paddingRight: 20 },
  popularCard: { width: 220, padding: 20, borderRadius: 20, borderWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empresa: { fontSize: 12, marginBottom: 6 },
  titulo: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  contrato: { fontSize: 13 },
  salario: { fontSize: 15, fontWeight: '800' },
  recentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 16 },
  recentIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});
