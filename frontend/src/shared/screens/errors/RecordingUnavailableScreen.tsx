import { View, Text } from "react-native";

import { assets } from "@/assets";
import { shadowspeakTheme } from "@/theme";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import StatusCards from "@/shared/components/errors/StatusCards";
import ErrorActions from "@/shared/components/errors/ErrorActions";

const { colors } = shadowspeakTheme;

export default function RecordingUnavailableScreen() {
  const cards = [
    {
      icon: "microphone-off" as const,
      iconColor: colors.error,
      title: "Microphone access may be off",
    },
    {
      icon: "check-circle" as const,
      iconColor: colors.success,
      title: "Your lesson position is saved",
    },
  ];

  const actions = [
    {
      label: "Open Settings",
      onPress: () =>
        console.log("[RecordingUnavailable] Open Settings pressed"),
      icon: "cog" as const,
      mode: "contained" as const,
      className: "bg-primary",
    },
    {
      label: "Continue listening",
      onPress: () =>
        console.log("[RecordingUnavailable] Continue listening pressed"),
      icon: "headphones" as const,
      mode: "outlined" as const,
      className: "border border-primary bg-transparent",
      labelStyle: { color: colors.primary },
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.recordingUnavailable}
      title="Recording isn't available"
      description="Check your microphone access or continue listening for now."
    >
      <StatusCards wrapperClassName="mt-5 gap-3" cards={cards} />

      <ErrorActions actions={actions} />

      <View className="items-center mt-2 mb-4">
        <Text
          className="text-primary text-base font-semibold"
          onPress={() =>
            console.log("[RecordingUnavailable] Try again pressed")
          }
        >
          Try again
        </Text>
      </View>
    </ErrorScreenLayout>
  );
}
