import { router } from "expo-router";

import GenericFallbackErrorScreen from "@/shared/screens/errors/GenericFallbackErrorScreen";

export default function GenericFallbackErrorRoute() {
  return (
    <GenericFallbackErrorScreen
      onRetry={async () => {
        // Simulate a retry, then go back to the previous screen (or home).
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/");
        }
      }}
      onReturnHome={() => {
        router.replace("/");
      }}
    />
  );
}
