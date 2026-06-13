import { View } from "react-native";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import PermissionStatusCard from "../components/PermissionStatusCard";

const actions = [
  {
    label: "Continue",
    onPress: () => console.log("PermissionPrompts: Continue pressed"),
  },
  {
    label: "Open Settings",
    mode: "outlined" as const,
    onPress: () => console.log("PermissionPrompts: Open Settings pressed"),
  },
];

export default function PermissionPromptsScreen() {
  return (
    <OnboardingLayout
      variant="cards"
      source={assets.badges.brandWaveformNeutral}
      title="Permission Prompts"
      subtitle="Enable these permissions to get the most out of ShadowSpeak."
      heroSize="sm"
      bodyCentered={false}
      actions={actions}
    >
      <View className="gap-3 mt-6">
        <PermissionStatusCard
          icon="bell"
          title="Notifications"
          description="Daily practice reminders"
          status="granted"
          helperText="You'll get helpful reminders to stay consistent."
        />
        <PermissionStatusCard
          icon="microphone"
          title="Microphone"
          description="Record your shadowing"
          status="optional"
          helperText="Allows you to record and review your practice."
        />
      </View>
    </OnboardingLayout>
  );
}
