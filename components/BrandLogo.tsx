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

  const finalSize = size || (compact ? 28 : 42); 
  const symbolColor = color || colors.textPrimary; 

  return (
    <View style={styles.container}>
      <Svg width={finalSize} height={finalSize} viewBox="0 0 100 100">
        <Rect x="25" y="28" width="55" height="12" fill={symbolColor} />
        <Path d="M35 46 h45 v12 h-25 q-8 0 -8 8 v24 h-12 z" fill={symbolColor} />
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
    fontSize: 28, 
    fontWeight: '800',
    fontFamily: 'DMSans_800ExtraBold',
    letterSpacing: -0.5,
  },
});
