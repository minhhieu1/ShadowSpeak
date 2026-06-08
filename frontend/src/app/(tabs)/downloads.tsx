import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { assets } from "@/assets";
import { demoLessons } from "@/data/demoData";
import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { LessonCard } from "@/components/LessonCard";
import { SectionTitle } from "@/components/SectionTitle";

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <SectionTitle title="Offline Library" action="Manage" />
          <InfoCard
            image={assets.badges.practiceOfflineCloud}
            title="Ready offline"
            body="Downloaded lessons and queued progress stay available without a network."
          />
          {demoLessons.slice(0, 2).map((lesson) => (
            <LessonCard key={lesson.lessonId} lesson={lesson} badge="Downloaded" />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
