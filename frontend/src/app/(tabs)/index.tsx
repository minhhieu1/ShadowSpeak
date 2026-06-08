import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { assets } from "@/assets";
import { demoLessons } from "@/data/demoData";
import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { MetricCard } from "@/components/MetricCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionTitle } from "@/components/SectionTitle";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const lesson = demoLessons[0];

  return (
    <View className="flex-1 bg-bg">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <View className="min-h-[172px] bg-surface border border-border rounded-card p-4 flex-row items-center overflow-hidden">
            <View className="flex-1 gap-2">
              <Text className="text-xs font-medium text-secondary uppercase">Recommended</Text>
              <Text className="text-display text-text">{lesson.title}</Text>
              <Text className="text-sm text-text-muted">
                {lesson.durationMinutes} min audio-first practice
              </Text>
            </View>
            <Image
              source={assets.badges.brandWaveformNeutral}
              className="w-[118px] h-[118px]"
              resizeMode="contain"
            />
          </View>
          <SectionTitle title="Today" action="View plan" />
          <View className="flex-row gap-3">
            <MetricCard value="10m" label="Daily goal" />
            <MetricCard value="42m" label="This week" />
          </View>
          <PrimaryButton label="Start daily practice" />
          <InfoCard
            image={assets.illustrations.reminder}
            title="Tonight at 19:30"
            body="A local reminder helps turn practice into a quiet habit."
          />
        </View>
      </ScrollView>
    </View>
  );
}
