import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface VagaPublicada {
  id: string;
  titulo: string;
  empresa: string;
  contrato: string;
  tipo: string;
  criadoEm: string;
}

export default function PostJob() {
  const router = useRouter();
  const [tipo, setTipo] = useState<'recrutador' | 'freelancer'>('recrutador');
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [contrato, setContrato] = useState('');
  const [salario, setSalario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState<'nova' | 'gerenciar'>('nova');
  const [minhasVagas, setMinhasVagas] = useState<VagaPublicada[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const carregarMinhasVagas = async () => {
    setLoadingVagas(true);
    try {
      const snapshot = await getDocs(collection(db, 'vagas'));
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VagaPublicada));
      setMinhasVagas(lista.sort((a, b) => b.criadoEm?.localeCompare(a.criadoEm)));
    } catch (e) {
      console.log('Erro ao carregar vagas:', e);
    } finally {
      setLoadingVagas(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'gerenciar') carregarMinhasVagas();
  }, [abaAtiva]);

  const handlePublicar = async () => {
    if (!titulo || !descricao) {
      if (Platform.OS === 'web') window.alert('Preencha pelo menos o título e a descrição!');
      else Alert.alert('Atenção', 'Preencha pelo menos o título e a descrição!');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'vagas'), {
        tipo,
        titulo,
        empresa: empresa || 'Não informado',
        contrato: contrato || 'Não informado',
        salario: salario || 'A combinar',
        descricao,
        criadoEm: new Date().toISOString(),
      });
      if (Platform.OS === 'web') {
        window.alert('Sua publicação foi postada com sucesso!');
        router.push('/(tabs)');
      } else {
        Alert.alert('Publicado!', 'Sua publicação foi postada no feed.', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
      }
      setTitulo(''); setEmpresa(''); setContrato(''); setSalario(''); setDescricao('');
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível publicar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = (vagaId: string, vagaTitulo: string) => {
    const confirmar = () => deletarVaga(vagaId);
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir a vaga "${vagaTitulo}"? Esta ação não pode ser desfeita.`)) confirmar();
    } else {
      Alert.alert('Excluir Vaga', `Deseja excluir "${vagaTitulo}"?\n\nEsta ação não pode ser desfeita.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar }
      ]);
    }
  };

  const deletarVaga = async (vagaId: string) => {
    setDeletandoId(vagaId);
    try {
      await deleteDoc(doc(db, 'vagas', vagaId));
      setMinhasVagas(prev => prev.filter(v => v.id !== vagaId));
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível excluir a vaga: ' + e.message);
    } finally {
      setDeletandoId(null);
    }
  };

  const formatarData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>Publicações</Text>
        <Text style={styles.subtitle}>Gerencie suas vagas</Text>
      </View>

      {/* Abas */}
      <View style={styles.abasContainer}>
        <TouchableOpacity
          style={[styles.abaBtn, abaAtiva === 'nova' && styles.abaBtnAtiva]}
          onPress={() => setAbaAtiva('nova')}
        >
          <FontAwesome name="plus-circle" size={14} color={abaAtiva === 'nova' ? '#2E9D4D' : '#83829A'} />
          <Text style={[styles.abaText, abaAtiva === 'nova' && styles.abaTextAtiva]}>  Nova Vaga</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.abaBtn, abaAtiva === 'gerenciar' && styles.abaBtnAtiva]}
          onPress={() => setAbaAtiva('gerenciar')}
        >
          <FontAwesome name="list" size={14} color={abaAtiva === 'gerenciar' ? '#2E9D4D' : '#83829A'} />
          <Text style={[styles.abaText, abaAtiva === 'gerenciar' && styles.abaTextAtiva]}>  Gerenciar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ABA: Nova Vaga */}
        {abaAtiva === 'nova' && (
          <View>
            {/* Tipo de publicação */}
            <View style={styles.tipoContainer}>
              <TouchableOpacity
                style={[styles.tipoBtn, tipo === 'recrutador' && styles.tipoBtnAtivo]}
                onPress={() => setTipo('recrutador')}
              >
                <Text style={[styles.tipoText, tipo === 'recrutador' && styles.tipoTextAtivo]}>🏢 Busco Profissional</Text>
                <Text style={[styles.tipoSub, tipo === 'recrutador' && styles.tipoTextAtivo]}>Sou recrutador</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoBtn, tipo === 'freelancer' && styles.tipoBtnAtivoRoxo]}
                onPress={() => setTipo('freelancer')}
              >
                <Text style={[styles.tipoText, tipo === 'freelancer' && styles.tipoTextAtivo]}>💼 Busco Projeto</Text>
                <Text style={[styles.tipoSub, tipo === 'freelancer' && styles.tipoTextAtivo]}>Sou freelancer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>{tipo === 'recrutador' ? 'Título da Vaga' : 'Título da Oferta'}</Text>
              <TextInput
                style={styles.input} placeholderTextColor="#A0A0A0" value={titulo} onChangeText={setTitulo}
                placeholder={tipo === 'recrutador' ? 'Ex: Desenvolvedor Front-end Pleno' : 'Ex: Dev React Native disponível'}
              />
              <Text style={styles.label}>{tipo === 'recrutador' ? 'Empresa' : 'Seu nome ou marca'}</Text>
              <TextInput
                style={styles.input} placeholderTextColor="#A0A0A0" value={empresa} onChangeText={setEmpresa}
                placeholder={tipo === 'recrutador' ? 'Nome da empresa' : 'Seu nome profissional'}
              />
              <Text style={styles.label}>Tipo de Contrato</Text>
              <TextInput
                style={styles.input} placeholderTextColor="#A0A0A0" value={contrato} onChangeText={setContrato}
                placeholder="Ex: PJ, CLT, Freelance, Remoto"
              />
              <Text style={styles.label}>{tipo === 'recrutador' ? 'Faixa Salarial' : 'Valor por hora ou projeto'}</Text>
              <TextInput
                style={styles.input} placeholderTextColor="#A0A0A0" value={salario} onChangeText={setSalario}
                placeholder="Ex: R$ 5.000 - R$ 8.000"
              />
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]} placeholderTextColor="#A0A0A0"
                value={descricao} onChangeText={setDescricao} multiline numberOfLines={4} textAlignVertical="top"
                placeholder={tipo === 'recrutador' ? 'Descreva as responsabilidades e requisitos...' : 'Descreva suas habilidades e experiência...'}
              />
              <TouchableOpacity
                style={[styles.button, tipo === 'freelancer' && styles.buttonRoxo]}
                onPress={handlePublicar} disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publicar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ABA: Gerenciar */}
        {abaAtiva === 'gerenciar' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Publicações no Feed</Text>
              <TouchableOpacity onPress={carregarMinhasVagas}>
                <Text style={styles.atualizarText}>↻ Atualizar</Text>
              </TouchableOpacity>
            </View>

            {loadingVagas ? (
              <ActivityIndicator color="#2E9D4D" style={{ marginTop: 30 }} size="large" />
            ) : minhasVagas.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome name="briefcase" size={32} color="#EFEFEF" />
                <Text style={styles.emptyText}>Nenhuma vaga publicada</Text>
                <Text style={styles.emptySubText}>Crie sua primeira publicação na aba "Nova Vaga"</Text>
              </View>
            ) : (
              minhasVagas.map(vaga => (
                <View key={vaga.id} style={styles.vagaCard}>
                  <View style={styles.vagaCardLeft}>
                    <View style={[styles.vagaIcone, { backgroundColor: vaga.tipo === 'freelancer' ? '#6A309315' : '#2E9D4D15' }]}>
                      <FontAwesome
                        name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'}
                        size={18}
                        color={vaga.tipo === 'freelancer' ? '#6A3093' : '#2E9D4D'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vagaTitulo} numberOfLines={2}>{vaga.titulo}</Text>
                      <Text style={styles.vagaEmpresa}>{vaga.empresa || '—'}</Text>
                      <Text style={styles.vagaData}>📅 {formatarData(vaga.criadoEm)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deletarBtn}
                    onPress={() => handleDeletar(vaga.id, vaga.titulo)}
                    disabled={deletandoId === vaga.id}
                  >
                    {deletandoId === vaga.id
                      ? <ActivityIndicator size="small" color="#DC2626" />
                      : <FontAwesome name="trash" size={18} color="#DC2626" />
                    }
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, backgroundColor: '#F4F5F7' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#83829A', marginTop: 4 },
  abasContainer: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: '#E8E9EC', borderRadius: 14, padding: 4, marginBottom: 4 },
  abaBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  abaBtnAtiva: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  abaText: { fontSize: 13, color: '#83829A', fontWeight: '600' },
  abaTextAtiva: { color: '#1A1A2E', fontWeight: '700' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  tipoContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tipoBtn: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFEFEF', alignItems: 'center' },
  tipoBtnAtivo: { backgroundColor: '#2E9D4D', borderColor: '#2E9D4D' },
  tipoBtnAtivoRoxo: { backgroundColor: '#6A3093', borderColor: '#6A3093' },
  tipoText: { fontSize: 14, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4 },
  tipoSub: { fontSize: 12, color: '#83829A' },
  tipoTextAtivo: { color: '#FFFFFF' },
  form: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#EFEFEF' },
  label: { fontSize: 13, fontWeight: '600', color: '#1A1A2E', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A2E' },
  textArea: { height: 120 },
  button: { backgroundColor: '#2E9D4D', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 28 },
  buttonRoxo: { backgroundColor: '#6A3093' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  atualizarText: { fontSize: 14, color: '#2E9D4D', fontWeight: '600' },
  vagaCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  vagaCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  vagaIcone: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vagaTitulo: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  vagaEmpresa: { fontSize: 13, color: '#83829A', marginBottom: 4 },
  vagaData: { fontSize: 12, color: '#B0B0B8' },
  deletarBtn: { padding: 10, marginLeft: 8, borderRadius: 10, backgroundColor: '#FEE2E2' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF', gap: 8 },
  emptyText: { fontSize: 16, color: '#312651', fontWeight: 'bold', marginTop: 8 },
  emptySubText: { fontSize: 14, color: '#83829A', textAlign: 'center' },
});