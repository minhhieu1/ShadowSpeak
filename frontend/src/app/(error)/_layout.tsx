import { Stack } from "expo-router";

export default function ErrorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="audio-load-failure" />
    </Stack>
  );
}
