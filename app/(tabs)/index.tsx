import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, calcularTempoRelativo } from '../../src/services/vagasExternas';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/theme/LanguageContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  
  const [userName, setUserName] = useState('');
  const [vagasAtivas, setVagasAtivas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.displayName) {
      setUserName(user.displayName.split(' ')[0]);
    }
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const externas = await buscarVagasComCache();
      const globais = externas.slice(0, 2).map(v => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        data: v.tempoPostagem,
        tipo: 'global',
        progress: 75,
      }));

      const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(4));
      const snapInternas = await getDocs(q);
      const locais = snapInternas.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          empresa: data.empresa,
          data: data.criadoEm ? calcularTempoRelativo(data.criadoEm) : 'Hoje',
          tipo: 'local',
          progress: 40,
        };
      });

      setVagasAtivas([...globais, ...locais]);
    } catch (e) {
      console.log('Erro ao carregar dados da Home', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Navbar Premium */}
        <View style={styles.topNav}>
          <TouchableOpacity style={[styles.navIcon, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="th-large" size={16} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Home</Text>
          <TouchableOpacity style={[styles.navIcon, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <FontAwesome name="bell" size={16} color={colors.secondary} />
            <View style={[styles.notificationDot, { backgroundColor: colors.danger }]} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>{t('home.greeting')} {userName || 'Visitante'}!</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Pronto para o seu próximo projeto?</Text>
        </View>

        {/* Search Premium */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: isDark ? '#000' : colors.primary }]} 
          onPress={() => router.push('/search')} 
          activeOpacity={0.8}
        >
          <FontAwesome name="search" size={14} color={colors.secondary} style={{ marginRight: 12 }} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{t('home.searchPlaceholder')}</Text>
          <View style={[styles.searchFilter, { backgroundColor: colors.primaryLight }]}>
            <FontAwesome name="sliders" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Premium Welcome Card with Gradient */}
        <LinearGradient
          colors={isDark ? ['rgba(122, 224, 74, 0.1)', 'rgba(122, 224, 74, 0.05)'] : ['rgba(122, 224, 74, 0.15)', 'rgba(122, 224, 74, 0.08)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.welcomeCard, { borderColor: colors.border }]}
        >
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeTitle, { color: colors.primary }]}>🚀 {t('home.welcomeCard.title')}</Text>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>{t('home.welcomeCard.subtitle')}</Text>
          </View>
          <View style={[styles.illustrationCircle, { backgroundColor: isDark ? 'rgba(122, 224, 74, 0.2)' : 'rgba(122, 224, 74, 0.1)' }]}>
            <FontAwesome name="bolt" size={28} color={colors.primary} />
          </View>
        </LinearGradient>

        {/* Ongoing Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('home.ongoingProjects')}</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.projectsGrid}>
            {vagasAtivas.map((vaga, index) => {
              const isFirst = index === 0;
              const cardBg = isFirst ? colors.primary : colors.cardBackground;
              const titleColor = isFirst ? '#FFFFFF' : colors.textPrimary;
              const dateColor = isFirst ? 'rgba(255,255,255,0.8)' : colors.textSecondary;
              const iconColor = isFirst ? '#FFFFFF' : colors.secondary;
              const shadowCol = isFirst ? colors.primary : '#000';

              return (
                <View key={vaga.id} style={[styles.projectCard, { backgroundColor: cardBg, borderColor: isFirst ? 'transparent' : colors.border, shadowColor: shadowCol }]}>
                  <View style={styles.cardHeader}>
                    <Text style={{ color: dateColor, fontSize: 9, fontWeight: '600' }}>{vaga.data}</Text>
                    <TouchableOpacity>
                      <FontAwesome name="ellipsis-v" size={12} color={dateColor} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.cardBody}>
                    <View style={[styles.iconContainer, { backgroundColor: isFirst ? 'rgba(255,255,255,0.2)' : colors.secondaryLight }]}>
                      <FontAwesome name={vaga.tipo === 'global' ? 'globe' : 'briefcase'} size={16} color={iconColor} />
                    </View>
                    <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>{vaga.titulo}</Text>
                    <Text style={{ color: dateColor, fontSize: 10, marginTop: 2, fontWeight: '500' }} numberOfLines={1}>{vaga.empresa}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={{ color: titleColor, fontSize: 9, fontWeight: '700', marginBottom: 4 }}>{t('home.progress')}</Text>
                    <View style={[styles.progressBg, { backgroundColor: isFirst ? 'rgba(255,255,255,0.3)' : '#E2E8F0' }]}>
                      <View style={[styles.progressFill, { width: `${vaga.progress}%`, backgroundColor: isFirst ? '#FFFFFF' : colors.primary }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40 },
  
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  navIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1 },
  navTitle: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 6, height: 6, borderRadius: 3 },

  greetingContainer: { marginBottom: 20 },
  greetingTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 2 },
  greetingSub: { fontSize: 13, fontWeight: '500' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchFilter: { marginLeft: 'auto', width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  welcomeCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeTextContainer: { flex: 1, paddingRight: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6, letterSpacing: -0.3 },
  welcomeSub: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  illustrationCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },

  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  projectCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardBody: { marginBottom: 16 },
  iconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  cardFooter: { marginTop: 'auto' },
  progressBg: { height: 4, borderRadius: 2, width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
});
