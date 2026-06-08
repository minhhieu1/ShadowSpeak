import { Text, View } from "react-native";

export function WaveformPreview() {
  const bars = [18, 34, 24, 52, 40, 28, 46, 22, 32, 16];

  return (
    <View className="bg-surface border border-border rounded-card gap-3 p-4">
      <Text className="text-base font-medium text-text">Practice waveform</Text>
      <View className="h-[72px] flex-row items-center justify-between">
        {bars.map((height, index) => (
          <View
            key={`${height}-${index}`}
            className="w-[14px] rounded-full bg-primary"
            style={{ height }}
          />
        ))}
      </View>
    </View>
  );
}
