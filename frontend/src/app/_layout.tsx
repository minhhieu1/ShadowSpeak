import "../../global.css";

// react-native-gesture-handler MUST be the first import for React Navigation
// (used by Expo Router) — gesture and tab navigation depend on it.
import "react-native-gesture-handler";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthManager } from "@/api/http";

export default function RootLayout() {
  // Bootstrap: hydrate the auth token from persistent storage so the first
  // API call (if authenticated) already has a Bearer token available.
  useEffect(() => {
    AuthManager.getInstance().loadFromStorage();
  },[]);

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
