import { View, Text } from "react-native";

type MessageBlockProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export default function MessageBlock({
  title,
  description,
}: MessageBlockProps) {
  return (
    <View className="items-center">
      <Text className="text-center leading-snug text-primary text-h1 font-bold">
        {title}
      </Text>
      <Text className="text-center leading-relaxed text-text-muted text-base">
        {description}
      </Text>
    </View>
  );
}
