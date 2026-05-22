import { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { BrandLogo } from '../components/BrandLogo';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Configuração do Google Auth com o seu Client ID
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '189326429321-kntm9qp3db45chg2ricg0ijov7rf8ilf.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .catch(error => {
          setErrorMessage('Erro ao autenticar com o Google.');
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [response]);

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
      
      // Update profile with the name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      // O _layout.tsx com o AuthProvider vai redirecionar automaticamente para /(tabs)
    } catch (error: any) {
      console.error("Register Error:", error);
      let customError = 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') {
        customError = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        customError = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        customError = 'A senha deve ter pelo menos 6 caracteres.';
      }
      setErrorMessage(customError);
      Alert.alert('Erro no Cadastro', customError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/auth_background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <BlurView intensity={50} tint="dark" style={styles.glassContainer}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <FontAwesome name="angle-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <BrandLogo compact={true} />
            </View>

            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Junte-se ao WorkConnect e encontre sua próxima oportunidade.</Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.googleButton} 
                onPress={() => promptAsync()}
                disabled={!request || loading}
              >
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png' }} 
                  style={{ width: 20, height: 20, marginRight: 10 }} 
                />
                <Text style={styles.googleButtonText}>Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OU CADASTRE COM E-MAIL</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome Completo"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
                <FontAwesome name="id-card-o" size={18} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <FontAwesome name="envelope-o" size={18} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Senha (mín. 6 caracteres)"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.inputIcon}>
                  <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta?{' '}</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginText}>Faça Login</Text>
              </TouchableOpacity>
            </View>

          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  glassContainer: {
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.5)',
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  googleButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 11,
  },
  inputContainer: {
    gap: 14,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputIcon: {
    marginLeft: 10,
    padding: 4,
  },
  button: {
    backgroundColor: '#6A3093', // Roxo
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
