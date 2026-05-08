import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { buscarFavoritos, removerFavorito, Favorito } from '../../src/services/favoritos';
import { auth } from '../../src/services/firebaseConfig';
import { useIsFocused } from '@react-navigation/native';

export default function Favorites() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid || 'anonimo';
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadFavoritos();
    }
  }, [isFocused]);

  const loadFavoritos = async () => {
    setLoading(true);
    const favs = await buscarFavoritos(userId);
    setFavoritos(favs);
    setLoading(false);
  };

  const handleRemover = async (id: string) => {
    await removerFavorito(id);
    loadFavoritos();
  };

  const handleAbrir = (link?: string) => {
    if (link) Linking.openURL(link);
  };

  const renderItem = ({ item }: { item: Favorito }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <FontAwesome name="briefcase" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitulo} numberOfLines={1}>{item.titulo}</Text>
          <Text style={styles.cardEmpresa}>{item.empresa}</Text>
        </View>
        <TouchableOpacity onPress={() => handleRemover(item.id!)}>
          <FontAwesome name="heart" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFonte}>📌 {item.fonte}</Text>
        {item.link ? (
          <TouchableOpacity onPress={() => handleAbrir(item.link)}>
            <Text style={styles.cardExterno}>Abrir Vaga →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Favoritos</Text>
        <Text style={styles.subtitle}>Vagas que você salvou</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E9D4D" style={{ marginTop: 50 }} />
      ) : favoritos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="heart-o" size={48} color="#EFEFEF" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Nenhum favorito salvo</Text>
          <Text style={styles.emptySubText}>As vagas que você salvar aparecerão aqui.</Text>
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
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EFEFEF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#312651' },
  subtitle: { fontSize: 14, color: '#83829A', marginTop: 4 },
  listContent: { padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EFEFEF' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIcon: { width: 44, height: 44, backgroundColor: '#2E9D4D', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#312651', marginBottom: 4 },
  cardEmpresa: { fontSize: 14, color: '#83829A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardFonte: { fontSize: 13, color: '#6B7280' },
  cardExterno: { fontSize: 13, color: '#6A3093', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#312651', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#83829A', textAlign: 'center' },
});
