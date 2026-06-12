import { View } from "react-native";
import { useRouter } from "expo-router";

import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCard from "@/shared/components/errors/StatusCard";

export type NetworkLossScreenProps = {
  downloadCount?: number;
  onRetry?: () => void | Promise<void>;
  onOpenDownloads?: () => void;
};

export default function NetworkLossScreen({
  downloadCount = 0,
  onRetry,
  onOpenDownloads,
}: NetworkLossScreenProps) {
  const { colors } = shadowspeakTheme;
  const router = useRouter();

  const handleOpenDownloads = onOpenDownloads ?? (() => router.push("/"));
  const handleRetry =
    onRetry ??
    (() => {
      // TODO: wire up to a global network-check / retry handler
    });

  return (
    <ErrorScreenLayout
      title="You’re offline"
      description="Downloaded lessons still work. We’ll reconnect when your network is back."
      illustration={assets.illustrations.networkLoss}
    >
      <View className="flex-1 justify-between">
        {/* Offline status — only shown when the user has cached lessons */}
        {downloadCount > 0 ? (
          <StatusCard
            icon="check-circle"
            iconColor={colors.success}
            iconContainerClassName="bg-surface-alt p-2 rounded-full"
            title={`${downloadCount} downloaded lesson${downloadCount === 1 ? "" : "s"} available`}
            subtitle="Practice can continue offline."
            containerClassName="mt-6"
          />
        ) : null}

        <ErrorActions
          actions={[
            {
              label: "Open downloads",
              onPress: handleOpenDownloads,
              icon: "download",
              className: "bg-primary rounded-card",
            },
            {
              label: "Retry connection",
              onPress: handleRetry,
              icon: "refresh",
              className: "border border-primary rounded-card bg-transparent",
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
