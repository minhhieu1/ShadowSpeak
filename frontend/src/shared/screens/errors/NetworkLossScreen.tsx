import { View } from "react-native";

import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

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
      icon: icons.CHECK_CIRCLE,
      iconColor: colors.success,
      title: `${downloadCount} downloaded lesson${downloadCount === 1 ? "" : "s"} available`,
      subtitle: "Practice can continue offline.",
    },
  ];

  const actions = [
    {
      label: "Open downloads",
      onPress: () => console.log("[NetworkLoss] Open downloads pressed"),
      icon: icons.DOWNLOAD,
      className: "bg-primary rounded-card",
    },
    {
      label: "Retry connection",
      onPress: () => console.log("[NetworkLoss] Retry connection pressed"),
      icon: icons.REFRESH,
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
      cards={cards}
      actions={actions}
    />
  );
}
