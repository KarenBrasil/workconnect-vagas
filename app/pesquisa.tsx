import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';

const PERGUNTAS = [
  {
    id: 'q1',
    titulo: '1. Perfil Profissional e Contexto:',
    descricao: 'Qual a sua relação atual com a área de Tecnologia ou Recursos Humanos?',
    opcoes: [
      'Estudo ou pretendo entrar na área de Tecnologia.',
      'Já atuo profissionalmente como Desenvolvedor(a), Designer ou em áreas técnicas.',
      'Trabalho com Recursos Humanos, Recrutamento ou Gestão.',
      'Sou de outra área, mas acompanho o mercado de tecnologia.',
    ],
  },
  {
    id: 'q2',
    titulo: '2. Interface e Design Visual (UI):',
    descricao: 'O que você achou da organização visual, das cores e da clareza das informações no aplicativo?',
    opcoes: [
      'Excelente. É moderno, visualmente agradável e super fácil de ler.',
      'Muito bom. O design atende bem, mas notei pequenos detalhes que podem melhorar.',
      'Razoável. O visual cumpre o papel, mas achei o design meio comum.',
      'Confuso. Tive certa dificuldade para ler ou achar as informações na tela.',
    ],
  },
  {
    id: 'q3',
    titulo: '3. Arquitetura da Informação e Navegação:',
    descricao: 'Como foi transitar entre as diferentes partes do app (Início, Buscar, Favoritos, Perfil)?',
    opcoes: [
      'Super intuitivo. Entendi a estrutura e naveguei sem precisar pensar.',
      'Bem fácil na maior parte do tempo, não tive grandes problemas.',
      'Ok, mas o caminho para chegar ou voltar de algumas telas poderia ser mais óbvio.',
      'Complicado. Fiquei um pouco perdido(a) nos menus ou durante o uso.',
    ],
  },
  {
    id: 'q4',
    titulo: '4. Sistema de Busca e Filtros:',
    descricao: 'Ao usar a aba "Buscar" e aplicar os filtros (Remoto, PJ, CLT), como foram os resultados retornados?',
    opcoes: [
      'Precisos. O sistema filtrou rapidamente exatamente o que eu procurava.',
      'Satisfatórios. A busca funciona, mas a precisão dos resultados pode melhorar um pouco.',
      'Razoáveis. Entendi o funcionamento, mas os filtros não mudaram muito minha experiência.',
      'Ineficientes. A pesquisa me trouxe muitas vagas que não tinham a ver com o termo.',
    ],
  },
  {
    id: 'q5',
    titulo: '5. Integração de Vagas Globais (APIs):',
    descricao: 'O app puxa vagas de várias plataformas externas (GitHub, Remotive, etc.). O que você achou dessa centralização?',
    opcoes: [
      'Incrível. Ter todas as vagas padronizadas no mesmo lugar poupa muito tempo.',
      'Muito boa. A ideia é ótima, embora a descrição de algumas vagas externas seja muito longa.',
      'Interessante, mas na prática eu prefiro continuar olhando nas fontes originais.',
      'Confusa. Ficou difícil diferenciar o que era vaga interna do app e o que era de fora.',
    ],
  },
  {
    id: 'q6',
    titulo: '6. Gerenciamento de Favoritos:',
    descricao: 'Ao salvar as vagas para acessar depois (botão de favoritar), como o sistema se comportou?',
    opcoes: [
      'Perfeito e instantâneo. Achei rápido, prático e muito útil.',
      'Funcional. Consegui salvar as vagas sem problemas técnicos.',
      'Básico. É um recurso padrão, funciona, mas não teve nada de surpreendente.',
      'Problemático. Tive alguma lentidão ou dificuldade para achar a lista salva depois.',
    ],
  },
  {
    id: 'q7',
    titulo: '7. Mecanismo de Conversão (Candidatura):',
    descricao: 'Em vez de um formulário longo, o app envia você direto para o WhatsApp ou E-mail do recrutador. O que acha dessa abordagem?',
    opcoes: [
      'Ótima e ágil. Evita a burocracia de criar contas e preencher dados de novo.',
      'Prática. Entendo a agilidade, mas eu gosto quando o currículo é enviado por dentro do app.',
      'Indiferente. Pra mim, não faz muita diferença na hora de mandar o currículo.',
      'Inconveniente. Ter que sair do aplicativo para falar com o recrutador quebra o fluxo de navegação.',
    ],
  },
  {
    id: 'q8',
    titulo: '8. Desempenho e Velocidade (Performance):',
    descricao: 'Como você avalia o tempo que o aplicativo demora para carregar as telas e as listas de vagas?',
    opcoes: [
      'Excelente. Muito rápido, não senti nenhum tipo de atraso ou travamento (lag).',
      'Muito bom. Pude notar um carregamento rápido, totalmente dentro do esperado.',
      'Estável. O tempo de resposta é normal, mas algumas telas poderiam carregar mais rápido.',
      'Lento. Demorou bastante para renderizar o conteúdo ou transitar entre as vagas.',
    ],
  },
  {
    id: 'q9',
    titulo: '9. Viabilidade Prática (Impacto Extensionista):',
    descricao: 'O foco do WorkConnect é democratizar as oportunidades e acabar com a "caça às vagas". Você acha que a ferramenta resolve esse problema na prática?',
    opcoes: [
      'Plenamente. A centralização de dados simplifica muito a vida de quem procura projeto/emprego.',
      'Significativamente. É uma iniciativa excelente que tem ótimo potencial técnico e de mercado.',
      'Parcialmente. A ferramenta tem mérito, mas o impacto depende de ter um volume maior de vagas.',
      'Pouco. No cenário atual, as ferramentas que já existem resolvem o problema de forma similar.',
    ],
  },
  {
    id: 'q10',
    titulo: '10. Intenção de Uso e Retenção:',
    descricao: 'Considerando a sua experiência durante os testes, você adotaria o app na sua rotina ou o recomendaria para sua rede?',
    opcoes: [
      'Com certeza! Eu usaria a ferramenta frequentemente e recomendaria para colegas da área.',
      'Provavelmente. Usaria de forma mais pontual e indicaria caso visse uma vaga interessante.',
      'Talvez. Manteria o acesso ao app, mas como uma opção secundária de pesquisa.',
      'Dificilmente. No momento, o aplicativo não se encaixaria nas minhas necessidades reais.',
    ],
  },
];

export default function PesquisaScreen() {
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroValidacao, setErroValidacao] = useState(false);

  const handleSelecionar = (perguntaId: string, opcaoIndex: number) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: opcaoIndex }));
    setErroValidacao(false);
  };

  const handleTestarApp = () => {
    Linking.openURL('/');
  };

  const handleEnviar = async () => {
    if (Object.keys(respostas).length < PERGUNTAS.length) {
      setErroValidacao(true);
      return;
    }

    setEnviando(true);
    try {
      // Formata os dados para salvar legível no banco
      const dadosParaSalvar: Record<string, string> = {};
      PERGUNTAS.forEach((p) => {
        const respostaIndex = respostas[p.id];
        dadosParaSalvar[p.id] = p.opcoes[respostaIndex];
      });

      await addDoc(collection(db, 'avaliacoes'), {
        respostas: dadosParaSalvar,
        plataforma: Platform.OS,
        criadoEm: serverTimestamp(),
      });

      setSucesso(true);
    } catch (e) {
      console.log('Erro ao salvar avaliação:', e);
      alert('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <View style={styles.successContainer}>
        <FontAwesome name="check-circle" size={80} color="#2E9D4D" style={{ marginBottom: 20 }} />
        <Text style={styles.successTitle}>Muito Obrigado!</Text>
        <Text style={styles.successText}>
          Sua avaliação foi enviada com sucesso e será fundamental para o nosso projeto de extensão.
        </Text>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleTestarApp}>
          <Text style={styles.buttonText}>Acessar o WorkConnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      
      {/* Header Info */}
      <View style={styles.headerBox}>
        <View style={styles.iconBox}>
          <FontAwesome name="clipboard" size={28} color="#FFF" />
        </View>
        <Text style={styles.title}>Avaliação Técnica de Usabilidade</Text>
        <Text style={styles.subtitle}>WorkConnect App</Text>
      </View>

      {/* Instruções */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsText}>
          Olá! Este formulário faz parte da validação técnica do meu projeto de extensão universitária: o aplicativo <Text style={{ fontWeight: 'bold' }}>WorkConnect</Text>.
        </Text>
        <Text style={styles.instructionsText}>
          O app foi desenvolvido para centralizar e facilitar o acesso a vagas do setor de Tecnologia, puxando oportunidades de diversas plataformas para um único lugar.
        </Text>
        
        <View style={styles.stepBox}>
          <FontAwesome name="hand-pointer-o" size={20} color="#2E9D4D" style={{ width: 30 }} />
          <Text style={styles.stepText}>Explore o aplicativo (crie uma conta, use filtros, salve favoritos).</Text>
        </View>
        <View style={styles.stepBox}>
          <FontAwesome name="check-square-o" size={20} color="#2E9D4D" style={{ width: 30 }} />
          <Text style={styles.stepText}>Volte aqui e responda a estas 10 perguntas rápidas.</Text>
        </View>

        <TouchableOpacity style={styles.testAppBtn} onPress={handleTestarApp}>
          <Text style={styles.testAppBtnText}>Abrir Aplicativo para Testar</Text>
          <FontAwesome name="external-link" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Formulário */}
      <View style={styles.formContainer}>
        {PERGUNTAS.map((pergunta, index) => (
          <View key={pergunta.id} style={styles.questionBox}>
            <Text style={styles.questionTitle}>{pergunta.titulo}</Text>
            <Text style={styles.questionDesc}>{pergunta.descricao}</Text>
            
            <View style={styles.optionsContainer}>
              {pergunta.opcoes.map((opcao, opIndex) => {
                const isSelected = respostas[pergunta.id] === opIndex;
                return (
                  <TouchableOpacity
                    key={opIndex}
                    style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                    onPress={() => handleSelecionar(pergunta.id, opIndex)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opcao}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {erroValidacao && (
          <Text style={styles.errorText}>Por favor, responda a todas as 10 perguntas antes de enviar.</Text>
        )}

        <TouchableOpacity 
          style={[styles.buttonPrimary, enviando && { opacity: 0.7 }]} 
          onPress={handleEnviar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Enviar Avaliação</Text>
              <FontAwesome name="paper-plane" size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 600,
    marginHorizontal: 'auto',
    width: '100%',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2E9D4D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2E9D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  instructionsBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  instructionsText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  stepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  testAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
    gap: 10,
  },
  testAppBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  formContainer: {
    gap: 32,
  },
  questionBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  questionDesc: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFC',
  },
  optionBtnSelected: {
    borderColor: '#2E9D4D',
    backgroundColor: '#F0FDF4',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#2E9D4D',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E9D4D',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E9D4D',
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    gap: 10,
    shadowColor: '#2E9D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -10,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFC',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 400,
  },
});
