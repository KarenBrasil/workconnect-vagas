import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, limparCacheVagas, VagaExterna } from '../../src/services/vagasExternas';
import { salvarFavorito, removerFavorito, buscarFavoritos, Favorito } from '../../src/services/favoritos';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';

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

const COR_FONTE: Record<string, string> = {
  'GitHub BR': '#24292e',
  'Remotive': '#4f46e5',
  'RemoteOK': '#0ea5e9',
  'Arbeitnow': '#FF5A5F',
  'Jooble': '#2196F3',
  'InfoJobs': '#0047BB',
};

const ICONE_FONTE: Record<string, string> = {
  'GitHub BR': 'github',
  'Remotive': 'globe',
  'RemoteOK': 'laptop',
  'Arbeitnow': 'briefcase',
  'Jooble': 'search',
  'InfoJobs': 'id-card-o',
};

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('internas');
  const [filtroTag, setFiltroTag] = useState('Todos');

  const [vagasExternas, setVagasExternas] = useState<VagaExterna[]>([]);
  const [vagasInternas, setVagasInternas] = useState<VagaInterna[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapa de vagaId -> favoritoId (para saber quais estão favoritados)
  const [favoritosMap, setFavoritosMap] = useState<Record<string, string>>({});
  const [salvandoFavId, setSalvandoFavId] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async (forcar = false) => {
    setLoading(true);
    try {
      if (forcar) limparCacheVagas();
      const [snap, ext] = await Promise.all([
        getDocs(collection(db, 'vagas')),
        buscarVagasComCache()
      ]);

      const listaInterna = snap.docs.map(d => ({ id: d.id, ...d.data() } as VagaInterna));
      listaInterna.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
      setVagasInternas(listaInterna);
      setVagasExternas(ext);

      // Carrega favoritos do usuário para mostrar corações preenchidos
      if (userId) {
        const favs = await buscarFavoritos(userId);
        const mapa: Record<string, string> = {};
        favs.forEach(f => { mapa[f.vagaId] = f.id!; });
        setFavoritosMap(mapa);
      }
    } catch (error) {
      console.log('Erro na busca', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorito = async (vagaId: string, titulo: string, empresa: string, fonte: string, link?: string) => {
    if (!userId) return; // silencia se não logado
    setSalvandoFavId(vagaId);
    try {
      if (favoritosMap[vagaId]) {
        // Já favorito — remove
        await removerFavorito(favoritosMap[vagaId]);
        setFavoritosMap(prev => {
          const novo = { ...prev };
          delete novo[vagaId];
          return novo;
        });
      } else {
        // Não favorito — adiciona
        await salvarFavorito({ userId, vagaId, titulo, empresa, fonte, link });
        // Recarrega mapa para pegar o ID gerado
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

  // Filtragem Internas
  const vagasInternasFiltradas = vagasInternas.filter(v => {
    if (termoBusca && !v.titulo.toLowerCase().includes(termoBusca) &&
        !(v.empresa || '').toLowerCase().includes(termoBusca)) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'PJ') return v.contrato?.toLowerCase().includes('pj');
    if (filtroTag === 'CLT') return v.contrato?.toLowerCase().includes('clt');
    if (filtroTag === 'Remoto') return v.contrato?.toLowerCase().includes('remoto');
    return true;
  });

  // Filtragem Externas
  const vagasExternasFiltradas = vagasExternas.filter(v => {
    if (termoBusca && !v.titulo.toLowerCase().includes(termoBusca) &&
        !(v.empresa || '').toLowerCase().includes(termoBusca) &&
        !(v.tags || []).some(t => t.toLowerCase().includes(termoBusca))) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'Exterior') return (v.local || '').includes('🌍') || (v.local || '').toLowerCase().includes('internac');
    return (v.tags || []).some(t => t.toLowerCase() === filtroTag.toLowerCase());
  });

  const renderCoracao = (vagaId: string, titulo: string, empresa: string, fonte: string, link?: string) => {
    const isFav = !!favoritosMap[vagaId];
    const salvando = salvandoFavId === vagaId;
    return (
      <TouchableOpacity
        onPress={() => handleToggleFavorito(vagaId, titulo, empresa, fonte, link)}
        disabled={salvando || !userId}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {salvando
          ? <ActivityIndicator size="small" color="#DC2626" />
          : <FontAwesome name={isFav ? 'heart' : 'heart-o'} size={20} color={isFav ? '#DC2626' : colors.textSecondary} />
        }
      </TouchableOpacity>
    );
  };

  const renderInterna = (vaga: VagaInterna) => (
    <TouchableOpacity key={vaga.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push(`/job/${vaga.id}` as any)}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: vaga.tipo === 'freelancer' ? colors.secondaryLight : colors.primaryLight }]}>
          <FontAwesome name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'} size={20} color={vaga.tipo === 'freelancer' ? colors.secondary : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.empresa, { color: colors.textSecondary }]}>{vaga.empresa || 'Empresa Confidencial'}</Text>
          <Text style={[styles.titulo, { color: colors.textPrimary }]} numberOfLines={2}>{vaga.titulo}</Text>
          <View style={styles.cardRow}>
            <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
            <Text style={[styles.cardRowText, { color: colors.textSecondary }]}>{vaga.contrato}</Text>
          </View>
        </View>
        {renderCoracao(vaga.id, vaga.titulo, vaga.empresa, 'WorkConnect')}
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.salario, { color: colors.secondary }]}>{vaga.salario}</Text>
        <View style={[styles.tagMatch, { backgroundColor: colors.secondaryLight }]}>
          <FontAwesome name="star" size={10} color={colors.secondary} />
          <Text style={[styles.tagMatchText, { color: colors.secondary }]}>Exclusiva</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExterna = (vaga: VagaExterna) => {
    const cor = COR_FONTE[vaga.fonte] || colors.textSecondary;
    const icon = ICONE_FONTE[vaga.fonte] || 'globe';
    return (
      <TouchableOpacity key={vaga.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => Linking.openURL(vaga.link)}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: cor + '18' }]}>
            <FontAwesome name={icon as any} size={20} color={cor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.empresa, { color: colors.textSecondary }]}>{vaga.empresa || vaga.fonte}</Text>
            <Text style={[styles.titulo, { color: colors.textPrimary }]} numberOfLines={2}>{vaga.titulo}</Text>
            <View style={styles.cardRow}>
              <FontAwesome name="globe" size={12} color={colors.textSecondary} />
              <Text style={[styles.cardRowText, { color: colors.textSecondary }]}>{vaga.local}</Text>
            </View>
          </View>
          {renderCoracao(vaga.id, vaga.titulo, vaga.empresa, vaga.fonte, vaga.link)}
        </View>
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.salario, { color: cor, fontSize: 12, fontWeight: '700' }]}>{vaga.fonte}</Text>
          <View style={[styles.tagMatch, { backgroundColor: colors.background }]}>
            <FontAwesome name="external-link" size={10} color={colors.textSecondary} />
            <Text style={[styles.tagMatchText, { color: colors.textSecondary }]}>Link Externo</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Fixo */}
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

      {/* Abas e Lista */}
      <View style={styles.abasWrapper}>
        <View style={[styles.abasContainer, { backgroundColor: colors.badgeBackground }]}>
          <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'internas' && { backgroundColor: colors.cardBackground }]} onPress={() => setAbaAtiva('internas')}>
            <Text style={[styles.abaText, { color: abaAtiva === 'internas' ? colors.textPrimary : colors.textSecondary, fontWeight: abaAtiva === 'internas' ? '700' : '500' }]}>WorkConnect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'externas' && { backgroundColor: colors.cardBackground }]} onPress={() => setAbaAtiva('externas')}>
            <Text style={[styles.abaText, { color: abaAtiva === 'externas' ? colors.textPrimary : colors.textSecondary, fontWeight: abaAtiva === 'externas' ? '700' : '500' }]}>Vagas Globais</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {/* Aviso para não logados */}
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
              <Text style={[styles.emptySearchSub, { color: colors.textSecondary }]}>Tente outro termo ou filtro</Text>
            </View>
          ) : vagasInternasFiltradas.map(renderInterna)
        ) : (
          vagasExternasFiltradas.length === 0 ? (
            <View style={styles.emptySearch}>
              <FontAwesome name="search" size={32} color="#EFEFEF" />
              <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>Nenhuma vaga encontrada</Text>
              <Text style={[styles.emptySearchSub, { color: colors.textSecondary }]}>Tente outro termo ou remova o filtro</Text>
            </View>
          ) : vagasExternasFiltradas.map(renderExterna)
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
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empresa: { fontSize: 12, marginBottom: 4 },
  titulo: { fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowText: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  salario: { fontSize: 14, fontWeight: '800' },
  tagMatch: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  tagMatchText: { fontSize: 11, fontWeight: '700' },
  emptySearch: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptySearchText: { fontSize: 16, fontWeight: '700' },
  emptySearchSub: { fontSize: 13 },
});
