import { View, Text } from "react-native";

import { assets } from "@/assets";
import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import StatusCards from "@/shared/components/errors/StatusCards";
import ErrorActions from "@/shared/components/errors/ErrorActions";

const { colors } = shadowspeakTheme;

export default function RecordingUnavailableScreen() {
  const cards = [
    {
      icon: icons.MICROPHONE_OFF,
      iconColor: colors.error,
      title: "Microphone access may be off",
    },
    {
      icon: icons.CHECK_CIRCLE,
      iconColor: colors.success,
      title: "Your lesson position is saved",
    },
  ];

  const actions = [
    {
      label: "Open Settings",
      onPress: () =>
        console.log("[RecordingUnavailable] Open Settings pressed"),
      icon: icons.COG,
      mode: "contained" as const,
      className: "bg-primary",
    },
    {
      label: "Continue listening",
      onPress: () =>
        console.log("[RecordingUnavailable] Continue listening pressed"),
      icon: icons.HEADPHONES,
      mode: "outlined" as const,
      className: "border border-primary bg-transparent",
      labelStyle: { color: colors.primary },
    },
    {
      label: "Try again",
      onPress: () => console.log("[RecordingUnavailable] Try again pressed"),
      icon: icons.REFRESH,
      mode: "outlined" as const,
      className: "border border-primary bg-transparent",
      labelStyle: { color: colors.primary },
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.recordingUnavailable}
      title="Recording isn't available"
      description={`Check your microphone access\nor continue listening for now.`}
    >
      <StatusCards wrapperClassName="mt-5 gap-3" cards={cards} />

      <ErrorActions actions={actions} />
    </ErrorScreenLayout>
  );
}
