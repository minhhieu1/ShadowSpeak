import { View } from "react-native";

import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

export default function SafeExitScreen() {
  const { colors } = shadowspeakTheme;

  const actions = [
    {
      label: "Exit this flow",
      onPress: () => console.log(`[SafeExit] Exit flow pressed`),
      icon: icons.CLOSE,
      className: "bg-primary rounded-card",
    },
    {
      label: "Return home",
      onPress: () => console.log(`[SafeExit] Return home pressed`),
      icon: icons.HOME_OUTLINE,
      className: "border border-primary rounded-card bg-transparent",
    },
  ];

  const cards = [
    {
      icon: icons.SHIELD_CHECK,
      iconColor: colors.onBackground,
      title: "Your progress stays safe on this device whenever possible.",
      subtitle: "",
    },
    {
      icon: icons.INFO_OUTLINE,
      iconColor: colors.onBackground,
      title: "If this keeps happening, restart the app and try again.",
      subtitle: "",
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.safeExit}
      title="You can exit safely"
      description={`This step can't continue right now.\nYou can close this flow and come back later.`}
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
