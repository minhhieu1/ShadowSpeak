import { View } from "react-native";

import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

export type GenericFallbackErrorScreenProps = {
  onRetry?: () => void | Promise<void>;
  onReturnHome?: () => void;
  errorCode?: string;
  supportEmail?: string;
};

export default function GenericFallbackErrorScreen({
  errorCode = "0x000F",
}: GenericFallbackErrorScreenProps) {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: icons.BUG_OUTLINE,
      iconColor: colors.secondary,
      title: `Error ${errorCode}`,
    },
  ];

  const actions = [
    {
      label: "Try again",
      onPress: () => console.log("[GenericFallback] Try again pressed"),
      icon: icons.REFRESH,
      className: "bg-primary rounded-card",
    },
    {
      label: "Return home",
      onPress: () => console.log("[GenericFallback] Return home pressed"),
      icon: icons.HOME_OUTLINE,
      className: "border border-primary rounded-card bg-transparent",
      labelStyle: {
        color: colors.primary,
      },
    },
  ];

  return (
    <ErrorScreenLayout
      title="Something went wrong"
      description="We hit an unexpected problem. Your progress is saved — try again, or return home."
      illustration={assets.illustrations.genericFallback}
    >
      <View className="flex-1 justify-between">
        <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />
        <ErrorActions actions={actions} />
      </View>
    </ErrorScreenLayout>
  );
}
