import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrandLogo } from '../components/BrandLogo';
import { getNameFromEmail, getSavedUserByEmail, saveUserSession } from '../utils/userSession';

const ADMIN_PASSWORDS = ['admin', '1234', 'workconnect'];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const enterApp = async () => {
    const normalizedEmail = email.trim().toLowerCase() || 'admin@workconnect.com';
    const savedUser = await getSavedUserByEmail(normalizedEmail);

    await saveUserSession(
      savedUser ?? {
        email: normalizedEmail,
        name: normalizedEmail === 'admin@workconnect.com' ? 'Admin' : getNameFromEmail(normalizedEmail),
      }
    );

    router.replace('/(tabs)');
  };

  const handleLogin = async () => {
    const normalizedPassword = password.trim().toLowerCase();

    if (ADMIN_PASSWORDS.includes(normalizedPassword)) {
      await enterApp();
      return;
    }

    Alert.alert('Acesso admin', 'Use a senha: admin');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <BrandLogo />
        </View>

        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>
          Entre como admin para navegar pelo prototipo e testar as abas.
        </Text>

        <View style={styles.adminHint}>
          <Text style={styles.adminHintTitle}>Acesso de teste</Text>
          <Text style={styles.adminHintText}>
            Senha: admin. O e-mail e opcional enquanto o cadastro real nao estiver pronto.
          </Text>
        </View>

        <Text style={styles.label}>E-mail opcional</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@workconnect.com"
          placeholderTextColor="#A0A0A0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha admin</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite admin"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminButton} onPress={enterApp}>
          <Text style={styles.adminButtonText}>Entrar como admin</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda nao tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#312651',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#83829A',
    marginBottom: 24,
    lineHeight: 22,
  },
  adminHint: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F2EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  adminHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#148243',
    marginBottom: 4,
  },
  adminHintText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#312651',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#312651',
  },
  button: {
    backgroundColor: '#2E9D4D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  adminButton: {
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E9D4D',
  },
  adminButtonText: {
    color: '#148243',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    color: '#83829A',
  },
  registerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6A3093',
  },
});
