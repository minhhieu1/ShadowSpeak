import { router, useLocalSearchParams } from "expo-router";

import LaunchErrorScreen from "@/shared/screens/errors/LaunchErrorScreen";

export default function LaunchErrorRoute() {
  // Re-fetch the previous screen for retry, or go to root
  const handleRetry = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(launch)/launch" as any);
    }
  };

  return <LaunchErrorScreen onRetry={handleRetry} />;
}
