import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { demoLessons } from "@/data/demoData";
import { LessonCard } from "@/components/LessonCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";

export default function LessonsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <SectionTitle title="Lessons" action="Filter" />
          <View className="flex-row flex-wrap gap-2">
            {["Beginner", "Travel", "5-10 min"].map((chip) => (
              <View key={chip} className="bg-surface border border-border rounded-full px-3 py-2">
                <Text className="text-xs font-medium text-text">{chip}</Text>
              </View>
            ))}
          </View>
          {demoLessons.map((lesson) => (
            <LessonCard key={lesson.lessonId} lesson={lesson} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
