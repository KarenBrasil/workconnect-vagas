import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '../src/theme/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { Input, ButtonPrimary } from '../components/ui';
import { IlluOnboarding } from '../assets/illustrations';
import { useTheme } from '../src/theme/ThemeContext';

export default function Register() {
  const router = useRouter();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const handleRegister = async () => {
    setErrorMessage('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!nome.trim() || !normalizedEmail || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nome: nome.trim(),
        email: normalizedEmail,
        uid: user.uid,
        criadoEm: new Date().toISOString()
      });

      await sendEmailVerification(user);

      showAlert(
        'Conta criada com sucesso!',
        'Um e-mail de confirmação foi enviado. Por favor, verifique sua caixa de entrada para ativar a conta antes de fazer o login.',
        'success',
        () => router.replace('/login')
      );
    } catch (error: any) {
      let customError = error.message || 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') customError = 'Este e-mail já está em uso.';
      else if (error.code === 'auth/invalid-email') customError = 'E-mail inválido.';
      else if (error.code === 'auth/weak-password') customError = 'A senha é muito fraca.';

      setErrorMessage(customError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <IlluOnboarding width={160} height={140} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Criar Conta 🚀</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Junte-se a nós para descobrir as melhores vagas.
            </Text>

            {errorMessage ? (
              <View style={[styles.errorContainer, { borderColor: colors.danger, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                <FontAwesome name="exclamation-circle" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <Input
                label="Nome Completo"
                placeholder="Seu nome completo"
                icon="user"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />

              <Input
                label="E-mail"
                placeholder="seu@email.com"
                icon="envelope"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <Input
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  icon="lock"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={16} color={colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ButtonPrimary
              label={loading ? '' : t('auth.register')}
              onPress={handleRegister}
              disabled={loading}
              style={styles.registerButton}
            />
            {loading && (
              <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
            )}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('auth.hasAccount')} </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginText, { color: colors.secondary }]}>{t('auth.loginHere')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    marginBottom: 24,
    gap: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 38,
    zIndex: 10,
  },
  registerButton: {
    marginBottom: 24,
    minHeight: 56,
  },
  loader: {
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
  },
  loginText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
