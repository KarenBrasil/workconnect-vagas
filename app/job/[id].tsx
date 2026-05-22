import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../src/services/firebaseConfig';
import { buscarVagasExternas, VagaExterna } from '../../src/services/vagasExternas';

type VagaDetalhe = {
  id: string;
  titulo: string;
  empresa: string;
  descricao: string;
  contrato?: string;
  salario?: string;
  tipo?: string;
  link?: string;          // Só existe para vagas externas
  fonte?: string;         // Só existe para vagas externas
  local?: string;
  tags?: string[];
  tempoPostagem?: string;
  isExterna: boolean;
};

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vaga, setVaga] = useState<VagaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadVaga(id);
  }, [id]);

  const loadVaga = async (vagaId: string) => {
    try {
      // Vagas externas têm prefixo: "github-", "remotive-", "remoteok-"
      const isExterna = vagaId.startsWith('github-') || vagaId.startsWith('remotive-') || vagaId.startsWith('remoteok-');

      if (isExterna) {
        // Busca na lista de vagas externas e filtra pelo ID
        const todas = await buscarVagasExternas('');
        const encontrada = todas.find(v => v.id === vagaId);
        if (encontrada) {
          setVaga({
            id: encontrada.id,
            titulo: encontrada.titulo,
            empresa: encontrada.empresa,
            descricao: encontrada.descricao,
            local: encontrada.local,
            tags: encontrada.tags,
            tempoPostagem: encontrada.tempoPostagem,
            link: encontrada.link,
            fonte: encontrada.fonte,
            isExterna: true,
          });
        }
      } else {
        // Vaga interna do Firestore
        const docRef = doc(db, 'vagas', vagaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setVaga({
            id: docSnap.id,
            titulo: data.titulo,
            empresa: data.empresa,
            descricao: data.descricao,
            contrato: data.contrato,
            salario: data.salario,
            tipo: data.tipo,
            isExterna: false,
          });
        }
      }
    } catch (error) {
      console.log('Erro ao carregar detalhes da vaga:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E9D4D" />
        <Text style={styles.loadingText}>Carregando vaga...</Text>
      </View>
    );
  }

  if (!vaga) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#EFEFEF" />
        <Text style={styles.errorText}>Vaga não encontrada.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const corPrimaria = vaga.tipo === 'freelancer' ? '#6A3093' : '#2E9D4D';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#312651" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Vaga</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card de Cabeçalho */}
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: corPrimaria }]}>
            <FontAwesome
              name={vaga.isExterna ? (vaga.fonte === 'GitHub BR' ? 'github' : 'globe') : (vaga.tipo === 'freelancer' ? 'briefcase' : 'building')}
              size={32} color="#FFFFFF"
            />
          </View>
          <Text style={styles.titulo}>{vaga.titulo}</Text>
          {vaga.empresa ? (
            <Text style={styles.empresa}>{vaga.empresa}</Text>
          ) : null}
          {vaga.fonte ? (
            <View style={[styles.fonteBadge, { backgroundColor: corPrimaria + '18' }]}>
              <Text style={[styles.fonteText, { color: corPrimaria }]}>via {vaga.fonte}</Text>
            </View>
          ) : null}
        </View>

        {/* Linha de Informações */}
        <View style={styles.infoRow}>
          {vaga.contrato ? (
            <View style={styles.infoBox}>
              <FontAwesome name="file-text-o" size={16} color="#83829A" style={{ marginBottom: 4 }} />
              <Text style={styles.infoLabel}>Contrato</Text>
              <Text style={styles.infoValue}>{vaga.contrato}</Text>
            </View>
          ) : null}
          {vaga.salario ? (
            <View style={styles.infoBox}>
              <FontAwesome name="money" size={16} color="#83829A" style={{ marginBottom: 4 }} />
              <Text style={styles.infoLabel}>Salário</Text>
              <Text style={styles.infoValue}>{vaga.salario}</Text>
            </View>
          ) : null}
          {vaga.local ? (
            <View style={styles.infoBox}>
              <FontAwesome name="map-marker" size={16} color="#83829A" style={{ marginBottom: 4 }} />
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{vaga.local}</Text>
            </View>
          ) : null}
          {vaga.tempoPostagem ? (
            <View style={styles.infoBox}>
              <FontAwesome name="clock-o" size={16} color="#83829A" style={{ marginBottom: 4 }} />
              <Text style={styles.infoLabel}>Postado</Text>
              <Text style={styles.infoValue}>{vaga.tempoPostagem}</Text>
            </View>
          ) : null}
        </View>

        {/* Tags */}
        {vaga.tags && vaga.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {vaga.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Descrição */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>
            {vaga.isExterna ? 'Descrição da Oportunidade' : 'Descrição da Vaga'}
          </Text>
          <Text style={styles.descriptionText}>
            {/* Para vagas externas do GitHub, o texto pode ter markdown — simplificamos */}
            {(vaga.descricao || 'Acesse o link para ver a descrição completa desta vaga.')
              .replace(/#{1,4} /g, '')   // Remove # headers de markdown
              .replace(/\*\*/g, '')      // Remove bold markdown
              .replace(/\n{3,}/g, '\n\n') // Reduz quebras excessivas
              .substring(0, 800)
              + (vaga.descricao && vaga.descricao.length > 800 ? '...' : '')}
          </Text>
        </View>
      </ScrollView>

      {/* Rodapé com botão de ação */}
      <View style={styles.footer}>
        {vaga.isExterna && vaga.link ? (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: corPrimaria }]}
            onPress={() => Linking.openURL(vaga.link!)}
          >
            <FontAwesome name="external-link" size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.applyBtnText}>Ver Vaga Completa</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: corPrimaria }]}
            onPress={() => {
              if (Platform.OS === 'web') window.alert('Em breve: Enviar Candidatura!');
            }}
          >
            <FontAwesome name="send" size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.applyBtnText}>Candidatar-se</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFC' },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FAFAFC', gap: 12, padding: 24,
  },
  loadingText: { fontSize: 15, color: '#83829A', marginTop: 8 },
  errorText: { fontSize: 16, color: '#312651', fontWeight: 'bold', textAlign: 'center' },
  backBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: '#2E9D4D', borderRadius: 10,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#EFEFEF',
  },
  backIcon: { padding: 8, borderRadius: 10, backgroundColor: '#F4F5F7' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#312651' },
  content: { padding: 20, paddingBottom: 24 },
  cardHeader: {
    alignItems: 'center', marginBottom: 20,
    backgroundColor: '#FFFFFF', padding: 24, borderRadius: 18,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardIcon: {
    width: 80, height: 80, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', textAlign: 'center', marginBottom: 6, lineHeight: 30 },
  empresa: { fontSize: 15, color: '#83829A', textAlign: 'center', marginBottom: 10 },
  fonteBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  fonteText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  infoBox: {
    flex: 1, minWidth: 100, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF',
  },
  infoLabel: { fontSize: 11, color: '#83829A', marginBottom: 2, textAlign: 'center' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#1A1A2E', textAlign: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagBadge: { backgroundColor: '#F0F0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#5A5A7A', fontWeight: '600' },
  descriptionContainer: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18,
    borderWidth: 1, borderColor: '#EFEFEF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  footer: {
    padding: 20, paddingBottom: 36, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderColor: '#EFEFEF',
  },
  applyBtn: {
    flexDirection: 'row', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
