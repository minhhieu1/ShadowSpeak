import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "react-native-paper";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import ToggleCard from "../components/ToggleCard";
import { saveReminder, saveOnboardingStep } from "../services/onboardingApi";
import { useOnboardingStore } from "../stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "../services/errorHandler";

import { shadowspeakTheme } from "@/theme";

export default function ReminderSetupScreen() {
  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { colors } = shadowspeakTheme;
  const setStep = useOnboardingStore((state) => state.setStep);

  const formatNumber = (n: number) => n.toString().padStart(2, "0");
  const reminderTime = `${formatNumber(hour)}:${formatNumber(minute)}`;

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Save reminder time (or null if disabled)
      await saveReminder(enabled ? reminderTime : null);

      // Update onboarding step
      await saveOnboardingStep("reminder_set");
      setStep("reminder_set");

      // Navigate to permission prompts
      router.replace("/(onboarding)/permission-prompts" as any);
    } catch (err) {
      console.error("[ReminderSetupScreen] Failed to save reminder", err);
      const category = getErrorCategory(err);

      if (category === "network" || category === "server") {
        setError("Connection issue. Please try again.");
      } else {
        handleOnboardingError(err, { errorCode: "SAVE_REMINDER" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip without saving
    router.replace("/(onboarding)/permission-prompts" as any);
  };

  const actions = [
    {
      label: isLoading ? "Saving..." : "Continue",
      onPress: handleContinue,
      disabled: isLoading,
      loading: isLoading,
    },
    {
      label: "Skip reminders",
      mode: "outlined" as const,
      onPress: handleSkip,
      disabled: isLoading,
    },
  ];

  return (
    <OnboardingLayout
      source={assets.badges.brandWaveformNeutral}
      title="Reminder Setup"
      subtitle="Set a daily reminder to keep your shadowing streak strong."
      heroSize="sm"
      bodyCentered={false}
      actions={actions}
    >
      <View className="gap-3 mt-6">
        <ToggleCard
          icon="bell"
          title="Daily reminder"
          description="Get a nudge at the same time every day."
          value={enabled}
          onValueChange={setEnabled}
          disabled={isLoading}
        />

        {enabled ? (
          <View className="bg-surface rounded-card p-4 flex-row items-center justify-center">
            <PressableNumber
              value={formatNumber(hour)}
              onPress={() => {
                const next = hour >= 23 ? 0 : hour + 1;
                setHour(next);
              }}
            />
            <Text className="text-h1 text-primary mx-2">:</Text>
            <PressableNumber
              value={formatNumber(minute)}
              onPress={() => {
                const next = minute >= 59 ? 0 : minute + 1;
                setMinute(next);
              }}
            />
          </View>
        ) : null}

        <View className="flex-row items-center mt-2">
          <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
            <Icon source="clock-outline" size={18} color={colors.primary} />
          </View>
          <Text className="flex-1 text-sm text-text-muted leading-relaxed">
            Reminders are scheduled based on your local device time.
          </Text>
        </View>

        {error && (
          <View className="bg-error/10 rounded-card p-4">
            <Text className="text-error text-sm">{error}</Text>
          </View>
        )}
      </View>
    </OnboardingLayout>
  );
}

type PressableNumberProps = {
  value: string;
  onPress: () => void;
};

function PressableNumber({ value, onPress }: PressableNumberProps) {
  return (
    <Pressable
      className="bg-surface-alt rounded-control px-4 py-3 mx-1 min-w-[64px] items-center"
      accessibilityRole="button"
      accessibilityLabel={`Time value ${value}`}
      accessibilityHint="Tap to increase by one"
      onPress={onPress}
    >
      <Text className="text-h1 text-primary font-semibold">{value}</Text>
    </Pressable>
  );
}
