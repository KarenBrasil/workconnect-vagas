import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, calcularTempoRelativo, VagaExterna } from '../../src/services/vagasExternas';
import { buscarFavoritos } from '../../src/services/favoritos';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { VagaCard } from '../../components/VagaCard';

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
      setUserName(user.displayName.split(' ')[0]); // Pega só o primeiro nome, conforme pedido
    }

    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Busca Internas separada para não bloquear as externas em caso de erro de permissão
      try {
        const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(5));
        const snapInternas = await getDocs(q);
        const internas = snapInternas.docs.map(d => ({ id: d.id, ...d.data() }));
        setVagasInternasRecentes(internas);
      } catch (e) {
        console.log('Erro ao buscar vagas internas (possível erro de permissão no Firebase):', e);
      }

      // Busca Externas independentemente
      let countExternas = 0;
      try {
        const externas = await buscarVagasComCache();
        setVagasExternasPopulares(externas.slice(0, 5));
        countExternas = externas.length;
      } catch (e) {
        console.log('Erro ao buscar vagas externas:', e);
      }

      setTotalVagas(vagasInternasRecentes.length + countExternas);

      // Conta favoritos reais do usuário
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
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>Olá, {userName || 'Visitante'} 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Encontre o projeto perfeito para você</Text>
          </View>
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push('/profile')}>
            <FontAwesome name="user-o" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Busca */}
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
            <FontAwesome name="globe" size={18} color={colors.primary} style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : `+${totalVagas}`}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vagas Ativas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="heart-o" size={18} color={colors.secondary} style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loading ? '...' : vagasSalvas}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Vagas Salvas</Text>
          </View>
        </ScrollView>

        {/* Vagas Externas (Populares) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vagas Globais</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
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
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Adicionadas Recentemente (TechConnect)</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, height: 56 },
  filterBtn: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { gap: 12, paddingBottom: 10, marginBottom: 16 },
  statCard: { width: 140, padding: 16, borderRadius: 16, borderWidth: 1 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
});
