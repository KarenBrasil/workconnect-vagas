import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Linking, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasExternas, VagaExterna } from '../../src/services/vagasExternas';
import { salvarFavorito, buscarFavoritos } from '../../src/services/favoritos';

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

// Mapa de fontes para cores distintas do ícone do card
const COR_FONTE: Record<string, string> = {
  'GitHub BR': '#24292e',
  'Remotive': '#4f46e5',
  'RemoteOK': '#0ea5e9',
};

const ICONE_FONTE: Record<string, string> = {
  'GitHub BR': 'github',
  'Remotive': 'globe',
  'RemoteOK': 'laptop',
};

const FILTROS_TAGS = [
  'Todos', 'Remoto', 'Híbrido', 'Presencial',
  'PJ', 'CLT', 'Freelance', 'Júnior', 'Pleno', 'Sênior',
  'Redes', 'Suporte', 'Dados', 'DevOps', 'Exterior'
];

export default function Home() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [vagasInternas, setVagasInternas] = useState<VagaInterna[]>([]);
  const [vagasExternas, setVagasExternas] = useState<VagaExterna[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loadingInternas, setLoadingInternas] = useState(false);
  const [loadingExternas, setLoadingExternas] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'externas' | 'internas'>('externas');
  const [filtroTag, setFiltroTag] = useState<string>('Todos');

  const userId = auth.currentUser?.uid || 'anonimo';

  useEffect(() => {
    carregarVagasInternas();
    carregarVagasExternas('');
    carregarFavoritos();
  }, []);

  const carregarVagasInternas = async () => {
    setLoadingInternas(true);
    try {
      const snapshot = await getDocs(collection(db, 'vagas'));
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VagaInterna));
      setVagasInternas(lista);
    } catch (e) {
      console.log('Erro ao carregar vagas internas:', e);
    } finally {
      setLoadingInternas(false);
    }
  };

  const carregarVagasExternas = async (termo: string) => {
    setLoadingExternas(true);
    try {
      const vagas = await buscarVagasExternas(termo);
      setVagasExternas(vagas);
    } catch (e) {
      console.log('Erro ao carregar vagas externas:', e);
    } finally {
      setLoadingExternas(false);
    }
  };

  const carregarFavoritos = async () => {
    try {
      const favs = await buscarFavoritos(userId);
      setFavoritos(favs.map(f => f.vagaId));
    } catch (e) {}
  };

  const handleBuscar = () => {
    const termo = busca.trim();
    setTermoBusca(termo);
    carregarVagasExternas(termo);
  };

  const toggleFavorito = async (vaga: VagaInterna | VagaExterna) => {
    const vagaId = vaga.id;
    if (favoritos.includes(vagaId)) {
      setFavoritos(prev => prev.filter(f => f !== vagaId));
      Alert.alert('Removido', 'Vaga removida dos favoritos.');
    } else {
      setFavoritos(prev => [...prev, vagaId]);
      await salvarFavorito({
        userId,
        vagaId,
        titulo: vaga.titulo,
        empresa: vaga.empresa || '',
        fonte: 'fonte' in vaga ? vaga.fonte : 'WorkConnect',
        link: 'link' in vaga ? vaga.link : '',
      });
      Alert.alert('Salvo!', 'Vaga salva nos favoritos.');
    }
  };

  const matchTagFiltro = (tags: string[], local: string, f: string) => {
    if (f === 'Todos') return true;
    if (f === 'Exterior') {
      return local.includes('🌍') || local.toLowerCase().includes('internac') ||
        local.toLowerCase().includes('europe') || local.toLowerCase().includes('usa');
    }
    if (f === 'Redes') return tags.some(t => t.toLowerCase().includes('rede') || t.toLowerCase().includes('network'));
    if (f === 'Suporte') return tags.some(t => t.toLowerCase().includes('suporte') || t.toLowerCase().includes('support'));
    if (f === 'Dados') return tags.some(t => t.toLowerCase().includes('dado') || t.toLowerCase().includes('data'));
    if (f === 'DevOps') return tags.some(t => t.toLowerCase().includes('devops'));
    return tags.some(t => t.toLowerCase() === f.toLowerCase());
  };

  const vagasExternasFiltradas = vagasExternas.filter(v =>
    matchTagFiltro(v.tags || [], v.local || '', filtroTag)
  );

  const vagasInternasFiltradas = vagasInternas.filter(v => {
    if (busca && !v.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroTag === 'Todos') return true;
    if (filtroTag === 'PJ') return v.contrato.toLowerCase().includes('pj');
    if (filtroTag === 'CLT') return v.contrato.toLowerCase().includes('clt');
    if (filtroTag === 'Remoto') return v.contrato.toLowerCase().includes('remoto') || v.descricao?.toLowerCase().includes('remoto');
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Encontre sua próxima oportunidade</Text>
        </View>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={24} color="#2E9D4D" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <FontAwesome name="search" size={18} color="#83829A" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: Redes, DevOps, React..."
              placeholderTextColor="#83829A"
              value={busca}
              onChangeText={setBusca}
              onSubmitEditing={handleBuscar}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar}>
            <FontAwesome name="search" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Abas Principais */}
        <View style={styles.abasContainer}>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'externas' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('externas')}
          >
            <Text style={[styles.abaText, abaAtiva === 'externas' && styles.abaTextAtiva]}>🌍 Vagas Globais</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.abaBtn, abaAtiva === 'internas' && styles.abaBtnAtiva]}
            onPress={() => setAbaAtiva('internas')}
          >
            <Text style={[styles.abaText, abaAtiva === 'internas' && styles.abaTextAtiva]}>🏢 WorkConnect</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros em Carrossel */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
        </View>

        {/* ABA: VAGAS GLOBAIS */}
        {abaAtiva === 'externas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comunidade & Exterior</Text>
              <Text style={styles.resultsCount}>{vagasExternasFiltradas.length} vagas</Text>
            </View>

            {loadingExternas ? (
              <ActivityIndicator color="#2E9D4D" style={{ marginVertical: 30 }} size="large" />
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
                    {/* Cabeçalho: ícone + conteúdo + favorito */}
                    <View style={styles.cardTop}>
                      {/* Ícone da fonte com cor única */}
                      <View style={[styles.cardIconCircle, { backgroundColor: corFonte + '18' }]}>
                        <FontAwesome name={icone as any} size={20} color={corFonte} />
                      </View>

                      <View style={styles.cardInfo}>
                        {/* Título completo da vaga */}
                        <Text style={styles.cardTitulo}>{vaga.titulo}</Text>

                        {/* Empresa (se existir) */}
                        {vaga.empresa ? (
                          <Text style={styles.cardEmpresa}>{vaga.empresa}</Text>
                        ) : null}

                        {/* Local separado, destaque visual abaixo do título */}
                        {vaga.local ? (
                          <View style={styles.localRow}>
                            <FontAwesome name="map-marker" size={12} color="#2E9D4D" />
                            <Text style={styles.localText}>{vaga.local}</Text>
                          </View>
                        ) : null}

                        {/* Tags de contrato/modalidade/senioridade */}
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

                      {/* Favorito */}
                      <TouchableOpacity onPress={() => toggleFavorito(vaga)} style={styles.favoriteBtn}>
                        <FontAwesome
                          name={favoritos.includes(vaga.id) ? 'heart' : 'heart-o'}
                          size={18}
                          color={favoritos.includes(vaga.id) ? '#DC2626' : '#C4C4C4'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Rodapé: tempo + fonte + CTA */}
                    <View style={styles.cardFooter}>
                      <View style={[styles.fonteBadge, { backgroundColor: corFonte + '15' }]}>
                        <Text style={[styles.fonteText, { color: corFonte }]}>{vaga.fonte}</Text>
                      </View>
                      <Text style={styles.tempoText}>⏱ {vaga.tempoPostagem}</Text>
                      <Text style={styles.cardExterno}>Ver vaga →</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* ABA: WORKCONNECT */}
        {abaAtiva === 'internas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exclusivas do App</Text>
              <TouchableOpacity onPress={carregarVagasInternas}>
                <Text style={styles.seeAll}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingInternas ? (
              <ActivityIndicator color="#2E9D4D" style={{ marginVertical: 30 }} size="large" />
            ) : vagasInternasFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="briefcase" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>Nenhuma vaga encontrada</Text>
                <Text style={styles.emptySubText}>Seja o primeiro a publicar!</Text>
              </View>
            ) : (
              vagasInternasFiltradas.map(vaga => (
                <TouchableOpacity
                  key={vaga.id}
                  style={styles.card}
                  onPress={() => router.push(`/job/${vaga.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIconCircle, { backgroundColor: vaga.tipo === 'freelancer' ? '#6A309318' : '#2E9D4D18' }]}>
                      <FontAwesome
                        name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'}
                        size={20}
                        color={vaga.tipo === 'freelancer' ? '#6A3093' : '#2E9D4D'}
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitulo}>{vaga.titulo}</Text>
                      <Text style={styles.cardEmpresa}>{vaga.empresa}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorito(vaga)} style={styles.favoriteBtn}>
                      <FontAwesome
                        name={favoritos.includes(vaga.id) ? 'heart' : 'heart-o'}
                        size={18}
                        color={favoritos.includes(vaga.id) ? '#DC2626' : '#C4C4C4'}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardFooter}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#F4F5F7',
  },
  greeting: { fontSize: 24, color: '#1A1A2E', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#83829A', marginTop: 4 },
  avatar: {
    width: 48, height: 48, backgroundColor: '#FFFFFF',
    borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchContainer: { flexDirection: 'row', height: 50, marginBottom: 16 },
  searchWrapper: {
    flex: 1, backgroundColor: '#FFFFFF', marginRight: 10,
    justifyContent: 'center', alignItems: 'center', borderRadius: 14,
    flexDirection: 'row', borderWidth: 1, borderColor: '#E8E8E8',
  },
  searchIcon: { marginLeft: 14, marginRight: 8 },
  searchInput: { flex: 1, height: '100%', color: '#1A1A2E', fontSize: 15 },
  searchBtn: {
    width: 50, backgroundColor: '#2E9D4D',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  abasContainer: {
    flexDirection: 'row', backgroundColor: '#E8E9EC', borderRadius: 14,
    padding: 4, marginBottom: 14,
  },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  abaBtnAtiva: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  abaText: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  abaTextAtiva: { color: '#1A1A2E', fontWeight: '700' },
  filtroBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E8E8',
  },
  filtroBtnAtivo: { backgroundColor: '#2E9D4D', borderColor: '#2E9D4D' },
  filtroText: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  filtroTextAtivo: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, color: '#1A1A2E', fontWeight: '700' },
  resultsCount: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  seeAll: { fontSize: 14, color: '#83829A' },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardIconCircle: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', lineHeight: 22, marginBottom: 3 },
  cardEmpresa: { fontSize: 13, color: '#83829A', marginBottom: 6 },
  localRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  localText: { fontSize: 12, color: '#2E9D4D', fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { backgroundColor: '#F0F0F5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#5A5A7A', fontWeight: '600' },
  favoriteBtn: { padding: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  fonteBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  fonteText: { fontSize: 11, fontWeight: '700' },
  tempoText: { fontSize: 12, color: '#83829A', flex: 1 },
  cardExterno: { fontSize: 13, color: '#2E9D4D', fontWeight: '700' },
  cardContrato: { fontSize: 13, color: '#6B7280', flex: 1 },
  cardSalario: { fontSize: 14, color: '#6A3093', fontWeight: 'bold' },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 32,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#EFEFEF', gap: 8,
  },
  emptyText: { fontSize: 16, color: '#312651', fontWeight: 'bold', marginTop: 8 },
  emptySubText: { fontSize: 14, color: '#83829A', textAlign: 'center' },
});
