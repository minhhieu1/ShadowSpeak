import { Stack } from "expo-router";

export default function LaunchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="screen" />
    </Stack>
  );
}
