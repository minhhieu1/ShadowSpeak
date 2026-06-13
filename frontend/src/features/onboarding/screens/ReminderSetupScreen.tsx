import { useState } from "react";
import { View, Text } from "react-native";
import { Icon } from "react-native-paper";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import ToggleCard from "../components/ToggleCard";

import { shadowspeakTheme } from "@/theme";

export default function ReminderSetupScreen() {
  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const { colors } = shadowspeakTheme;

  const formatNumber = (n: number) => n.toString().padStart(2, "0");

  const actions = [
    {
      label: "Continue",
      onPress: () => console.log("ReminderSetup: Continue pressed"),
    },
    {
      label: "Skip reminders",
      mode: "outlined" as const,
      onPress: () => console.log("ReminderSetup: Skip reminders pressed"),
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
          onValueChange={(value) => {
            setEnabled(value);
            console.log(`ReminderSetup: daily reminder toggled to ${value}`);
          }}
        />

        {enabled ? (
          <View className="bg-surface rounded-card p-4 flex-row items-center justify-center">
            <PressableNumber
              value={formatNumber(hour)}
              onPress={() => {
                const next = hour >= 12 ? 1 : hour + 1;
                setHour(next);
                console.log(`ReminderSetup: hour changed to ${next}`);
              }}
            />
            <Text className="text-h1 text-primary mx-2">:</Text>
            <PressableNumber
              value={formatNumber(minute)}
              onPress={() => {
                const next = minute >= 59 ? 0 : minute + 1;
                setMinute(next);
                console.log(`ReminderSetup: minute changed to ${next}`);
              }}
            />
            <PressableNumber
              value={period}
              onPress={() => {
                const next = period === "AM" ? "PM" : "AM";
                setPeriod(next);
                console.log(`ReminderSetup: period changed to ${next}`);
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
    <View
      className="bg-surface-alt rounded-control px-4 py-3 mx-1 min-w-[64px] items-center"
      accessibilityRole="button"
      onTouchEnd={onPress}
    >
      <Text className="text-h1 text-primary font-semibold">{value}</Text>
    </View>
  );
}
