import { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Button } from "react-native-paper";

import { assets } from "@/assets";
import SafeScreen from "@/shared/layouts/SafeLayout";
import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";
import { useOnboardingStore } from "@/features/onboarding/stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "@/features/onboarding/services/errorHandler";

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const logoWidth = width * 0.7;
  const logoHeight = logoWidth * 0.5;

  const resolveStartupState = useOnboardingStore(
    (state) => state.resolveStartupState,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const handleStartup = async () => {
      if (hasAttempted) return;

      try {
        setHasAttempted(true);
        setIsLoading(true);
        setLocalError(null);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const route = await resolveStartupState();
        router.replace(route as any);
      } catch (err) {
        console.error("[LaunchScreen] Startup resolution failed", err);
        const category = getErrorCategory(err);

        // Network errors show inline retry; harder errors go to error screen
        if (category === "network" || category === "server") {
          setLocalError("Connection issue. Please try again.");
          setIsLoading(false);
        } else {
          // Navigate to error screen for harder errors
          handleOnboardingError(err, { errorCode: "STARTUP" });
        }
      }
    };

    handleStartup();
  }, [resolveStartupState, hasAttempted]);

  const handleRetry = async () => {
    setIsLoading(true);
    setLocalError(null);
    setHasAttempted(false);
    try {
      const route = await resolveStartupState();
      router.replace(route as any);
    } catch (err) {
      console.error("[LaunchScreen] Retry failed", err);
      const category = getErrorCategory(err);
      if (category === "network" || category === "server") {
        setLocalError("Connection issue. Please try again.");
      } else {
        handleOnboardingError(err, { errorCode: "STARTUP_RETRY" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToErrorScreen = () => {
    // User-initiated navigation to the launch error screen
    router.replace("/launch-error" as any);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        <View className="items-center justify-center py-10">
          <IllustrationBlock
            source={assets.logos.splashLockup}
            width={logoWidth}
            height={logoHeight}
          />

          {isLoading ? (
            <>
              <ActivityIndicator size="large" className="mt-10 color-primary" />
              <Text className="text-base text-text-muted text-center mt-4">
                Checking your setup...
              </Text>
            </>
          ) : localError ? (
            <>
              <Text className="text-h3 text-error text-center mt-10">
                Startup Error
              </Text>
              <Text className="text-base text-text-muted text-center mt-2 px-5">
                {localError}
              </Text>
              <Button
                mode="contained"
                onPress={handleRetry}
                className="mt-6"
                testID="retry-button"
              >
                Retry
              </Button>
              <Button
                mode="outlined"
                onPress={handleGoToErrorScreen}
                className="mt-3"
                testID="error-screen-button"
              >
                View Error Details
              </Button>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
