import { type ReactNode } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SafeScreen from "@/shared/layouts/SafeLayout";
import Header from "@/shared/components/Header";

type OnboardingVariant = "hero" | "form" | "cards";

type OnboardingShellProps = {
  variant?: OnboardingVariant;
  showHeader?: boolean;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function OnboardingShell({
  variant = "hero",
  showHeader = true,
  children,
  contentContainerStyle,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + 24;

  const scrollContent = (
    <ScrollView
      className="flex-1"
      contentContainerStyle={[
        {
          paddingBottom: bottomPadding,
          flexGrow: variant === "hero" ? 1 : undefined,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 px-5">{children}</View>
    </ScrollView>
  );

  return (
    <SafeScreen>
      {showHeader && <Header />}
      {variant === "form" ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={insets.top + 64}
        >
          {scrollContent}
        </KeyboardAvoidingView>
      ) : (
        scrollContent
      )}
    </SafeScreen>
  );
}
