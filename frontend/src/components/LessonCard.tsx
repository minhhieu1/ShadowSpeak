import { Text, View } from "react-native";
import { demoLessons } from "@/data/demoData";

type Lesson = (typeof demoLessons)[number];

export function LessonCard({
  lesson,
  badge,
}: {
  lesson: Lesson;
  badge?: string;
}) {
  return (
    <View className="min-h-[88px] bg-surface border border-border rounded-card flex-row items-center gap-3 p-3">
      <View className="w-[58px] h-[58px] rounded-card bg-[#F4E7D5] items-center justify-center">
        <Text className="text-base font-medium text-secondary">
          {lesson.topic.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-base font-medium text-text">{lesson.title}</Text>
        <Text className="text-xs text-text-muted capitalize">
          {lesson.level} · {lesson.durationMinutes} min · {lesson.lines} lines
        </Text>
      </View>
      {badge ? (
        <View className="bg-[#E8F4F0] rounded-full px-2 py-1">
          <Text className="text-xs font-medium text-success">{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}
