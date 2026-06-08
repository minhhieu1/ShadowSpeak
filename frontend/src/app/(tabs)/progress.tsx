import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { assets } from "@/assets";
import { demoProgress } from "@/data/demoData";
import { MetricCard } from "@/components/MetricCard";
import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { SectionTitle } from "@/components/SectionTitle";
import { WaveformPreview } from "@/components/WaveformPreview";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <SectionTitle title="Progress" action="History" />
          <View className="flex-row gap-3">
            <MetricCard value={`${demoProgress.streakDays}`} label="Day streak" />
            <MetricCard value={`${demoProgress.minutesPracticed}`} label="Minutes" />
            <MetricCard value={`${demoProgress.completedLessonCount}`} label="Lessons" />
          </View>
          <InfoCard
            image={assets.badges.successStar}
            title="Recording comparison unlocked"
            body="Finish a session to compare native audio with your own recording."
          />
          <WaveformPreview />
        </View>
      </ScrollView>
    </View>
  );
}
