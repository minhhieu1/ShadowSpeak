import { View } from "react-native";

import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

export type PermissionRecoveryScreenProps = {
  onOpenSettings?: () => void;
  onNotNow?: () => void;
};

export default function PermissionRecoveryScreen({}: PermissionRecoveryScreenProps) {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: "microphone" as const,
      iconColor: colors.onBackground,
      title: "Microphone: needed for recording",
      subtitle: "Denied",
    },
    {
      icon: "bell-outline" as const,
      iconColor: colors.onBackground,
      title: "Notifications: needed for reminders",
      subtitle: "Denied",
    },
  ];

  const actions = [
    {
      label: "Open Settings",
      onPress: () => console.log("[PermissionRecovery] Open Settings pressed"),
      icon: "cog" as const,
      className: "bg-primary rounded-card",
    },
    {
      label: "Not now",
      onPress: () => console.log("[PermissionRecovery] Not now pressed"),
      icon: "close" as const,
      className: "border border-primary rounded-card bg-transparent",
      labelStyle: {
        color: colors.primary,
      },
    },
  ];

  return (
    <ErrorScreenLayout
      title="Permission is turned off"
      description="Turn it back on in Settings so ShadowSpeak can support your practice routine."
      illustration={assets.illustrations.permissionRecovery}
    >
      <View className="flex-1 justify-between">
        <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />

        <ErrorActions actions={actions} />
      </View>
    </ErrorScreenLayout>
  );
}
