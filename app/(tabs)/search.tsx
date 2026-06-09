import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
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

const FILTROS = ['Todos', 'Remoto', 'Híbrido', 'PJ', 'CLT'];

export default function SearchScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('externas');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

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

      try {
        const snap = await getDocs(collection(db, 'vagas'));
        const internas = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VagaInterna));
        setVagasInternas(internas.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')));
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
    const filtroMatch =
      filtroAtivo === 'Todos' || (v.tags && v.tags.some((t: string) => t.includes(filtroAtivo)));
    return match && filtroMatch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorar Vagas</Text>
        <Text style={styles.subtitle}>Encontre a oportunidade perfeita</Text>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInputField
          placeholder="Buscar vagas..."
          icon="search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        contentContainerStyle={styles.chipsContent}
      >
        {FILTROS.map((filtro) => (
          <FilterChip
            key={filtro}
            label={filtro}
            active={filtroAtivo === filtro}
            onPress={() => setFiltroAtivo(filtro)}
          />
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'externas' && styles.tabActive]}
          onPress={() => setAbaAtiva('externas')}
        >
          <Text style={[styles.tabText, abaAtiva === 'externas' && styles.tabTextActive]}>
            Globais
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'internas' && styles.tabActive]}
          onPress={() => setAbaAtiva('internas')}
        >
          <Text style={[styles.tabText, abaAtiva === 'internas' && styles.tabTextActive]}>
            TechConnect
          </Text>
        </TouchableOpacity>
      </View>

      {/* Counter */}
      <Text style={styles.counter}>{vagasFiltradas.length} oportunidades encontradas</Text>

      {/* Vagas List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={vagasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.vagaItem}>
              <View style={styles.vagaHeader}>
                <View style={[styles.companyLogo, { backgroundColor: item.tipo === 'local' ? COLORS.primary : COLORS.accent }]}>
                  <Text style={styles.companyLogoText}>{item.empresa ? item.empresa.charAt(0).toUpperCase() : 'C'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleFavorito(item)}
                  disabled={salvandoFavId === item.id}
                  style={styles.favoriteBtn}
                >
                  <MaterialIcons
                    name={favoritosMap[item.id] ? 'favorite' : 'favorite-border'}
                    size={22}
                    color={favoritosMap[item.id] ? COLORS.accent : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.vagaContent}>
                <View style={styles.vagaInfo}>
                  <Text style={styles.vagaTitle} numberOfLines={2}>
                    {item.titulo}
                  </Text>
                  <Text style={styles.vagaCompany} numberOfLines={1}>
                    {item.empresa || 'Confidencial'}
                  </Text>
                  <Text style={styles.vagaLocation}>{item.local || 'Localização não especificada'}</Text>

                  <View style={styles.vagaTags}>
                    {item.tags && item.tags.slice(0, 2).map((tag: string, i: number) => (
                      <Tag key={i} label={tag} variant="gray" />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.vagaFooter}>
                <Text style={styles.vagaTime}>{item.tempoPostagem || item.data}</Text>
                {item.tipo === 'local' && <Tag label="⭐ Vaga Exclusiva" variant="purple" />}
              </View>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
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
    paddingTop: 16,
    paddingBottom: 12,
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
  chipsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 44,
  },
  chipsContent: {
    gap: 8,
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
    color: COLORS.textSecondary,
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
    padding: 16,
    marginBottom: 4,
  },
  vagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    fontFamily: 'DMSans_800ExtraBold',
  },
  favoriteBtn: {
    padding: 4,
  },
  vagaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vagaInfo: {
    flex: 1,
  },
  vagaTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  vagaCompany: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vagaLocation: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  vagaTags: {
    flexDirection: 'row',
    gap: 8,
  },
  vagaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  vagaTime: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
  },
});
