import { View, Text } from "react-native";
import SafeScreen from "@/shared/layouts/SafeLayout";

export default function HomeScreen() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-h1 text-center">Home Screen</Text>
        <Text className="text-base text-text-muted text-center mt-2">
          Welcome to ShadowSpeak!
        </Text>
      </View>
    </SafeScreen>
  );
}
