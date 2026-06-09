import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg items-center justify-center" style={{ paddingBottom: insets.bottom }}>
      <Text className="text-h1 text-text">ShadowSpeak</Text>
      <Text className="text-sm text-text-muted mt-2">Listen. Shadow. Improve.</Text>
    </View>
  );
}
