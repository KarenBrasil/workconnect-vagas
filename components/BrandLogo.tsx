import { Image, StyleSheet, View } from "react-native";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Image
        source={require("../assets/images/logo_workconnect.png")}
        style={compact ? styles.logoCompact : styles.logoDefault}
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="Logomarca WorkConnect"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  compactContainer: {
    alignItems: "flex-start",
  },
  logoDefault: {
    width: 240,
    height: 240, // Dimensão proporcional para destacar o aperto de mãos e o texto abaixo
  },
  logoCompact: {
    width: 140,
    height: 40, // Dimensão reduzida para barras de navegação ou cabeçalhos horizontais
  },
});
