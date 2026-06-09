import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform,
  TextInput, ScrollView, ActivityIndicator, Linking, Switch, ImageBackground
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [carregando, setCarregando] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
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

  const nomeExibido = perfil.nome || userEmail.split('@')[0] || 'Visitante';
  const iniciais = nomeExibido.slice(0, 2).toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>

      {/* Hero Header com Gradiente */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        />
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary, borderColor: colors.cardBackground }]}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          
          <Text style={[styles.nomeText, { color: colors.textPrimary }]}>{nomeExibido}</Text>
          {perfil.cargo ? <Text style={[styles.cargoText, { color: colors.primary }]}>{perfil.cargo}</Text> : null}
          
          <View style={styles.infoRow}>
            {perfil.cidade ? (
              <View style={styles.cidadeRow}>
                <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
                <Text style={[styles.cidadeText, { color: colors.textSecondary }]}>{perfil.cidade}</Text>
              </View>
            ) : null}
            <Text style={[styles.emailText, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>

          <TouchableOpacity
            style={[styles.editarBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
            onPress={() => setEditando(!editando)}
            activeOpacity={0.7}
          >
            <FontAwesome name={editando ? 'times' : 'pencil'} size={14} color={colors.primary} />
            <Text style={[styles.editarBtnText, { color: colors.primary }]}>{editando ? '  Cancelar' : '  Editar Perfil'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Links rápidos (exibidos quando não está editando) */}
      {!editando && (
        <View style={styles.linksSection}>
          {perfil.githubUrl ? (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => abrirLink(perfil.githubUrl)}>
              <View style={[styles.linkIcone, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#24292e15' }]}>
                <FontAwesome name="github" size={22} color={isDark ? '#FFF' : '#24292e'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>GitHub</Text>
                <Text style={[styles.linkUrl, { color: colors.textSecondary }]} numberOfLines={1}>{perfil.githubUrl}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          {perfil.linkedinUrl ? (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => abrirLink(perfil.linkedinUrl)}>
              <View style={[styles.linkIcone, { backgroundColor: '#0077b515' }]}>
                <FontAwesome name="linkedin" size={22} color="#0077b5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>LinkedIn</Text>
                <Text style={[styles.linkUrl, { color: colors.textSecondary }]} numberOfLines={1}>{perfil.linkedinUrl}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          {perfil.curriculo ? (
            <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => abrirLink(perfil.curriculo)}>
              <View style={[styles.linkIcone, { backgroundColor: '#DC262615' }]}>
                <FontAwesome name="file-pdf-o" size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Currículo (PDF)</Text>
                <Text style={[styles.linkUrl, { color: colors.textSecondary }]} numberOfLines={1}>{perfil.curriculo}</Text>
              </View>
              <FontAwesome name="external-link" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          {perfil.bio ? (
            <View style={[styles.bioCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.bioLabel, { color: colors.textPrimary }]}>Sobre mim</Text>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>{perfil.bio}</Text>
            </View>
          ) : null}

          {!perfil.githubUrl && !perfil.linkedinUrl && !perfil.curriculo && !perfil.bio && (
            <View style={[styles.emptyLinks, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <FontAwesome name="user-circle" size={48} color={colors.textSecondary + '40'} />
              <Text style={[styles.emptyLinksText, { color: colors.textPrimary }]}>Seu perfil está incompleto</Text>
              <Text style={[styles.emptyLinksSubText, { color: colors.textSecondary }]}>Destaque-se para os recrutadores adicionando suas informações profissionais.</Text>
            </View>
          )}
        </View>
      )}

      {/* Formulário de Edição */}
      {editando && (
        <View style={[styles.formSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.formSectionTitle, { color: colors.textPrimary }]}>Informações Profissionais</Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Nome Completo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.nome} onChangeText={v => setPerfil(p => ({ ...p, nome: v }))}
            placeholder="Seu nome completo" placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Cargo / Área de Atuação</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.cargo} onChangeText={v => setPerfil(p => ({ ...p, cargo: v }))}
            placeholder="Ex: Desenvolvedor Full Stack" placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Cidade, Estado</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.cidade} onChangeText={v => setPerfil(p => ({ ...p, cidade: v }))}
            placeholder="Ex: São Paulo, SP" placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Sobre Mim</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.bio} onChangeText={v => setPerfil(p => ({ ...p, bio: v }))}
            placeholder="Conte um pouco sobre você, suas habilidades e experiências..." placeholderTextColor={colors.textSecondary}
            multiline numberOfLines={4} textAlignVertical="top"
          />

          <Text style={[styles.formSectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Links & Portfólio</Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>🐱 URL do GitHub</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.githubUrl} onChangeText={v => setPerfil(p => ({ ...p, githubUrl: v }))}
            placeholder="https://github.com/seunome" placeholderTextColor={colors.textSecondary}
            autoCapitalize="none" keyboardType="url"
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>💼 URL do LinkedIn</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.linkedinUrl} onChangeText={v => setPerfil(p => ({ ...p, linkedinUrl: v }))}
            placeholder="https://linkedin.com/in/seunome" placeholderTextColor={colors.textSecondary}
            autoCapitalize="none" keyboardType="url"
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>📄 Link do Currículo (PDF)</Text>
          <Text style={[styles.labelHint, { color: colors.textSecondary }]}>Cole o link público do seu PDF (Google Drive, Dropbox, etc.)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]} 
            value={perfil.curriculo} onChangeText={v => setPerfil(p => ({ ...p, curriculo: v }))}
            placeholder="https://drive.google.com/..." placeholderTextColor={colors.textSecondary}
            autoCapitalize="none" keyboardType="url"
          />

          <TouchableOpacity activeOpacity={0.8} onPress={salvarPerfil} disabled={salvando}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.salvarBtn}>
              {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.salvarBtnText}>💾 Salvar Perfil</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Configurações */}
      <View style={styles.settingsSection}>
        <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>Configurações</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.secondaryLight }]}>
              <FontAwesome name="moon-o" size={18} color={colors.primary} />
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
            <View style={[styles.settingIcon, { backgroundColor: colors.secondaryLight }]}>
              <FontAwesome name="bell" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Notificações</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.secondaryLight }]}>
              <FontAwesome name="lock" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Privacidade e Segurança</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <FontAwesome name="sign-out" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.settingText, { color: colors.danger }]}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  // Hero / Profile Card
  heroSection: {
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 20,
    position: 'relative',
  },
  heroBanner: {
    width: '100%',
    height: 180,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  profileCard: {
    width: '90%',
    marginTop: 100,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    marginTop: -48, marginBottom: 16,
    borderWidth: 4,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  nomeText: { fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  cargoText: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 10, marginBottom: 20 },
  cidadeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cidadeText: { fontSize: 13, fontWeight: '500' },
  emailText: { fontSize: 13, fontWeight: '500' },
  editarBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24, borderWidth: 1,
  },
  editarBtnText: { fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },

  // Links
  linksSection: { paddingHorizontal: 20 },
  linkCard: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  linkIcone: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  linkLabel: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  linkUrl: { fontSize: 13, fontWeight: '500' },
  bioCard: { borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  bioLabel: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  bioText: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  emptyLinks: { alignItems: 'center', padding: 40, gap: 12, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' },
  emptyLinksText: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  emptyLinksSubText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Formulário
  formSection: { margin: 20, borderRadius: 20, padding: 24, borderWidth: 1 },
  formSectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  labelHint: { fontSize: 12, marginBottom: 12, marginTop: -6 },
  input: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 15, fontWeight: '500' },
  textArea: { height: 120 },
  salvarBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 32, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  salvarBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // Configurações
  settingsSection: { paddingHorizontal: 20, paddingTop: 12 },
  settingsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingText: { fontSize: 15, fontWeight: '700' },
});
