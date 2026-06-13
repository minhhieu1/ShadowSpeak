import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { Icon } from "react-native-paper";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import SupportNote from "../components/SupportNote";

import { shadowspeakTheme } from "@/theme";

export default function AgeGateScreen() {
  const [confirmed, setConfirmed] = useState(false);
  const { colors } = shadowspeakTheme;

  const actions = [
    {
      label: "Continue",
      onPress: () => console.log("AgeGate: Continue pressed"),
      disabled: !confirmed,
    },
    {
      label: "Exit / Support",
      mode: "outlined" as const,
      onPress: () => console.log("AgeGate: Exit / Support pressed"),
    },
  ];

  return (
    <OnboardingLayout
      variant="hero"
      showHeader={false}
      source={assets.badges.brandWaveformNeutral}
      title="Age Gate"
      subtitle="ShadowSpeak is intended for learners aged 13 and above."
      heroSize="md"
      actions={actions}
    >
      <Pressable
        onPress={() => {
          setConfirmed((prev) => {
            const next = !prev;
            console.log(`AgeGate: checkbox toggled to ${next}`);
            return next;
          });
        }}
        className="flex-row items-center bg-surface rounded-card p-4 mt-6"
      >
        <View
          className={`w-7 h-7 rounded-lg border-2 items-center justify-center mr-4 ${
            confirmed
              ? "bg-primary border-primary"
              : "border-primary bg-transparent"
          }`}
        >
          {confirmed ? (
            <Icon source="check" size={18} color={colors.onPrimary} />
          ) : null}
        </View>
        <Text className="flex-1 text-base text-text">
          I confirm I am 13 years of age or older.
        </Text>
      </Pressable>

      <SupportNote text="We're here to support your learning journey in a safe and positive environment." />
    </OnboardingLayout>
  );
}
