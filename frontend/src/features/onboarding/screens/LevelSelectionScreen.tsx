import { useState } from "react";
import { View } from "react-native";

import { assets } from "@/assets";
import OnboardingLayout from "../components/OnboardingLayout";
import SelectableCard from "../components/SelectableCard";

const levels = [
  { id: "beginner", title: "Beginner", image: assets.onboarding.levelBeginner },
  {
    id: "intermediate",
    title: "Intermediate",
    image: assets.onboarding.levelIntermediate,
  },
  { id: "advanced", title: "Advanced", image: assets.onboarding.levelAdvanced },
] as const;

export default function LevelSelectionScreen() {
  const [selected, setSelected] = useState<string>("beginner");

  const actions = [
    {
      label: "Continue",
      onPress: () =>
        console.log(`LevelSelection: Continue pressed with ${selected}`),
    },
  ];

  return (
    <OnboardingLayout
      variant="hero"
      source={assets.badges.brandWaveformNeutral}
      title="Level Selection"
      subtitle="Choose the option that best describes your current English speaking level."
      heroSize="sm"
      bodyCentered={false}
      actions={actions}
    >
      <View className="gap-3 mt-6">
        {levels.map((level) => (
          <SelectableCard
            key={level.id}
            image={level.image}
            title={level.title}
            selected={selected === level.id}
            onPress={() => {
              setSelected(level.id);
              console.log(`LevelSelection: selected ${level.id}`);
            }}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}
