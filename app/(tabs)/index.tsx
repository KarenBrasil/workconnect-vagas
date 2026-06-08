import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, calcularTempoRelativo, VagaExterna } from '../../src/services/vagasExternas';
import { buscarFavoritos } from '../../src/services/favoritos';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { VagaCard } from '../../components/VagaCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [userName, setUserName] = useState('');
  const [totalVagas, setTotalVagas] = useState(0);
  const [vagasSalvas, setVagasSalvas] = useState(0);
  
  const [vagasExternasPopulares, setVagasExternasPopulares] = useState<VagaExterna[]>([]);
  const [vagasInternasRecentes, setVagasInternasRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.displayName) {
      setUserName(user.displayName.split(' ')[0]);
    }
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      try {
        const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(5));
        const snapInternas = await getDocs(q);
        const internas = snapInternas.docs.map(d => ({ id: d.id, ...d.data() }));
        setVagasInternasRecentes(internas);
      } catch (e) {
        console.log('Erro ao buscar vagas internas:', e);
      }

      let countExternas = 0;
      try {
        const externas = await buscarVagasComCache();
        setVagasExternasPopulares(externas.slice(0, 5));
        countExternas = externas.length;
      } catch (e) {
        console.log('Erro ao buscar vagas externas:', e);
      }

      setTotalVagas(vagasInternasRecentes.length + countExternas);

      const userId = auth.currentUser?.uid;
      if (userId) {
        const favs = await buscarFavoritos(userId);
        setVagasSalvas(favs.length);
      } else {
        setVagasSalvas(0);
      }
    } catch (e) {
      console.log('Erro geral ao carregar dados da Home', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header & Hero Banner */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.textPrimary }]}>Olá, {userName || 'Visitante'} 👋</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Pronto para o próximo nível?</Text>
            </View>
            <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push('/profile')}>
              <FontAwesome name="user-o" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <LinearGradient 
            colors={isDark ? ['#16A34A', '#22C55E'] : ['#22C55E', '#4ADE80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Mais de {loading ? '...' : totalVagas} vagas de tecnologia ativas hoje.</Text>
              <Text style={styles.heroSubtitle}>Encontre projetos globais, remotos e presenciais.</Text>
            </View>
            <View style={styles.heroOverlay}>
              <FontAwesome name="code" size={100} color="rgba(255,255,255,0.1)" style={styles.heroIconBackground} />
            </View>
          </LinearGradient>
        </View>

        {/* Busca */}
        <TouchableOpacity style={styles.searchRow} onPress={() => router.push('/search')} activeOpacity={0.8}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="search" size={18} color={colors.primary} style={{ marginHorizontal: 16 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 16, flex: 1, fontWeight: '500' }}>Qual stack você domina?</Text>
          </View>
          <LinearGradient colors={colors.primaryGradient || ['#22C55E', '#16A34A']} style={styles.filterBtn}>
            <FontAwesome name="sliders" size={22} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Estatísticas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primaryLight }]}>
              <FontAwesome name="globe" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : `+${totalVagas}`}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Oportunidades</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: colors.secondaryLight }]}>
              <FontAwesome name="heart" size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : vagasSalvas}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vagas Salvas</Text>
            </View>
          </View>
        </ScrollView>

        {/* Vagas Externas (Populares) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vagas Globais ✨</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
        ) : (
          <View>
            {vagasExternasPopulares.map(vaga => {
              let icone = 'globe';
              if (vaga.fonte.includes('GitHub')) icone = 'github';
              if (vaga.fonte.includes('Remotive') || vaga.fonte.includes('RemoteOK')) icone = 'laptop';

              return (
                <VagaCard
                  key={vaga.id}
                  id={vaga.id}
                  titulo={vaga.titulo}
                  empresa={vaga.empresa}
                  localOuContrato={vaga.local}
                  salarioOuFonte={vaga.fonte}
                  isExterna={true}
                  tipoOuIcone={icone}
                  tags={vaga.tags}
                  tempoRelativo={vaga.tempoPostagem}
                  linkExterna={vaga.link}
                />
              );
            })}
          </View>
        )}

        {/* Vagas Internas (TechConnect) */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>TechConnect Exclusivas ⚡</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginVertical: 32 }} />
        ) : (
          <View>
            {vagasInternasRecentes.map(vaga => (
              <VagaCard
                key={vaga.id}
                id={vaga.id}
                titulo={vaga.titulo}
                empresa={vaga.empresa}
                localOuContrato={vaga.local}
                salarioOuFonte={vaga.salario}
                isExterna={false}
                tipoOuIcone={vaga.tipo === 'freelancer' ? 'freelancer' : 'recrutador'}
                tags={vaga.requisitos ? vaga.requisitos.split(',').slice(0, 3) : []}
                tempoRelativo={vaga.criadoEm ? calcularTempoRelativo(vaga.criadoEm) : 'recentemente'}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { marginBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4 },
  profileBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  
  heroBanner: {
    borderRadius: 24,
    padding: 24,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    zIndex: 2,
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: '600',
  },
  heroOverlay: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
  },
  heroIconBackground: {
    transform: [{ rotate: '-15deg' }],
  },

  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  searchInputContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 16, 
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterBtn: { 
    width: 60, 
    height: 60, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  statsContainer: { gap: 16, paddingBottom: 16, marginBottom: 16 },
  statCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180, 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
});
