import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, limparCacheVagas, VagaExterna, calcularTempoRelativo } from '../../src/services/vagasExternas';
import { salvarFavorito, removerFavorito, buscarFavoritos } from '../../src/services/favoritos';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { VagaCard } from '../../components/VagaCard';
import { LinearGradient } from 'expo-linear-gradient';

interface VagaInterna {
  id: string;
  titulo: string;
  empresa: string;
  contrato: string;
  salario: string;
  descricao: string;
  tipo: string;
  criadoEm: string;
}

const FILTROS_TAGS = ['Todos', 'Remoto', 'Híbrido', 'PJ', 'CLT', 'Freelance', 'Exterior'];

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('externas'); // Padrão Externas
  const [filtroTag, setFiltroTag] = useState('Todos');

  const [vagasExternas, setVagasExternas] = useState<VagaExterna[]>([]);
  const [vagasInternas, setVagasInternas] = useState<VagaInterna[]>([]);
  const [loading, setLoading] = useState(true);

  const [favoritosMap, setFavoritosMap] = useState<Record<string, string>>({});
  const [salvandoFavId, setSalvandoFavId] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async (forcar = false) => {
    setLoading(true);
    try {
      if (forcar) await limparCacheVagas();
      
      let listaInterna: VagaInterna[] = [];
      try {
        const snap = await getDocs(collection(db, 'vagas'));
        listaInterna = snap.docs.map(d => ({ id: d.id, ...d.data() } as VagaInterna));
        listaInterna.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
        setVagasInternas(listaInterna);
      } catch (e) {
        console.log('Erro vagas internas:', e);
      }

      try {
        const ext = await buscarVagasComCache();
        setVagasExternas(ext);
      } catch (e) {
        console.log('Erro vagas globais:', e);
      }

      if (userId) {
        try {
          const favs = await buscarFavoritos(userId);
          const mapa: Record<string, string> = {};
          favs.forEach(f => { mapa[f.vagaId] = f.id!; });
          setFavoritosMap(mapa);
        } catch (e) {}
      }
    } catch (error) {
      console.log('Erro na busca', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorito = async (vagaId: string, titulo: string, empresa: string, fonte: string, link?: string) => {
    if (!userId) return;
    setSalvandoFavId(vagaId);
    try {
      if (favoritosMap[vagaId]) {
        await removerFavorito(favoritosMap[vagaId]);
        setFavoritosMap(prev => {
          const novo = { ...prev };
          delete novo[vagaId];
          return novo;
        });
      } else {
        await salvarFavorito({ userId, vagaId, titulo, empresa, fonte, link });
        const favs = await buscarFavoritos(userId);
        const mapa: Record<string, string> = {};
        favs.forEach(f => { mapa[f.vagaId] = f.id!; });
        setFavoritosMap(mapa);
      }
    } catch (e) {
      console.log('Erro ao favoritar:', e);
    } finally {
      setSalvandoFavId(null);
    }
  };

  const termoBusca = busca.toLowerCase().trim();

  const vagasInternasFiltradas = vagasInternas.filter(v => {
    if (termoBusca && !v.titulo.toLowerCase().includes(termoBusca) && !(v.empresa || '').toLowerCase().includes(termoBusca)) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'PJ') return v.contrato?.toLowerCase().includes('pj');
    if (filtroTag === 'CLT') return v.contrato?.toLowerCase().includes('clt');
    if (filtroTag === 'Remoto') return v.contrato?.toLowerCase().includes('remoto');
    return true;
  });

  const vagasExternasFiltradas = vagasExternas.filter(v => {
    if (termoBusca && !v.titulo.toLowerCase().includes(termoBusca) && !(v.empresa || '').toLowerCase().includes(termoBusca) && !(v.tags || []).some(t => t.toLowerCase().includes(termoBusca))) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'Exterior') return (v.local || '').includes('🌍') || (v.local || '').toLowerCase().includes('internac');
    return (v.tags || []).some(t => t.toLowerCase() === filtroTag.toLowerCase());
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Explorar Vagas</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Milhares de oportunidades em um só lugar.</Text>

        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="search" size={18} color={colors.primary} style={{ marginHorizontal: 16 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Ex: React Native, UX Designer..."
              placeholderTextColor={colors.textSecondary}
              value={busca}
              onChangeText={setBusca}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca('')} style={{ padding: 12 }}>
                <FontAwesome name="times-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => carregarTudo(true)} activeOpacity={0.8}>
            <LinearGradient colors={colors.primaryGradient || ['#22C55E', '#16A34A']} style={styles.filterBtn}>
              <FontAwesome name="refresh" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
          {FILTROS_TAGS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.tagBtn, {
                backgroundColor: filtroTag === f ? colors.secondary : 'transparent',
                borderColor: filtroTag === f ? colors.secondary : colors.border
              }]}
              onPress={() => setFiltroTag(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tagBtnText, { color: filtroTag === f ? '#FFF' : colors.textPrimary }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.abasWrapper}>
        <View style={[styles.abasContainer, { backgroundColor: colors.badgeBackground }]}>
          <TouchableOpacity 
            style={[styles.abaBtn, abaAtiva === 'externas' && { backgroundColor: colors.cardBackground, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3, shadowRadius: 8 }]} 
            onPress={() => setAbaAtiva('externas')}
          >
            <Text style={[styles.abaText, { color: abaAtiva === 'externas' ? colors.primary : colors.textSecondary, fontWeight: abaAtiva === 'externas' ? '800' : '600' }]}>Vagas Globais</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.abaBtn, abaAtiva === 'internas' && { backgroundColor: colors.cardBackground, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3, shadowRadius: 8 }]} 
            onPress={() => setAbaAtiva('internas')}
          >
            <Text style={[styles.abaText, { color: abaAtiva === 'internas' ? colors.secondary : colors.textSecondary, fontWeight: abaAtiva === 'internas' ? '800' : '600' }]}>TechConnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {!userId && (
          <View style={[styles.loginHint, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30', borderWidth: 1 }]}>
            <FontAwesome name="info-circle" size={16} color={colors.primary} />
            <Text style={[styles.loginHintText, { color: colors.primary }]}>  Faça login para salvar vagas nos favoritos</Text>
          </View>
        )}

        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {abaAtiva === 'internas' ? vagasInternasFiltradas.length : vagasExternasFiltradas.length} oportunidades encontradas
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : abaAtiva === 'internas' ? (
          vagasInternasFiltradas.length === 0 ? (
            <View style={styles.emptySearch}>
              <View style={[styles.emptySearchIcon, { backgroundColor: colors.primaryLight }]}>
                <FontAwesome name="search" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.emptySearchText, { color: colors.textPrimary }]}>Nenhuma vaga encontrada</Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Tente usar palavras mais genéricas ou limpar os filtros.</Text>
            </View>
          ) : vagasInternasFiltradas.map(vaga => (
            <VagaCard
              key={vaga.id}
              id={vaga.id}
              titulo={vaga.titulo}
              empresa={vaga.empresa}
              localOuContrato={vaga.contrato}
              salarioOuFonte={vaga.salario}
              isExterna={false}
              tipoOuIcone={vaga.tipo === 'freelancer' ? 'freelancer' : 'recrutador'}
              tags={[]}
              tempoRelativo={vaga.criadoEm ? calcularTempoRelativo(vaga.criadoEm) : 'recentemente'}
              onToggleFavorito={() => handleToggleFavorito(vaga.id, vaga.titulo, vaga.empresa, 'TechConnect')}
              isFavorito={!!favoritosMap[vaga.id]}
              salvandoFav={salvandoFavId === vaga.id}
              userId={userId}
            />
          ))
        ) : (
          vagasExternasFiltradas.length === 0 ? (
            <View style={styles.emptySearch}>
              <View style={[styles.emptySearchIcon, { backgroundColor: colors.secondaryLight }]}>
                <FontAwesome name="search" size={36} color={colors.secondary} />
              </View>
              <Text style={[styles.emptySearchText, { color: colors.textPrimary }]}>Nenhuma vaga encontrada</Text>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Tente usar palavras mais genéricas ou limpar os filtros.</Text>
            </View>
          ) : vagasExternasFiltradas.map(vaga => {
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
                onToggleFavorito={() => handleToggleFavorito(vaga.id, vaga.titulo, vaga.empresa, vaga.fonte, vaga.link)}
                isFavorito={!!favoritosMap[vaga.id]}
                salvandoFav={salvandoFavId === vaga.id}
                userId={userId}
                linkExterna={vaga.link}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 16, marginTop: 6, marginBottom: 24, fontWeight: '500' },
  
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  searchInputContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: 16, 
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: { flex: 1, height: '100%', fontSize: 16 },
  filterBtn: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  tagsContainer: { gap: 10, paddingRight: 20, paddingBottom: 10 },
  tagBtn: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 24, 
    borderWidth: 1 
  },
  tagBtnText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  
  abasWrapper: { paddingHorizontal: 20, paddingBottom: 16 },
  abasContainer: { 
    flexDirection: 'row', 
    borderRadius: 16, 
    padding: 6 
  },
  abaBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12 
  },
  abaText: { fontSize: 14, letterSpacing: 0.3 },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 60 },
  loginHint: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 20 
  },
  loginHintText: { fontSize: 14, fontWeight: '700' },
  resultsCount: { fontSize: 14, marginBottom: 20, fontWeight: '600' },
  
  emptySearch: { alignItems: 'center', paddingVertical: 60, gap: 12, paddingHorizontal: 40 },
  emptySearchIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptySearchText: { fontSize: 18, fontWeight: '800' },
});
