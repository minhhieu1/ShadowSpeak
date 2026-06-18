import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "@/features/onboarding/layouts/OnboardingLayout";
import LabeledInput from "../components/LabeledInput";
import PasswordInput from "../components/PasswordInput";
import SocialSignInButton from "../components/SocialSignInButton";
import { isValidEmail } from "@/features/onboarding/types/onboarding";
import { authenticate } from "@/features/onboarding/services/authService";
import { useOnboardingStore } from "@/features/onboarding/stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "@/features/onboarding/services/errorHandler";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const setStep = useOnboardingStore((state) => state.setStep);

  const isFormValid = isValidEmail(email) && password.length > 0 && !isLoading;

  const handleSignIn = async () => {
    if (!isFormValid) {
      if (!isValidEmail(email)) {
        setEmailError("Please enter a valid email address");
      }
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setEmailError(null);

    try {
      const result = await authenticate(email, password);

      if (!result.ok) {
        // Auth-specific errors are inline
        if (result.code === "INVALID_CREDENTIALS") {
          setAuthError("Invalid email or password. Please try again.");
        } else {
          setAuthError(result.error || "Sign in failed");
        }
        return;
      }

      // Successful auth — advance to level selection
      setStep("consent_done");
      router.replace("/(onboarding)/level-selection" as any);
    } catch (err) {
      console.error("[SignInScreen] Sign in failed", err);
      const category = getErrorCategory(err);

      // Auth-expired → error screen
      if (category === "auth_expired") {
        handleOnboardingError(err, { errorCode: "SIGNIN_AUTH" });
        return;
      }

      // Network/server → inline retry
      if (category === "network" || category === "server") {
        setAuthError("Connection issue. Please try again.");
        return;
      }

      // Unknown → error screen
      handleOnboardingError(err, { errorCode: "SIGNIN" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError(null);
    }
  };

  const actions = [
    {
      label: isLoading ? "Signing in..." : "Sign In",
      onPress: handleSignIn,
      disabled: !isFormValid,
      loading: isLoading,
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
          onPress={() => router.push("/onboarding/sign-up" as any)}
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
        {authError && (
          <View className="bg-error/10 rounded-card p-3 mb-4">
            <Text className="text-error text-sm">{authError}</Text>
          </View>
        )}

        <LabeledInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<LabeledInput.Icon icon="email-outline" />}
        />
        {emailError && (
          <Text className="text-error text-sm mt-1 mb-2">{emailError}</Text>
        )}

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={() => {
            // Forgot password flow — route to error screen for now
            handleOnboardingError(
              new Error("Forgot password flow not yet implemented"),
              { errorCode: "FORGOT_PASSWORD" },
            );
          }}
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
          onPress={() => {
            // Social auth not yet implemented → error screen
            handleOnboardingError(
              new Error("Google sign-in not yet configured"),
              { errorCode: "GOOGLE_SIGNIN" },
            );
          }}
        />
        <SocialSignInButton
          provider="apple"
          mode="signin"
          onPress={() => {
            handleOnboardingError(
              new Error("Apple sign-in not yet configured"),
              { errorCode: "APPLE_SIGNIN" },
            );
          }}
        />
        <SocialSignInButton
          provider="email"
          mode="signin"
          onPress={() => {
            handleOnboardingError(
              new Error("Email link sign-in not yet configured"),
              { errorCode: "EMAIL_LINK_SIGNIN" },
            );
          }}
        />
      </View>
    </OnboardingLayout>
  );
}
