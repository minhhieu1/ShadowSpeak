import { useState } from "react";
import { View, Text, Pressable } from "react-native";

import { assets } from "@/assets";
import OnboardingLayout from "@/features/onboarding/components/OnboardingLayout";
import LabeledInput from "../components/LabeledInput";
import PasswordInput from "../components/PasswordInput";
import SocialSignInButton from "../components/SocialSignInButton";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const actions = [
    {
      label: "Sign In",
      onPress: () => console.log("SignIn: Sign In pressed"),
    },
  ];

  return (
    <OnboardingLayout
      variant="form"
      source={assets.badges.brandWaveformNeutral}
      title="Sign In"
      subtitle="Welcome back! Sign in to continue your shadowing practice."
      heroSize="sm"
      bodyCentered={false}
      bodyGrow={false}
      actions={actions}
      footerTopSpacing={false}
      footerChildren={
        <Pressable
          onPress={() => console.log("SignIn: Create account pressed")}
          className="items-center mt-4 mb-2"
        >
          <Text className="text-base text-text-muted">
            Don't have an account?{" "}
            <Text className="text-primary font-semibold">Create account</Text>
          </Text>
        </Pressable>
      }
    >
      <View className="mt-6">
        <LabeledInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            console.log("SignIn: email changed");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<LabeledInput.Icon icon="email-outline" />}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            console.log("SignIn: password changed");
          }}
        />
        <Pressable
          onPress={() => console.log("SignIn: Forgot password pressed")}
          className="self-end mb-4"
        >
          <Text className="text-base text-primary">Forgot password?</Text>
        </Pressable>

        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-3 text-sm text-text-muted uppercase tracking-wider">
            or continue with
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <SocialSignInButton
          provider="google"
          mode="signin"
          onPress={() => console.log("SignIn: Continue with Google pressed")}
        />
        <SocialSignInButton
          provider="apple"
          mode="signin"
          onPress={() => console.log("SignIn: Sign in with Apple pressed")}
        />
        <SocialSignInButton
          provider="email"
          mode="signin"
          onPress={() => console.log("SignIn: Continue with Email pressed")}
        />
      </View>
    </OnboardingLayout>
  );
}
