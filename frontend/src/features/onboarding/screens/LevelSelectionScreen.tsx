import { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import SelectableCard from "../components/SelectableCard";
import { saveLevel, saveOnboardingStep } from "../services/onboardingApi";
import { useOnboardingStore } from "../stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "../services/errorHandler";

const levels = [
  {
    id: "beginner" as const,
    title: "Beginner",
    image: assets.onboarding.levelBeginner,
  },
  {
    id: "intermediate" as const,
    title: "Intermediate",
    image: assets.onboarding.levelIntermediate,
  },
  {
    id: "advanced" as const,
    title: "Advanced",
    image: assets.onboarding.levelAdvanced,
  },
];

type Level = (typeof levels)[number]["id"];

export default function LevelSelectionScreen() {
  const [selected, setSelected] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStep = useOnboardingStore((state) => state.setStep);

  const handleContinue = async () => {
    if (!selected || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Save level to user profile
      await saveLevel(selected);

      // Update onboarding step
      await saveOnboardingStep("level_selected");
      setStep("level_selected");

      // Navigate to reminder setup
      router.replace("/(onboarding)/reminder-setup" as any);
    } catch (err) {
      console.error("[LevelSelectionScreen] Failed to save level", err);
      const category = getErrorCategory(err);

      if (category === "network" || category === "server") {
        setError("Connection issue. Please try again.");
      } else {
        handleOnboardingError(err, { errorCode: "SAVE_LEVEL" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      label: isLoading ? "Saving..." : "Continue",
      onPress: handleContinue,
      disabled: !selected || isLoading,
      loading: isLoading,
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
            onPress={() => setSelected(level.id)}
          />
        ))}
      </View>

      {error && (
        <View className="bg-error/10 rounded-card p-4 mt-4">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      )}
    </OnboardingLayout>
  );
}
