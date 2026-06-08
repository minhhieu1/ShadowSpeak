import { Text, View } from "react-native";

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-h2 text-text">{title}</Text>
      {action ? <Text className="text-sm font-medium text-primary">{action}</Text> : null}
    </View>
  );
}
