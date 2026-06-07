import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/theme/ThemeContext';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

interface AvaliacaoData {
  id: string;
  criadoEm: any;
  respostas: Record<number, any>;
}

export default function AdminDashboard() {
  const { colors } = useTheme();
  
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'pesquisas'>('usuarios');
  
  // Dados de Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Dados de Pesquisas
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loadingPesquisas, setLoadingPesquisas] = useState(true);

  const carregarUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'users'), orderBy('criadoEm', 'desc'), limit(100));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
      setUsuarios(lista);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const carregarPesquisas = async () => {
    setLoadingPesquisas(true);
    try {
      // Busca Total de Visitas
      const docRef = doc(db, 'avaliacoes_stats', 'metrics');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTotalVisits(docSnap.data().visits || 0);
      }

      // Busca Respostas Reais
      const q = query(collection(db, 'avaliacoes'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AvaliacaoData[];
      setAvaliacoes(lista);
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
    } finally {
      setLoadingPesquisas(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'usuarios' && usuarios.length === 0) carregarUsuarios();
    if (abaAtiva === 'pesquisas' && avaliacoes.length === 0) carregarPesquisas();
  }, [abaAtiva]);

  // ──────────────────────────────────────────────────────────────────────────
  // ANÁLISE DE DADOS (PESQUISAS)
  // ──────────────────────────────────────────────────────────────────────────

  const calcConversion = () => {
    if (totalVisits === 0) return 0;
    return ((avaliacoes.length / totalVisits) * 100).toFixed(1);
  };

  const calculateNps = () => {
    if (avaliacoes.length === 0) return 0;
    let promotores = 0;
    let detratores = 0;
    avaliacoes.forEach(a => {
      const score = a.respostas[10]?.score;
      if (score >= 9) promotores++;
      if (score <= 6) detratores++;
    });
    const total = avaliacoes.length;
    return (((promotores - detratores) / total) * 100).toFixed(0);
  };

  // Calcula a média das notas (1 a 5) de uma pergunta do tipo 'scale+reason'
  const getAverageScale = (qId: number) => {
    if (avaliacoes.length === 0) return 0;
    let sum = 0;
    let count = 0;
    avaliacoes.forEach(a => {
      const scale = a.respostas[qId]?.scale;
      if (scale !== undefined) {
        sum += (scale + 1); // porque nosso array era 0-4 internamente
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '0';
  };

  const getOpenComments = (qId: number) => {
    return avaliacoes
      .map(a => a.respostas[qId]?.openText)
      .filter(text => text && text.trim().length > 0);
  };

  const renderProgressChart = (title: string, current: string | number, max: number, suffix: string = '') => {
    const percent = Math.min((Number(current) / max) * 100, 100);
    return (
      <View style={styles.chartItem}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.chartValue, { color: colors.textPrimary }]}>{current}{suffix}</Text>
        </View>
        <View style={styles.chartBarBg}>
          <View style={[styles.chartBarFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Painel Admin</Text>
        
        {/* Toggle Abas */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'usuarios' && styles.toggleBtnActive]}
            onPress={() => setAbaAtiva('usuarios')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'usuarios' && styles.toggleTextActive]}>Usuários</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'pesquisas' && styles.toggleBtnActive]}
            onPress={() => setAbaAtiva('pesquisas')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'pesquisas' && styles.toggleTextActive]}>Pesquisas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {abaAtiva === 'usuarios' && (
          <View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <FontAwesome name="users" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{loadingUsers ? '...' : usuarios.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Usuários Cadastrados</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Lista de Usuários</Text>
              <TouchableOpacity onPress={carregarUsuarios}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingUsers ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : usuarios.map((user) => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{user.nome ? user.nome.slice(0, 2).toUpperCase() : 'US'}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>{user.nome || 'Sem Nome'}</Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>{user.email}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {abaAtiva === 'pesquisas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Funil de Conversão</Text>
              <TouchableOpacity onPress={carregarPesquisas}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingPesquisas ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <>
                <View style={styles.funnelContainer}>
                  <View style={[styles.funnelBox, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={styles.funnelValue}>{totalVisits}</Text>
                    <Text style={styles.funnelLabel}>Visitas no Formulário</Text>
                  </View>
                  <View style={[styles.funnelBox, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={styles.funnelValue}>{avaliacoes.length}</Text>
                    <Text style={styles.funnelLabel}>Respostas Enviadas</Text>
                  </View>
                  <View style={[styles.funnelBox, { backgroundColor: '#CDFE00' }]}>
                    <Text style={[styles.funnelValue, { color: '#111827' }]}>{calcConversion()}%</Text>
                    <Text style={[styles.funnelLabel, { color: '#111827' }]}>Taxa de Conversão</Text>
                  </View>
                </View>

                {avaliacoes.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Métricas de Satisfação (Médias)</Text>
                    </View>

                    <View style={[styles.chartsContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                      {renderProgressChart('Design Visual (1-5)', getAverageScale(2), 5)}
                      {renderProgressChart('Navegação Intuitiva (1-5)', getAverageScale(3), 5)}
                      {renderProgressChart('Eficiência de Filtros (1-5)', getAverageScale(4), 5)}
                      {renderProgressChart('Qualidade das Vagas (1-5)', getAverageScale(5), 5)}
                      {renderProgressChart('Fluxo de Candidatura (1-5)', getAverageScale(7), 5)}
                      {renderProgressChart('Resolução de Problema (1-5)', getAverageScale(9), 5)}
                      
                      <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                        <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Net Promoter Score (NPS)</Text>
                        <Text style={{ fontSize: 32, fontWeight: '800', color: calculateNps() > 50 ? '#10B981' : '#F59E0B' }}>
                          {calculateNps()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Comentários Finais (NPS)</Text>
                    </View>

                    {getOpenComments(10).length === 0 ? (
                      <Text style={{ color: colors.textSecondary }}>Nenhum comentário deixado.</Text>
                    ) : (
                      getOpenComments(10).map((comment, index) => (
                        <View key={index} style={styles.commentBox}>
                          <FontAwesome name="quote-left" size={14} color="#D1D5DB" style={{ marginBottom: 8 }} />
                          <Text style={styles.commentText}>{comment}</Text>
                        </View>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  toggleTextActive: { color: '#111827' },
  
  scrollContent: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  
  statCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 16 },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 13 },

  funnelContainer: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  funnelBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  funnelValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  funnelLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', textAlign: 'center' },

  chartsContainer: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 16 },
  chartItem: { marginBottom: 4 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  chartTitle: { fontSize: 13, fontWeight: '600' },
  chartValue: { fontSize: 13, fontWeight: '800' },
  chartBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  chartBarFill: { height: '100%', backgroundColor: '#2E9D4D', borderRadius: 4 },

  commentBox: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  commentText: { fontSize: 14, color: '#4B5563', lineHeight: 22, fontStyle: 'italic' },
});
