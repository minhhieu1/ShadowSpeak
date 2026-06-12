import { View } from "react-native";

import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCard from "@/shared/components/commons/StatusCard";

export type GenericFallbackErrorScreenProps = {
  onRetry?: () => void | Promise<void>;
  onReturnHome?: () => void;
  errorCode?: string;
  supportEmail?: string;
};

export default function GenericFallbackErrorScreen({
  onRetry,
  onReturnHome,
  errorCode = "0x000F",
  supportEmail = "support@shadowspeak.app",
}: GenericFallbackErrorScreenProps) {
  const { colors } = shadowspeakTheme;

  return (
    <ErrorScreenLayout
      title="Something went wrong"
      description="We hit an unexpected problem. Your progress is saved — try again, or return home."
      illustration={assets.illustrations.genericFallback}
    >
      <View className="flex-1 justify-between">
        {/* Error code card */}
        <StatusCard
          icon="bug-outline"
          iconColor={colors.secondary}
          title={`Error ${errorCode}`}
          containerClassName="mt-6"
        />

        <ErrorActions
          actions={[
            {
              label: "Try again",
              onPress: onRetry,
              icon: "refresh",
              className: "bg-primary rounded-card",
            },
            {
              label: "Return home",
              onPress: onReturnHome,
              icon: "home-outline",
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
