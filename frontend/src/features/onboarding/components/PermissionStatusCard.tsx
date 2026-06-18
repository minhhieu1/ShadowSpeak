import { Pressable, View, Text } from "react-native";
import { Icon } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type PermissionStatus = "granted" | "optional" | "denied";

type PermissionStatusCardProps = {
  icon: string;
  title: string;
  description: string;
  status: PermissionStatus;
  helperText: string;
  onRequest?: () => void;
  onOpenSettings?: () => void;
};

const statusConfig: Record<
  PermissionStatus,
  {
    label: string;
    bg: string;
    text: string;
    iconColor: string;
    helperIcon: string;
  }
> = {
  granted: {
    label: "Granted",
    bg: "bg-primary",
    text: "text-white",
    iconColor: "#FFFFFF",
    helperIcon: "check-circle",
  },
  optional: {
    label: "Optional",
    bg: "bg-surface-alt",
    text: "text-text",
    iconColor: "#6B7280",
    helperIcon: "information",
  },
  denied: {
    label: "Denied",
    bg: "bg-error/10",
    text: "text-error",
    iconColor: "#C2410C",
    helperIcon: "alert-circle",
  },
};

export default function PermissionStatusCard({
  icon,
  title,
  description,
  status,
  helperText,
  onRequest,
  onOpenSettings,
}: PermissionStatusCardProps) {
  const { colors } = shadowspeakTheme;
  const config = statusConfig[status];

  return (
    <View className="bg-surface rounded-card p-4">
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full bg-secondary/10 items-center justify-center mr-4">
          <Icon source={icon} size={22} color={colors.secondary} />
        </View>
        <View className="flex-1">
          <Text className="text-h3 text-text font-semibold">{title}</Text>
          <Text className="text-sm text-text-muted leading-relaxed mt-0.5">
            {description}
          </Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${config.bg}`} accessibilityRole="none">
          <Text className={`text-xs font-semibold ${config.text}`}>
            {config.label}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-3 pt-3 border-t border-border">
        <Icon source={config.helperIcon} size={16} color={config.iconColor} />
        <Text className="text-sm text-text-muted ml-2 flex-1">
          {helperText}
        </Text>
      </View>

      {onRequest && status === "optional" && (
        <Pressable
          onPress={onRequest}
          className="mt-3 bg-primary/10 rounded-control py-2 items-center"
          accessibilityRole="button"
          accessibilityLabel={`Allow ${title} permission`}
          accessibilityHint={helperText}
        >
          <Text className="text-primary font-semibold">Allow</Text>
        </Pressable>
      )}

      {onOpenSettings && status === "denied" && (
        <Pressable
          onPress={onOpenSettings}
          className="mt-3 bg-error/10 rounded-control py-2 items-center"
          accessibilityRole="button"
          accessibilityLabel={`Open settings to enable ${title}`}
          accessibilityHint="Opens app settings to change permission"
        >
          <Text className="text-error font-semibold">Open Settings</Text>
        </Pressable>
      )}
    </View>
  );
}
