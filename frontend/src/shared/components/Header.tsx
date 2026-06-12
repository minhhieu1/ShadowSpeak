import { View } from "react-native";
import { IconButton } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";
import { router } from "expo-router";

export default function Header() {
  const { colors } = shadowspeakTheme;

  return (
    <View className="h-16 flex-row items-center px-5">
      <IconButton
        icon="arrow-left"
        iconColor={colors.primary}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          }
        }}
        className="-ml-2.5"
      />
    </View>
  );
}
