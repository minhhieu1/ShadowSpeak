import { View } from "react-native";

import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCard from "@/shared/components/errors/StatusCard";

export type PermissionRecoveryScreenProps = {
  onOpenSettings?: () => void;
  onNotNow?: () => void;
};

export default function PermissionRecoveryScreen({
  onOpenSettings,
  onNotNow,
}: PermissionRecoveryScreenProps) {
  const { colors } = shadowspeakTheme;

  return (
    <ErrorScreenLayout
      title="Permission is turned off"
      description="Turn it back on in Settings so ShadowSpeak can support your practice routine."
      illustration={assets.illustrations.permissionRecovery}
    >
      <View className="flex-1 justify-between">
        <View className="mt-6 gap-3">
          <StatusCard
            icon="microphone"
            iconColor={colors.onBackground}
            iconContainerClassName="bg-surface-alt p-2 rounded-full"
            title="Microphone: needed for recording"
            subtitle="Denied"
          />
          <StatusCard
            icon="bell-outline"
            iconColor={colors.onBackground}
            iconContainerClassName="bg-surface-alt p-2 rounded-full"
            title="Notifications: needed for reminders"
            subtitle="Denied"
          />
        </View>

        <ErrorActions
          actions={[
            {
              label: "Open Settings",
              onPress: onOpenSettings,
              icon: "cog",
              className: "bg-primary rounded-card",
            },
            {
              label: "Not now",
              onPress: onNotNow,
              className:
                "border border-primary rounded-card bg-transparent",
              labelStyle: {
                color: colors.primary,
              },
            },
          ]}
        />
      </View>
    </ErrorScreenLayout>
  );
}
