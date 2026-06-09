import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { TextInputField, PrimaryButton, OutlineButton } from '../components/ui';
import { useTheme } from '../src/theme/ThemeContext';
import { IlluResume } from '../assets/illustrations';

export default function ForgotPassword() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Por favor, digite seu e-mail.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      let customError = 'Ocorreu um erro ao tentar recuperar a senha.';
      if (error.code === 'auth/user-not-found') {
        customError = 'Não há usuário cadastrado com este e-mail.';
      } else if (error.code === 'auth/invalid-email') {
        customError = 'E-mail inválido.';
      }
      setErrorMessage(customError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <IlluResume width={140} height={120} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Recuperar Senha 🔐</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enviaremos um link para você redefinir sua senha.
            </Text>

            {errorMessage ? (
              <View style={[styles.errorContainer, { borderColor: colors.danger, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                <FontAwesome name="exclamation-circle" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={[styles.successContainer, { borderColor: colors.success, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#DCFCE7' }]}>
                <FontAwesome name="check-circle" size={16} color={colors.success} style={{ marginRight: 8 }} />
                <Text style={[styles.successText, { color: colors.success }]}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <TextInputField
                label="E-mail de Recuperação"
                placeholder="seu@email.com"
                icon="envelope"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <PrimaryButton
              label={loading ? '' : 'Enviar E-mail'}
              onPress={handleResetPassword}
              disabled={loading}
              style={styles.button}
            />
            {loading && (
              <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
            )}

            <OutlineButton
              label="Voltar para Login"
              onPress={() => router.back()}
              style={styles.backButton}
            />
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
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  successText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 16,
    minHeight: 56,
  },
  loader: {
    marginVertical: 16,
  },
  backButton: {
    marginTop: 8,
  },
});
