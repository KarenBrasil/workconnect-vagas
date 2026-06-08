import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeContext';
import { useRouter } from 'expo-router';

export interface VagaCardProps {
  id: string;
  titulo: string;
  empresa: string;
  localOuContrato: string;
  salarioOuFonte: string;
  isExterna: boolean;
  tipoOuIcone: string;
  tags: string[];
  tempoRelativo: string;
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
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    router.push(`/job/${id}`);
  };

  let corIcone = colors.primary;
  let bgIcone = colors.primaryLight;
  let iconeName: any = 'briefcase';

  if (isExterna) {
    if (tipoOuIcone === 'github') { corIcone = isDark ? '#FFFFFF' : '#24292e'; iconeName = 'github'; }
    else if (tipoOuIcone === 'laptop') { corIcone = '#0ea5e9'; iconeName = 'laptop'; }
    else if (tipoOuIcone === 'globe') { corIcone = '#8B5CF6'; iconeName = 'globe'; }
    else if (tipoOuIcone === 'search') { corIcone = '#22C55E'; iconeName = 'search'; }
    else { corIcone = '#F43F5E'; iconeName = 'briefcase'; }
    bgIcone = corIcone + '15';
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
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: bgIcone }]}>
          <FontAwesome name={iconeName} size={22} color={corIcone} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.empresaRow}>
            <Text style={[styles.empresa, { color: colors.textSecondary }]} numberOfLines={1}>
              {empresa || 'Confidencial'}
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
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.coracaoBtn}
          >
            {salvandoFav ? (
              <FontAwesome name="circle-o-notch" size={22} color="#F43F5E" />
            ) : (
              <FontAwesome name={isFavorito ? 'heart' : 'heart-o'} size={22} color={isFavorito ? '#F43F5E' : colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {tags && tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.slice(0, 3).map((t, idx) => (
            <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.salario, { color: isExterna ? corIcone : colors.secondary }]}>{salarioOuFonte}</Text>
        
        <View style={[styles.tagMatch, { backgroundColor: isExterna ? colors.background : colors.secondaryLight }]}>
          <FontAwesome name={isExterna ? "external-link" : "star"} size={12} color={isExterna ? colors.textSecondary : colors.secondary} />
          <Text style={[styles.tagMatchText, { color: isExterna ? colors.textSecondary : colors.secondary }]}>
            {isExterna ? 'Ver Detalhes' : 'Vaga Exclusiva'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empresaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  empresa: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  tempo: {
    fontSize: 12,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  localText: {
    fontSize: 13,
    flexShrink: 1,
    fontWeight: '500',
  },
  coracaoBtn: {
    padding: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  salario: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tagMatchText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
