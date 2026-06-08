import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, calcularTempoRelativo, VagaExterna } from '../../src/services/vagasExternas';
import { useTheme } from '../../src/theme/ThemeContext';
import { useLanguage } from '../../src/theme/LanguageContext';
import { useRouter } from 'expo-router';

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
      // Busca 2 vagas globais
      const externas = await buscarVagasComCache();
      const globais = externas.slice(0, 2).map(v => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        data: v.tempoPostagem,
        tipo: 'global',
        progress: 75,
      }));

      // Busca 2 vagas locais
      const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(2));
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
        
        {/* Top Navbar */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navIcon}>
            <FontAwesome name="th-large" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Home</Text>
          <TouchableOpacity style={styles.navIcon}>
            <FontAwesome name="bell" size={20} color={colors.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingTitle, { color: colors.primary }]}>{t('home.greeting')} {userName || 'Visitante'}!</Text>
          <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>Bom dia</Text>
        </View>

        {/* Search */}
        <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={() => router.push('/search')} activeOpacity={0.8}>
          <FontAwesome name="search" size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
          <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>

        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { borderColor: colors.primary }]}>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeTitle, { color: colors.primary }]}>{t('home.welcomeCard.title')}</Text>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>{t('home.welcomeCard.subtitle')}</Text>
          </View>
          <Image source={require('../../assets/images/icon.png')} style={styles.welcomeIllustration} />
        </View>

        {/* Ongoing Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('home.ongoingProjects')}</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500' }}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.projectsGrid}>
            {vagasAtivas.map((vaga, index) => {
              const isFirst = index === 0;
              const cardBg = isFirst ? colors.primary : colors.cardBackground;
              const titleColor = isFirst ? '#FFF' : colors.textPrimary;
              const dateColor = isFirst ? 'rgba(255,255,255,0.7)' : colors.textSecondary;
              const iconColor = isFirst ? '#FFF' : colors.primary;

              return (
                <View key={vaga.id} style={[styles.projectCard, { backgroundColor: cardBg, borderColor: isFirst ? 'transparent' : colors.border }]}>
                  <View style={styles.cardHeader}>
                    <Text style={{ color: dateColor, fontSize: 10, fontWeight: '600' }}>{vaga.data}</Text>
                    <FontAwesome name="ellipsis-v" size={14} color={dateColor} />
                  </View>
                  
                  <View style={styles.cardBody}>
                    <FontAwesome name={vaga.tipo === 'global' ? 'globe' : 'briefcase'} size={24} color={iconColor} style={{ marginBottom: 12 }} />
                    <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>{vaga.titulo}</Text>
                    <Text style={{ color: dateColor, fontSize: 10, marginTop: 4 }} numberOfLines={1}>{vaga.empresa}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={{ color: titleColor, fontSize: 10, fontWeight: '600', marginBottom: 6 }}>{t('home.progress')}</Text>
                    <View style={[styles.progressBg, { backgroundColor: isFirst ? 'rgba(255,255,255,0.2)' : '#EAECEF' }]}>
                      <View style={[styles.progressFill, { width: `${vaga.progress}%`, backgroundColor: isFirst ? '#FFF' : colors.primary }]} />
                    </View>
                    <Text style={{ color: dateColor, fontSize: 9, textAlign: 'right', marginTop: 4 }}>{vaga.progress}%</Text>
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
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  navIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700' },
  notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },

  greetingContainer: { marginBottom: 24 },
  greetingTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  greetingSub: { fontSize: 14, fontWeight: '500' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },

  welcomeCard: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  welcomeTextContainer: { flex: 1, paddingRight: 16 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  welcomeSub: { fontSize: 12, lineHeight: 18 },
  welcomeIllustration: { width: 80, height: 80, resizeMode: 'contain' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  projectCard: {
    width: '47%',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardBody: { marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardFooter: { marginTop: 'auto' },
  progressBg: { height: 4, borderRadius: 2, width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
});
