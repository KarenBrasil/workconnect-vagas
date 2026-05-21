import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmailFormat = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handlePasswordReset = async () => {
    setErrorMessage("");
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Por favor, informe o seu e-mail cadastrado.");
      return;
    }

    if (!validateEmailFormat(normalizedEmail)) {
      setErrorMessage("Formato de e-mail inválido.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: "workconnect://reset-password",
        },
      );

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      Alert.alert(
        "E-mail Enviado",
        "Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.",
        [{ text: "OK", onPress: () => router.replace("/login") }],
      );
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
      {/* 1. Remove a barra superior (seta e nome do arquivo) */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Recuperar Senha</Text>
          </View>

          <View style={styles.logoContainer}>
            <BrandLogo />
          </View>

          <Text style={styles.instructionsText}>
            Digite seu e-mail cadastrado para receber um link de recuperação de
            senha.
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="mail-outline"
              size={22}
              color="#757575"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#757575"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>ENVIAR LINK DE RECUPERAÇÃO</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Links posicionados nas extremidades conforme a especificação */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            disabled={loading}
          >
            <Text style={styles.linkText}>Voltar ao Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register")}
            disabled={loading}
          >
            <Text style={styles.linkText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: "Roboto",
    fontSize: 26,
    fontWeight: "700",
    color: "#312651",
    textAlign: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  instructionsText: {
    fontFamily: "Roboto",
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
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
  },
  errorText: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "#D32F2F",
    marginLeft: 8,
    flex: 1,
  },
  button: {
    backgroundColor: "#2E9D4D",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#81C784",
  },
  buttonText: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-between", // Extremidade esquerda e direita
    width: "100%",
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 20,
  },
  linkText: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "#6A3093",
    textDecorationLine: "underline",
  },
});
