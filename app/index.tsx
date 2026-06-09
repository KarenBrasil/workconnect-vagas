import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IlluOnboarding } from '../assets/illustrations';
import { PrimaryButton, OutlineButton, COLORS } from '../components/ui';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Logo Topo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.logoText}>TechConnect</Text>
      </View>

      {/* Ilustração */}
      <View style={styles.illustrationWrapper}>
        <IlluOnboarding />
      </View>

      {/* Conteúdo inferior */}
      <View style={styles.bottomContent}>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>
            Sua porta de entrada para o <Text style={styles.highlight}>sucesso</Text>.
          </Text>
          <Text style={styles.subtitle}>
            Conectamos você com as melhores oportunidades de trabalho ao redor do mundo.
          </Text>
        </View>

        {/* Paginação */}
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Botões */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Começar agora"
            onPress={() => router.push('/register')}
          />
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.ghostButtonText}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C14', // Fundo escuro conforme spec
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 18,
  },
  logoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  textWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  actions: {
    gap: 16,
  },
  ghostButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  ghostButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
