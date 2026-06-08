import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

interface AvaliacaoData {
  id: string;
  criadoEm: any;
  status?: string;
  lastStep?: number;
  respostas?: Record<number, any>;
}

export default function AdminDashboard() {
  const { colors, isDark } = useTheme();
  
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'pesquisas' | 'respostas'>('pesquisas');
  
  // Dados de Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dados de Pesquisas
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([]);
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
    if ((abaAtiva === 'pesquisas' || abaAtiva === 'respostas') && avaliacoes.length === 0) carregarPesquisas();
  }, [abaAtiva]);

  // ──────────────────────────────────────────────────────────────────────────
  // ANÁLISE DE DADOS (PESQUISAS) - APENAS FINALIZADAS
  // ──────────────────────────────────────────────────────────────────────────

  const completas = avaliacoes.filter(a => a.status === 'completed');
  
  const calculateNps = () => {
    if (completas.length === 0) return 0;
    let promotores = 0;
    let detratores = 0;
    completas.forEach(a => {
      const score = a.respostas?.[10]?.score;
      if (score !== undefined) {
        if (score >= 9) promotores++;
        if (score <= 6) detratores++;
      }
    });
    return (((promotores - detratores) / completas.length) * 100).toFixed(0);
  };

  const getAverageScale = (qId: number) => {
    if (completas.length === 0) return 0;
    let sum = 0;
    let count = 0;
    completas.forEach(a => {
      const scale = a.respostas?.[qId]?.scale;
      if (scale !== undefined) {
        sum += (scale + 1); 
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '0';
  };

  const getOpenComments = (qId: number) => {
    return completas
      .map(a => a.respostas?.[qId]?.openText)
      .filter(text => text && text.trim().length > 0);
  };

  const renderProgressChart = (title: string, current: string | number, max: number, colorStart: string, colorEnd: string) => {
    const percent = Math.min((Number(current) / max) * 100, 100);
    return (
      <View style={styles.chartItem}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.chartValue, { color: colors.textPrimary }]}>{current} / {max}</Text>
        </View>
        <View style={[styles.chartBarBg, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <LinearGradient
            colors={[colorStart, colorEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.chartBarFill, { width: `${percent}%` }]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analytics & Admin</Text>
        
        {/* Toggle Abas */}
        <View style={[styles.toggleContainer, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'pesquisas' && [styles.toggleBtnActive, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]]}
            onPress={() => setAbaAtiva('pesquisas')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'pesquisas' && [styles.toggleTextActive, { color: colors.textPrimary }]]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'respostas' && [styles.toggleBtnActive, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]]}
            onPress={() => setAbaAtiva('respostas')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'respostas' && [styles.toggleTextActive, { color: colors.textPrimary }]]}>Feedbacks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'usuarios' && [styles.toggleBtnActive, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]]}
            onPress={() => setAbaAtiva('usuarios')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'usuarios' && [styles.toggleTextActive, { color: colors.textPrimary }]]}>Usuários</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ABA: DASHBOARD GERAL */}
        {abaAtiva === 'pesquisas' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Métricas de Funil</Text>
              <TouchableOpacity onPress={carregarPesquisas}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingPesquisas ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <>
                <View style={styles.funnelContainer}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.funnelCard}>
                    <Text style={styles.funnelCardLabel}>Pesquisas Finalizadas</Text>
                    <Text style={styles.funnelCardValue}>{completas.length}</Text>
                    <FontAwesome name="check-circle" size={24} color="rgba(255,255,255,0.3)" style={styles.funnelIcon} />
                  </LinearGradient>
                </View>

                {completas.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 16 }]}>Satisfação (Média das notas 1 a 5)</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                      {renderProgressChart('Design e Visual', getAverageScale(2), 5, '#8B5CF6', '#6D28D9')}
                      {renderProgressChart('Navegação e Usabilidade', getAverageScale(3), 5, '#3B82F6', '#1D4ED8')}
                      {renderProgressChart('Filtros e Busca', getAverageScale(4), 5, '#0EA5E9', '#0369A1')}
                      {renderProgressChart('Qualidade das Vagas', getAverageScale(5), 5, '#10B981', '#047857')}
                      {renderProgressChart('Fluxo de Candidatura', getAverageScale(7), 5, '#F59E0B', '#B45309')}
                      {renderProgressChart('Resolução de Problemas', getAverageScale(9), 5, '#EC4899', '#BE185D')}
                      
                      <View style={styles.npsContainer}>
                        <View>
                          <Text style={[styles.chartTitle, { color: colors.textSecondary }]}>Net Promoter Score (NPS)</Text>
                          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Baseado nas pesquisas totalmente finalizadas.</Text>
                        </View>
                        <Text style={{ fontSize: 40, fontWeight: '900', color: Number(calculateNps()) > 50 ? '#10B981' : '#F59E0B' }}>
                          {calculateNps()}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* ABA: FEEDBACKS ABERTOS */}
        {abaAtiva === 'respostas' && (
          <View>
             <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Feedbacks Escritos</Text>
              <TouchableOpacity onPress={carregarPesquisas}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
              </TouchableOpacity>
            </View>
            
            {loadingPesquisas ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <View>
                {getOpenComments(10).length === 0 ? (
                  <Text style={{ color: colors.textSecondary }}>Nenhum comentário final registrado.</Text>
                ) : (
                  getOpenComments(10).map((comment, index) => (
                    <View key={index} style={[styles.feedbackCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
                      <FontAwesome name="quote-left" size={16} color={colors.primary} style={{ marginBottom: 12, opacity: 0.5 }} />
                      <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment}</Text>
                    </View>
                  ))
                )}

                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>Sugestões de Filtros</Text>
                </View>
                {getOpenComments(4).map((comment, index) => (
                    <View key={index} style={[styles.feedbackCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
                      <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment}</Text>
                    </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ABA: USUÁRIOS */}
        {abaAtiva === 'usuarios' && (
          <View>
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
                <TouchableOpacity style={styles.actionBtn}>
                  <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 24, letterSpacing: -0.5 },
  toggleContainer: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: { shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  toggleTextActive: { fontWeight: '800' },
  
  scrollContent: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  
  card: { padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },

  // FUNIL CARDS
  funnelContainer: { flexDirection: 'column', gap: 12, marginBottom: 32 },
  funnelCard: { padding: 20, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  funnelCardLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  funnelCardValue: { fontSize: 36, color: '#FFFFFF', fontWeight: '900', letterSpacing: -1 },
  funnelIcon: { position: 'absolute', right: 20, top: '50%', transform: [{ translateY: -12 }] },

  // DROP OFF BARS
  dropOffRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  dropOffLabel: { width: 28, fontSize: 13, fontWeight: '700' },
  dropOffBarContainer: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  dropOffBar: { height: '100%', borderRadius: 6 },
  dropOffCount: { width: 32, textAlign: 'right', fontSize: 14, fontWeight: '800' },

  // CHARTS
  chartItem: { marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  chartTitle: { fontSize: 14, fontWeight: '700' },
  chartValue: { fontSize: 14, fontWeight: '900' },
  chartBarBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  chartBarFill: { height: '100%', borderRadius: 5 },

  npsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(156, 163, 175, 0.2)' },

  // FEEDBACKS
  feedbackCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  commentText: { fontSize: 15, lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },

  // USERS
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  userEmail: { fontSize: 13 },
  actionBtn: { padding: 8 },
});
