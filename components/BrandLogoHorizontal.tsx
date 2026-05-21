import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export function BrandLogoHorizontal() {
  // Define uma largura segura baseada nas margens laterais de 24px da tela (48px total de respiro)
  const targetWidth = screenWidth - 48;

  // Calcula a altura mantendo estritamente a proporção original do arquivo (931x131)
  const targetHeight = targetWidth * (131 / 931);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo_workconnect_hrz.png")}
        style={[styles.logo, { width: targetWidth, height: targetHeight }]}
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="Logomarca Horizontal WorkConnect"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
  logo: {
    // Dimensões dinâmicas aplicadas inline para respeitar o aspecto de 931px x 131px
  },
});
