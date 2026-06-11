import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import {
  buscarVagasComCache,
  limparCacheVagas,
  VagaExterna,
} from '../../src/services/vagasExternas';
import { salvarFavorito, removerFavorito, buscarFavoritos } from '../../src/services/favoritos';
import { useRouter } from 'expo-router';
import { COLORS, Card, Tag, FilterChip, TextInputField } from '../../components/ui';
import { BrandLogo } from '../../components/BrandLogo';
import { IlluSearch } from '../../assets/illustrations';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const FILTROS = ['Todos', 'Nacionais', 'Internacionais', 'Remoto', 'Híbrido', 'PJ', 'CLT'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('externas');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const [vagasExternas, setVagasExternas] = useState<VagaExterna[]>([]);
  const [vagasInternas, setVagasInternas] = useState<VagaInterna[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritosMap, setFavoritosMap] = useState<Record<string, string>>({});
  const [salvandoFavId, setSalvandoFavId] = useState<string | null>(null);
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const { colors, isDark } = useTheme();

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async (forcar = false) => {
    setLoading(true);
    try {
      if (forcar) await limparCacheVagas();

      try {
        const snap = await getDocs(collection(db, 'vagas'));
        const internas = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VagaInterna));
        
        setVagasInternas([...internas].sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')));
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
          favs.forEach((f) => {
            mapa[f.vagaId] = f.id!;
          });
          setFavoritosMap(mapa);
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (vaga: any) => {
    if (!userId) return;
    setSalvandoFavId(vaga.id);
    try {
      if (favoritosMap[vaga.id]) {
        await removerFavorito(favoritosMap[vaga.id]);
        setFavoritosMap((prev) => {
          const novo = { ...prev };
          delete novo[vaga.id];
          return novo;
        });
      } else {
        await salvarFavorito({
          userId,
          vagaId: vaga.id,
          titulo: vaga.titulo,
          empresa: vaga.empresa,
          fonte: vaga.fonte || 'Interna',
          link: vaga.link,
        });
        setFavoritosMap((prev) => ({ ...prev, [vaga.id]: 'temp' }));
      }
    } finally {
      setSalvandoFavId(null);
    }
  };

  const vagasParaMostrar = abaAtiva === 'externas' ? vagasExternas : vagasInternas;
  const vagasFiltradas = vagasParaMostrar.filter((v: any) => {
    const match = `${v.titulo} ${v.empresa}`.toLowerCase().includes(searchText.toLowerCase());
    
    let filtroMatch = true;
    if (filtroAtivo !== 'Todos') {
      if (filtroAtivo === 'Nacionais') {
        filtroMatch = v.local?.toLowerCase().includes('brasil') || v.local?.toLowerCase().includes('br');
      } else if (filtroAtivo === 'Internacionais') {
        filtroMatch = !(v.local?.toLowerCase().includes('brasil') || v.local?.toLowerCase().includes('br'));
      } else {
        filtroMatch = v.tags && v.tags.some((t: string) => t.toLowerCase() === filtroAtivo.toLowerCase());
      }
    }

    return match && filtroMatch;
  });

  const hasInteracted = searchText.trim().length > 0 || filtroAtivo !== 'Todos';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      {/* Header Row */}
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 16, marginBottom: 12 }]}>
        <View style={{ flexShrink: 1, paddingRight: 16 }}>
          <View style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
            <BrandLogo />
          </View>
          <Text style={[styles.title, { color: colors.textMain }]}>Explorar Vagas</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Encontre a oportunidade perfeita</Text>
        </View>
        <IlluSearch width={110} height={100} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Search & Filter Row */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <TextInputField
              placeholder="Ex: React, Designer, Remoto..."
              icon="search"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          
          <TouchableOpacity 
            style={{ width: 48, height: 48, backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => { /* feedback visual, busca já é realtime */ }}
          >
            <MaterialIcons name="check" size={24} color={isDark ? colors.background : COLORS.surface} />
          </TouchableOpacity>

          {/* Botão de Filtro Retrátil */}
          <TouchableOpacity 
            style={{ width: 48, height: 48, backgroundColor: colors.cardBackground, borderRadius: 8, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setModalFiltrosVisible(!modalFiltrosVisible)}
          >
            <MaterialIcons name="filter-list" size={24} color={colors.textMain} />
            {filtroAtivo !== 'Todos' && (
              <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.searchHint, { color: colors.textSecondary, marginTop: 8, marginBottom: 12 }]}>
          Dica: Pesquise por linguagens, cargos ou modelo.
        </Text>

        {/* Filtros Retráteis */}
        {modalFiltrosVisible && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            {FILTROS.map((filtro) => (
              <FilterChip
                key={filtro}
                label={filtro}
                active={filtroAtivo === filtro}
                onPress={() => setFiltroAtivo(filtro)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'externas' && { borderBottomColor: colors.accent }]}
          onPress={() => setAbaAtiva('externas')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, abaAtiva === 'externas' && { color: colors.accent }]}>
            Globais
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'internas' && { borderBottomColor: colors.accent }]}
          onPress={() => setAbaAtiva('internas')}
        >
          <Text style={[styles.tabText, { color: colors.textSecondary }, abaAtiva === 'internas' && { color: colors.accent }]}>
            TechConnect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Counter */}
      <Text style={[styles.counter, { color: colors.textSecondary }]}>{vagasFiltradas.length} oportunidades encontradas</Text>

      {/* Vagas List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : vagasFiltradas.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateTitle, { color: colors.textMain }]}>Nenhuma vaga encontrada 🌍</Text>
          <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>Tente pesquisar usando outras palavras-chave ou altere os filtros.</Text>
        </View>
      ) : (
        <FlatList
          data={vagasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity onPress={() => router.push(`/job/${item.id}?fonte=${item.fonte || ''}`)} activeOpacity={0.8}>
              <Card style={styles.vagaItem}>
                <View style={styles.vagaMainRow}>
                  {/* Info na esquerda */}
                  <View style={styles.vagaInfo}>
                    <Text style={[styles.vagaTitle, { color: colors.textMain }]} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                    <Text style={[styles.vagaCompany, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.empresa || 'Confidencial'}
                    </Text>
                    <Text style={[styles.vagaLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.local || 'Não especificada'}
                    </Text>
                    
                    {item.tags && item.tags.length > 0 && (
                      <View style={styles.vagaTags}>
                        {item.tags.slice(0, 2).map((tag: string, i: number) => (
                          <Tag key={i} label={tag} variant="gray" />
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Botão Favorito na direita */}
                  <TouchableOpacity
                    onPress={() => toggleFavorito(item)}
                    disabled={salvandoFavId === item.id}
                    style={styles.favoriteBtn}
                  >
                    <MaterialIcons
                      name={favoritosMap[item.id] ? 'favorite' : 'favorite-border'}
                      size={22}
                      color={favoritosMap[item.id] ? colors.accent : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

              <View style={[styles.vagaFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.vagaTime, { color: colors.textSecondary }]}>{item.tempoPostagem || item.data}</Text>
                {item.tipo === 'local' && <Tag label="⭐ Vaga Exclusiva" variant="purple" />}
              </View>
            </Card>
          </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    maxHeight: 50,
  },
  chipsContent: {
    gap: 8,
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: COLORS.accent,
  },
  counter: {
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  vagaItem: {
    padding: 14,
    marginBottom: 8,
  },
  vagaMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  companyLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    fontFamily: 'DMSans_800ExtraBold',
  },
  favoriteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  vagaInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vagaTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  vagaCompany: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  vagaLocation: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  vagaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  vagaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  vagaTime: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
