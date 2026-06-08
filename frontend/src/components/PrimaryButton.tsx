import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void | Promise<void>;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || !onPress) return;
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      className={`min-h-[52px] rounded-control items-center justify-center px-4 ${
        loading ? "opacity-60" : ""
      }`}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#0A4652" : "#0E5A6A",
      })}
      onPress={handlePress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color="#FFFFFF" size="small" />
          <Text className="text-base font-medium text-white">{label}</Text>
        </View>
      ) : (
        <Text className="text-base font-medium text-white">{label}</Text>
      )}
    </Pressable>
  );
}
