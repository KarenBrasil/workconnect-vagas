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
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton, TextInputField, COLORS } from '../components/ui';
import { IlluOnboarding } from '../assets/illustrations';
import { lightColors } from '../src/theme/colors';

export default function Register() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colors = lightColors;
  const isDark = false;

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!nome.trim() || !normalizedEmail || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
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
        criadoEm: new Date().toISOString(),
      });

      await sendEmailVerification(user);

      Alert.alert(
        'Conta criada com sucesso!',
        'Um e-mail de confirmação foi enviado. Verifique sua caixa de entrada.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      let customError = error.message || 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') {
        customError = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        customError = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        customError = 'A senha é muito fraca.';
      }

      Alert.alert('Erro', customError);
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
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <IlluOnboarding />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textMain }]}>Criar Conta 🎉</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Junte-se a milhares de profissionais em busca de oportunidades.</Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInputField
                label="Nome Completo"
                placeholder="Seu nome"
                icon="person"
                value={nome}
                onChangeText={setNome}
              />

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
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <PrimaryButton
              label={loading ? '' : 'Criar Conta'}
              onPress={handleRegister}
              disabled={loading}
            />
            {loading && <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />}

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginText, { color: colors.accent }]}>Entre aqui</Text>
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
  loader: {
    marginVertical: 16,
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
  loginText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
