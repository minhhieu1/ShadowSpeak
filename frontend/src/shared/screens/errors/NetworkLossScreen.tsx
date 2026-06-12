import { View } from "react-native";

import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

export type NetworkLossScreenProps = {
  downloadCount?: number;
  onRetry?: () => void | Promise<void>;
  onOpenDownloads?: () => void;
};

export default function NetworkLossScreen({
  downloadCount = 0,
}: NetworkLossScreenProps) {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: "check-circle" as const,
      iconColor: colors.success,
      title: `${downloadCount} downloaded lesson${downloadCount === 1 ? "" : "s"} available`,
      subtitle: "Practice can continue offline.",
    },
  ];

  const actions = [
    {
      label: "Open downloads",
      onPress: () => console.log("[NetworkLoss] Open downloads pressed"),
      icon: "download" as const,
      className: "bg-primary rounded-card",
    },
    {
      label: "Retry connection",
      onPress: () => console.log("[NetworkLoss] Retry connection pressed"),
      icon: "refresh" as const,
      className: "border border-primary rounded-card bg-transparent",
      labelStyle: {
        color: colors.primary,
      },
    },
  ];

  return (
    <ErrorScreenLayout
      title="You're offline"
      description="Downloaded lessons still work. We'll reconnect when your network is back."
      illustration={assets.illustrations.networkLoss}
    >
      <View className="flex-1 justify-between">
        <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />

        <ErrorActions actions={actions} />
      </View>
    </ErrorScreenLayout>
  );
}
