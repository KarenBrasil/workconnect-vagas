import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView, Animated, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';
import { useRouter } from 'expo-router';
import { BrandLogo } from '../components/BrandLogo';
import { useTheme } from '../src/theme/ThemeContext';

type RespostaType = any; 

const QUESTIONS = [
  {
    id: 1,
    tag: "CONTEXTO",
    title: "Qual é o seu perfil?",
    subtitle: "Selecione a opção que melhor te descreve.",
    type: "single",
    options: [
      { label: "Profissional de TI (dev, dados, infra, produto…)" },
      { label: "Estudante de tecnologia" },
      { label: "Profissional de RH ou recrutamento" },
      { label: "Estou buscando emprego ativamente" },
      { label: "Nenhuma das anteriores" },
    ],
  },
  {
    id: 2,
    tag: "DESIGN",
    title: "Como você avalia o design e a interface visual?",
    subtitle: "Considere organização, cores, clareza e hierarquia das informações.",
    type: "scale+reason",
    scaleLabel: ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"],
    reasons: [
      "Visual limpo e organizado",
      "Cores agradáveis e coerentes",
      "Informações confusas ou mal distribuídas",
      "Falta consistência visual",
      "Design genérico, sem identidade",
    ],
    open: "Algo específico que chamou sua atenção?",
  },
  {
    id: 3,
    tag: "NAVEGAÇÃO",
    title: "A navegação entre as seções foi intuitiva?",
    subtitle: "Avalie a experiência de transitar entre Início, Buscar, Favoritos e Perfil.",
    type: "scale+reason",
    scaleLabel: ["Muito confusa", "Confusa", "Neutra", "Intuitiva", "Muito intuitiva"],
    reasons: [
      "Fácil de entender onde estou",
      "Ícones e rótulos claros",
      "Fiquei perdido em algum momento",
      "Faltam indicações visuais",
      "Estrutura pouco lógica",
    ],
    open: "Teve algum momento em que não sabia o que fazer?",
  },
  {
    id: 4,
    tag: "BUSCA & FILTROS",
    title: "Os filtros ajudaram a encontrar vagas relevantes?",
    subtitle: "Avalie a eficiência da busca ao usar os filtros disponíveis (Remoto, PJ, CLT…).",
    type: "scale+reason",
    scaleLabel: ["Não ajudaram", "Pouco úteis", "Regulares", "Úteis", "Muito úteis"],
    reasons: [
      "Resultados alinhados com o meu perfil",
      "Filtros são suficientes",
      "Faltam filtros importantes",
      "Resultados irrelevantes ou desatualizados",
      "A busca não funcionou como esperado",
    ],
    open: "Algum filtro que faria diferença para você?",
  },
  {
    id: 5,
    tag: "VAGAS & APIS",
    title: "As vagas exibidas pareceram relevantes e atualizadas?",
    subtitle: "O app integra vagas de múltiplas plataformas externas.",
    type: "scale+reason",
    scaleLabel: ["Muito ruins", "Ruins", "Regulares", "Boas", "Excelentes"],
    reasons: [
      "Variedade de fontes é um diferencial",
      "Vagas parecem atualizadas",
      "Muitas vagas duplicadas ou desatualizadas",
      "Poucas opções para o meu perfil",
      "Centralizar tudo num lugar é prático",
    ],
    open: "Alguma observação sobre as vagas exibidas?",
  },
  {
    id: 6,
    tag: "FAVORITOS",
    title: "A função de favoritar vagas funcionou corretamente?",
    subtitle: "Salve uma vaga e verifique se ela aparece na aba Favoritos.",
    type: "single",
    options: [
      { label: "Funcionou perfeitamente" },
      { label: "Funcionou, mas com lentidão ou comportamento estranho" },
      { label: "Não funcionou como esperado" },
      { label: "Não testei essa função" },
    ],
  },
  {
    id: 7,
    tag: "CANDIDATURA",
    title: "Como você avalia o fluxo de candidatura?",
    subtitle: "O app direciona para contato direto com o recrutador via WhatsApp ou e-mail.",
    type: "scale+reason",
    scaleLabel: ["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"],
    reasons: [
      "Contato direto agiliza o processo",
      "Prefiro um formulário padrão",
      "Falta rastreamento das candidaturas",
      "WhatsApp/e-mail é mais acessível",
      "Não me senti seguro com essa abordagem",
    ],
    open: "Preferiria um fluxo diferente? Como seria?",
  },
  {
    id: 8,
    tag: "VELOCIDADE",
    title: "Como foi o desempenho e a velocidade do app?",
    subtitle: "Considere o carregamento das telas e das listas de vagas.",
    type: "single",
    options: [
      { label: "Rápido sem esperas perceptíveis" },
      { label: "Aceitável pequenas esperas, mas não atrapalha" },
      { label: "Lento esperas que prejudicam a experiência" },
      { label: "Muito lento impede o uso fluido" },
    ],
  },
  {
    id: 9,
    tag: "PROPOSTA DE VALOR",
    title: "O app resolve um problema real para quem busca vagas em tech?",
    subtitle: "Avalie se a ferramenta tem utilidade prática no mercado.",
    type: "scale+reason",
    scaleLabel: ["Não resolve", "Pouco", "Parcialmente", "Resolve bem", "Resolve muito bem"],
    reasons: [
      "Centralizar vagas economiza tempo",
      "Já existem ferramentas melhores",
      "Boa ideia, mas precisa evoluir",
      "Seria útil para quem está em busca ativa",
      "O problema é real e relevante",
    ],
    open: "O que falta para ele ser realmente útil no dia a dia?",
  },
  {
    id: 10,
    tag: "NPS",
    title: "Qual a chance de você usar ou recomendar o TechConnect?",
    subtitle: "De 0 a 10 onde 0 é 'nunca usaria' e 10 é 'recomendaria para todos'.",
    type: "nps",
    open: "Quer deixar um comentário final ou sugestão?",
  },
];

export default function PesquisaWizardScreen() {
  const router = useRouter();
  
  const [iniciado, setIniciado] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, RespostaType>>({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const { colors, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const registrarVisita = async () => {
      try {
        await setDoc(doc(db, 'avaliacoes_stats', 'metrics'), { visits: increment(1) }, { merge: true });
      } catch (e) {
        console.log('Erro ao registrar visita:', e);
      }
    };
    registrarVisita();
  }, []);

  const totalSteps = QUESTIONS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQ = QUESTIONS[currentStep];

  const setAnswer = (val: any) => setRespostas(prev => ({ ...prev, [currentQ.id]: val }));
  const currentAnswer = respostas[currentQ.id];

  const checkPodeContinuar = () => {
    if (currentAnswer === undefined || currentAnswer === null) return false;
    if (currentQ.type === 'multi' && (!Array.isArray(currentAnswer) || currentAnswer.length === 0)) return false;
    if (currentQ.type === 'single' && typeof currentAnswer !== 'number') return false;
    if (currentQ.type === 'scale+reason') {
      if (typeof currentAnswer.scale !== 'number') return false;
      // Exigir pelo menos 1 tag selecionada
      if (!Array.isArray(currentAnswer.reasons) || currentAnswer.reasons.length === 0) return false;
    }
    if (currentQ.type === 'nps' && typeof currentAnswer.score !== 'number') return false;
    return true;
  };

  const animarTransicao = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const iniciarAvaliacao = async () => {
    setIniciado(true);
    try {
      const docRef = await addDoc(collection(db, 'avaliacoes'), {
        status: 'started',
        lastStep: 0,
        plataforma: Platform.OS,
        criadoEm: serverTimestamp(),
      });
      setDocId(docRef.id);
    } catch (e) {
      console.log('Erro ao iniciar documento de avaliação:', e);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      if (docId) {
        // Salva o progresso parcial em background
        setDoc(doc(db, 'avaliacoes', docId), {
          respostas,
          lastStep: currentStep + 1,
          status: 'in_progress',
          atualizadoEm: serverTimestamp()
        }, { merge: true }).catch(console.error);
      }
      animarTransicao(() => setCurrentStep(curr => curr + 1));
    } else {
      await enviarAvaliacao();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animarTransicao(() => setCurrentStep(curr => curr - 1));
    } else {
      setIniciado(false);
    }
  };

  const handleTestarApp = () => {
    Linking.openURL('/');
  };

  const enviarAvaliacao = async () => {
    setEnviando(true);
    try {
      if (docId) {
        await setDoc(doc(db, 'avaliacoes', docId), {
          respostas,
          status: 'completed',
          atualizadoEm: serverTimestamp(),
        }, { merge: true });
      } else {
        // Fallback caso a pessoa tenha respondido muito rápido e o docId não esteja pronto
        await addDoc(collection(db, 'avaliacoes'), {
          respostas,
          status: 'completed',
          plataforma: Platform.OS,
          criadoEm: serverTimestamp(),
        });
      }
      setSucesso(true);
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDERIZADORES DE INPUTS
  // ──────────────────────────────────────────────────────────────────────────

  const renderMulti = () => {
    const selecoes = Array.isArray(currentAnswer) ? currentAnswer : [];
    return (
      <View style={styles.optionsContainer}>
        {currentQ.options?.map((opt, i) => {
          const isSelected = selecoes.includes(i);
          return (
            <TouchableOpacity 
              key={i} 
              style={[styles.boxOption, { backgroundColor: colors.background, borderColor: colors.border }, isSelected && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
              onPress={() => {
                if (isSelected) setAnswer(selecoes.filter((s: number) => s !== i));
                else setAnswer([...selecoes, i]);
              }}
            >
              <Text style={[styles.boxOptionLabel, { color: colors.textSecondary }, isSelected && { color: colors.textPrimary, fontWeight: '700' }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSingle = () => {
    return (
      <View style={styles.optionsContainer}>
        {currentQ.options?.map((opt, i) => {
          const isSelected = typeof currentAnswer === 'number' && currentAnswer === i;
          return (
            <TouchableOpacity 
              key={i} 
              style={[styles.boxOption, { backgroundColor: colors.background, borderColor: colors.border }, isSelected && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
              onPress={() => setAnswer(i)}
            >
              <View style={[styles.radioCircle, { borderColor: colors.textSecondary }, isSelected && { borderColor: colors.accent }]}>
                {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
              </View>
              <Text style={[styles.boxOptionLabel, { color: colors.textSecondary }, isSelected && { color: colors.textPrimary, fontWeight: '700' }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderScaleReason = () => {
    const ans = currentAnswer || { scale: undefined, reasons: [], openText: '' };
    return (
      <View>
        <Text style={styles.inputSectionLabel}>Nota (1 a 5)</Text>
        <View style={styles.scaleRow}>
          {[0, 1, 2, 3, 4].map(idx => {
            const isSelected = ans.scale === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.scaleBox, { backgroundColor: colors.background, borderColor: colors.border }, isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={() => setAnswer({ ...ans, scale: idx })}
              >
                <Text style={[styles.scaleText, { color: colors.textSecondary }, isSelected && { color: isDark ? '#111827' : '#FFFFFF' }]}>{idx + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.scaleLabelsRow}>
          <Text style={styles.scaleLabelLimit}>{currentQ.scaleLabel![0]}</Text>
          <Text style={styles.scaleLabelLimit}>{currentQ.scaleLabel![4]}</Text>
        </View>

        {typeof ans.scale === 'number' && (
          <View style={styles.reasonsFadeIn}>
            <Text style={styles.inputSectionLabel}>O que influenciou sua nota?</Text>
            <View style={styles.chipsContainer}>
              {currentQ.reasons?.map((reason, i) => {
                const isSelected = ans.reasons.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }, isSelected && { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}
                    onPress={() => {
                      if (isSelected) setAnswer({ ...ans, reasons: ans.reasons.filter((r: number) => r !== i) });
                      else setAnswer({ ...ans, reasons: [...ans.reasons, i] });
                    }}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, isSelected && { color: colors.accent, fontWeight: '700' }]}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={[styles.textInputArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder={currentQ.open}
              placeholderTextColor={colors.textSecondary}
              multiline
              value={ans.openText}
              onChangeText={(t) => setAnswer({ ...ans, openText: t })}
            />
          </View>
        )}
      </View>
    );
  };

  const renderNps = () => {
    const ans = currentAnswer || { score: undefined, openText: '' };
    return (
      <View>
        <View style={styles.npsRow}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
            const isSelected = ans.score === val;
            let bgColor = colors.background;
            if (isSelected) {
              if (val <= 6) bgColor = colors.danger; 
              else if (val <= 8) bgColor = colors.warning; 
              else bgColor = colors.success; 
            }
            return (
              <TouchableOpacity
                key={val}
                style={[styles.npsBox, { backgroundColor: bgColor, borderColor: colors.border }, isSelected && { borderColor: isDark ? '#FFFFFF' : '#111827', borderWidth: 2 }]}
                onPress={() => setAnswer({ ...ans, score: val })}
              >
                <Text style={[styles.npsText, { color: colors.textSecondary }, isSelected && { color: '#FFF' }]}>{val}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.scaleLabelsRow}>
          <Text style={styles.scaleLabelLimit}>0 Nunca recomendaria</Text>
          <Text style={styles.scaleLabelLimit}>10 Recomendaria muito</Text>
        </View>

        {typeof ans.score === 'number' && (
          <View style={styles.reasonsFadeIn}>
            <TextInput
              style={[styles.textInputArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder={currentQ.open}
              placeholderTextColor={colors.textSecondary}
              multiline
              value={ans.openText}
              onChangeText={(t) => setAnswer({ ...ans, openText: t })}
            />
          </View>
        )}
      </View>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TELAS
  // ──────────────────────────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <FontAwesome name="check-circle" size={80} color={colors.accent} style={{ marginBottom: 20 }} />
        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Muito Obrigado!</Text>
        <Text style={[styles.successText, { color: colors.textSecondary }]}>
          Seus feedbacks foram enviados com sucesso e nos ajudarão a criar uma plataforma incrível.
        </Text>
        <TouchableOpacity style={[styles.buttonContinueDark, { backgroundColor: colors.accent }]} onPress={() => router.replace('/')}>
          <Text style={[styles.buttonTextBlack, { color: isDark ? '#111827' : '#FFFFFF' }]}>Voltar ao App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.mainContainer, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.glowBg, { backgroundColor: colors.accent + '10' }]} />

        <View style={[styles.cardContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.headerLogoRow}>
            <BrandLogo compact={true} size={36} color={colors.accent} />
            <Text style={[styles.logoText, { color: colors.textSecondary }]}>TECHCONNECT</Text>
          </View>

          {!iniciado ? (
            <View>
              <Text style={[styles.introTitle, { color: colors.textPrimary }]}>Avaliação de Experiência do Usuário</Text>
              <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
                Você foi convidado a testar um aplicativo em fase de validação. Responda com base na sua experiência real de uso, sem certo ou errado.
              </Text>

              <View style={styles.tagsRow}>
                {["10 perguntas", "4 minutos", "Anônimo"].map(tag => (
                  <View key={tag} style={[styles.tagBadge, { borderColor: colors.border }]}>
                    <Text style={[styles.tagBadgeText, { color: colors.textSecondary }]}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.instructionsBoxDark, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.instLabel, { color: colors.accent }]}>ANTES DE RESPONDER</Text>
                
                <View style={styles.stepRow}>
                  <View style={[styles.stepIconBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}><FontAwesome name="search" size={14} color={colors.accent} /></View>
                  <Text style={[styles.stepText, { color: colors.textPrimary }]}>Acesse o app pelo link abaixo</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={[styles.stepIconBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}><FontAwesome name="user-plus" size={14} color={colors.accent} /></View>
                   <Text style={[styles.stepText, { color: colors.textPrimary }]}>Crie uma conta gratuita</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={[styles.stepIconBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}><FontAwesome name="filter" size={14} color={colors.accent} /></View>
                   <Text style={[styles.stepText, { color: colors.textPrimary }]}>Use a busca e aplique os filtros disponíveis</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={[styles.stepIconBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}><FontAwesome name="heart-o" size={14} color={colors.accent} /></View>
                   <Text style={[styles.stepText, { color: colors.textPrimary }]}>Salve ao menos uma vaga como favorita</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={[styles.stepIconBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}><FontAwesome name="check-square-o" size={14} color={colors.accent} /></View>
                   <Text style={[styles.stepText, { color: colors.textPrimary }]}>Volte aqui e responda as perguntas</Text>
                </View>
              </View>

              <TouchableOpacity style={[styles.testAppBtnDark, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '40' }]} onPress={handleTestarApp}>
                 <View>
                   <Text style={[styles.testAppLabel, { color: colors.accent }]}>ACESSAR O APP</Text>
                   <Text style={[styles.testAppUrl, { color: colors.textPrimary }]}>TechConnect App</Text>
                 </View>
                 <FontAwesome name="external-link" size={20} color={colors.accent} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.buttonContinueDark, { backgroundColor: colors.accent }]} onPress={iniciarAvaliacao}>
                <Text style={[styles.buttonTextBlack, { color: isDark ? '#111827' : '#FFFFFF' }]}>Já explorei o app, quero responder →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={[styles.progressBarWrapper, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFillDark, { width: `${progress}%`, backgroundColor: colors.accent }]} />
              </View>
              
              <Animated.View style={{ opacity: fadeAnim }}>
                <View style={[styles.tagWrapperDark, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.tagTextDark, { color: colors.accent }]}>{currentQ.tag}</Text>
                </View>
                <Text style={[styles.qTitleDark, { color: colors.textPrimary }]}>{currentQ.title}</Text>
                <Text style={[styles.qSubtitleDark, { color: colors.textSecondary }]}>{currentQ.subtitle}</Text>

                <View style={{ marginTop: 24, marginBottom: 32 }}>
                  {currentQ.type === 'multi' && renderMulti()}
                  {currentQ.type === 'single' && renderSingle()}
                  {currentQ.type === 'scale+reason' && renderScaleReason()}
                  {currentQ.type === 'nps' && renderNps()}
                </View>
              </Animated.View>

              <View style={styles.footerRow}>
                <TouchableOpacity style={[styles.buttonBackDark, { borderColor: colors.border }]} onPress={handleBack}>
                  <Text style={[styles.buttonTextGray, { color: colors.textSecondary }]}>← Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.buttonContinueDark, { flex: 2, backgroundColor: colors.accent }, !checkPodeContinuar() && { backgroundColor: colors.border, opacity: 0.5 }]} 
                  onPress={handleNext}
                  disabled={!checkPodeContinuar() || enviando}
                >
                  {enviando ? (
                    <ActivityIndicator color={isDark ? "#111827" : "#FFFFFF"} />
                  ) : (
                    <Text style={[styles.buttonTextBlack, { color: isDark ? '#111827' : '#FFFFFF' }, !checkPodeContinuar() && { color: colors.textSecondary }]}>
                      {currentStep === totalSteps - 1 ? 'Enviar avaliação ✓' : 'Próxima →'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
        <Text style={[styles.footerInfo, { color: colors.textSecondary }]}>PROJETO DE EXTENSÃO UNIVERSITÁRIA · 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flexGrow: 1, padding: 20, paddingTop: 40, paddingBottom: 60, alignItems: 'center' },
  glowBg: { position: 'absolute', top: 0, width: 600, height: 300, borderRadius: 300 },
  cardContainer: { width: '100%', maxWidth: 560, borderRadius: 20, borderWidth: 1.5, padding: 32, zIndex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoLetter: { fontSize: 16, fontWeight: '900' },
  logoText: { fontSize: 13, letterSpacing: 1.5, fontWeight: '700' },

  introTitle: { fontSize: 26, fontWeight: '700', marginBottom: 10, lineHeight: 34 },
  introDesc: { fontSize: 14, lineHeight: 24, marginBottom: 28 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  tagBadgeText: { fontSize: 11, letterSpacing: 0.8, fontWeight: '700' },

  instructionsBoxDark: { borderWidth: 1.5, borderRadius: 16, padding: 24, marginBottom: 28 },
  instLabel: { fontSize: 11, letterSpacing: 1, fontWeight: '700', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  stepIconBox: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  stepText: { fontSize: 13, lineHeight: 20, flex: 1 },
  stepNum: { fontWeight: '700', fontSize: 11 },

  testAppBtnDark: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, marginBottom: 24 },
  testAppLabel: { fontSize: 11, letterSpacing: 0.8, fontWeight: '700', marginBottom: 4 },
  testAppUrl: { fontSize: 14, fontWeight: '600' },

  buttonContinueDark: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonTextBlack: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  
  footerInfo: { textAlign: 'center', fontSize: 11, marginTop: 24, fontWeight: '700', letterSpacing: 0.5 },

  /* WIZARD STYLES */
  progressBarWrapper: { height: 4, borderRadius: 2, marginBottom: 32 },
  progressBarFillDark: { height: '100%', borderRadius: 2 },
  
  tagWrapperDark: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  tagTextDark: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  qTitleDark: { fontSize: 22, fontWeight: '700', marginBottom: 8, lineHeight: 30 },
  qSubtitleDark: { fontSize: 14, lineHeight: 22 },

  optionsContainer: { gap: 12 },
  boxOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  emojiText: { fontSize: 20, marginRight: 12 },
  boxOptionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  inputSectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 12, marginTop: 24 },
  scaleRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  scaleBox: { flex: 1, aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  scaleText: { fontSize: 16, fontWeight: '700' },
  scaleLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleLabelLimit: { fontSize: 11, fontWeight: '500' },

  reasonsFadeIn: { marginTop: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },

  textInputArea: { borderWidth: 1.5, borderRadius: 14, padding: 16, paddingTop: 16, marginTop: 20, minHeight: 100, fontSize: 15, textAlignVertical: 'top' },

  npsRow: { flexDirection: 'row', gap: 4, justifyContent: 'space-between', flexWrap: 'wrap' },
  npsBox: { width: '8%', minWidth: 30, aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  npsText: { fontSize: 13, fontWeight: '700' },

  footerRow: { flexDirection: 'row', gap: 12 },
  buttonBackDark: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  buttonTextGray: { fontSize: 14, fontWeight: '600' },

  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successTitle: { fontSize: 32, fontWeight: '800', marginBottom: 12 },
  successText: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 40, maxWidth: 400 },
});
