import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeContext';
import { useRouter } from 'expo-router';

export interface VagaCardProps {
  id: string;
  titulo: string;
  empresa: string;
  localOuContrato: string; // Pode ser "São Paulo, Brasil 🇧🇷" ou "CLT"
  salarioOuFonte: string;  // Pode ser "R$ 5.000" ou "RemoteOK"
  isExterna: boolean;
  tipoOuIcone: string;     // Para internas: "recrutador"|"freelancer". Para externas: o nome do ícone
  tags: string[];          // Ex: "Remoto", "Pleno"
  tempoRelativo: string;   // Ex: "há 5h", "há 2 dias"
  onToggleFavorito?: () => void;
  isFavorito?: boolean;
  salvandoFav?: boolean;
  userId?: string;
  linkExterna?: string;
}

export function VagaCard({
  id, titulo, empresa, localOuContrato, salarioOuFonte, isExterna,
  tipoOuIcone, tags, tempoRelativo, onToggleFavorito, isFavorito, salvandoFav, userId, linkExterna
}: VagaCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (isExterna && linkExterna) {
      router.push(`/job/${id}`);
    } else {
      router.push(`/job/${id}`);
    }
  };

  // Cores dinâmicas
  let corIcone = colors.primary;
  let bgIcone = colors.primaryLight;
  let iconeName: any = 'briefcase';

  if (isExterna) {
    if (tipoOuIcone === 'github') { corIcone = '#24292e'; iconeName = 'github'; }
    else if (tipoOuIcone === 'laptop') { corIcone = '#0ea5e9'; iconeName = 'laptop'; }
    else if (tipoOuIcone === 'globe') { corIcone = '#4f46e5'; iconeName = 'globe'; }
    else if (tipoOuIcone === 'search') { corIcone = '#2196F3'; iconeName = 'search'; }
    else { corIcone = '#FF5A5F'; iconeName = 'briefcase'; } // Arbeitnow
    bgIcone = corIcone + '18';
  } else {
    if (tipoOuIcone === 'freelancer') {
      corIcone = colors.secondary;
      bgIcone = colors.secondaryLight;
      iconeName = 'briefcase';
    } else {
      corIcone = colors.primary;
      bgIcone = colors.primaryLight;
      iconeName = 'building';
    }
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: bgIcone }]}>
          <FontAwesome name={iconeName} size={20} color={corIcone} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.empresaRow}>
            <Text style={[styles.empresa, { color: colors.textSecondary }]} numberOfLines={1}>
              {empresa || 'Empresa Confidencial'}
            </Text>
            <Text style={[styles.tempo, { color: colors.textSecondary }]}> • {tempoRelativo}</Text>
          </View>
          <Text style={[styles.titulo, { color: colors.textPrimary }]} numberOfLines={2}>{titulo}</Text>
          <View style={styles.localRow}>
            <FontAwesome name={isExterna ? "globe" : "map-marker"} size={12} color={colors.textSecondary} />
            <Text style={[styles.localText, { color: colors.textSecondary }]} numberOfLines={1}>{localOuContrato}</Text>
          </View>
        </View>

        {onToggleFavorito && (
          <TouchableOpacity
            onPress={onToggleFavorito}
            disabled={salvandoFav || !userId}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.coracaoBtn}
          >
            {salvandoFav ? (
              <FontAwesome name="circle-o-notch" size={20} color="#DC2626" />
            ) : (
              <FontAwesome name={isFavorito ? 'heart' : 'heart-o'} size={20} color={isFavorito ? '#DC2626' : colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Tags Customizadas (Apenas 2 ou 3 para não quebrar layout) */}
      {tags && tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((t, idx) => (
            <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.salario, { color: isExterna ? corIcone : colors.secondary }]}>{salarioOuFonte}</Text>
        
        <View style={[styles.tagMatch, { backgroundColor: isExterna ? colors.background : colors.secondaryLight }]}>
          <FontAwesome name={isExterna ? "external-link" : "star"} size={10} color={isExterna ? colors.textSecondary : colors.secondary} />
          <Text style={[styles.tagMatchText, { color: isExterna ? colors.textSecondary : colors.secondary }]}>
            {isExterna ? 'Ver Detalhes' : 'Exclusiva'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empresaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  empresa: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  tempo: {
    fontSize: 11,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  localText: {
    fontSize: 12,
    flexShrink: 1,
  },
  coracaoBtn: {
    padding: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  salario: {
    fontSize: 14,
    fontWeight: '800',
  },
  tagMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagMatchText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
