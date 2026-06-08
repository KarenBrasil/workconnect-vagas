import { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, StatusBar, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { BrandLogo } from '../components/BrandLogo';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleRegister = async () => {
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

  const handleRegister = async () => {
    setErrorMessage('');
    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name.trim();

    if (!normalizedEmail || !password.trim() || !displayName) {
      setErrorMessage('Preencha nome, e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });

        await sendEmailVerification(userCredential.user);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          nome: displayName,
          email: normalizedEmail,
          uid: userCredential.user.uid,
          criadoEm: new Date().toISOString()
        });

        Alert.alert(
          'Conta Criada!', 
          'Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada antes de fazer login.'
        );
        router.replace('/login');
      }
    } catch (error: any) {
      let customError = 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') {
        customError = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        customError = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        customError = 'A senha deve ter pelo menos 6 caracteres.';
      }
      setErrorMessage(customError);
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
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se ao TechConnect e encontre sua próxima oportunidade.</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={16} color="#F87171" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleRegister}
              disabled={loading}
              activeOpacity={0.7}
            >
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png' }} 
                style={{ width: 22, height: 22, marginRight: 12 }} 
              />
              <Text style={styles.googleButtonText}>Cadastrar com Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OU USE SEU E-MAIL</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputWrapper, focusedInput === 'name' && styles.inputWrapperFocused]}>
                <FontAwesome name="user-o" size={18} color={focusedInput === 'name' ? '#A78BFA' : 'rgba(255,255,255,0.4)'} style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome Completo"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                <FontAwesome name="envelope-o" size={18} color={focusedInput === 'email' ? '#A78BFA' : 'rgba(255,255,255,0.4)'} style={styles.inputIconLeft} />
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
                <FontAwesome name="lock" size={20} color={focusedInput === 'password' ? '#A78BFA' : 'rgba(255,255,255,0.4)'} style={styles.inputIconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha (mín. 6 caracteres)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleRegister}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIconRight}>
                  <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, loading && styles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Criar Conta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta?{' '}</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginText}>Faça Login</Text>
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
    backgroundColor: 'rgba(139, 92, 246, 0.05)', // Purple tint
    borderColor: '#A78BFA',
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
  button: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF', // White text on purple button
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
  loginText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A78BFA', // Purple
  },
});
