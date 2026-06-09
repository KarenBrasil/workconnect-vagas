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
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { MaterialIcons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();
import { PrimaryButton, GoogleButton, TextInputField, COLORS } from '../components/ui';
import { IlluRecruiter } from '../assets/illustrations';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      '189326429321-kntm9qp3db45chg2ricg0ijov7rf8ilf.apps.googleusercontent.com',
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '189326429321-kntm9qp3db45chg2ricg0ijov7rf8ilf.apps.googleusercontent.com',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
  });

  useEffect(() => {
    console.log("GOOGLE AUTH RESPONSE TRIGGERED:", response);
    if (response) {
      if (response.type === 'success') {
        const { id_token } = response.params;
        console.log("ID TOKEN OBTIDO:", !!id_token);
        
        if (!id_token) {
           Alert.alert('Erro', 'O Google não retornou o id_token. A configuração do cliente web pode estar incorreta no GCP.');
           return;
        }

        const credential = GoogleAuthProvider.credential(id_token);
        setLoading(true);
        signInWithCredential(auth, credential)
          .then(async (userCred) => {
            console.log("USUÁRIO AUTENTICADO NO FIREBASE:", userCred.user.uid);
            await setDoc(
              doc(db, 'users', userCred.user.uid),
              {
                nome: userCred.user.displayName || 'Usuário Google',
                email: userCred.user.email,
                uid: userCred.user.uid,
                criadoEm: new Date().toISOString(),
              },
              { merge: true }
            );
            router.replace('/(tabs)');
          })
          .catch((error) => {
            console.error("ERRO FIREBASE CREDENTIAL:", error);
            Alert.alert('Erro', 'Erro ao autenticar com Google: ' + error.message);
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (response.type === 'error') {
        console.error("ERRO GOOGLE RESPONSE:", response.error);
        Alert.alert('Erro', 'O Google retornou um erro: ' + response.error?.message);
      } else {
        console.log("TIPO DE RESPOSTA NÃO TRATADO:", response.type);
      }
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    promptAsync();
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if (!userCredential.user.emailVerified && normalizedEmail !== adminEmail) {
        await signOut(auth);
        Alert.alert(
          'E-mail não verificado',
          'Você precisa confirmar o seu e-mail antes de acessar.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Reenviar',
              onPress: async () => {
                try {
                  await sendEmailVerification(userCredential.user);
                  Alert.alert('Sucesso', 'E-mail reenviado! Verifique sua caixa de entrada.');
                } catch (e) {
                  Alert.alert('Erro', 'Não foi possível reenviar o e-mail.');
                }
              },
            },
          ]
        );
        return;
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if (
        (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
        normalizedEmail === adminEmail &&
        password === 'admin123'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          router.replace('/(tabs)');
          return;
        } catch (createError) {
          Alert.alert('Erro', 'Erro ao criar a conta admin automaticamente.');
        }
      } else {
        Alert.alert('Erro', error.message || 'Ocorreu um erro ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <IlluRecruiter />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Bem-vindo de volta 👋</Text>
            <Text style={styles.subtitle}>Conecte-se para continuar explorando oportunidades.</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInputField
                label="E-mail"
                placeholder="seu@email.com"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <TextInputField
                  label="Senha"
                  placeholder="••••••••"
                  icon="lock"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={18}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <PrimaryButton
              label={loading ? '' : 'Entrar'}
              onPress={handleLogin}
              disabled={loading}
            />
            {loading && <ActivityIndicator color={COLORS.primary} size="large" style={styles.loader} />}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <GoogleButton onPress={handleGoogleLogin} />

            {/* Register Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerText}>Registre-se aqui</Text>
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
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
    color: COLORS.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 20,
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
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
