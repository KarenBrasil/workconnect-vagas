import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, query, limit, orderBy, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useTheme } from '../../src/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert } from 'react-native';

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
  
  const [abaAtiva, setAbaAtiva] = useState<'feedbacks' | 'usuarios'>('feedbacks');
  
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
    if (abaAtiva === 'feedbacks' && avaliacoes.length === 0) carregarPesquisas();
  }, [abaAtiva]);

  // ──────────────────────────────────────────────────────────────────────────
  // GERADOR DE VAGAS FICTÍCIAS
  // ──────────────────────────────────────────────────────────────────────────
  const gerarVagasFicticias = async () => {
    Alert.alert('Iniciando...', 'Gerando 15 vagas fictícias...');
    const vagas = [
      {
        titulo: "Desenvolvedor Front-end React Pleno",
        empresa: "TechSolutions BR",
        contrato: "CLT",
        salario: "R$ 6.000,00",
        descricao: "Buscamos um desenvolvedor com experiência em ReactJS, TypeScript e Styled Components para atuar em projetos de grande escala. Trabalho 100% remoto.",
        contato: "vagas@techsolutions.com.br",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Serviços de UI/UX Design",
        empresa: "Profissional Autônomo (Camila S.)",
        contrato: "Freelance",
        salario: "A combinar",
        descricao: "Sou designer UI/UX com 4 anos de experiência criando interfaces modernas e responsivas no Figma. Procuro projetos freelancer para aplicativos mobile ou web.",
        contato: "camila.design@gmail.com",
        fonte: "interna",
      },
      {
        titulo: "Engenheiro de Dados Sênior",
        empresa: "DataCorp",
        contrato: "PJ",
        salario: "R$ 14.000,00",
        descricao: "Procuramos Engenheiro de Dados Sênior com forte conhecimento em AWS, Python, Spark e pipelines ETL robustos. Necessário inglês avançado.",
        contato: "rh@datacorp.io",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Consultoria em Segurança da Informação",
        empresa: "Profissional Autônomo (Ricardo P.)",
        contrato: "PJ",
        salario: "R$ 150/hora",
        descricao: "Especialista em pentest e adequação à LGPD. Ajudo a sua startup a blindar as aplicações antes de ir para produção. Faça uma auditoria completa com meu serviço.",
        contato: "ricardo.sec@protonmail.com",
        fonte: "interna",
      },
      {
        titulo: "Desenvolvedor Backend Node.js",
        empresa: "Startup Inova",
        contrato: "PJ",
        salario: "R$ 8.500,00",
        descricao: "Vaga para desenvolvedor Node.js com foco em APIs RESTful, microsserviços e bancos de dados relacionais e NoSQL (Postgres e MongoDB).",
        contato: "talentos@inova.com",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Desenvolvimento Mobile (React Native)",
        empresa: "Profissional Autônomo (João M.)",
        contrato: "Freelance",
        salario: "A combinar",
        descricao: "Precisa de um app rápido e moderno para iOS e Android? Sou desenvolvedor React Native criando apps de alta performance com Expo. Entre em contato para orçamentos.",
        contato: "joaom.dev@outlook.com",
        fonte: "interna",
      },
      {
        titulo: "Analista de Marketing Digital (Tech)",
        empresa: "Agência Click",
        contrato: "CLT",
        salario: "R$ 4.500,00",
        descricao: "Procuramos especialista em tráfego pago e SEO focado no nicho de tecnologia e SaaS. Trabalho híbrido em São Paulo.",
        contato: "vagas@agenciaclick.com",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Gestão de Projetos Ágeis (Scrum Master)",
        empresa: "Profissional Autônomo (Amanda F.)",
        contrato: "PJ",
        salario: "A combinar",
        descricao: "Sou Scrum Master certificada, ajudo equipes de desenvolvimento a otimizarem suas entregas e melhorarem a comunicação interna.",
        contato: "amanda.agile@gmail.com",
        fonte: "interna",
      },
      {
        titulo: "Desenvolvedor Python (Júnior)",
        empresa: "CodeBase",
        contrato: "CLT",
        salario: "R$ 3.500,00",
        descricao: "Vaga de entrada para desenvolvedores Python. Você trabalhará junto com nossos seniores na criação de bots e automações web. Ótima oportunidade de aprendizado.",
        contato: "rh@codebase.tech",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Edição de Vídeo para YouTube/Reels",
        empresa: "Profissional Autônomo (Lucas V.)",
        contrato: "Freelance",
        salario: "R$ 50/vídeo curto",
        descricao: "Editor de vídeo especializado em formato curto (TikTok, Reels, Shorts) para criadores de conteúdo tech e programadores.",
        contato: "lucas.edits@gmail.com",
        fonte: "interna",
      },
      {
        titulo: "Tech Lead",
        empresa: "Fintech PayRight",
        contrato: "PJ",
        salario: "R$ 18.000,00",
        descricao: "Buscamos líder técnico para guiar o esquadrão principal de pagamentos. Necessário experiência prévia em fintechs e liderança de times.",
        contato: "vagas@payright.com.br",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Criação de Landing Pages Alta Conversão",
        empresa: "Profissional Autônomo (Fernanda L.)",
        contrato: "Freelance",
        salario: "R$ 1.500/projeto",
        descricao: "Desenvolvo landing pages em Next.js super rápidas com SEO otimizado, ideais para o lançamento de produtos de tecnologia e infoprodutos.",
        contato: "fernanda.web@gmail.com",
        fonte: "interna",
      },
      {
        titulo: "Especialista em Cloud AWS",
        empresa: "CloudSec BR",
        contrato: "PJ",
        salario: "R$ 12.000,00",
        descricao: "Precisa-se de profissional certificado AWS para atuar na migração de servidores legados para arquitetura serverless.",
        contato: "recrutamento@cloudsec.com",
        fonte: "interna",
      },
      {
        titulo: "Ofereço: Testes de QA Manuais e Automatizados",
        empresa: "Profissional Autônomo (Bruno T.)",
        contrato: "Freelance",
        salario: "A combinar",
        descricao: "Sou analista de testes (QA) com experiência em Cypress e Selenium. Ofereço serviço de caça a bugs antes de você lançar a sua aplicação no mercado.",
        contato: "bruno.qa@gmail.com",
        fonte: "interna",
      },
      {
        titulo: "Suporte Técnico Nível 2",
        empresa: "HelpDesk TI",
        contrato: "CLT",
        salario: "R$ 2.800,00",
        descricao: "Atendimento técnico a clientes B2B via chat e telefone. Necessário conhecimentos básicos em redes, Linux e resolução de problemas de software.",
        contato: "suporte.vagas@helpdesk.com",
        fonte: "interna",
      }
    ];

    try {
      for (let i = 0; i < vagas.length; i++) {
        await addDoc(collection(db, 'vagas'), {
          ...vagas[i],
          criadoEm: new Date(Date.now() - i * 3600000).toISOString(),
        });
      }
      Alert.alert('Sucesso!', 'As 15 vagas fictícias foram publicadas no banco de dados.');
    } catch (error: any) {
      Alert.alert('Erro', 'Houve um erro ao gerar vagas: ' + error.message);
    }
  };

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
            style={[styles.toggleBtn, abaAtiva === 'feedbacks' && [styles.toggleBtnActive, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]]}
            onPress={() => setAbaAtiva('feedbacks')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'feedbacks' && [styles.toggleTextActive, { color: colors.textPrimary }]]}>Feedbacks (Métricas e Respostas)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, abaAtiva === 'usuarios' && [styles.toggleBtnActive, { backgroundColor: isDark ? '#374151' : '#FFFFFF' }]]}
            onPress={() => setAbaAtiva('usuarios')}
          >
            <Text style={[styles.toggleText, abaAtiva === 'usuarios' && [styles.toggleTextActive, { color: colors.textPrimary }]]}>Usuários Cadastrados</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* BOTÃO GERAR VAGAS (TEMPORÁRIO) */}
        <TouchableOpacity 
          style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center' }}
          onPress={gerarVagasFicticias}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Gerar 15 Vagas Fictícias (Base de Mostruário)</Text>
        </TouchableOpacity>
        
        {/* ABA: FEEDBACKS GERAIS E MÉTRICAS */}
        {abaAtiva === 'feedbacks' && (
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

                {/* SEÇÃO DE FEEDBACKS ESCRITOS */}
                <View style={[styles.sectionHeader, { marginTop: 40 }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Feedbacks Escritos</Text>
                </View>

                {getOpenComments(10).length === 0 ? (
                  <Text style={{ color: colors.textSecondary }}>Nenhum comentário final registrado.</Text>
                ) : (
                  getOpenComments(10).map((comment, index) => (
                    <View key={`fb-${index}`} style={[styles.feedbackCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
                      <FontAwesome name="quote-left" size={16} color={colors.primary} style={{ marginBottom: 12, opacity: 0.5 }} />
                      <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment}</Text>
                    </View>
                  ))
                )}

                {getOpenComments(4).length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>Sugestões de Filtros</Text>
                    </View>
                    {getOpenComments(4).map((comment, index) => (
                      <View key={`sug-${index}`} style={[styles.feedbackCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
                        <Text style={[styles.commentText, { color: colors.textPrimary }]}>{comment}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
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
            ) : usuarios.map((user) => {
              const dataCadastro = user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : 'Data Indisponível';
              return (
                <View key={user.id} style={[styles.userCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{user.nome ? user.nome.slice(0, 2).toUpperCase() : 'US'}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>{user.nome || 'Sem Nome'}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>{user.email}</Text>
                    <Text style={[styles.userDate, { color: colors.primary }]} numberOfLines={1}>Cadastrado em: {dataCadastro}</Text>
                  </View>
                </View>
              );
            })}
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
  userEmail: { fontSize: 13, marginBottom: 4 },
  userDate: { fontSize: 11, fontWeight: '700' },
});
