import "../../global.css";
import "react-native-gesture-handler";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthManager } from "@/features/auth/store/AuthManager";
import { shadowspeakTheme } from "@/theme";

export default function RootLayout() {
  useEffect(() => {
    void AuthManager.getInstance().loadFromStorage();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={shadowspeakTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
