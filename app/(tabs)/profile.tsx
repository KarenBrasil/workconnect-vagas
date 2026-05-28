import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform,
  TextInput, ScrollView, ActivityIndicator, Linking, Switch
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

interface PerfilProfissional {
  nome: string;
  cargo: string;
  cidade: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  curriculo: string;
}

const PERFIL_VAZIO: PerfilProfissional = {
  nome: '', cargo: '', cidade: '', bio: '',
  githubUrl: '', linkedinUrl: '', curriculo: '',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [perfil, setPerfil] = useState<PerfilProfissional>(PERFIL_VAZIO);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  // Começa como false para não travar — só carrega se houver userId
  const [carregando, setCarregando] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Carrega Firebase de forma dinâmica para não bloquear a renderização
    const inicializar = async () => {
      try {
        const { auth } = await import('../../src/services/firebaseConfig');
        const uid = auth.currentUser?.uid || '';
        const email = auth.currentUser?.email || '';
        setUserId(uid);
        setUserEmail(email);
        if (uid) {
          setCarregando(true);
          await carregarPerfil(uid);
        }
      } catch (e) {
        console.log('Firebase não disponível:', e);
      }
    };
    inicializar();
  }, []);

  const carregarPerfil = async (uid: string) => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../src/services/firebaseConfig');
      const snap = await getDoc(doc(db, 'perfis', uid));
      if (snap.exists()) {
        setPerfil({ ...PERFIL_VAZIO, ...snap.data() as PerfilProfissional });
      }
    } catch (e) {
      console.log('Erro ao carregar perfil:', e);
    } finally {
      setCarregando(false);
    }
  };

  const salvarPerfil = async () => {
    if (!userId) {
      if (Platform.OS === 'web') window.alert('Faça login para salvar o perfil.');
      return;
    }
    setSalvando(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../src/services/firebaseConfig');
      await setDoc(doc(db, 'perfis', userId), {
        ...perfil,
        email: userEmail,
        atualizadoEm: new Date().toISOString(),
      });
      setEditando(false);
      if (Platform.OS === 'web') window.alert('Perfil salvo com sucesso!');
      else Alert.alert('Salvo!', 'Seu perfil foi atualizado.');
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert('Não foi possível salvar: ' + e.message);
      else Alert.alert('Erro', 'Não foi possível salvar: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  const executeLogout = async () => {
    try {
      const { auth } = await import('../../src/services/firebaseConfig');
      const { signOut } = await import('firebase/auth');
      if (auth.currentUser) await signOut(auth);
      router.replace('/login');
    } catch (e) {
      if (Platform.OS === 'web') window.alert('Não foi possível sair.');
      else Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair?')) executeLogout();
    } else {
      Alert.alert('Sair', 'Tem certeza que deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: executeLogout }
      ]);
    }
  };

  const abrirLink = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(finalUrl);
  };

  const nomeExibido = perfil.nome || userEmail.split('@')[0] || 'Usuário';
  const iniciais = nomeExibido.slice(0, 2).toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>

      {/* Header com Avatar */}
      <View style={[styles.heroSection, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{iniciais}</Text>
        </View>
        <Text style={[styles.nomeText, { color: colors.textPrimary }]}>{nomeExibido}</Text>
        {perfil.cargo ? <Text style={styles.cargoText}>{perfil.cargo}</Text> : null}
        {perfil.cidade ? (
          <View style={styles.cidadeRow}>
            <FontAwesome name="map-marker" size={12} color="#83829A" />
            <Text style={styles.cidadeText}>{perfil.cidade}</Text>
          </View>
        ) : null}
        <Text style={styles.emailText}>{userEmail}</Text>

        <TouchableOpacity
          style={styles.editarBtn}
          onPress={() => setEditando(!editando)}
        >
          <FontAwesome name={editando ? 'times' : 'pencil'} size={14} color="#2E9D4D" />
          <Text style={styles.editarBtnText}>{editando ? '  Cancelar' : '  Editar Perfil'}</Text>
        </TouchableOpacity>
      </View>

      {/* Links rápidos (exibidos quando não está editando) */}
      {!editando && (
        <View style={styles.linksSection}>
          {perfil.githubUrl ? (
            <TouchableOpacity style={styles.linkCard} onPress={() => abrirLink(perfil.githubUrl)}>
              <View style={[styles.linkIcone, { backgroundColor: '#24292e15' }]}>
                <FontAwesome name="github" size={20} color="#24292e" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>GitHub</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{perfil.githubUrl}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color="#83829A" />
            </TouchableOpacity>
          ) : null}

          {perfil.linkedinUrl ? (
            <TouchableOpacity style={styles.linkCard} onPress={() => abrirLink(perfil.linkedinUrl)}>
              <View style={[styles.linkIcone, { backgroundColor: '#0077b515' }]}>
                <FontAwesome name="linkedin" size={20} color="#0077b5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>LinkedIn</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{perfil.linkedinUrl}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color="#83829A" />
            </TouchableOpacity>
          ) : null}

          {perfil.curriculo ? (
            <TouchableOpacity style={styles.linkCard} onPress={() => abrirLink(perfil.curriculo)}>
              <View style={[styles.linkIcone, { backgroundColor: '#DC262615' }]}>
                <FontAwesome name="file-pdf-o" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>Currículo (PDF)</Text>
                <Text style={styles.linkUrl} numberOfLines={1}>{perfil.curriculo}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color="#83829A" />
            </TouchableOpacity>
          ) : null}

          {perfil.bio ? (
            <View style={styles.bioCard}>
              <Text style={styles.bioLabel}>Sobre mim</Text>
              <Text style={styles.bioText}>{perfil.bio}</Text>
            </View>
          ) : null}

          {!perfil.githubUrl && !perfil.linkedinUrl && !perfil.curriculo && !perfil.bio && (
            <View style={styles.emptyLinks}>
              <FontAwesome name="user-circle" size={40} color="#DEDEDE" />
              <Text style={styles.emptyLinksText}>Seu perfil está vazio</Text>
              <Text style={styles.emptyLinksSubText}>Clique em "Editar Perfil" para adicionar suas informações</Text>
            </View>
          )}
        </View>
      )}

      {/* Formulário de Edição */}
      {editando && (
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Informações Profissionais</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input} value={perfil.nome} onChangeText={v => setPerfil(p => ({ ...p, nome: v }))}
            placeholder="Seu nome completo" placeholderTextColor="#B0B0B8"
          />

          <Text style={styles.label}>Cargo / Área de Atuação</Text>
          <TextInput
            style={styles.input} value={perfil.cargo} onChangeText={v => setPerfil(p => ({ ...p, cargo: v }))}
            placeholder="Ex: Desenvolvedor Full Stack" placeholderTextColor="#B0B0B8"
          />

          <Text style={styles.label}>Cidade, Estado</Text>
          <TextInput
            style={styles.input} value={perfil.cidade} onChangeText={v => setPerfil(p => ({ ...p, cidade: v }))}
            placeholder="Ex: São Paulo, SP" placeholderTextColor="#B0B0B8"
          />

          <Text style={styles.label}>Sobre Mim</Text>
          <TextInput
            style={[styles.input, styles.textArea]} value={perfil.bio} onChangeText={v => setPerfil(p => ({ ...p, bio: v }))}
            placeholder="Conte um pouco sobre você, suas habilidades e experiências..." placeholderTextColor="#B0B0B8"
            multiline numberOfLines={4} textAlignVertical="top"
          />

          <Text style={styles.formSectionTitle}>Links & Portfólio</Text>

          <Text style={styles.label}>🐱 URL do GitHub</Text>
          <TextInput
            style={styles.input} value={perfil.githubUrl} onChangeText={v => setPerfil(p => ({ ...p, githubUrl: v }))}
            placeholder="https://github.com/seunome" placeholderTextColor="#B0B0B8"
            autoCapitalize="none" keyboardType="url"
          />

          <Text style={styles.label}>💼 URL do LinkedIn</Text>
          <TextInput
            style={styles.input} value={perfil.linkedinUrl} onChangeText={v => setPerfil(p => ({ ...p, linkedinUrl: v }))}
            placeholder="https://linkedin.com/in/seunome" placeholderTextColor="#B0B0B8"
            autoCapitalize="none" keyboardType="url"
          />

          <Text style={styles.label}>📄 Link do Currículo (PDF)</Text>
          <Text style={styles.labelHint}>Cole o link público do seu PDF (Google Drive, Dropbox, etc.)</Text>
          <TextInput
            style={styles.input} value={perfil.curriculo} onChangeText={v => setPerfil(p => ({ ...p, curriculo: v }))}
            placeholder="https://drive.google.com/..." placeholderTextColor="#B0B0B8"
            autoCapitalize="none" keyboardType="url"
          />

          <TouchableOpacity style={styles.salvarBtn} onPress={salvarPerfil} disabled={salvando}>
            {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.salvarBtnText}>💾 Salvar Perfil</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Configurações */}
      <View style={styles.settingsSection}>
        <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>Configurações</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.iconBox }]}>
              <FontAwesome name="moon-o" size={16} color={colors.textPrimary} />
            </View>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Modo Escuro</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')} 
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.iconBox }]}>
              <FontAwesome name="bell" size={16} color={colors.textPrimary} />
            </View>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Notificações</Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.iconBox }]}>
              <FontAwesome name="lock" size={16} color={colors.textPrimary} />
            </View>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Privacidade e Segurança</Text>
          </View>
          <FontAwesome name="chevron-right" size={12} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.errorBackground }]}>
              <FontAwesome name="sign-out" size={16} color={colors.error} />
            </View>
            <Text style={[styles.settingText, { color: colors.error }]}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  scrollContent: { paddingBottom: 60 },

  // Hero
  heroSection: {
    backgroundColor: '#FFFFFF', alignItems: 'center', paddingTop: 70,
    paddingBottom: 28, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F5',
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#2E9D4D',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: '#2E9D4D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#FFFFFF' },
  nomeText: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', textAlign: 'center' },
  cargoText: { fontSize: 14, color: '#2E9D4D', fontWeight: '600', marginTop: 4 },
  cidadeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cidadeText: { fontSize: 13, color: '#83829A' },
  emailText: { fontSize: 13, color: '#B0B0B8', marginTop: 4, marginBottom: 16 },
  editarBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#2E9D4D',
  },
  editarBtnText: { color: '#2E9D4D', fontWeight: '700', fontSize: 14 },

  // Links
  linksSection: { padding: 20 },
  linkCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  linkIcone: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  linkLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  linkUrl: { fontSize: 12, color: '#83829A' },
  bioCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#EFEFEF' },
  bioLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#4A4A6A', lineHeight: 22 },
  emptyLinks: { alignItems: 'center', padding: 32, gap: 8 },
  emptyLinksText: { fontSize: 16, fontWeight: '700', color: '#312651', marginTop: 8 },
  emptyLinksSubText: { fontSize: 13, color: '#83829A', textAlign: 'center' },

  // Formulário
  formSection: { backgroundColor: '#FFFFFF', margin: 16, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#EFEFEF' },
  formSectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A1A2E', marginBottom: 6, marginTop: 14 },
  labelHint: { fontSize: 12, color: '#83829A', marginBottom: 8, marginTop: -4 },
  input: { backgroundColor: '#F4F5F7', borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A2E' },
  textArea: { height: 110 },
  salvarBtn: { backgroundColor: '#2E9D4D', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  salvarBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Configurações
  settingsSection: { paddingHorizontal: 20, paddingTop: 8 },
  settingsTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingText: { fontSize: 15, fontWeight: '500', color: '#1A1A2E' },
});
