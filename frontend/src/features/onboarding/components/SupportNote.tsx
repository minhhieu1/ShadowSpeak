import { View, Text } from "react-native";
import { Icon } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type SupportNoteProps = {
  text: string;
  icon?: string;
};

export default function SupportNote({
  text,
  icon = "shield-check-outline",
}: SupportNoteProps) {
  const { colors } = shadowspeakTheme;

  return (
    <View className="items-center mt-6 px-4">
      <View className="w-12 h-12 rounded-full bg-surface items-center justify-center mb-3">
        <Icon source={icon} size={24} color={colors.primary} />
      </View>
      <Text className="text-center text-sm text-text-muted leading-relaxed">
        {text}
      </Text>
    </View>
  );
}
