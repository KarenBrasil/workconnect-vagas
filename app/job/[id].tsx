import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vaga, setVaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVaga();
    }
  }, [id]);

  const loadVaga = async () => {
    try {
      const docRef = doc(db, 'vagas', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVaga({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('Vaga não encontrada');
      }
    } catch (error) {
      console.log('Erro ao carregar detalhes da vaga', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E9D4D" />
      </View>
    );
  }

  if (!vaga) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Vaga não encontrada.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#312651" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Vaga</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, vaga.tipo === 'freelancer' && styles.cardIconRoxo]}>
            <FontAwesome
              name={vaga.tipo === 'freelancer' ? 'briefcase' : 'building'}
              size={32} color="#FFFFFF"
            />
          </View>
          <Text style={styles.titulo}>{vaga.titulo}</Text>
          <Text style={styles.empresa}>{vaga.empresa}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <FontAwesome name="file-text-o" size={16} color="#83829A" style={{ marginBottom: 4 }} />
            <Text style={styles.infoLabel}>Contrato</Text>
            <Text style={styles.infoValue}>{vaga.contrato}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome name="money" size={16} color="#83829A" style={{ marginBottom: 4 }} />
            <Text style={styles.infoLabel}>Salário</Text>
            <Text style={styles.infoValue}>{vaga.salario}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Descrição da Vaga</Text>
          <Text style={styles.descriptionText}>{vaga.descricao}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={() => alert('Em breve: Enviar Candidatura!')}>
          <Text style={styles.applyBtnText}>Candidatar-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFC' },
  errorText: { fontSize: 16, color: '#312651', marginBottom: 16 },
  backBtn: { padding: 12, backgroundColor: '#EFEFEF', borderRadius: 8 },
  backBtnText: { color: '#312651', fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EFEFEF' },
  backIcon: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#312651' },
  content: { padding: 24 },
  cardHeader: { alignItems: 'center', marginBottom: 24 },
  cardIcon: { width: 80, height: 80, backgroundColor: '#2E9D4D', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardIconRoxo: { backgroundColor: '#6A3093' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#312651', textAlign: 'center', marginBottom: 8 },
  empresa: { fontSize: 16, color: '#83829A', textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF', marginHorizontal: 4 },
  infoLabel: { fontSize: 12, color: '#83829A', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#312651' },
  descriptionContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#312651', marginBottom: 12 },
  descriptionText: { fontSize: 15, color: '#6B7280', lineHeight: 24 },
  footer: { padding: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#EFEFEF', paddingBottom: 40 },
  applyBtn: { backgroundColor: '#2E9D4D', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
