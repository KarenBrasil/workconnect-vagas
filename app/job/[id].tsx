import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebaseConfig';
import { buscarVagasComCache, VagaExterna } from '../../src/services/vagasExternas';
import { salvarFavorito, removerFavorito, buscarFavoritos } from '../../src/services/favoritos';
import { useTheme } from '../../src/theme/ThemeContext';

// Prefixos que identificam vagas externas (não estão no Firestore)
const PREFIXOS_EXTERNOS = ['github-', 'remotive-', 'remoteok-', 'arbeit-', 'jooble-', 'infojobs-'];

function isVagaExterna(id: string): boolean {
  return PREFIXOS_EXTERNOS.some(prefix => id.startsWith(prefix));
}

type VagaDetalhe = {
  id: string;
  titulo: string;
  empresa: string;
  descricao: string;
  contrato?: string;
  salario?: string;
  tipo?: string;
  contato?: string;    // Email ou WhatsApp do poster (vagas internas)
  link?: string;       // Só existe para vagas externas
  fonte?: string;      // Só existe para vagas externas
  local?: string;
  tags?: string[];
  tempoPostagem?: string;
  requisitos?: string[];
  linguagens?: string[];
  isExterna: boolean;
};

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [vaga, setVaga] = useState<VagaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoritoId, setFavoritoId] = useState<string | null>(null); // null = não favoritado
  const [salvandoFav, setSalvandoFav] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (id) loadVaga(id);
  }, [id]);

  // Carrega estado de favorito após ter os dados da vaga
  useEffect(() => {
    if (vaga && userId) {
      verificarFavorito();
    }
  }, [vaga, userId]);

  const verificarFavorito = async () => {
    if (!userId) return;
    try {
      const favs = await buscarFavoritos(userId);
      const fav = favs.find(f => f.vagaId === id);
      setFavoritoId(fav?.id || null);
    } catch (e) {
      console.log('Erro ao verificar favorito:', e);
    }
  };

  const loadVaga = async (vagaId: string) => {
    try {
      if (isVagaExterna(vagaId)) {
        // Usa cache — não refaz todas as chamadas de API
        const todas = await buscarVagasComCache();
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
            contato: data.contato || '',
            requisitos: data.requisitos || [],
            linguagens: data.linguagens || [],
            tempoPostagem: data.criadoEm ? new Date(data.criadoEm).toLocaleDateString('pt-BR') : undefined,
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

  const handleToggleFavorito = async () => {
    if (!userId) {
      Alert.alert('Login necessário', 'Faça login para salvar favoritos.');
      return;
    }
    if (!vaga) return;
    setSalvandoFav(true);
    try {
      if (favoritoId) {
        // Já é favorito — remove
        await removerFavorito(favoritoId);
        setFavoritoId(null);
      } else {
        // Não é favorito — adiciona
        await salvarFavorito({
          userId,
          vagaId: vaga.id,
          titulo: vaga.titulo,
          empresa: vaga.empresa || '',
          fonte: vaga.fonte || 'TechConnect',
          link: vaga.link,
        });
        // Recarrega para pegar o ID gerado
        await verificarFavorito();
      }
    } catch (e) {
      console.log('Erro ao atualizar favorito:', e);
    } finally {
      setSalvandoFav(false);
    }
  };

  const abrirContato = (contato: string) => {
    if (!contato) return;
    const numero = contato.replace(/\D/g, '');
    // Detecta se é número de telefone (≥ 8 dígitos) ou e-mail
    if (numero.length >= 8 && !contato.includes('@')) {
      const numeroCompleto = numero.startsWith('55') ? numero : `55${numero}`;
      Linking.openURL(`https://wa.me/${numeroCompleto}`);
    } else {
      Linking.openURL(`mailto:${contato}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando vaga...</Text>
      </View>
    );
  }

  if (!vaga) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <FontAwesome name="exclamation-circle" size={48} color="#EFEFEF" />
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>Vaga não encontrada.</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const corPrimaria = vaga.tipo === 'freelancer' ? '#6A3093' : colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backIcon, { backgroundColor: colors.background }]} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Detalhes da Vaga</Text>
        {/* Botão de favoritar no header */}
        <TouchableOpacity
          style={[styles.backIcon, { backgroundColor: colors.background }]}
          onPress={handleToggleFavorito}
          disabled={salvandoFav}
        >
          {salvandoFav
            ? <ActivityIndicator size="small" color="#DC2626" />
            : <FontAwesome name={favoritoId ? 'heart' : 'heart-o'} size={20} color={favoritoId ? '#DC2626' : colors.textSecondary} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card de Cabeçalho */}
        <View style={[styles.cardHeader, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.cardIcon, { backgroundColor: corPrimaria }]}>
            <FontAwesome
              name={vaga.isExterna ? (vaga.fonte === 'GitHub BR' ? 'github' : 'globe') : (vaga.tipo === 'freelancer' ? 'briefcase' : 'building')}
              size={32} color="#FFFFFF"
            />
          </View>
          <Text style={[styles.titulo, { color: colors.textPrimary }]}>{vaga.titulo}</Text>
          {vaga.empresa ? (
            <Text style={[styles.empresa, { color: colors.textSecondary }]}>{vaga.empresa}</Text>
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
            <View style={[styles.infoBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <FontAwesome name="file-text-o" size={16} color={colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contrato</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{vaga.contrato}</Text>
            </View>
          ) : null}
          {vaga.salario ? (
            <View style={[styles.infoBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <FontAwesome name="money" size={16} color={colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Salário</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{vaga.salario}</Text>
            </View>
          ) : null}
          {vaga.local ? (
            <View style={[styles.infoBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <FontAwesome name="map-marker" size={16} color={colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Local</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={2}>{vaga.local}</Text>
            </View>
          ) : null}
          {vaga.tempoPostagem ? (
            <View style={[styles.infoBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <FontAwesome name="clock-o" size={16} color={colors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Postado</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{vaga.tempoPostagem}</Text>
            </View>
          ) : null}
        </View>

        {/* Tags */}
        {vaga.tags && vaga.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {vaga.tags.map((tag, idx) => (
              <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Descrição */}
        <View style={[styles.descriptionContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {vaga.isExterna ? 'Descrição da Oportunidade' : 'Descrição da Vaga'}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {(vaga.descricao || 'Acesse o link para ver a descrição completa desta vaga.')
              .replace(/#{1,4} /g, '')   // Remove # headers de markdown
              .replace(/\*\*/g, '')      // Remove bold markdown
              .replace(/\n{3,}/g, '\n\n') // Reduz quebras excessivas
              .substring(0, 800)
              + (vaga.descricao && vaga.descricao.length > 800 ? '...' : '')}
          </Text>
        </View>

        {/* Linguagens */}
        {vaga.linguagens && vaga.linguagens.length > 0 && (
          <View style={[styles.descriptionContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>💻 Linguagens & Ferramentas</Text>
            <View style={styles.tagsContainer}>
              {vaga.linguagens.map((lang, idx) => (
                <View key={idx} style={[styles.tagBadge, { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }]}>
                  <Text style={[styles.tagText, { color: '#374151', fontWeight: '600' }]}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Requisitos */}
        {vaga.requisitos && vaga.requisitos.length > 0 && (
          <View style={[styles.descriptionContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>✅ Requisitos / Diferenciais</Text>
            <View style={{ marginTop: 8 }}>
              {vaga.requisitos.map((req, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ color: colors.primary, marginRight: 8, fontSize: 16 }}>•</Text>
                  <Text style={{ color: colors.textSecondary, flex: 1, fontSize: 15, lineHeight: 22 }}>{req}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Card de Contato — só para vagas internas com contato cadastrado */}
        {!vaga.isExterna && vaga.contato ? (
          <View style={[styles.contatoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📞 Como se Candidatar</Text>
            <Text style={[styles.contatoInfo, { color: colors.textSecondary }]}>
              Entre em contato diretamente com o responsável pela vaga:
            </Text>
            <TouchableOpacity
              style={[styles.contatoBtn, { backgroundColor: corPrimaria }]}
              onPress={() => abrirContato(vaga.contato!)}
            >
              <FontAwesome
                name={vaga.contato!.includes('@') ? 'envelope' : 'whatsapp'}
                size={18}
                color="#FFF"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.contatoBtnText}>
                {vaga.contato!.includes('@') ? 'Enviar E-mail' : 'Abrir no WhatsApp'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.contatoTexto, { color: colors.textSecondary }]}>{vaga.contato}</Text>
          </View>
        ) : null}

        {/* Aviso quando vaga interna não tem contato */}
        {!vaga.isExterna && !vaga.contato ? (
          <View style={[styles.contatoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📞 Como se Candidatar</Text>
            <Text style={[styles.contatoInfo, { color: colors.textSecondary }]}>
              Contato não informado. Busque a empresa na descrição da vaga para se candidatar.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Rodapé com botão de ação */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        {vaga.isExterna && vaga.link ? (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: corPrimaria }]}
            onPress={() => Linking.openURL(vaga.link!)}
          >
            <FontAwesome name="external-link" size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.applyBtnText}>Ver Vaga Completa</Text>
          </TouchableOpacity>
        ) : !vaga.isExterna && vaga.contato ? (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: corPrimaria }]}
            onPress={() => abrirContato(vaga.contato!)}
          >
            <FontAwesome
              name={vaga.contato.includes('@') ? 'envelope' : 'whatsapp'}
              size={16}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.applyBtnText}>
              {vaga.contato.includes('@') ? 'Enviar E-mail' : 'Contato via WhatsApp'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.applyBtn, { backgroundColor: colors.border }]}>
            <Text style={[styles.applyBtnText, { color: colors.textSecondary }]}>Contato não disponível</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 24,
  },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  backBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backIcon: { padding: 8, borderRadius: 10, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 24 },
  cardHeader: {
    alignItems: 'center', marginBottom: 16,
    padding: 24, borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardIcon: {
    width: 80, height: 80, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, lineHeight: 30 },
  empresa: { fontSize: 15, textAlign: 'center', marginBottom: 10 },
  fonteBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  fonteText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  infoBox: {
    flex: 1, minWidth: 100, padding: 14, borderRadius: 14,
    alignItems: 'center', borderWidth: 1,
  },
  infoLabel: { fontSize: 11, marginBottom: 2, textAlign: 'center' },
  infoValue: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '600' },
  descriptionContainer: {
    padding: 20, borderRadius: 18, marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  descriptionText: { fontSize: 14, lineHeight: 22 },
  contatoCard: {
    padding: 20, borderRadius: 18, marginBottom: 16,
    borderWidth: 1,
  },
  contatoInfo: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  contatoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, marginBottom: 10,
  },
  contatoBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  contatoTexto: { fontSize: 13, textAlign: 'center' },
  footer: {
    padding: 20, paddingBottom: 36,
    borderTopWidth: 1,
  },
  applyBtn: {
    flexDirection: 'row', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
