import { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import { assets } from "@/assets";

const { width } = Dimensions.get("window");
const logoWidth = width * 0.7;
const logoHeight = logoWidth * 0.5;

export default function LaunchScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(error)/audio-load-failure");
    }, 1000);
    return () => clearTimeout(timer);
  },[]);

  return (
    <View className="flex-1 bg-bg">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 items-center justify-center">
        <Image
          source={assets.logos.splashLockup}
          style={{ width: logoWidth, height: logoHeight }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#0E5A6A" className="mt-10" />
        <Text className="text-base text-text-muted text-center mt-4">
          Checking your setup...
        </Text>
      </View>
    </View>
  );
}
