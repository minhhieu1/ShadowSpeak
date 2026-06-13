import { useState } from "react";
import { View, Text } from "react-native";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import ToggleCard from "../components/ToggleCard";

export default function ConsentScreen() {
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(false);

  const actions = [
    {
      label: "Accept and Continue",
      onPress: () => console.log("Consent: Accept and Continue pressed"),
      disabled: !privacyAccepted,
    },
    {
      label: "Decline and Exit",
      mode: "outlined" as const,
      onPress: () => console.log("Consent: Decline and Exit pressed"),
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
        <Text className="text-base text-text-muted  text-center">
          <Text style={{ fontWeight: "bold" }}>Your privacy matters.</Text>
          We use your data{"\n"} to keep ShadowSpeak safe and improve{"\n"}
          your experience. You're in control.
        </Text>
      </View>
      <View className="gap-3 mt-6">
        <ToggleCard
          icon="shield-check"
          title="Privacy Policy"
          description="I agree to the Privacy Policy and consent to the processing of my data as described."
          value={privacyAccepted}
          onValueChange={(value) => {
            setPrivacyAccepted(value);
            console.log(`Consent: Privacy Policy toggled to ${value}`);
          }}
          required
        />
        <ToggleCard
          icon="bullhorn"
          title="Personalized Ads"
          description="Allow personalized ads to help support ShadowSpeak. You can change this anytime in settings."
          value={personalizedAds}
          onValueChange={(value) => {
            setPersonalizedAds(value);
            console.log(`Consent: Personalized Ads toggled to ${value}`);
          }}
        />
      </View>
    </OnboardingLayout>
  );
}
