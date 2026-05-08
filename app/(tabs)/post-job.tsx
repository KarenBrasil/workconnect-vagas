import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { useRouter } from 'expo-router';

export default function PostJob() {
  const router = useRouter();
  const [tipo, setTipo] = useState<'recrutador' | 'freelancer'>('recrutador');
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [contrato, setContrato] = useState('');
  const [salario, setSalario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublicar = async () => {
    if (!titulo || !descricao) {
      Alert.alert('Atenção', 'Preencha pelo menos o título e a descrição!');
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
        window.alert('Concluído: Sua publicação foi postada com sucesso no feed principal!');
        router.push('/(tabs)');
      } else {
        Alert.alert('Concluído', 'Sua publicação foi postada com sucesso no feed principal!', [
          { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
      }
      setTitulo('');
      setEmpresa('');
      setContrato('');
      setSalario('');
      setDescricao('');
    } catch (e: any) {
      console.log('ERRO FIREBASE: ', e);
      Alert.alert('Erro', 'Não foi possível publicar. Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Nova Publicação</Text>
          <Text style={styles.subtitle}>O que você quer publicar?</Text>
        </View>

        {/* Seletor de tipo */}
        <View style={styles.tipoContainer}>
          <TouchableOpacity
            style={[styles.tipoBtn, tipo === 'recrutador' && styles.tipoBtnAtivo]}
            onPress={() => setTipo('recrutador')}
          >
            <Text style={[styles.tipoText, tipo === 'recrutador' && styles.tipoTextAtivo]}>
              🏢 Busco Profissional
            </Text>
            <Text style={[styles.tipoSub, tipo === 'recrutador' && styles.tipoTextAtivo]}>
              Sou recrutador
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoBtn, tipo === 'freelancer' && styles.tipoBtnAtivoRoxo]}
            onPress={() => setTipo('freelancer')}
          >
            <Text style={[styles.tipoText, tipo === 'freelancer' && styles.tipoTextAtivo]}>
              💼 Busco Projeto
            </Text>
            <Text style={[styles.tipoSub, tipo === 'freelancer' && styles.tipoTextAtivo]}>
              Sou freelancer
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            {tipo === 'recrutador' ? 'Título da Vaga' : 'Título da Oferta'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={tipo === 'recrutador' ? 'Ex: Desenvolvedor Front-end' : 'Ex: Desenvolvedor React Native disponível'}
            placeholderTextColor="#A0A0A0"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>
            {tipo === 'recrutador' ? 'Empresa' : 'Seu nome ou marca'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={tipo === 'recrutador' ? 'Nome da empresa' : 'Seu nome profissional'}
            placeholderTextColor="#A0A0A0"
            value={empresa}
            onChangeText={setEmpresa}
          />

          <Text style={styles.label}>Tipo de Contrato</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: PJ, CLT, Freelance, Remoto"
            placeholderTextColor="#A0A0A0"
            value={contrato}
            onChangeText={setContrato}
          />

          <Text style={styles.label}>
            {tipo === 'recrutador' ? 'Faixa Salarial' : 'Valor por hora ou projeto'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: R$ 5.000 - R$ 8.000"
            placeholderTextColor="#A0A0A0"
            value={salario}
            onChangeText={setSalario}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={tipo === 'recrutador'
              ? 'Descreva as responsabilidades e requisitos...'
              : 'Descreva suas habilidades e experiência...'}
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={descricao}
            onChangeText={setDescricao}
          />

          <TouchableOpacity
            style={[styles.button, tipo === 'freelancer' && styles.buttonRoxo]}
            onPress={handlePublicar}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Publicar</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#312651', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#83829A' },
  tipoContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  tipoBtn: {
    flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#EFEFEF', alignItems: 'center',
  },
  tipoBtnAtivo: { backgroundColor: '#2E9D4D', borderColor: '#2E9D4D' },
  tipoBtnAtivoRoxo: { backgroundColor: '#6A3093', borderColor: '#6A3093' },
  tipoText: { fontSize: 14, fontWeight: 'bold', color: '#312651', marginBottom: 4 },
  tipoSub: { fontSize: 12, color: '#83829A' },
  tipoTextAtivo: { color: '#FFFFFF' },
  form: {
    backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#312651', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FAFAFC', borderWidth: 1, borderColor: '#EFEFEF',
    borderRadius: 12, padding: 16, fontSize: 16, color: '#312651',
  },
  textArea: { height: 120 },
  button: {
    backgroundColor: '#2E9D4D', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 32,
  },
  buttonRoxo: { backgroundColor: '#6A3093' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});