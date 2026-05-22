import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Linking, ActivityIndicator, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import {
  buscarVagasComCache,
  limparCacheVagas,
  VagaExterna
} from '../../src/services/vagasExternas';

const tempoRelativo = (dataString: string) => {
  if (!dataString) return '';
  const diff = Date.now() - new Date(dataString).getTime();
  if (isNaN(diff)) return '';
  
  const minutos = Math.floor(diff / (1000 * 60));
  if (minutos < 60) return minutos < 2 ? 'há pouco tempo' : `há ${minutos} mins`;
  
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
  
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias > 1 ? 's' : ''}`;
};

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

const FILTROS_TAGS = [
  'Todos', 'Remoto', 'Híbrido', 'PJ', 'CLT', 'Freelance',
  'Júnior', 'Pleno', 'Sênior', 'DevOps', 'Exterior'
];

export default function Home() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [busca, setBusca] = useState('');
  const [vagasExternas, setVagasExternas] = useState<VagaExterna[]>([]);
  const [vagasInternas, setVagasInternas] = useState<VagaInterna[]>([]);
  const [loadingExternas, setLoadingExternas] = useState(true);
  const [loadingInternas, setLoadingInternas] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('externas');
  const [filtroTag, setFiltroTag] = useState('Todos');
  const [erroExternas, setErroExternas] = useState(false);
  const [erroInternas, setErroInternas] = useState(false);
  const buscaTimeout = useRef<any>(null);

  // Carrega TUDO na inicialização em paralelo
  useEffect(() => {
    carregarVagasExternas();
    carregarVagasInternas();
  }, []);

  const carregarVagasExternas = async (forcarAtualizacao = false) => {
    setLoadingExternas(true);
    setErroExternas(false);
    try {
      if (forcarAtualizacao) limparCacheVagas();
      const resultado = await Promise.race([
        buscarVagasComCache(),
        new Promise<VagaExterna[]>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        )
      ]);
      setVagasExternas(resultado as VagaExterna[]);
    } catch (e) {
      console.log('Erro ao buscar vagas externas:', e);
      setErroExternas(true);
      setVagasExternas([]);
    } finally {
      setLoadingExternas(false);
    }
  };

  const carregarVagasInternas = async () => {
    setLoadingInternas(true);
    setErroInternas(false);
    try {
      const snapshot = await getDocs(collection(db, 'vagas'));
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VagaInterna));
      // Ordena por data de criação (mais recente primeiro)
      lista.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
      setVagasInternas(lista);
    } catch (e) {
      console.log('Erro ao carregar vagas internas:', e);
      setErroInternas(true);
    } finally {
      setLoadingInternas(false);
    }
  };

  const limparBusca = () => setBusca('');

  const handleRefreshAndScrollToTop = () => {
    if (abaAtiva === 'externas') {
      carregarVagasExternas(true);
    } else {
      carregarVagasInternas();
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Filtro de texto local — nunca re-chama a API
  const termoBusca = busca.toLowerCase().trim();

  const matchTagFiltro = (tags: string[], local: string, f: string) => {
    if (f === 'Todos') return true;
    if (f === 'Exterior') {
      return local.includes('🌍') ||
        local.toLowerCase().includes('internac') ||
        local.toLowerCase().includes('europe') ||
        local.toLowerCase().includes('usa');
    }
    if (f === 'DevOps') return tags.some(t => t.toLowerCase().includes('devops'));
    return tags.some(t => t.toLowerCase() === f.toLowerCase());
  };

  // Filtragem 100% local — sem nova chamada à API
  const vagasExternasFiltradas = vagasExternas.filter(v => {
    if (!matchTagFiltro(v.tags || [], v.local || '', filtroTag)) return false;
    if (!termoBusca) return true;
    return (
      v.titulo.toLowerCase().includes(termoBusca) ||
      (v.empresa || '').toLowerCase().includes(termoBusca) ||
      (v.local || '').toLowerCase().includes(termoBusca) ||
      (v.tags || []).some(t => t.toLowerCase().includes(termoBusca))
    );
  });

  const vagasInternasFiltradas = vagasInternas.filter(v => {
    if (termoBusca && !v.titulo.toLowerCase().includes(termoBusca) &&
        !(v.empresa || '').toLowerCase().includes(termoBusca) &&
        !(v.descricao || '').toLowerCase().includes(termoBusca)) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'PJ') return v.contrato?.toLowerCase().includes('pj');
    if (filtroTag === 'CLT') return v.contrato?.toLowerCase().includes('clt');
    if (filtroTag === 'Remoto') return v.contrato?.toLowerCase().includes('remoto') || v.descricao?.toLowerCase().includes('remoto');
    return true;
  });

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Encontre sua próxima oportunidade</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
          <FontAwesome name="user" size={22} color="#2E9D4D" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >

        {/* Busca e Refresh */}
        <View style={styles.searchHeaderWrapper}>
          <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <FontAwesome name="search" size={16} color="#83829A" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: Redes, DevOps, React..."
              placeholderTextColor="#83829A"
              value={busca}
              onChangeText={setBusca}
              returnKeyType="search"
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={limparBusca} style={styles.clearBtn}>
                <FontAwesome name="times-circle" size={16} color="#83829A" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleRefreshAndScrollToTop} style={styles.refreshTopBtn}>
            <FontAwesome name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </View>

        {/* Abas principais */}
        <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'externas' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('externas')}
          >
            <Text style={[styles.abaText, abaAtiva === 'externas' && styles.abaTextAtiva]}>
              🌍 Vagas Globais
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'internas' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('internas')}
          >
            <Text style={[styles.abaText, abaAtiva === 'internas' && styles.abaTextAtiva]}>
              🏢 WorkConnect
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosScroll}
          style={{ marginBottom: 16 }}
        >
          {FILTROS_TAGS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBtn, filtroTag === f && styles.filtroBtnAtivo]}
              onPress={() => setFiltroTag(f)}
            >
              <Text style={[styles.filtroText, filtroTag === f && styles.filtroTextAtivo]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── ABA: VAGAS GLOBAIS ── */}
        {abaAtiva === 'externas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comunidade & Exterior</Text>
              {!loadingExternas && (
                termoBusca ? (
                  // Quando há busca ativa: mostra quantas encontrou + botão limpar
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.resultsCount}>{vagasExternasFiltradas.length} vagas</Text>
                    <TouchableOpacity onPress={limparBusca} style={styles.limparFiltroBtn}>
                      <Text style={styles.limparFiltroText}>✕ Limpar busca</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Sem busca: mostra apenas o total
                  <Text style={styles.resultsCount}>{vagasExternas.length} vagas</Text>
                )
              )}
            </View>

            {loadingExternas ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color="#2E9D4D" size="large" />
                <Text style={styles.loadingText}>Buscando vagas...</Text>
              </View>
            ) : erroExternas ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="wifi" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>Sem conexão com as APIs</Text>
                <TouchableOpacity style={styles.reloadBtn} onPress={() => carregarVagasExternas('')}>
                  <Text style={styles.reloadBtnText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : vagasExternasFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="search" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>Nenhuma vaga encontrada</Text>
                <Text style={styles.emptySubText}>Mude o filtro ou busque outra área</Text>
              </View>
            ) : (
              vagasExternasFiltradas.map(vaga => {
                const corFonte = COR_FONTE[vaga.fonte] || '#83829A';
                const icone = ICONE_FONTE[vaga.fonte] || 'globe';
                return (
                  <TouchableOpacity
                    key={vaga.id}
                    style={styles.card}
                    onPress={() => Linking.openURL(vaga.link)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardTop}>
                      <View style={[styles.cardIconCircle, { backgroundColor: corFonte + '18' }]}>
                        <FontAwesome name={icone as any} size={20} color={corFonte} />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitulo} numberOfLines={2}>{vaga.titulo}</Text>
                        {vaga.empresa ? (
                          <Text style={styles.cardEmpresa}>{vaga.empresa}</Text>
                        ) : null}
                        {vaga.local ? (
                          <View style={styles.localRow}>
                            <FontAwesome name="map-marker" size={11} color="#2E9D4D" />
                            <Text style={styles.localText}>{' '}{vaga.local}</Text>
                          </View>
                        ) : null}
                        {vaga.tags && vaga.tags.length > 0 && (
                          <View style={styles.tagsContainer}>
                            {vaga.tags.map((tag, idx) => (
                              <View key={idx} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{tag}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <View style={[styles.fonteBadge, { backgroundColor: corFonte + '15' }]}>
                        <Text style={[styles.fonteText, { color: corFonte }]}>{vaga.fonte}</Text>
                      </View>
                      <Text style={styles.tempoText}>⏱{' '}{vaga.tempoPostagem}</Text>
                      <Text style={styles.cardExterno}>Ver vaga →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ── ABA: WORKCONNECT ── */}
        {abaAtiva === 'internas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exclusivas do App</Text>
              <TouchableOpacity onPress={carregarVagasInternas}>
                <Text style={styles.seeAll}>↻ Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingInternas ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color="#2E9D4D" size="large" />
                <Text style={styles.loadingText}>Carregando vagas...</Text>
              </View>
            ) : erroInternas ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="exclamation-circle" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>Erro ao carregar vagas</Text>
                <TouchableOpacity style={styles.reloadBtn} onPress={carregarVagasInternas}>
                  <Text style={styles.reloadBtnText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : vagasInternasFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="briefcase" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>
                  {filtroTag === 'Todos'
                    ? 'Nenhuma vaga publicada ainda'
                    : `Sem vagas com filtro "${filtroTag}"`}
                </Text>
                <TouchableOpacity
                  style={styles.reloadBtn}
                  onPress={() => router.push('/(tabs)/post-job')}
                >
                  <Text style={styles.reloadBtnText}>+ Publicar Vaga</Text>
                </TouchableOpacity>
              </View>
            ) : (
              vagasInternasFiltradas.map(vaga => (
                <TouchableOpacity
                  key={vaga.id}
                  style={styles.card}
                  onPress={() => router.push(`/job/${vaga.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIconCircle, {
                      backgroundColor: vaga.tipo === 'freelancer' ? '#6A309318' : '#2E9D4D18'
                    }]}>
                      <FontAwesome
                        name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'}
                        size={20}
                        color={vaga.tipo === 'freelancer' ? '#6A3093' : '#2E9D4D'}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitulo} numberOfLines={2}>{vaga.titulo}</Text>
                      <Text style={styles.cardEmpresa}>{vaga.empresa}</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.tempoText}>⏱{' '}{tempoRelativo(vaga.criadoEm)}</Text>
                    <Text style={styles.cardContrato}>{vaga.contrato}</Text>
                    <Text style={styles.cardSalario}>{vaga.salario}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 18, backgroundColor: '#F4F5F7',
  },
  greeting: { fontSize: 22, color: '#1A1A2E', fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#83829A', marginTop: 3 },
  avatar: {
    width: 46, height: 46, backgroundColor: '#FFFFFF',
    borderRadius: 23, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  searchHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: 10,
    backgroundColor: '#F4F5F7',
    zIndex: 10,
  },
  searchContainer: { flex: 1, flexDirection: 'row', height: 48 },
  searchWrapper: {
    flex: 1, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    borderRadius: 14, flexDirection: 'row', borderWidth: 1, borderColor: '#E8E8E8',
  },
  refreshTopBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#2E9D4D',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#2E9D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginLeft: 14, marginRight: 8 },
  searchInput: { flex: 1, height: '100%', color: '#1A1A2E', fontSize: 14 },
  clearBtn: { paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  abasContainer: {
    flexDirection: 'row', backgroundColor: '#E8E9EC', borderRadius: 14,
    padding: 4, marginBottom: 12,
  },
  abaBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  abaBtnAtiva: {
    backgroundColor: '#FFFFFF',
  },
  abaText: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  abaTextAtiva: { color: '#1A1A2E', fontWeight: '700' },
  filtrosScroll: { gap: 8, paddingRight: 8 },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E8E8',
  },
  filtroBtnAtivo: { backgroundColor: '#2E9D4D', borderColor: '#2E9D4D' },
  filtroText: { fontSize: 12, color: '#83829A', fontWeight: '600' },
  filtroTextAtivo: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, color: '#1A1A2E', fontWeight: '700' },
  resultsCount: { fontSize: 12, color: '#83829A', fontWeight: '600' },
  seeAll: { fontSize: 13, color: '#83829A' },
  loadingCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 40,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#EFEFEF',
  },
  loadingText: { fontSize: 14, color: '#83829A' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#EFEFEF',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardIconCircle: {
    width: 44, height: 44, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', lineHeight: 20, marginBottom: 2 },
  cardEmpresa: { fontSize: 12, color: '#83829A', marginBottom: 5 },
  localRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  localText: { fontSize: 11, color: '#2E9D4D', fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tagBadge: { backgroundColor: '#F0F0F5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#5A5A7A', fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F5',
  },
  fonteBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  fonteText: { fontSize: 10, fontWeight: '700' },
  tempoText: { fontSize: 11, color: '#83829A', flex: 1 },
  cardExterno: { fontSize: 12, color: '#2E9D4D', fontWeight: '700' },
  cardContrato: { fontSize: 12, color: '#6B7280', flex: 1 },
  cardSalario: { fontSize: 13, color: '#6A3093', fontWeight: 'bold' },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 32,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#EFEFEF',
  },
  emptyText: { fontSize: 15, color: '#312651', fontWeight: 'bold', marginTop: 8 },
  emptySubText: { fontSize: 13, color: '#83829A', textAlign: 'center' },
  reloadBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#2E9D4D', borderRadius: 10,
  },
  reloadBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  limparFiltroBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#FFF0F0', borderRadius: 8, borderWidth: 1, borderColor: '#FFCCCC',
  },
  limparFiltroText: { fontSize: 11, color: '#DC2626', fontWeight: '700' },
  cacheBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F5FF', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 6, marginBottom: 12,
  },
  cacheText: { fontSize: 11, color: '#83829A', flex: 1 },
  atualizarAgoraBtn: { paddingHorizontal: 8, paddingVertical: 3 },
  atualizarAgoraText: { fontSize: 11, color: '#2E9D4D', fontWeight: '700' },
});
