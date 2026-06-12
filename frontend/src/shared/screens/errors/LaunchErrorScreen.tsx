import { View } from "react-native";

import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

export default function LaunchErrorScreen() {
  const { colors } = shadowspeakTheme;

  const actions = [
    {
      label: "Retry",
      onPress: () => console.log(`[LaunchError] Retry pressed`),
      icon: icons.REFRESH,
      className: "bg-primary rounded-card",
    },
    {
      label: "Contact support",
      onPress: () => console.log(`[LaunchError] Contact support pressed`),
      className: "bg-transparent rounded-card",
    },
  ];

  const cards = [
    {
      icon: icons.CLOCK,
      iconColor: colors.onBackground,
      title: "Try again in a moment.",
      subtitle: "",
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.launchError}
      title="We couldn't start ShadowSpeak"
      description={`Something interrupted the launch.\nYour progress is safe.`}
    >
      <View className="flex-1 justify-between">
        {cards.length > 0 && (
          <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />
        )}
        <ErrorActions actions={actions} />
      </View>
    </ErrorScreenLayout>
  );
}
