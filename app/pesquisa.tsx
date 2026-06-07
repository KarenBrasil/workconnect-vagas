import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform, KeyboardAvoidingView, Animated, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';
import { useRouter } from 'expo-router';

// Tipagem de Resposta Dinâmica
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

  // Animação de transição suave
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Registra Visita Invisível no Banco
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

  // Helper para salvar estado da resposta atual
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
              placeholderTextColor="#9CA3AF"
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
            let bgColor = '#F3F4F6';
            if (isSelected) {
              if (val <= 6) bgColor = '#EF4444'; // Detratores
              else if (val <= 8) bgColor = '#F59E0B'; // Passivos
              else bgColor = '#10B981'; // Promotores
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
              placeholderTextColor="#9CA3AF"
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
  // TELAS PRINCIPAIS
  // ──────────────────────────────────────────────────────────────────────────

  if (sucesso) {
    return (
      <View style={styles.successContainer}>
        <FontAwesome name="check-circle" size={80} color="#CDFE00" style={{ marginBottom: 20 }} />
        <Text style={styles.successTitle}>Muito Obrigado!</Text>
        <Text style={styles.successText}>
          Seus feedbacks foram enviados com sucesso e nos ajudarão a criar uma plataforma incrível.
        </Text>
        <TouchableOpacity style={styles.buttonContinue} onPress={() => router.replace('/')}>
          <Text style={styles.buttonTextBlack}>Voltar ao App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!iniciado) {
    return (
      <ScrollView contentContainerStyle={styles.introContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.iconBox}>
          <FontAwesome name="flask" size={32} color="#111827" />
        </View>
        <Text style={styles.introTitle}>Avaliação de Experiência do Usuário</Text>
        <Text style={styles.introDesc}>
          Você foi convidado a testar um aplicativo em fase de validação. Responda com base na sua experiência real de uso — sem certo ou errado.
        </Text>
        
        {/* Orientações e Link do App */}
        <View style={styles.instructionsBox}>
          <View style={styles.stepBox}>
            <FontAwesome name="hand-pointer-o" size={20} color="#2E9D4D" style={{ width: 30 }} />
            <Text style={styles.stepText}>Explore o aplicativo: teste as buscas, veja vagas e use os favoritos.</Text>
          </View>
          <TouchableOpacity style={styles.testAppBtn} onPress={handleTestarApp}>
            <Text style={styles.testAppBtnText}>Abrir Aplicativo para Testar</Text>
            <FontAwesome name="external-link" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="clock-o" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Leva cerca de 3 minutos</Text>
        </View>

        <TouchableOpacity style={styles.buttonContinue} onPress={() => setIniciado(true)}>
          <Text style={styles.buttonTextBlack}>Começar Pesquisa</Text>
          <FontAwesome name="arrow-right" size={16} color="#111827" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.wizardContainer}>
        {/* Topbar */}
        <View style={styles.topbar}>
          <TouchableOpacity onPress={handleBack}>
            <FontAwesome name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepCounter}>{currentStep + 1}/{totalSteps}</Text>
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.questionScroll} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          <View style={styles.tagWrapper}>
            <Text style={styles.tagText}>{currentQ.tag}</Text>
          </View>
          <Text style={styles.qTitle}>{currentQ.title}</Text>
          <Text style={styles.qSubtitle}>{currentQ.subtitle}</Text>

          {/* Renderiza o input dinâmico */}
          <View style={{ marginTop: 24 }}>
            {currentQ.type === 'multi' && renderMulti()}
            {currentQ.type === 'single' && renderSingle()}
            {currentQ.type === 'scale+reason' && renderScaleReason()}
            {currentQ.type === 'nps' && renderNps()}
          </View>
        </Animated.ScrollView>

        {/* Footer Area com o botão Continuar */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.buttonContinue, !checkPodeContinuar() && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={!checkPodeContinuar() || enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={styles.buttonTextBlack}>{currentStep === totalSteps - 1 ? 'Finalizar e Enviar' : 'Continuar'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  introContainer: { flexGrow: 1, backgroundColor: '#FAFAFC', padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#CDFE00', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  introTitle: { fontSize: 32, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 16 },
  introDesc: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 26, marginBottom: 24, maxWidth: 500 },
  
  instructionsBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24, width: '100%', maxWidth: 500 },
  stepBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepText: { fontSize: 14, color: '#111827', flex: 1, fontWeight: '500', lineHeight: 20 },
  testAppBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', padding: 14, borderRadius: 12, marginTop: 8, gap: 10 },
  testAppBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 40, gap: 8 },
  infoText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  buttonContinue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CDFE00', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16, width: '100%', maxWidth: 500, gap: 12 },
  buttonTextBlack: { color: '#111827', fontSize: 18, fontWeight: '800' },
  buttonDisabled: { opacity: 0.4 },

  wizardContainer: { flex: 1, backgroundColor: '#FAFAFC' },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 60, paddingBottom: 16, gap: 16 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#CDFE00', borderRadius: 3 },
  stepCounter: { fontSize: 14, color: '#6B7280', fontWeight: '600', width: 36, textAlign: 'right' },

  questionScroll: { padding: 24, paddingBottom: 120, maxWidth: 600, marginHorizontal: 'auto', width: '100%' },
  tagWrapper: { backgroundColor: '#111827', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  tagText: { color: '#CDFE00', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  qTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8, lineHeight: 34 },
  qSubtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },

  optionsContainer: { gap: 12 },
  boxOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, borderWidth: 2, borderColor: '#F3F4F6' },
  boxOptionSelected: { borderColor: '#CDFE00', backgroundColor: '#F9FFE5' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioCircleSelected: { borderColor: '#2E9D4D' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2E9D4D' },
  emojiText: { fontSize: 24, marginRight: 16 },
  boxOptionLabel: { flex: 1, fontSize: 16, color: '#4B5563', fontWeight: '500' },
  boxOptionLabelSelected: { color: '#111827', fontWeight: '700' },

  inputSectionLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 24 },
  scaleRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  scaleBox: { flex: 1, aspectRatio: 1, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  scaleBoxSelected: { backgroundColor: '#111827', borderColor: '#CDFE00' },
  scaleText: { fontSize: 18, fontWeight: '700', color: '#4B5563' },
  scaleTextSelected: { color: '#CDFE00' },
  scaleLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleLabelLimit: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },

  reasonsFadeIn: { marginTop: 16 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipSelected: { backgroundColor: '#F9FFE5', borderColor: '#CDFE00' },
  chipText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  chipTextSelected: { color: '#111827', fontWeight: '700' },

  textInputArea: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, paddingTop: 16, marginTop: 24, minHeight: 120, fontSize: 16, color: '#111827', textAlignVertical: 'top' },

  npsRow: { flexDirection: 'row', gap: 4, justifyContent: 'space-between', flexWrap: 'wrap' },
  npsBox: { width: '8%', minWidth: 30, aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  npsBoxSelected: { borderWidth: 3, borderColor: '#111827' },
  npsText: { fontSize: 14, fontWeight: '700', color: '#4B5563' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: '#FAFAFC', borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center' },

  successContainer: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  successText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', lineHeight: 24, marginBottom: 40, maxWidth: 400 },
});
