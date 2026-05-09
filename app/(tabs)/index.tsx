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
import { salvarFavorito, removerFavorito, buscarFavoritos } from '../../src/services/favoritos';

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

const FILTROS_TAGS = [
  'Todos', 'Remoto', 'Híbrido', 'Presencial', 'PJ', 'CLT',
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
    } catch (e) {
      console.log('Erro ao carregar favoritos:', e);
    }
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
        empresa: vaga.empresa || 'Empresa Confidencial',
        fonte: 'fonte' in vaga ? vaga.fonte : 'WorkConnect',
        link: 'link' in vaga ? vaga.link : '',
      });
      Alert.alert('Salvo!', 'Vaga salva nos favoritos.');
    }
  };

  const abrirVagaExterna = (link: string) => {
    if (link) Linking.openURL(link);
  };

  const matchTagFiltro = (tags: string[], f: string) => {
    if (f === 'Todos') return true;
    if (f === 'Exterior') return tags.some(t => t.includes('Worldwide') || t.includes('Europa') || t.includes('EUA') || t.includes('LATAM'));
    return tags.includes(f);
  };

  const vagasExternasFiltradas = vagasExternas.filter(v => matchTagFiltro(v.tags || [], filtroTag));

  const vagasInternasFiltradas = vagasInternas.filter(v => {
    const matchBusca = busca === '' || v.titulo.toLowerCase().includes(busca.toLowerCase());
    
    // Filtro simplificado para internas usando tipo de contrato ou vaga
    if (filtroTag === 'Todos') return matchBusca;
    if (filtroTag === 'PJ' && v.contrato.toLowerCase() !== 'pj') return false;
    if (filtroTag === 'CLT' && v.contrato.toLowerCase() !== 'clt') return false;
    if (filtroTag === 'Remoto' && !v.titulo.toLowerCase().includes('remoto')) return false;
    // ...se não bater nos mapeamentos básicos, não exibe
    
    return matchBusca;
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
              placeholder="Buscar profissão, ex: Redes..."
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

        {/* Toggle Abas Principais */}
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

        {/* Aba Ativa: EXTERNAS */}
        {abaAtiva === 'externas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comunidade e Exterior</Text>
              <Text style={styles.resultsCount}>{vagasExternasFiltradas.length} vagas</Text>
            </View>

            {loadingExternas ? (
              <ActivityIndicator color="#2E9D4D" style={{ marginVertical: 20 }} />
            ) : vagasExternasFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma vaga encontrada.</Text>
                <Text style={styles.emptySubText}>Mude o filtro ou tente buscar outra palavra.</Text>
              </View>
            ) : (
              vagasExternasFiltradas.map(vaga => (
                <TouchableOpacity
                  key={vaga.id}
                  style={styles.card}
                  onPress={() => abrirVagaExterna(vaga.link)}
                >
                  <View style={[styles.cardHeader, { alignItems: 'flex-start' }]}>
                    <View style={styles.cardIconExterno}>
                      <FontAwesome name="globe" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitulo, { fontSize: 16 }]}>{vaga.titulo}</Text>
                      {vaga.empresa ? <Text style={styles.cardEmpresa}>{vaga.empresa}</Text> : null}
                      
                      {/* Tags */}
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
                    <TouchableOpacity onPress={() => toggleFavorito(vaga)} style={{ padding: 4 }}>
                      <FontAwesome
                        name={favoritos.includes(vaga.id) ? 'heart' : 'heart-o'}
                        size={20}
                        color={favoritos.includes(vaga.id) ? '#DC2626' : '#83829A'}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFonte}>⏱️ {vaga.tempoPostagem} • {vaga.fonte}</Text>
                    <Text style={styles.cardExterno}>Ver Vaga →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Aba Ativa: INTERNAS */}
        {abaAtiva === 'internas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exclusivas do App</Text>
              <TouchableOpacity onPress={carregarVagasInternas}>
                <Text style={styles.seeAll}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingInternas ? (
              <ActivityIndicator color="#2E9D4D" style={{ marginVertical: 20 }} />
            ) : vagasInternasFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nenhuma vaga encontrada.</Text>
                <Text style={styles.emptySubText}>Seja o primeiro a publicar!</Text>
              </View>
            ) : (
              vagasInternasFiltradas.map(vaga => (
                <TouchableOpacity 
                  key={vaga.id} 
                  style={styles.card}
                  onPress={() => router.push(`/job/${vaga.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIcon, vaga.tipo === 'freelancer' && styles.cardIconRoxo]}>
                      <FontAwesome
                        name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'}
                        size={20} color="#FFFFFF"
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitulo, { fontSize: 16 }]}>{vaga.titulo}</Text>
                      <Text style={styles.cardEmpresa}>{vaga.empresa}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorito(vaga)}>
                      <FontAwesome
                        name={favoritos.includes(vaga.id) ? 'heart' : 'heart-o'}
                        size={20}
                        color={favoritos.includes(vaga.id) ? '#DC2626' : '#83829A'}
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
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  scrollContent: { padding: 24, paddingTop: 0, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FAFAFC',
  },
  greeting: { fontSize: 24, color: '#312651', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#83829A', marginTop: 4 },
  avatar: {
    width: 50, height: 50, backgroundColor: '#EFEFEF',
    borderRadius: 25, justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: { flexDirection: 'row', marginTop: 10, height: 50, marginBottom: 16 },
  searchWrapper: {
    flex: 1, backgroundColor: '#FFFFFF', marginRight: 12,
    justifyContent: 'center', alignItems: 'center', borderRadius: 12,
    flexDirection: 'row', borderWidth: 1, borderColor: '#EFEFEF',
  },
  searchIcon: { marginLeft: 16, marginRight: 8 },
  searchInput: { flex: 1, height: '100%', color: '#312651', fontSize: 16 },
  searchBtn: {
    width: 50, height: '100%', backgroundColor: '#2E9D4D',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  abasContainer: { flexDirection: 'row', backgroundColor: '#EFEFEF', borderRadius: 12, padding: 4, marginBottom: 16 },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  abaBtnAtiva: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  abaText: { fontSize: 14, color: '#83829A', fontWeight: '600' },
  abaTextAtiva: { color: '#312651' },
  filtroBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFEFEF',
  },
  filtroBtnAtivo: { backgroundColor: '#2E9D4D', borderColor: '#2E9D4D' },
  filtroText: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  filtroTextAtivo: { color: '#FFFFFF' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, color: '#312651', fontWeight: 'bold' },
  resultsCount: { fontSize: 14, color: '#83829A', fontWeight: '600' },
  seeAll: { fontSize: 14, color: '#83829A' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: {
    width: 44, height: 44, backgroundColor: '#2E9D4D',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardIconRoxo: { backgroundColor: '#6A3093' },
  cardIconExterno: {
    width: 44, height: 44, backgroundColor: '#F59E0B',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitulo: { fontWeight: 'bold', color: '#312651', marginBottom: 4 },
  cardEmpresa: { fontSize: 14, color: '#83829A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContrato: { fontSize: 13, color: '#6B7280' },
  cardSalario: { fontSize: 14, color: '#6A3093', fontWeight: 'bold' },
  cardFonte: { fontSize: 13, color: '#83829A', fontWeight: '500' },
  cardExterno: { fontSize: 13, color: '#2E9D4D', fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagBadge: { backgroundColor: '#EFEFEF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#312651', fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#EFEFEF',
  },
  emptyText: { fontSize: 16, color: '#312651', fontWeight: 'bold', marginBottom: 4 },
  emptySubText: { fontSize: 14, color: '#83829A', textAlign: 'center' },
});
