import { useState } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Icon } from "react-native-paper";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "@/features/onboarding/layouts/OnboardingLayout";
import LabeledInput from "../components/LabeledInput";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import {
  isValidEmail,
  validatePassword,
  type PasswordStrength,
} from "@/features/onboarding/types/onboarding";
import { register } from "@/features/onboarding/services/authService";
import { useOnboardingStore } from "@/features/onboarding/stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "@/features/onboarding/services/errorHandler";

import { shadowspeakTheme } from "@/theme";

const strengthToLevel: Record<PasswordStrength, "weak" | "fair" | "strong"> = {
  weak: "weak",
  medium: "fair",
  strong: "strong",
};

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const { colors } = shadowspeakTheme;
  const setStep = useOnboardingStore((state) => state.setStep);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isFormValid =
    isValidEmail(email) &&
    passwordValidation.isValid &&
    passwordsMatch &&
    acceptedTerms &&
    !isLoading;

  const handleCreateAccount = async () => {
    // Validate
    const errors: typeof fieldErrors = {};

    if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0] || "Invalid password";
    }
    if (!passwordsMatch) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!acceptedTerms) {
      errors.terms = "You must accept the Terms of Service to continue";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setFieldErrors({});

    try {
      const result = await register(email, password);

      if (!result.ok) {
        // Auth-specific errors are inline
        if (result.code === "INVALID_CREDENTIALS") {
          setAuthError(
            "An account with this email already exists. Please sign in instead.",
          );
        } else {
          setAuthError(result.error || "Sign up failed");
        }
        return;
      }

      // Successful registration — advance to level selection
      setStep("consent_done");
      router.replace("/(onboarding)/level-selection" as any);
    } catch (err) {
      console.error("[SignUpScreen] Sign up failed", err);
      const category = getErrorCategory(err);

      if (category === "auth_expired") {
        handleOnboardingError(err, { errorCode: "SIGNUP_AUTH" });
        return;
      }

      if (category === "network" || category === "server") {
        setAuthError("Connection issue. Please try again.");
        return;
      }

      handleOnboardingError(err, { errorCode: "SIGNUP" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("[SignUpScreen] Failed to open URL", err);
    });
  };

  const actions = [
    {
      label: isLoading ? "Creating account..." : "Create Account",
      onPress: handleCreateAccount,
      disabled: !isFormValid,
      loading: isLoading,
    },
    {
      label: "Already have account? Sign In",
      mode: "outlined" as const,
      onPress: () => router.push("/onboarding/sign-in" as any),
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
        {authError && (
          <View className="bg-error/10 rounded-card p-3 mb-4">
            <Text className="text-error text-sm">{authError}</Text>
          </View>
        )}

        <LabeledInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          left={<LabeledInput.Icon icon="email-outline" />}
        />
        {fieldErrors.email && (
          <Text className="text-error text-sm mt-1 mb-2">
            {fieldErrors.email}
          </Text>
        )}

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
        />
        {password.length > 0 && (
          <PasswordStrengthBar
            strength={strengthToLevel[passwordValidation.strength]}
          />
        )}
        {fieldErrors.password && (
          <Text className="text-error text-sm mt-1 mb-2">
            {fieldErrors.password}
          </Text>
        )}

        <PasswordInput
          label="Confirm password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }
          }}
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text className="text-error text-sm mt-1 mb-2">
            Passwords do not match
          </Text>
        )}

        <Pressable
          onPress={() => {
            setAcceptedTerms((prev) => !prev);
            if (fieldErrors.terms) {
              setFieldErrors((prev) => ({ ...prev, terms: undefined }));
            }
          }}
          className="flex-row items-start mt-2 mb-4"
        >
          <View
            className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
              acceptedTerms
                ? "bg-primary border-primary"
                : "border-primary bg-transparent"
            }`}
          >
            {acceptedTerms ? (
              <Icon source="check" size={14} color={colors.onPrimary} />
            ) : null}
          </View>
          <Text className="flex-1 text-sm text-text-muted leading-relaxed">
            By creating an account, you agree to our{" "}
            <Text
              className="text-primary font-semibold"
              onPress={() => handleOpenLink("https://shadowspeak.app/terms")}
            >
              Terms of Use
            </Text>{" "}
            and acknowledge our{" "}
            <Text
              className="text-primary font-semibold"
              onPress={() => handleOpenLink("https://shadowspeak.app/privacy")}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </Pressable>
        {fieldErrors.terms && (
          <Text className="text-error text-sm mt-1 mb-2">
            {fieldErrors.terms}
          </Text>
        )}
      </View>
    </OnboardingLayout>
  );
}
