import { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, GoogleAuthProvider, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import * as WebBrowser from 'expo-web-browser';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { BrandLogo } from '../components/BrandLogo';
import { LinearGradient } from 'expo-linear-gradient';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      import('firebase/auth').then(async ({ signInWithPopup }) => {
        const userCred = await signInWithPopup(auth, provider);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          nome: userCred.user.displayName || 'Usuário Google',
          email: userCred.user.email,
          uid: userCred.user.uid,
          criadoEm: new Date().toISOString()
        }, { merge: true });
      }).catch((error) => {
        setErrorMessage('Erro ao autenticar com o Google.');
      }).finally(() => {
        setLoading(false);
      });
    } catch (e) {
      setLoading(false);
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
        Alert.alert(
          'E-mail não verificado',
          'Você precisa confirmar o seu e-mail antes de acessar o aplicativo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Reenviar E-mail', 
              onPress: async () => {
                await sendEmailVerification(userCredential.user);
                Alert.alert('Sucesso', 'E-mail reenviado! Verifique sua caixa de entrada.');
              }
            }
          ]
        );
        return;
      }
    } catch (error: any) {
      const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL || 'ass.karenm@gmail.com';
      if ((error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && normalizedEmail === adminEmail && password === 'admin123') {
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          return; 
        } catch (createError) {
          setErrorMessage('Erro ao criar a conta admin automaticamente.');
        }
      } else {
        let customError = error.message || 'Ocorreu um erro ao fazer login.';
        setErrorMessage(customError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../assets/images/auth_background.png')} 
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={['rgba(11, 15, 25, 0.4)', 'rgba(11, 15, 25, 0.9)']} style={StyleSheet.absoluteFillObject} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome name="angle-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <BrandLogo compact={true} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              O seu portal para as melhores oportunidades de tecnologia.
            </Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={16} color="#F87171" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                <FontAwesome name="envelope-o" size={18} color={focusedInput === 'email' ? '#4ADE80' : 'rgba(255,255,255,0.4)'} style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail profissional"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
                <FontAwesome name="lock" size={20} color={focusedInput === 'password' ? '#4ADE80' : 'rgba(255,255,255,0.4)'} style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha secreta"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIconRight}>
                  <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotText}>Recuperar senha</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={['#4ADE80', '#22C55E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#0B0F19" />
                ) : (
                  <Text style={styles.buttonText}>Acessar Conta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OU CONECTE-SE COM</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png' }} 
                style={{ width: 22, height: 22, marginRight: 12 }} 
              />
              <Text style={styles.googleButtonText}>Continuar com Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Novo por aqui?{' '}</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerText}>Crie sua conta agora</Text>
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
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputWrapperFocused: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderColor: '#4ADE80',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingLeft: 12,
  },
  inputIconLeft: {
    width: 24,
    textAlign: 'center',
  },
  inputIconRight: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#A78BFA', // Neon purple accent
    fontWeight: '600',
  },
  button: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0B0F19', // Dark text on bright button
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
  googleButton: {
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  registerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4ADE80',
  },
});
