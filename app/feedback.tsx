import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView, Animated, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';
import { useRouter } from 'expo-router';

type RespostaType = any; 

const QUESTIONS = [
  {
    id: 1,
    tag: "CONTEXTO",
    title: "Qual é o seu perfil?",
    subtitle: "Selecione a opção que melhor te descreve.",
    type: "single",
    options: [
      { emoji: "💻", label: "Profissional de TI (dev, dados, infra, produto…)" },
      { emoji: "🎓", label: "Estudante de tecnologia" },
      { emoji: "🔍", label: "Profissional de RH ou recrutamento" },
      { emoji: "📨", label: "Estou ativamente buscando emprego em tech" },
      { emoji: "👤", label: "Nenhuma das anteriores" },
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
      { emoji: "✅", label: "Funcionou perfeitamente" },
      { emoji: "⚠️", label: "Funcionou, mas com lentidão ou comportamento estranho" },
      { emoji: "❌", label: "Não funcionou como esperado" },
      { emoji: "⏭️", label: "Não testei essa função" },
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
      { emoji: "⚡", label: "Rápido sem esperas perceptíveis" },
      { emoji: "🟡", label: "Aceitável pequenas esperas, mas não atrapalha" },
      { emoji: "🐢", label: "Lento esperas que prejudicam a experiência" },
      { emoji: "🔴", label: "Muito lento impede o uso fluido" },
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
    if (currentQ.type === 'scale+reason' && typeof currentAnswer.scale !== 'number') return false;
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

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
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
      await addDoc(collection(db, 'avaliacoes'), {
        respostas,
        plataforma: Platform.OS,
        criadoEm: serverTimestamp(),
      });
      setSucesso(true);
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDERIZADORES DE INPUTS (DARK THEME)
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
              style={[styles.boxOption, isSelected && styles.boxOptionSelected]}
              onPress={() => {
                if (isSelected) setAnswer(selecoes.filter((s: number) => s !== i));
                else setAnswer([...selecoes, i]);
              }}
            >
              <Text style={styles.emojiText}>{opt.emoji}</Text>
              <Text style={[styles.boxOptionLabel, isSelected && styles.boxOptionLabelSelected]}>{opt.label}</Text>
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
              style={[styles.boxOption, isSelected && styles.boxOptionSelected]}
              onPress={() => setAnswer(i)}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.emojiText}>{opt.emoji}</Text>
              <Text style={[styles.boxOptionLabel, isSelected && styles.boxOptionLabelSelected]}>{opt.label}</Text>
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
                style={[styles.scaleBox, isSelected && styles.scaleBoxSelected]}
                onPress={() => setAnswer({ ...ans, scale: idx })}
              >
                <Text style={[styles.scaleText, isSelected && styles.scaleTextSelected]}>{idx + 1}</Text>
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
            <Text style={styles.inputSectionLabel}>O que influenciou sua nota? (Opcional)</Text>
            <View style={styles.chipsContainer}>
              {currentQ.reasons?.map((reason, i) => {
                const isSelected = ans.reasons.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => {
                      if (isSelected) setAnswer({ ...ans, reasons: ans.reasons.filter((r: number) => r !== i) });
                      else setAnswer({ ...ans, reasons: [...ans.reasons, i] });
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={styles.textInputArea}
              placeholder={currentQ.open}
              placeholderTextColor="#475569"
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
            let bgColor = '#060f1f';
            if (isSelected) {
              if (val <= 6) bgColor = '#EF4444'; 
              else if (val <= 8) bgColor = '#F59E0B'; 
              else bgColor = '#10B981'; 
            }
            return (
              <TouchableOpacity
                key={val}
                style={[styles.npsBox, { backgroundColor: bgColor }, isSelected && styles.npsBoxSelected]}
                onPress={() => setAnswer({ ...ans, score: val })}
              >
                <Text style={[styles.npsText, isSelected && { color: '#FFF' }]}>{val}</Text>
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
              style={styles.textInputArea}
              placeholder={currentQ.open}
              placeholderTextColor="#475569"
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
  // TELAS (DARK THEME)
  // ──────────────────────────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <View style={styles.successContainer}>
        <FontAwesome name="check-circle" size={80} color="#6366f1" style={{ marginBottom: 20 }} />
        <Text style={styles.successTitle}>Muito Obrigado!</Text>
        <Text style={styles.successText}>
          Seus feedbacks foram enviados com sucesso e nos ajudarão a criar uma plataforma incrível.
        </Text>
        <TouchableOpacity style={styles.buttonContinueDark} onPress={() => router.replace('/')}>
          <Text style={styles.buttonTextWhite}>Voltar ao App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.mainContainer} showsVerticalScrollIndicator={false}>
        
        {/* Glow effect simulação */}
        <View style={styles.glowBg} />

        <View style={styles.cardContainer}>
          <View style={styles.headerLogoRow}>
            <View style={styles.logoBox}><Text style={styles.logoLetter}>T</Text></View>
            <Text style={styles.logoText}>TECHCONNECT</Text>
          </View>

          {!iniciado ? (
            <View>
              <Text style={styles.introTitle}>Avaliação de Experiência do Usuário</Text>
              <Text style={styles.introDesc}>
                Você foi convidado a testar um aplicativo em fase de validação. Responda com base na sua experiência real de uso, sem certo ou errado.
              </Text>

              <View style={styles.tagsRow}>
                {["10 perguntas", "4 minutos", "Anônimo"].map(tag => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.instructionsBoxDark}>
                <Text style={styles.instLabel}>ANTES DE RESPONDER</Text>
                
                <View style={styles.stepRow}>
                  <View style={styles.stepIconBox}><FontAwesome name="search" size={14} color="#a5b4fc" /></View>
                  <Text style={styles.stepText}><Text style={styles.stepNum}>01 </Text>Explore o aplicativo</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={styles.stepIconBox}><FontAwesome name="check-square-o" size={14} color="#a5b4fc" /></View>
                   <Text style={styles.stepText}><Text style={styles.stepNum}>02 </Text>Teste buscas e filtros</Text>
                </View>
                <View style={styles.stepRow}>
                   <View style={styles.stepIconBox}><FontAwesome name="heart-o" size={14} color="#a5b4fc" /></View>
                   <Text style={styles.stepText}><Text style={styles.stepNum}>03 </Text>Use os favoritos</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.testAppBtnDark} onPress={handleTestarApp}>
                 <View>
                   <Text style={styles.testAppLabel}>ACESSAR O APP</Text>
                   <Text style={styles.testAppUrl}>techconnect-br.vercel.app</Text>
                 </View>
                 <FontAwesome name="external-link" size={20} color="#a5b4fc" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonContinueDark} onPress={() => setIniciado(true)}>
                <Text style={styles.buttonTextWhite}>Já explorei o app, quero responder →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.progressBarWrapper}>
                <View style={[styles.progressBarFillDark, { width: `${progress}%` }]} />
              </View>
              
              <Animated.View style={{ opacity: fadeAnim }}>
                <View style={styles.tagWrapperDark}>
                  <Text style={styles.tagTextDark}>{currentQ.tag}</Text>
                </View>
                <Text style={styles.qTitleDark}>{currentQ.title}</Text>
                <Text style={styles.qSubtitleDark}>{currentQ.subtitle}</Text>

                <View style={{ marginTop: 24, marginBottom: 32 }}>
                  {currentQ.type === 'multi' && renderMulti()}
                  {currentQ.type === 'single' && renderSingle()}
                  {currentQ.type === 'scale+reason' && renderScaleReason()}
                  {currentQ.type === 'nps' && renderNps()}
                </View>
              </Animated.View>

              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.buttonBackDark} onPress={handleBack}>
                  <Text style={styles.buttonTextGray}>← Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.buttonContinueDark, { flex: 2 }, !checkPodeContinuar() && styles.buttonDisabledDark]} 
                  onPress={handleNext}
                  disabled={!checkPodeContinuar() || enviando}
                >
                  {enviando ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.buttonTextWhite, !checkPodeContinuar() && { color: '#64748b' }]}>
                      {currentStep === totalSteps - 1 ? 'Enviar avaliação ✓' : 'Próxima →'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
        <Text style={styles.footerInfo}>PROJETO DE EXTENSÃO UNIVERSITÁRIA · 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flexGrow: 1, backgroundColor: '#020818', padding: 20, paddingTop: 40, paddingBottom: 60, alignItems: 'center' },
  glowBg: { position: 'absolute', top: 0, width: 600, height: 300, borderRadius: 300, backgroundColor: 'rgba(99,102,241,0.08)' },
  cardContainer: { width: '100%', maxWidth: 560, backgroundColor: '#0a1628', borderRadius: 20, borderWidth: 1.5, borderColor: '#1e293b', padding: 32, zIndex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  logoLetter: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  logoText: { color: '#475569', fontSize: 13, letterSpacing: 1.5, fontWeight: '700' },

  introTitle: { fontSize: 26, fontWeight: '700', color: '#f1f5f9', marginBottom: 10, lineHeight: 34 },
  introDesc: { fontSize: 14, color: '#64748b', lineHeight: 24, marginBottom: 28 },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: '#1e293b' },
  tagBadgeText: { fontSize: 11, color: '#475569', letterSpacing: 0.8, fontWeight: '700' },

  instructionsBoxDark: { backgroundColor: '#060f1f', borderWidth: 1.5, borderColor: '#1e293b', borderRadius: 16, padding: 24, marginBottom: 28 },
  instLabel: { fontSize: 11, color: '#6366f1', letterSpacing: 1, fontWeight: '700', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  stepIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', justifyContent: 'center', alignItems: 'center' },
  stepText: { fontSize: 13, color: '#94a3b8', lineHeight: 20, flex: 1 },
  stepNum: { color: '#475569', fontWeight: '700', fontSize: 11 },

  testAppBtnDark: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.08)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.3)', marginBottom: 24 },
  testAppLabel: { fontSize: 11, color: '#6366f1', letterSpacing: 0.8, fontWeight: '700', marginBottom: 4 },
  testAppUrl: { fontSize: 13, color: '#a5b4fc' },

  buttonContinueDark: { width: '100%', padding: 16, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  buttonTextWhite: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  
  footerInfo: { textAlign: 'center', fontSize: 11, color: '#1e293b', marginTop: 24, fontWeight: '700', letterSpacing: 0.5 },

  /* WIZARD STYLES (DARK) */
  progressBarWrapper: { height: 4, backgroundColor: '#1e293b', borderRadius: 2, marginBottom: 32 },
  progressBarFillDark: { height: '100%', backgroundColor: '#6366f1', borderRadius: 2 },
  
  tagWrapperDark: { backgroundColor: 'rgba(99,102,241,0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  tagTextDark: { color: '#a5b4fc', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  qTitleDark: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 8, lineHeight: 30 },
  qSubtitleDark: { fontSize: 14, color: '#64748b', lineHeight: 22 },

  optionsContainer: { gap: 12 },
  boxOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#060f1f', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#1e293b' },
  boxOptionSelected: { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioCircleSelected: { borderColor: '#6366f1' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366f1' },
  emojiText: { fontSize: 20, marginRight: 12 },
  boxOptionLabel: { flex: 1, fontSize: 15, color: '#94a3b8', fontWeight: '500' },
  boxOptionLabelSelected: { color: '#f1f5f9', fontWeight: '700' },

  inputSectionLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 12, marginTop: 24 },
  scaleRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  scaleBox: { flex: 1, aspectRatio: 1, backgroundColor: '#060f1f', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1e293b' },
  scaleBoxSelected: { backgroundColor: '#6366f1', borderColor: '#8b5cf6' },
  scaleText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  scaleTextSelected: { color: '#FFF' },
  scaleLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleLabelLimit: { fontSize: 11, color: '#475569', fontWeight: '500' },

  reasonsFadeIn: { marginTop: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#060f1f', borderWidth: 1, borderColor: '#1e293b' },
  chipSelected: { backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366f1' },
  chipText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  chipTextSelected: { color: '#a5b4fc', fontWeight: '700' },

  textInputArea: { backgroundColor: '#060f1f', borderWidth: 1.5, borderColor: '#1e293b', borderRadius: 14, padding: 16, paddingTop: 16, marginTop: 20, minHeight: 100, fontSize: 15, color: '#f1f5f9', textAlignVertical: 'top' },

  npsRow: { flexDirection: 'row', gap: 4, justifyContent: 'space-between', flexWrap: 'wrap' },
  npsBox: { width: '8%', minWidth: 30, aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  npsBoxSelected: { borderWidth: 2, borderColor: '#f1f5f9' },
  npsText: { fontSize: 13, fontWeight: '700', color: '#64748b' },

  footerRow: { flexDirection: 'row', gap: 12 },
  buttonBackDark: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  buttonTextGray: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  buttonDisabledDark: { backgroundColor: '#1e293b' },

  successContainer: { flex: 1, backgroundColor: '#020818', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successTitle: { fontSize: 32, fontWeight: '800', color: '#f1f5f9', marginBottom: 12 },
  successText: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 24, marginBottom: 40, maxWidth: 400 },
});
