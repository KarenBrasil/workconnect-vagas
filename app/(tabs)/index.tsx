import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query, addDoc } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { buscarVagasComCache, calcularTempoRelativo } from '../../src/services/vagasExternas';
import { useRouter } from 'expo-router';
import { COLORS, Card, Tag, FilterChip } from '../../components/ui';
import { BrandLogo } from '../../components/BrandLogo';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [vagasGlobais, setVagasGlobais] = useState<any[]>([]);
  const [vagasLocais, setVagasLocais] = useState<any[]>([]);
  const [totalVagas, setTotalVagas] = useState(0);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setUserName(user.displayName.split(' ')[0]);
      }
      carregarDados(user);
    });
    return () => unsubscribe();
  }, []);

  const carregarDados = async (user: any) => {
    setLoading(true);
    try {
      const externas = await buscarVagasComCache();
      setTotalVagas(externas.length);

      const globais = externas.slice(0, 5).map((v) => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        data: v.tempoPostagem,
        tipo: 'global',
        fonte: v.fonte,
      }));

      const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(5));
      const snapInternas = await getDocs(q);
      const locaisDb = snapInternas.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          empresa: data.empresa,
          data: data.criadoEm ? calcularTempoRelativo(data.criadoEm) : 'Hoje',
          tipo: 'local',
        };
      });

      if (locaisDb.length < 10 && user) {
        // Auto-seed: Injetar vagas no banco de dados para popular a área
        console.log("Poucas vagas detectadas. Auto-gerando vagas fictícias...");
        const seedVagas = [
          {
            titulo: "Desenvolvedor Front-end React Pleno",
            empresa: "TechSolutions BR",
            contrato: "CLT",
            salario: "R$ 6.000,00",
            descricao: "Buscamos um desenvolvedor com experiência em ReactJS, TypeScript e Styled Components para atuar em projetos de grande escala. Trabalho 100% remoto.",
            contato: "vagas@techsolutions.com.br",
            fonte: "interna",
            requisitos: ["Experiência comprovada em React", "Conhecimento de Hooks e Context API", "Versionamento Git"],
            linguagens: ["JavaScript", "TypeScript", "HTML/CSS"],
          },
          {
            titulo: "Ofereço: Serviços de UI/UX Design",
            empresa: "Profissional Autônomo (Camila S.)",
            contrato: "Freelance",
            salario: "A combinar",
            descricao: "Sou designer UI/UX com 4 anos de experiência criando interfaces modernas e responsivas no Figma. Procuro projetos freelancer para aplicativos mobile ou web.",
            contato: "camila.design@gmail.com",
            fonte: "interna",
            requisitos: ["Criação de Wireframes", "Prototipagem de alta fidelidade", "Design Systems"],
            linguagens: ["Figma", "Adobe XD"],
          },
          {
            titulo: "Engenheiro de Dados Sênior",
            empresa: "DataCorp",
            contrato: "PJ",
            salario: "R$ 14.000,00",
            descricao: "Procuramos Engenheiro de Dados Sênior com forte conhecimento em AWS, Python, Spark e pipelines ETL robustos. Necessário inglês avançado.",
            contato: "rh@datacorp.io",
            fonte: "interna",
            requisitos: ["Inglês Avançado", "Experiência em Cloud computing", "Criação de pipelines complexos"],
            linguagens: ["Python", "SQL", "Spark"],
          },
          {
            titulo: "Ofereço: Consultoria em Segurança da Informação",
            empresa: "Profissional Autônomo (Ricardo P.)",
            contrato: "PJ",
            salario: "R$ 150/hora",
            descricao: "Especialista em pentest e adequação à LGPD. Ajudo a sua startup a blindar as aplicações antes de ir para produção. Faça uma auditoria completa com meu serviço.",
            contato: "ricardo.sec@protonmail.com",
            fonte: "interna",
            requisitos: ["Análise de Vulnerabilidades", "Testes de Invasão (Pentest)", "Conformidade LGPD"],
            linguagens: ["Bash", "Python"],
          },
          {
            titulo: "Desenvolvedor Backend Node.js",
            empresa: "Startup Inova",
            contrato: "PJ",
            salario: "R$ 8.500,00",
            descricao: "Vaga para desenvolvedor Node.js com foco em APIs RESTful, microsserviços e bancos de dados relacionais e NoSQL (Postgres e MongoDB).",
            contato: "talentos@inova.com",
            fonte: "interna",
            requisitos: ["Desenvolvimento de microsserviços", "Experiência com filas de mensagens", "Criação de testes unitários"],
            linguagens: ["Node.js", "SQL", "MongoDB"],
          },
          {
            titulo: "Ofereço: Desenvolvimento Mobile (React Native)",
            empresa: "Profissional Autônomo (João M.)",
            contrato: "Freelance",
            salario: "A combinar",
            descricao: "Precisa de um app rápido e moderno para iOS e Android? Sou desenvolvedor React Native criando apps de alta performance com Expo. Entre em contato para orçamentos.",
            contato: "joaom.dev@outlook.com",
            fonte: "interna",
            requisitos: ["Publicação nas Lojas Apple/Google", "Integração de APIs REST"],
            linguagens: ["React Native", "TypeScript"],
          },
          {
            titulo: "Analista de Marketing Digital (Tech)",
            empresa: "Agência Click",
            contrato: "CLT",
            salario: "R$ 4.500,00",
            descricao: "Procuramos especialista em tráfego pago e SEO focado no nicho de tecnologia e SaaS. Trabalho híbrido em São Paulo.",
            contato: "vagas@agenciaclick.com",
            fonte: "interna",
            requisitos: ["Google Ads", "Facebook Ads", "Ferramentas de SEO (Ahrefs, SEMrush)"],
            linguagens: ["Google Analytics", "Marketing"],
          },
          {
            titulo: "Ofereço: Gestão de Projetos Ágeis (Scrum Master)",
            empresa: "Profissional Autônomo (Amanda F.)",
            contrato: "PJ",
            salario: "A combinar",
            descricao: "Sou Scrum Master certificada, ajudo equipes de desenvolvimento a otimizarem suas entregas e melhorarem a comunicação interna.",
            contato: "amanda.agile@gmail.com",
            fonte: "interna",
            requisitos: ["Certificação CSM", "Facilitação de Cerimônias"],
            linguagens: ["Jira", "Trello", "Scrum"],
          },
          {
            titulo: "Desenvolvedor Python (Júnior)",
            empresa: "CodeBase",
            contrato: "CLT",
            salario: "R$ 3.500,00",
            descricao: "Vaga de entrada para desenvolvedores Python. Você trabalhará junto com nossos seniores na criação de bots e automações web. Ótima oportunidade de aprendizado.",
            contato: "rh@codebase.tech",
            fonte: "interna",
            requisitos: ["Vontade de aprender", "Conhecimento básico em lógica de programação"],
            linguagens: ["Python", "Selenium"],
          },
          {
            titulo: "Ofereço: Edição de Vídeo para YouTube/Reels",
            empresa: "Profissional Autônomo (Lucas V.)",
            contrato: "Freelance",
            salario: "R$ 50/vídeo curto",
            descricao: "Editor de vídeo especializado em formato curto (TikTok, Reels, Shorts) para criadores de conteúdo tech e programadores.",
            contato: "lucas.edits@gmail.com",
            fonte: "interna",
            requisitos: ["Conhecimento das tendências do nicho tech", "Cortes rápidos e legendagem"],
            linguagens: ["Premiere Pro", "CapCut"],
          },
          {
            titulo: "Tech Lead",
            empresa: "Fintech PayRight",
            contrato: "PJ",
            salario: "R$ 18.000,00",
            descricao: "Buscamos líder técnico para guiar o esquadrão principal de pagamentos. Necessário experiência prévia em fintechs e liderança de times.",
            contato: "vagas@payright.com.br",
            fonte: "interna",
            requisitos: ["Experiência mínima de 6 anos", "Liderança de times ágeis", "Arquitetura de sistemas financeiros"],
            linguagens: ["Java", "Kotlin", "AWS"],
          },
          {
            titulo: "Ofereço: Criação de Landing Pages Alta Conversão",
            empresa: "Profissional Autônomo (Fernanda L.)",
            contrato: "Freelance",
            salario: "R$ 1.500/projeto",
            descricao: "Desenvolvo landing pages em Next.js super rápidas com SEO otimizado, ideais para o lançamento de produtos de tecnologia e infoprodutos.",
            contato: "fernanda.web@gmail.com",
            fonte: "interna",
            requisitos: ["Entrega expressa", "Otimização de SEO", "Alta performance no Lighthouse"],
            linguagens: ["Next.js", "Tailwind CSS"],
          },
          {
            titulo: "Especialista em Cloud AWS",
            empresa: "CloudSec BR",
            contrato: "PJ",
            salario: "R$ 12.000,00",
            descricao: "Precisa-se de profissional certificado AWS para atuar na migração de servidores legados para arquitetura serverless.",
            contato: "recrutamento@cloudsec.com",
            fonte: "interna",
            requisitos: ["Certificação AWS Solutions Architect", "Experiência com Docker/Kubernetes"],
            linguagens: ["AWS", "Terraform"],
          },
          {
            titulo: "Ofereço: Testes de QA Manuais e Automatizados",
            empresa: "Profissional Autônomo (Bruno T.)",
            contrato: "Freelance",
            salario: "A combinar",
            descricao: "Sou analista de testes (QA) com experiência em Cypress e Selenium. Ofereço serviço de caça a bugs antes de você lançar a sua aplicação no mercado.",
            contato: "bruno.qa@gmail.com",
            fonte: "interna",
            requisitos: ["Plano de testes estruturado", "Reporte de bugs detalhado"],
            linguagens: ["Cypress", "JavaScript", "Selenium"],
          },
          {
            titulo: "Suporte Técnico Nível 2",
            empresa: "HelpDesk TI",
            contrato: "CLT",
            salario: "R$ 2.800,00",
            descricao: "Atendimento técnico a clientes B2B via chat e telefone. Necessário conhecimentos básicos em redes, Linux e resolução de problemas de software.",
            contato: "suporte.vagas@helpdesk.com",
            fonte: "interna",
            requisitos: ["Excelente comunicação verbal e escrita", "Conhecimento básico em redes TCP/IP"],
            linguagens: ["Linux", "Redes"],
          }
        ];

        for (let i = 0; i < seedVagas.length; i++) {
          const docRef = await addDoc(collection(db, 'vagas'), {
            ...seedVagas[i],
            criadoEm: new Date(Date.now() - i * 3600000).toISOString(),
          });
          locaisDb.push({
            id: docRef.id,
            titulo: seedVagas[i].titulo,
            empresa: seedVagas[i].empresa,
            data: 'Agora',
            tipo: 'local',
          });
        }
      }

      setVagasGlobais(globais);
      setVagasLocais(locaisDb.slice(0, 10));
    } catch (e) {
      console.log('Erro ao carregar dados da Home', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <BrandLogo />
        </View>
        <View style={[styles.header, { alignItems: 'center' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textMain }]}>Olá, {userName || 'Visitante'}!</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>Pronta para dar o próximo passo?</Text>
          </View>
        </View>

        {/* Featured Banner & Total */}
        <Card style={[styles.banner, { backgroundColor: colors.primary }]}>
          <View style={styles.bannerContent}>
            <View>
              <Text style={[styles.bannerTitle, { color: colors.primaryDark }]}>🚀 {totalVagas}+ Vagas Globais</Text>
              <Text style={[styles.bannerSub, { color: colors.primaryDark }]}>Agregadas em tempo real para você</Text>
            </View>
            <MaterialIcons name="public" size={28} color={isDark ? colors.background : COLORS.surface} />
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Vagas Globais Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Vagas Globais</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={[styles.viewAll, { color: colors.accent }]}>Ver todas →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vagasList}>
              {vagasGlobais.map((vaga) => (
                <TouchableOpacity key={vaga.id} onPress={() => router.push(`/job/${vaga.id}?fonte=${vaga.fonte || ''}`)}>
                  <Card style={styles.vagaListItem}>
                    <View style={styles.vagaListContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.vagaListTitle, { color: colors.textMain }]} numberOfLines={1}>{vaga.titulo}</Text>
                        <Text style={[styles.vagaListCompany, { color: colors.textSecondary }]} numberOfLines={1}>{vaga.empresa || 'Confidencial'}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            {/* Vagas TechConnect Section */}
            <View style={[styles.sectionHeader, { marginTop: 12 }]}>
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Vagas TechConnect</Text>
              <Tag label="Exclusivo" variant="green" />
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>Publicadas pela nossa comunidade.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vagasScroll}>
              {vagasLocais.map((vaga) => (
                <TouchableOpacity key={vaga.id} onPress={() => router.push(`/job/${vaga.id}`)} activeOpacity={0.8}>
                  <Card style={styles.vagaCard}>
                    <View style={styles.vagaHeader}>
                      <View style={[styles.companylconBox, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.companyIcon, { color: isDark ? colors.background : COLORS.surface }]}>{(vaga.empresa || 'C').charAt(0).toUpperCase()}</Text>
                      </View>
                      <MaterialIcons name="favorite-border" size={20} color={colors.textSecondary} />
                    </View>

                    <Text style={[styles.vagaTitle, { color: colors.textMain }]} numberOfLines={2}>{vaga.titulo}</Text>
                    <Text style={[styles.vagaCompany, { color: colors.textSecondary }]}>{vaga.empresa || 'Confidencial'}</Text>

                    <View style={styles.vagaFooter}>
                      <Text style={[styles.vagaTime, { color: colors.textSecondary }]}>{vaga.data}</Text>
                      <Tag label="Comunidade" variant="gray" />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
  },
  subGreeting: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginHorizontal: 12,
  },
  banner: {
    marginBottom: 28,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.primaryDark,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.accent,
  },
  vagasScroll: {
    marginBottom: 28,
  },
  vagaCard: {
    width: 160,
    padding: 12,
    marginRight: 12,
  },
  vagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companylconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyIcon: {
    color: COLORS.surface,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    fontSize: 14,
  },
  vagaTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  vagaCompany: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  vagaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vagaTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  vagasList: {
    gap: 12,
  },
  vagaListItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  vagaListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vagaListTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  vagaListCompany: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
  },
});
