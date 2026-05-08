import { StyleSheet, Text, View } from 'react-native';

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.mark, compact && styles.compactMark]}>
        <View style={[styles.circle, styles.greenCircle]} />
        <View style={[styles.circle, styles.purpleCircle]} />
        <Text style={[styles.markText, compact && styles.compactMarkText]}>W</Text>
      </View>
      {!compact && (
        <Text style={styles.logoText}>
          Work<Text style={styles.logoTextHighlight}>Connect</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compactMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  circle: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.95,
  },
  greenCircle: {
    left: 10,
    top: 12,
    backgroundColor: '#2E9D4D',
  },
  purpleCircle: {
    right: 10,
    bottom: 12,
    backgroundColor: '#6A3093',
  },
  markText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  compactMarkText: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#312651',
  },
  logoTextHighlight: {
    color: '#2E9D4D',
  },
});
