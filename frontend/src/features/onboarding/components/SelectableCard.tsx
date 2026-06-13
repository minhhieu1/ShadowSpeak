import { Pressable, View, Text } from "react-native";
import { Icon } from "react-native-paper";

import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";
import { shadowspeakTheme } from "@/theme";

type SelectableCardProps = {
  image: { uri: string } | number;
  title: string;
  selected: boolean;
  onPress: () => void;
};

export default function SelectableCard({
  image,
  title,
  selected,
  onPress,
}: SelectableCardProps) {
  const { colors } = shadowspeakTheme;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center bg-surface rounded-card p-4 border-2 ${
        selected ? "border-primary" : "border-transparent"
      }`}
    >
      <View className="w-14 h-14 rounded-full bg-surface-alt items-center justify-center overflow-hidden mr-4">
        <IllustrationBlock source={image} width={48} height={48} />
      </View>
      <Text className="flex-1 text-h3 text-text font-semibold">{title}</Text>
      <View
        className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
          selected
            ? "bg-primary border-primary"
            : "border-border bg-transparent"
        }`}
      >
        {selected ? (
          <Icon source="check" size={18} color={colors.onPrimary} />
        ) : null}
      </View>
    </Pressable>
  );
}
