import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import ToggleCard from "../components/ToggleCard";
import { useConsentStore } from "../stores/consentStore";
import { useOnboardingStore } from "../stores/onboardingStore";
import { submitConsent } from "../services/onboardingApi";
import {
  handleOnboardingError,
  getErrorCategory,
} from "../services/errorHandler";

export default function ConsentScreen() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageVerified = useConsentStore((state) => state.ageVerified);
  const setPrivacyAcceptedStore = useConsentStore(
    (state) => state.setPrivacyAccepted,
  );
  const setAdConsentStore = useConsentStore((state) => state.setAdConsent);
  const setConsent = useConsentStore((state) => state.setConsent);
  const deviceId = useConsentStore((state) => state.deviceId);
  const setStep = useOnboardingStore((state) => state.setStep);

  // Guard: must complete age gate before accessing consent
  useEffect(() => {
    if (!ageVerified) {
      router.replace("/(onboarding)/age-gate" as any);
    }
  }, [ageVerified]);

  const handleAccept = async () => {
    if (!deviceId) {
      setError("Device ID not loaded. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const adConsent = personalizedAds ? "personalized" : "non_personalized";

      // Submit consent to backend
      const response = await submitConsent(
        {
          privacyAccepted: true,
          adConsent,
        },
        deviceId,
      );

      // Update local stores
      setConsent(response);
      setPrivacyAcceptedStore(true);
      setAdConsentStore(adConsent);

      // Update onboarding step and navigate to sign-in
      setStep("consent_done");
      router.replace("/(onboarding)/sign-in" as any);
    } catch (err) {
      console.error("[ConsentScreen] Failed to submit consent", err);
      const category = getErrorCategory(err);

      if (category === "validation") {
        setError("Please check your selection and try again.");
      } else if (category === "network" || category === "server") {
        setError("Connection issue. Please try again.");
      } else {
        handleOnboardingError(err, { errorCode: "CONSENT" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    // Decline routes to age-policy-block (required consent not given)
    router.replace("/(onboarding)/age-policy-block" as any);
  };

  const actions = [
    {
      label: isLoading ? "Submitting..." : "Accept and Continue",
      onPress: handleAccept,
      disabled: !privacyAccepted || isLoading,
      loading: isLoading,
    },
    {
      label: "Decline and Exit",
      mode: "outlined" as const,
      onPress: handleDecline,
      disabled: isLoading,
    },
  ];

  return (
    <OnboardingLayout
      variant="cards"
      source={assets.onboarding.privacyShield}
      title="Privacy and Ad Consent"
      subtitle=""
      bodyCentered={false}
      actions={actions}
    >
      <View>
        <Text className="text-base text-text-muted text-center">
          <Text style={{ fontWeight: "bold" }}>Your privacy matters.</Text> We
          use your data{"\n"} to keep ShadowSpeak safe and improve{"\n"} your
          experience. You're in control.
        </Text>
      </View>
      <View className="gap-3 mt-6" accessibilityLabel="Consent options">
        <ToggleCard
          icon="shield-check"
          title="Privacy Policy"
          description="I agree to the Privacy Policy and consent to the processing of my data as described."
          value={privacyAccepted}
          onValueChange={setPrivacyAccepted}
          required
          disabled={isLoading}
        />
        <ToggleCard
          icon="bullhorn"
          title="Personalized Ads"
          description="Allow personalized ads to help support ShadowSpeak. You can change this anytime in settings."
          value={personalizedAds}
          onValueChange={setPersonalizedAds}
          disabled={isLoading}
        />
      </View>

      {error && (
        <View className="bg-error/10 rounded-card p-4 mt-4">
          <Text className="text-error text-sm">{error}</Text>
        </View>
      )}
    </OnboardingLayout>
  );
}
