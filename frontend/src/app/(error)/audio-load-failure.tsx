import { router } from "expo-router";

import AudioLoadFailureScreen from "@/shared/screens/AudioLoadFailureScreen";

export default function AudioLoadFailureRoute() {
  return (
    <AudioLoadFailureScreen
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      onRetry={async () => {
        // Simulate retry delay, then go back
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (router.canGoBack()) {
          router.back();
        }
      }}
      onReturnToLesson={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      lessonTitle="Natural Small Talk"
      lessonSubtitle="at a Cafe"
      lessonDuration="8 min"
      lessonThumbnail={{
        uri: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=144&h=144&fit=crop",
      }}
      progressSaved={true}
    />
  );
}
