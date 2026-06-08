import { Image, Text, View } from "react-native";

export function InfoCard({
  image,
  title,
  body,
}: {
  image: number;
  title: string;
  body: string;
}) {
  return (
    <View className="flex-row items-center gap-3 bg-surface border border-border rounded-card p-4">
      <Image source={image} className="w-[76px] h-[76px]" resizeMode="contain" />
      <View className="flex-1 gap-1">
        <Text className="text-base font-medium text-text">{title}</Text>
        <Text className="text-sm text-text-muted">{body}</Text>
      </View>
    </View>
  );
}
