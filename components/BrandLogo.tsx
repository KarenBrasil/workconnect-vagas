import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { COLORS } from './ui/Colors';

type BrandLogoProps = {
  compact?: boolean;
  color?: string;
  size?: number;
};

export function BrandLogo({ compact = false, color = '#111111', size }: BrandLogoProps) {
  const finalSize = size || (compact ? 36 : 72);
  
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Svg width={finalSize} height={finalSize} viewBox="0 0 100 100">
        <Rect x="25" y="28" width="55" height="12" fill={color} />
        <Path d="M35 46 h45 v12 h-25 q-8 0 -8 8 v24 h-12 z" fill={color} />
      </Svg>
      {!compact && (
        <Text style={styles.logoText}>
          Tech<Text style={[styles.logoTextHighlight, { color }]}>Connect</Text>
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
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#312651',
  },
  logoTextHighlight: {
    color: '#111111',
  },
});
