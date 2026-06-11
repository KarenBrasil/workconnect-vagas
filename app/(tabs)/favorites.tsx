import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { buscarFavoritos, removerFavorito, Favorito } from '../../src/services/favoritos';
import { auth } from '../../src/services/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../../src/theme/ThemeContext';
import { IlluSavedJobs } from '../../assets/illustrations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Favorites() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const userId = auth.currentUser?.uid;

  const loadFavoritos = useCallback(async () => {
    if (!userId) {
      setFavoritos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const favs = await buscarFavoritos(userId);
      setFavoritos(favs);
    } catch (e) {
      console.log('Erro ao carregar favoritos:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused) {
      loadFavoritos();
    }
  }, [isFocused, loadFavoritos]);

  const handleRemover = async (id: string) => {
    await removerFavorito(id);
    loadFavoritos();
  };

  const handleAbrir = (link?: string) => {
    if (link) Linking.openURL(link);
  };

  const renderItem = ({ item }: { item: Favorito }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: colors.primary }]}>
          <FontAwesome name="briefcase" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitulo, { color: colors.textPrimary }]} numberOfLines={1}>{item.titulo}</Text>
          <Text style={[styles.cardEmpresa, { color: colors.textSecondary }]}>{item.empresa}</Text>
        </View>
        <TouchableOpacity onPress={() => handleRemover(item.id!)}>
          <FontAwesome name="heart" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.cardFonte, { color: colors.textSecondary }]}>📌 {item.fonte}</Text>
        {item.link ? (
          <TouchableOpacity onPress={() => handleAbrir(item.link)}>
            <Text style={[styles.cardExterno, { color: colors.primary }]}>Abrir Vaga →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, paddingTop: insets.top + 44 }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Meus Favoritos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vagas que você salvou</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : !userId ? (
        <View style={styles.emptyContainer}>
          <IlluSavedJobs width={160} height={140} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Login necessário</Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Faça login para ver seus favoritos salvos.</Text>
        </View>
      ) : favoritos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IlluSavedJobs width={160} height={140} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Nenhum favorito salvo</Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Toque no 💜 em qualquer vaga para salvar aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={item => item.id!}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 20, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  listContent: { padding: 24 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardEmpresa: { fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1 },
  cardFonte: { fontSize: 13 },
  cardExterno: { fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubText: { fontSize: 14, textAlign: 'center' },
});
