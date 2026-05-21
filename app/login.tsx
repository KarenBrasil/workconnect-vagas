import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { supabase } from "../utils/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Validação de formato prévio local (Sintaxe do e-mail) - Conforme RF1
  const validateEmailFormat = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleLogin = async () => {
    setErrorMessage("");
    const normalizedEmail = email.trim();
    const currentPassword = password;

    // Impede o envio com campos vazios
    if (!normalizedEmail || !currentPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    // Validação estrutural local antes de submeter à API
    if (!validateEmailFormat(normalizedEmail)) {
      setErrorMessage("Usuário ou senha inválidos.");
      return;
    }

    setLoading(true);

    try {
      // Autenticação integrada ao Supabase Auth (RF1)
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: currentPassword,
      });

      if (error) {
        // Mensagem genérica obrigatória contra engenharia reversa
        setErrorMessage("Usuário ou senha inválidos.");
        setLoading(false);
        return;
      }

      setLoading(false);
      // Transição imediata de tela após o retorno positivo
      router.replace("/(tabs)");
    } catch (err) {
      setErrorMessage("Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Bloco Centralizado da Logomarca */}
        <View style={styles.logoContainer}>
          <BrandLogo />
        </View>

        {/* Campo de E-mail com ícone de envelope à esquerda */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="mail-outline"
            size={22}
            color="#83829A"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#A0A0A0"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            accessible={true}
            accessibilityLabel="Campo de entrada de e-mail"
          />
        </View>

        {/* Campo de Senha com ícone de cadeado à esquerda */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock-outline"
            size={22}
            color="#83829A"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={true} // Mascarado por padrão para proteção visual
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
            editable={!loading}
            accessible={true}
            accessibilityLabel="Campo de entrada de senha"
          />
        </View>

        {/* Feedback visual de erro integrado à interface */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={16} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Botão Principal: ENTRAR */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Botão Entrar"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        {/* Link Secundário 1: Criar Conta (Centralizado abaixo do botão) */}
        <TouchableOpacity
          style={styles.linkContainerMiddle}
          onPress={() => router.push("/register")}
          disabled={loading}
        >
          <Text style={styles.linkTextSublined}>Criar Conta</Text>
        </TouchableOpacity>

        {/* Espaçador dinâmico para empurrar o último elemento para o fim da tela */}
        <View style={styles.flexSpacer} />

        {/* Link Secundário 2: Esqueceu a senha? (Isolado na parte inferior) */}
        <TouchableOpacity
          style={styles.linkContainerBottom}
          onPress={() => router.push("/forgot-password")}
          disabled={loading}
        >
          <Text style={styles.linkTextSublined}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Fundo limpo e de alto contraste
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 24, // Respiro regulamentar do link inferior
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Roboto",
    fontSize: 16,
    color: "#312651",
    height: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "#D32F2F",
    marginLeft: 8,
    flex: 1,
  },
  button: {
    backgroundColor: "#2E9D4D", // Cor de destaque sólida do ecossistema
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#81C784",
  },
  buttonText: {
    fontFamily: "Roboto",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  linkContainerMiddle: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  flexSpacer: {
    flex: 1,
    minHeight: 40, // Mantém o distanciamento simétrico em telas compactas
  },
  linkContainerBottom: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  linkTextSublined: {
    fontFamily: "Roboto",
    fontSize: 15,
    color: "#6A3093", // Estilo sublinhado indicando navegabilidade
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
