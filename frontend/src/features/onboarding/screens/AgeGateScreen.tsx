import { useState } from "react";
import { Pressable, View, Text, ActivityIndicator } from "react-native";
import { Icon } from "react-native-paper";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import SupportNote from "../components/SupportNote";
import { useConsentStore } from "../stores/consentStore";
import { useOnboardingStore } from "../stores/onboardingStore";
import { submitConsent } from "../services/onboardingApi";
import {
  handleOnboardingError,
  getErrorCategory,
} from "../services/errorHandler";

import { shadowspeakTheme } from "@/theme";

export default function AgeGateScreen() {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { colors } = shadowspeakTheme;
  const setAgeVerified = useConsentStore((state) => state.setAgeVerified);
  const deviceId = useConsentStore((state) => state.deviceId);
  const setStep = useOnboardingStore((state) => state.setStep);

  const handleContinue = async () => {
    if (!confirmed || !deviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Submit age verification to backend
      const consentState = await submitConsent(
        { ageVerified: confirmed },
        deviceId,
      );

      // Update local stores
      setAgeVerified(consentState.ageVerified);

      // Check if user is under-age (blocked)
      if (!consentState.ageVerified) {
        router.replace("/(onboarding)/age-policy-block" as any);
        return;
      }

      // Update onboarding step and navigate to consent
      setStep("age_gate_done");
      router.replace("/(onboarding)/consent" as any);
    } catch (err) {
      console.error("[AgeGateScreen] Failed to submit age verification", err);
      const category = getErrorCategory(err);

      // Validation errors are inline (user can correct and retry)
      if (category === "validation") {
        setError("Please check your selection and try again.");
      } else if (category === "network" || category === "server") {
        // Inline retry for transient errors
        setError("Connection issue. Please try again.");
      } else {
        // Hard errors → navigate to error screen
        handleOnboardingError(err, { errorCode: "AGE_GATE" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    // Exit the app or go back to launch
    handleOnboardingError(new Error("User exited"), { errorCode: "USER_EXIT" });
  };

  const actions = [
    {
      label: isLoading ? "Submitting..." : "Continue",
      onPress: handleContinue,
      disabled: !confirmed || isLoading,
      loading: isLoading,
    },
    {
      label: "Exit / Support",
      mode: "outlined" as const,
      onPress: handleExit,
      disabled: isLoading,
    },
  ];

  return (
    <OnboardingLayout
      variant="hero"
      showHeader={false}
      source={assets.badges.brandWaveformNeutral}
      title="Age Gate"
      subtitle="ShadowSpeak is intended for learners aged 13 and above."
      heroSize="md"
      actions={actions}
    >
      <Pressable
        onPress={() => setConfirmed((prev) => !prev)}
        className="flex-row items-center bg-surface rounded-card p-4 mt-6"
        disabled={isLoading}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: confirmed }}
        accessibilityLabel="I confirm I am 13 years of age or older"
        accessibilityHint="Check to confirm you are 13 or older, then tap Continue"
      >
        <View
          className={`w-7 h-7 rounded-lg border-2 items-center justify-center mr-4 ${
            confirmed
              ? "bg-primary border-primary"
              : "border-primary bg-transparent"
          }`}
          accessibilityRole="none"
        >
          {confirmed ? (
            <Icon source="check" size={18} color={colors.onPrimary} />
          ) : null}
        </View>
        <Text className="flex-1 text-base text-text">
          I confirm I am 13 years of age or older.
        </Text>
      </Pressable>

      {error && (
        <View className="bg-error/10 rounded-card p-4 mt-4">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      )}

      <SupportNote text="We're here to support your learning journey in a safe and positive environment." />
    </OnboardingLayout>
  );
}
