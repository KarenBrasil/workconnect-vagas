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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../components/ui';
import { IlluLogin } from '../assets/illustrations';
import { useTheme } from '../src/theme/ThemeContext';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { colors, isDark } = useTheme();

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

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      
      const userCred = await signInWithPopup(auth, provider);
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
    } catch (error: any) {
      console.error("ERRO FIREBASE POPUP:", error);
      const msg = error.message || 'Ocorreu um erro ao fazer login com o Google.';
      setErrorMessage(msg);
      Alert.alert('Falha no Login', msg);
    } finally {
      setLoading(false);
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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />

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
            <Text style={[styles.title, { color: colors.textMain }]}>Login</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Google Button */}
            <TouchableOpacity 
              style={[styles.googleButtonOutline, { backgroundColor: isDark ? colors.background : '#FFF', borderColor: colors.border }]} 
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} 
                style={{ width: 22, height: 22, marginRight: 12, resizeMode: 'contain' }} 
              />
              <Text style={[styles.googleButtonOutlineText, { color: colors.textMain }]}>Continuar com o Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>ou</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? colors.background : '#F5F5F5', color: colors.textMain }]}
                placeholder="E-mail"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 50, backgroundColor: isDark ? colors.background : '#F5F5F5', color: colors.textMain }]}
                  placeholder="Senha"
                  placeholderTextColor={colors.textSecondary}
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
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: colors.primary }]} 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryDark} />
              ) : (
                <Text style={[styles.loginButtonText, { color: colors.primaryDark }]}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotLink}>
              <Text style={[styles.forgotText, { color: colors.textSecondary }]}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMain }]}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                <Text style={[styles.registerText, { color: colors.textMain }]}>Cadastre-se aqui</Text>
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
    marginBottom: 24,
    textAlign: 'center',
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
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    textDecorationLine: 'underline',
  },
  googleButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 40,
  },
  googleButtonOutlineText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  registerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textDecorationLine: 'underline',
  },
});
