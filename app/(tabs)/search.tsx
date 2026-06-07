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
  const { colors } = useTheme();
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
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Buscar</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Encontre vagas ou freelancers</Text>

        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="search" size={16} color={colors.textSecondary} style={{ marginHorizontal: 12 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="React Native, Designer..."
              placeholderTextColor={colors.textSecondary}
              value={busca}
              onChangeText={setBusca}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca('')} style={{ padding: 10 }}>
                <FontAwesome name="times-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.primary }]} onPress={() => carregarTudo(true)}>
            <FontAwesome name="refresh" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
          {FILTROS_TAGS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.tagBtn, {
                backgroundColor: filtroTag === f ? colors.secondary : colors.cardBackground,
                borderColor: filtroTag === f ? colors.secondary : colors.border
              }]}
              onPress={() => setFiltroTag(f)}
            >
              <Text style={[styles.tagBtnText, { color: filtroTag === f ? '#FFF' : colors.textPrimary }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.abasWrapper}>
        <View style={[styles.abasContainer, { backgroundColor: colors.badgeBackground }]}>
          <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'externas' && { backgroundColor: colors.cardBackground }]} onPress={() => setAbaAtiva('externas')}>
            <Text style={[styles.abaText, { color: abaAtiva === 'externas' ? colors.textPrimary : colors.textSecondary, fontWeight: abaAtiva === 'externas' ? '700' : '500' }]}>Vagas Globais</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'internas' && { backgroundColor: colors.cardBackground }]} onPress={() => setAbaAtiva('internas')}>
            <Text style={[styles.abaText, { color: abaAtiva === 'internas' ? colors.textPrimary : colors.textSecondary, fontWeight: abaAtiva === 'internas' ? '700' : '500' }]}>TechConnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {!userId && (
          <View style={[styles.loginHint, { backgroundColor: colors.primaryLight }]}>
            <FontAwesome name="info-circle" size={14} color={colors.primary} />
            <Text style={[styles.loginHintText, { color: colors.primary }]}>  Faça login para salvar vagas nos favoritos</Text>
          </View>
        )}

        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {abaAtiva === 'internas' ? vagasInternasFiltradas.length : vagasExternasFiltradas.length} vagas encontradas
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : abaAtiva === 'internas' ? (
          vagasInternasFiltradas.length === 0 ? (
            <View style={styles.emptySearch}>
              <FontAwesome name="search" size={32} color="#EFEFEF" />
              <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>Nenhuma vaga encontrada</Text>
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
              <FontAwesome name="search" size={32} color="#EFEFEF" />
              <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>Nenhuma vaga encontrada</Text>
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSubtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, height: 50 },
  searchInput: { flex: 1, height: '100%', fontSize: 15 },
  filterBtn: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tagsContainer: { gap: 8, paddingRight: 20 },
  tagBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tagBtnText: { fontSize: 13, fontWeight: '600' },
  abasWrapper: { paddingHorizontal: 20, paddingBottom: 10 },
  abasContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  abaText: { fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loginHint: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 12 },
  loginHintText: { fontSize: 13, fontWeight: '500' },
  resultsCount: { fontSize: 13, marginBottom: 16, fontWeight: '500' },
  emptySearch: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptySearchText: { fontSize: 16, fontWeight: '700' },
});
