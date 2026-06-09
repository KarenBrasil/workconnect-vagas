import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, calcularTempoRelativo } from '../../src/services/vagasExternas';
import { useRouter } from 'expo-router';
import { COLORS, Card, Tag, FilterChip } from '../../components/ui';

export default function Home() {
  const router = useRouter();
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
      const globais = externas.slice(0, 4).map((v) => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.empresa,
        data: v.tempoPostagem,
        tipo: 'global',
        fonte: v.fonte,
      }));

      const q = query(collection(db, 'vagas'), orderBy('criadoEm', 'desc'), limit(4));
      const snapInternas = await getDocs(q);
      const locais = snapInternas.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          empresa: data.empresa,
          data: data.criadoEm ? calcularTempoRelativo(data.criadoEm) : 'Hoje',
          tipo: 'local',
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {userName || 'Visitante'}! 👋</Text>
            <Text style={styles.subGreeting}>Encontre suas próximas oportunidades</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="notifications-none" size={24} color={COLORS.textMain} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="search" size={18} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Buscar vagas...</Text>
          <MaterialIcons name="tune" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Featured Banner */}
        <Card style={styles.banner}>
          <View style={styles.bannerContent}>
            <View>
              <Text style={styles.bannerTitle}>🚀 Vagas em Destaque</Text>
              <Text style={styles.bannerSub}>Explore oportunidades exclusivas hoje</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={28} color={COLORS.primary} />
          </View>
        </Card>

        {/* Featured Jobs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vagas Recentes</Text>
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Text style={styles.viewAll}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginVertical: 40 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vagasScroll}>
            {vagasAtivas.slice(0, 5).map((vaga) => (
              <Card key={vaga.id} style={styles.vagaCard}>
                <View style={styles.vagaHeader}>
                  <View
                    style={[
                      styles.companylconBox,
                      { backgroundColor: vaga.tipo === 'local' ? COLORS.primary : COLORS.accent },
                    ]}
                  >
                    <Text style={styles.companyIcon}>{(vaga.empresa || 'C').charAt(0).toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="favorite-border" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.vagaTitle} numberOfLines={2}>
                  {vaga.titulo}
                </Text>
                <Text style={styles.vagaCompany}>{vaga.empresa || 'Confidencial'}</Text>

                <View style={styles.vagaFooter}>
                  <Text style={styles.vagaTime}>{vaga.data}</Text>
                  {vaga.tipo === 'local' && <Tag label="Local" variant="green" />}
                </View>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Recently Published Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Publicadas Recentemente</Text>
        </View>

        <View style={styles.vagasList}>
          {vagasAtivas.slice(0, 3).map((vaga) => (
            <TouchableOpacity key={vaga.id} onPress={() => router.push(`/job/${vaga.id}`)}>
              <Card style={styles.vagaListItem}>
                <View style={styles.vagaListContent}>
                  <View>
                    <Text style={styles.vagaListTitle} numberOfLines={1}>
                      {vaga.titulo}
                    </Text>
                    <Text style={styles.vagaListCompany} numberOfLines={1}>
                      {vaga.empresa || 'Confidencial'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  subGreeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  banner: {
    backgroundColor: COLORS.primary,
    marginBottom: 28,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: COLORS.primaryDark,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  vagasScroll: {
    marginBottom: 28,
  },
  vagaCard: {
    width: 160,
    padding: 12,
    marginRight: 12,
  },
  vagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companylconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyIcon: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  vagaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  vagaCompany: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  vagaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vagaTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  vagasList: {
    gap: 12,
  },
  vagaListItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  vagaListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vagaListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  vagaListCompany: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
