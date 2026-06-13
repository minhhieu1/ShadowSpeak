import { View } from "react-native";

import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

export type PermissionRecoveryScreenProps = {
  onOpenSettings?: () => void;
  onNotNow?: () => void;
};

export default function PermissionRecoveryScreen({}: PermissionRecoveryScreenProps) {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: icons.MICROPHONE,
      iconColor: colors.onBackground,
      title: "Microphone: needed for recording",
      subtitle: "Denied",
    },
    {
      icon: icons.BELL_OUTLINE,
      iconColor: colors.onBackground,
      title: "Notifications: needed for reminders",
      subtitle: "Denied",
    },
  ];

  const actions = [
    {
      label: "Open Settings",
      onPress: () => console.log("[PermissionRecovery] Open Settings pressed"),
      icon: icons.COG,
      className: "bg-primary rounded-card",
    },
    {
      label: "Not now",
      onPress: () => console.log("[PermissionRecovery] Not now pressed"),
      icon: icons.CLOSE,
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
      cards={cards}
      actions={actions}
    />
  );
}
