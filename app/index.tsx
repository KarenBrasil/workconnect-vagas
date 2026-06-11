import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IlluOnboarding } from '../assets/illustrations';
import { PrimaryButton, OutlineButton } from '../components/ui';
import { BrandLogo } from '../components/BrandLogo';
import { useTheme } from '../src/theme/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Logo Topo */}
      <View style={{ marginTop: 20, marginBottom: 30, alignItems: 'center' }}>
        <BrandLogo color={colors.textPrimary} />
      </View>

      {/* Ilustração */}
      <View style={styles.illustrationWrapper}>
        <IlluOnboarding />
      </View>

      {/* Conteúdo inferior */}
      <View style={styles.bottomContent}>
        <View style={styles.textWrapper}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Sua porta de entrada para o <Text style={{ color: colors.primary }}>sucesso</Text>.
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Conectamos você com as melhores oportunidades de trabalho ao redor do mundo.
          </Text>
        </View>

        {/* Paginação */}
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: isDark ? colors.border : '#E0E0E0' }]} />
          <View style={[styles.dot, { backgroundColor: isDark ? colors.border : '#E0E0E0' }]} />
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
            <Text style={[styles.ghostButtonText, { color: colors.textPrimary }]}>Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
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
  },
  dotActive: {
    width: 24,
  },
  actions: {
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
