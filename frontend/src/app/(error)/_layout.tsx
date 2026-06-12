import { Stack } from "expo-router";

export default function ErrorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="audio-load-failure" />
      <Stack.Screen name="session-expired" />
      <Stack.Screen name="generic-fallback-error" />
      <Stack.Screen name="network-loss" />
      <Stack.Screen name="permission-recovery" />
      <Stack.Screen name="recording-unavailable" />
      <Stack.Screen name="storage-full" />
      <Stack.Screen name="retryable-error" />
    </Stack>
  );
}
