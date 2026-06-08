import { useState, useEffect } from 'react';
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
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithPopup, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import { FontAwesome } from '@expo/vector-icons';
import { useLanguage } from '../src/theme/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { Input, ButtonPrimary, ButtonGoogle } from '../components/ui';
import { IlluRecruiter } from '../assets/illustrations';
import { useTheme } from '../src/theme/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
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
    showCancel?: boolean;
    onConfirm?: () => void;
    confirmText?: string;
  }>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    showCancel = false,
    onConfirm?: () => void,
    confirmText = 'OK'
  ) => {
    setAlertConfig({ visible: true, title, message, type, showCancel, onConfirm, confirmText });
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '189326429321-kntm9qp3db45chg2ricg0ijov7rf8ilf.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token, access_token);

      setLoading(true);
      signInWithCredential(auth, credential).then(async (userCred) => {
        await setDoc(doc(db, 'users', userCred.user.uid), {
          nome: userCred.user.displayName || 'Usuário Google',
          email: userCred.user.email,
          uid: userCred.user.uid,
          criadoEm: new Date().toISOString()
        }, { merge: true });
        router.replace('/(tabs)');
      }).catch(error => {
        setErrorMessage('Erro ao autenticar com Google: ' + error.message);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      try {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        const userCred = await signInWithPopup(auth, provider);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          nome: userCred.user.displayName || 'Usuário Google',
          email: userCred.user.email,
          uid: userCred.user.uid,
          criadoEm: new Date().toISOString()
        }, { merge: true });
        router.replace('/(tabs)');
      } catch (error: any) {
        setErrorMessage('Erro ao autenticar com o Google na Web.');
      } finally {
        setLoading(false);
      }
    } else {
      showAlert(
        'Ambiente de Desenvolvimento',
        'No aplicativo de testes (Expo Go), utilize o acesso por E-mail e Senha.\n\nO login nativo com Google estará totalmente funcional na versão final do aplicativo.',
        'info'
      );
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setErrorMessage('Preencha e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if (!userCredential.user.emailVerified && normalizedEmail !== adminEmail) {
        await signOut(auth);
        showAlert(
          'E-mail não verificado',
          'Você precisa confirmar o seu e-mail antes de acessar. Clique em Reenviar para receber o link novamente.',
          'warning',
          true,
          async () => {
            try {
              await sendEmailVerification(userCredential.user);
              showAlert('Sucesso', 'E-mail reenviado! Verifique sua caixa de entrada.', 'success');
            } catch (e) {
              showAlert('Erro', 'Não foi possível reenviar o e-mail.', 'error');
            }
          },
          'Reenviar'
        );
        return;
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && normalizedEmail === adminEmail && password === 'admin123') {
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          router.replace('/(tabs)');
          return;
        } catch (createError) {
          setErrorMessage('Erro ao criar a conta admin automaticamente.');
        }
      } else {
        setErrorMessage(error.message || 'Ocorreu um erro ao fazer login.');
      }
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
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
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
            <IlluRecruiter width={180} height={160} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Bem-vindo de volta 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Conecte-se para continuar.
            </Text>

            {errorMessage ? (
              <View style={[styles.errorContainer, { borderColor: colors.danger, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                <FontAwesome name="exclamation-circle" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
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
                  placeholder="••••••••"
                  icon="lock"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={16} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={[styles.forgotText, { color: colors.secondary }]}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <ButtonPrimary
              label={loading ? '' : t('auth.login')}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
            {loading && (
              <ActivityIndicator color="#7AE04A" size="large" style={styles.loader} />
            )}

            <View style={[styles.dividerContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OU</Text>
            </View>

            <ButtonGoogle
              label={t('auth.google')}
              onPress={handleGoogleLogin}
              disabled={loading}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('auth.noAccount')} </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[styles.registerText, { color: colors.secondary }]}>{t('auth.registerHere')}</Text>
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
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  loginButton: {
    marginBottom: 24,
    minHeight: 56,
  },
  loader: {
    marginVertical: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    borderTopWidth: 1,
    paddingTop: 20,
  },
  dividerText: {
    marginHorizontal: 'auto',
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
  },
  registerText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
