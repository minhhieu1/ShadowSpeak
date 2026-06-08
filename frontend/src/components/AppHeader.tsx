import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { assets } from "@/assets";

export function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center gap-3">
        <Image
          source={assets.logos.brandWaveformMark}
          className="w-11 h-11"
          resizeMode="contain"
        />
        <View>
          <Text className="text-h3 text-text">ShadowSpeak</Text>
          <Text className="text-xs text-text-muted uppercase">Listen. Shadow. Improve.</Text>
        </View>
      </View>
      <View className="bg-surface border border-border rounded-full px-3 py-2">
        <Text className="text-xs font-medium text-secondary">3 day</Text>
      </View>
    </View>
  );
}
