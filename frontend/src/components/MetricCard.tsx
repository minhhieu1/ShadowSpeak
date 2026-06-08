import { Text, View } from "react-native";

export function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-card p-4">
      <Text className="text-h1 text-primary">{value}</Text>
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  );
}
