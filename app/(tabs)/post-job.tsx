import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton, TextInputField, Card, COLORS } from '../../components/ui';

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
  const [abaAtiva, setAbaAtiva] = useState<'nova' | 'gerenciar'>('nova');
  const [titulo, setTitulo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [contrato, setContrato] = useState('');
  const [salario, setSalario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [loading, setLoading] = useState(false);
  const [minhasVagas, setMinhasVagas] = useState<VagaPublicada[]>([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const carregarMinhasVagas = async () => {
    setLoadingVagas(true);
    try {
      const snapshot = await getDocs(collection(db, 'vagas'));
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as VagaPublicada));
      setMinhasVagas(lista.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')));
    } catch (e) {
      console.log('Erro ao carregar vagas:', e);
    } finally {
      setLoadingVagas(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'gerenciar') carregarMinhasVagas();
  }, [abaAtiva]);

  const resetForm = () => {
    setTitulo('');
    setEmpresa('');
    setContrato('');
    setSalario('');
    setDescricao('');
    setContato('');
  };

  const handlePublicar = async () => {
    if (!titulo || !descricao) {
      Alert.alert('Atenção', 'Preencha o título e a descrição da vaga.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'vagas'), {
        titulo,
        empresa: empresa || 'Não informado',
        contrato: contrato || 'Não informado',
        salario: salario || 'A combinar',
        descricao,
        contato: contato || '',
        criadoEm: new Date().toISOString(),
      });

      Alert.alert('Sucesso', 'Vaga publicada com sucesso!', [
        { text: 'OK', onPress: () => { resetForm(); setAbaAtiva('gerenciar'); } },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao publicar vaga.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaga = async (vagaId: string) => {
    Alert.alert(
      'Deletar Vaga',
      'Tem certeza que deseja deletar esta vaga? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setDeletandoId(vagaId);
            try {
              await deleteDoc(doc(db, 'vagas', vagaId));
              setMinhasVagas((prev) => prev.filter((v) => v.id !== vagaId));
              Alert.alert('Sucesso', 'Vaga deletada com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao deletar vaga.');
            } finally {
              setDeletandoId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'nova' && styles.tabActive]}
          onPress={() => setAbaAtiva('nova')}
        >
          <Text style={[styles.tabText, abaAtiva === 'nova' && styles.tabTextActive]}>
            Nova Vaga
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === 'gerenciar' && styles.tabActive]}
          onPress={() => setAbaAtiva('gerenciar')}
        >
          <Text style={[styles.tabText, abaAtiva === 'gerenciar' && styles.tabTextActive]}>
            Gerenciar
          </Text>
        </TouchableOpacity>
      </View>

      {abaAtiva === 'nova' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Publicar Vaga</Text>
              <Text style={styles.subtitle}>Preencha os dados da oportunidade</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInputField
                label="Título da Vaga"
                placeholder="Ex: Senior React Developer"
                icon="briefcase"
                value={titulo}
                onChangeText={setTitulo}
              />

              <TextInputField
                label="Empresa"
                placeholder="Nome da empresa"
                icon="business"
                value={empresa}
                onChangeText={setEmpresa}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <TextInputField
                    label="Tipo de Contrato"
                    placeholder="PJ, CLT, Freelance"
                    icon="description"
                    value={contrato}
                    onChangeText={setContrato}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInputField
                    label="Salário"
                    placeholder="A combinar"
                    icon="attach-money"
                    value={salario}
                    onChangeText={setSalario}
                  />
                </View>
              </View>

              {/* Description Textarea */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>DESCRIÇÃO</Text>
                <TextInput
                  placeholder="Descrição completa da vaga..."
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  numberOfLines={6}
                  style={[styles.textarea]}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <TextInputField
                label="Contato"
                placeholder="Email ou telefone"
                icon="email"
                value={contato}
                onChangeText={setContato}
              />

              {/* Publish Button */}
              <PrimaryButton label={loading ? '' : 'Publicar Vaga'} onPress={handlePublicar} />
              {loading && (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 16 }} />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.vagasListContent}>
          {loadingVagas ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : minhasVagas.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma vaga publicada ainda</Text>
            </View>
          ) : (
            minhasVagas.map((vaga) => (
              <Card key={vaga.id} style={styles.vagaItem}>
                <View style={styles.vagaHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vagaTitle} numberOfLines={2}>
                      {vaga.titulo}
                    </Text>
                    <Text style={styles.vagaCompany}>{vaga.empresa}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteVaga(vaga.id)}
                    disabled={deletandoId === vaga.id}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color={deletandoId === vaga.id ? COLORS.textSecondary : '#EF4444'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.vagaFooter}>
                  <Text style={styles.vagaMeta}>{vaga.contrato}</Text>
                  <Text style={styles.vagaMeta}>•</Text>
                  <Text style={styles.vagaMeta}>{vaga.tipo || 'Remoto'}</Text>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  formContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  formContainer: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.04,
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: '#F9F9FC',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textMain,
    textAlignVertical: 'top',
  },
  vagasListContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  vagaItem: {
    paddingVertical: 12,
  },
  vagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vagaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  vagaCompany: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  vagaFooter: {
    flexDirection: 'row',
    gap: 6,
  },
  vagaMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
