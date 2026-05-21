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

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para a seleção de perfis adicionais pela interface
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [isRecrutador, setIsRecrutador] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmailFormat = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleRegister = async () => {
    setErrorMessage("");

    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();

    if (!nameTrimmed || !emailTrimmed || !password || !confirmPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    if (!validateEmailFormat(emailTrimmed)) {
      setErrorMessage("Formato de e-mail inválido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar credencial de acesso no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailTrimmed,
        password: password,
      });

      if (authError) {
        if (
          authError.message.includes("already registered") ||
          authError.status === 422
        ) {
          setErrorMessage("Este e-mail já está cadastrado.");
        } else {
          setErrorMessage(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData?.user) {
        const userId = authData.user.id;

        // 2. Operação 1: Inserir dados básicos na tabela public.profiles
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: userId,
            email: emailTrimmed,
            name: nameTrimmed, // Conforme o Dicionário de Dados Físico
            role: "D", // Constraint CHECK: 'D' para Usuário Padrão
            active_view: "comum", // Constraint CHECK: 'comum' em minúsculo
          },
        ]);

        if (profileError) {
          setErrorMessage(
            "Erro ao criar perfil básico: " + profileError.message,
          );
          setLoading(false);
          return;
        }

        // 3. Operação 2: Mapear e inserir linhas na tabela public.profile_roles
        // Adiciona 'comum' obrigatoriamente por padrão conforme a regra de negócio
        const rolesToInsert = [{ profile_id: userId, user_type: "comum" }];

        if (isFreelancer) {
          rolesToInsert.push({ profile_id: userId, user_type: "freelancer" }); // Constraint CHECK
        }
        if (isRecrutador) {
          rolesToInsert.push({ profile_id: userId, user_type: "recrutador" }); // Constraint CHECK
        }

        const { error: rolesError } = await supabase
          .from("profile_roles")
          .insert(rolesToInsert);

        if (rolesError) {
          setErrorMessage(
            "Erro ao vincular papéis do perfil: " + rolesError.message,
          );
          setLoading(false);
          return;
        }

        setLoading(false);
        router.replace("/(tabs)");
      }
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
        <Text style={styles.screenTitle}>Criar Conta</Text>

        <View style={styles.logoContainer}>
          <BrandLogo />
        </View>

        {/* Campo Nome */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="person-outline"
            size={22}
            color="#83829A"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        {/* Campo E-mail */}
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
          />
        </View>

        {/* Campo Senha */}
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
            secureTextEntry={true}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        {/* Campo Confirmar Senha */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock-outline"
            size={22}
            color="#83829A"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={true}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
        </View>

        <View style={styles.divider} />

        {/* Componente de Múltipla Escolha dos Perfis */}
        <View style={styles.profileSection}>
          <Text style={styles.profileTitle}>Selecionar Perfil</Text>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isFreelancer && styles.toggleButtonActive,
              ]}
              onPress={() => setIsFreelancer(!isFreelancer)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  isFreelancer && styles.toggleTextActive,
                ]}
              >
                Freelancer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                isRecrutador && styles.toggleButtonActive,
              ]}
              onPress={() => setIsRecrutador(!isRecrutador)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  isRecrutador && styles.toggleTextActive,
                ]}
              >
                Recrutador
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Feedback visual de erros */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={16} color="#D32F2F" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Botão Principal */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>CRIAR CONTA</Text>
          )}
        </TouchableOpacity>

        {/* Link para retornar */}
        <TouchableOpacity
          style={styles.linkContainerBottom}
          onPress={() => router.push("/login")}
          disabled={loading}
        >
          <Text style={styles.linkTextSublined}>Voltar ao Login</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
  },
  screenTitle: {
    fontFamily: "Roboto",
    fontSize: 24,
    fontWeight: "700",
    color: "#312651",
    textAlign: "center",
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
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
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
    width: "100%",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 8,
    width: "100%",
  },
  profileTitle: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "600",
    color: "#312651",
    marginBottom: 16,
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
    height: 48,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#616161", // Tom escuro do wireframe
  },
  toggleText: {
    fontFamily: "Roboto",
    fontSize: 15,
    color: "#616161",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
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
    backgroundColor: "#2E9D4D",
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 24,
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
  linkContainerBottom: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
    marginTop: 8,
  },
  linkTextSublined: {
    fontFamily: "Roboto",
    fontSize: 14,
    color: "#6A3093",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
