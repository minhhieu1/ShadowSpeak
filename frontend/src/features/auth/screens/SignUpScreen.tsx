import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "react-native-paper";

import { assets } from "@/assets";
import OnboardingLayout from "@/features/onboarding/components/OnboardingLayout";
import LabeledInput from "../components/LabeledInput";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthBar from "../components/PasswordStrengthBar";

import { shadowspeakTheme } from "@/theme";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { colors } = shadowspeakTheme;

  const actions = [
    {
      label: "Create Account",
      onPress: () => console.log("SignUp: Create Account pressed"),
    },
    {
      label: "Already have account? Sign In",
      mode: "outlined" as const,
      onPress: () => console.log("SignUp: Sign In pressed"),
    },
  ];

  return (
    <OnboardingLayout
      variant="form"
      source={assets.badges.brandWaveformNeutral}
      title="Sign Up"
      subtitle="Create your ShadowSpeak account and start your shadowing journey."
      heroSize="sm"
      bodyCentered={false}
      bodyGrow={false}
      actions={actions}
    >
      <View className="mt-6">
        <LabeledInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            console.log("SignUp: email changed");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<LabeledInput.Icon icon="email-outline" />}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            console.log("SignUp: password changed");
          }}
        />
        <PasswordStrengthBar strength="fair" />
        <PasswordInput
          label="Confirm password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            console.log("SignUp: confirm password changed");
          }}
        />

        <View className="flex-row items-start mt-2 mb-4">
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
            <Icon source="shield-check" size={18} color={colors.primary} />
          </View>
          <Text className="flex-1 text-sm text-text-muted leading-relaxed">
            By creating an account, you agree to our{" "}
            <Text
              className="text-primary font-semibold"
              onPress={() => console.log("SignUp: Terms of Use pressed")}
            >
              Terms of Use
            </Text>{" "}
            and acknowledge our{" "}
            <Text
              className="text-primary font-semibold"
              onPress={() => console.log("SignUp: Privacy Policy pressed")}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
