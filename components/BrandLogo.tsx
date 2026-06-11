import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { useTheme } from '../src/theme/ThemeContext';

type BrandLogoProps = {
  compact?: boolean;
  color?: string;
  size?: number;
};

export function BrandLogo({ compact = false, color, size }: BrandLogoProps) {
  const { colors } = useTheme();

  const finalSize = size || 15;
  const symbolColor = color || colors.textPrimary; 

  return (
    <View style={styles.container}>
      <Svg width={finalSize} height={finalSize} viewBox="0 0 100 100">
        <Rect x="20" y="20" width="60" height="12" fill={symbolColor} />
        <Path d="M 35 80 v -28 a 16 16 0 0 1 16 -16 h 29 v 12 h -29 a 4 4 0 0 0 -4 4 v 28 Z" fill={symbolColor} />
      </Svg>
      {!compact && (
        <Text style={[styles.logoText, { color: colors.textPrimary }]}>
          Tech<Text style={{ color: colors.primary }}>Connect</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 15, 
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    letterSpacing: -0.5,
  },
});
