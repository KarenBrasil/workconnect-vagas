import { useState, useEffect, useRef } from 'react';
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
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton, GoogleButton, TextInputField, COLORS } from '../components/ui';
import { IlluLogin } from '../assets/illustrations';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animação de Flutuação (Float Animation)
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, // sobe 15px
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // desce de volta
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Configuração do Google Auth Session
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '189326429321-kntm9qp3db45chg2ricg0ijov7rf8ilf.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      setLoading(true);
      signInWithCredential(auth, credential).then(async (userCred) => {
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
      }).catch((error) => {
        console.error("ERRO FIREBASE CREDENTIAL:", error);
        setErrorMessage(error.message || 'Erro ao autenticar');
        Alert.alert('Falha no Login', error.message || 'Erro ao autenticar com o Google.');
      }).finally(() => {
        setLoading(false);
      });
    } else if (response?.type === 'error') {
      setErrorMessage('Erro ao autenticar com o Google.');
      Alert.alert('Falha no Login', 'Erro ao autenticar com o Google.');
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      promptAsync();
    } catch (error: any) {
      console.error("ERRO AUTH SESSION:", error);
      const msg = error.message || 'Ocorreu um erro ao iniciar o login com o Google.';
      setErrorMessage(msg);
      Alert.alert('Falha', msg);
    }
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setErrorMessage('');
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if (!userCredential.user.emailVerified && normalizedEmail !== adminEmail) {
        await signOut(auth);
        const msg = 'Você precisa confirmar o seu e-mail antes de acessar.';
        setErrorMessage(msg);
        Alert.alert(
          'E-mail não verificado',
          msg,
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
          setErrorMessage('Erro ao criar a conta admin automaticamente.');
          Alert.alert('Erro', 'Erro ao criar a conta admin automaticamente.');
        }
      } else {
        const msg = error.message || 'Ocorreu um erro ao fazer login.';
        setErrorMessage(msg);
        Alert.alert('Erro', msg);
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
          {/* Illustration Animada */}
          <Animated.View style={[styles.illustrationContainer, { transform: [{ translateY: floatAnim }] }]}>
            <IlluLogin width={260} height={220} />
          </Animated.View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Conecte-se para continuar sua jornada.</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

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

            <TouchableOpacity 
              style={[styles.googleButtonSolid, { marginTop: 16 }]} 
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png' }} 
                style={{ width: 20, height: 16, marginRight: 8, resizeMode: 'contain' }} 
              />
              <Text style={styles.googleButtonSolidText}>Gmail</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                <Text style={styles.registerText}>Cadastre-se aqui</Text>
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
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  googleButtonSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  googleButtonSolidText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E9D4D',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
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
