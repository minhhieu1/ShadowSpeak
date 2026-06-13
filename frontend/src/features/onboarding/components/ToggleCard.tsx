import { View, Text } from "react-native";
import { Switch, Icon } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type ToggleCardProps = {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  required?: boolean;
  disabled?: boolean;
};

export default function ToggleCard({
  icon,
  title,
  description,
  value,
  onValueChange,
  required = false,
  disabled = false,
}: ToggleCardProps) {
  const { colors } = shadowspeakTheme;

  return (
    <View className="bg-surface rounded-card p-4 flex-row items-center">
      <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-4">
        <Icon source={icon} size={22} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-h3 text-text font-semibold">{title}</Text>
        <Text className="text-sm text-text-muted leading-relaxed mt-1">
          {description}
        </Text>
        {required ? (
          <View className="flex-row items-center mt-2">
            <Icon source="check-circle" size={14} color={colors.secondary} />
            <Text className="text-sm text-secondary ml-1">Required</Text>
          </View>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        color={colors.primary}
      />
    </View>
  );
}
