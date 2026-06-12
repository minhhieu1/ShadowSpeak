import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Button } from "react-native-paper";

import { assets } from "@/assets";
import SafeScreen from "@/shared/layouts/SafeLayout";
import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const logoWidth = width * 0.7;
  const logoHeight = logoWidth * 0.5;

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <IllustrationBlock
          source={assets.logos.splashLockup}
          width={logoWidth}
          height={logoHeight}
        />
        <ActivityIndicator size="large" className="mt-10 color-primary" />
        <Text className="text-base text-text-muted text-center mt-4">
          Checking your setup...
        </Text>
      </View>
      <View>
        <Button
          mode="contained"
          onPress={() => router.push("/audio-load-failure")}
        >
          audio-load-failure
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/session-expired")}
        >
          session-expired
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/generic-fallback-error")}
        >
          generic-fallback-error
        </Button>
        <Button mode="contained" onPress={() => router.push("/network-loss")}>
          network-loss
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/permission-recovery")}
        >
          permission-recovery
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/recording-unavailable")}
        >
          recording-unavailable
        </Button>
        <Button mode="contained" onPress={() => router.push("/storage-full")}>
          storage-full
        </Button>
      </View>
    </SafeScreen>
  );
}
