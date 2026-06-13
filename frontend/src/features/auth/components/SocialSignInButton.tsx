import { View, Text } from "react-native";
import { Button, Icon } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type SocialProvider = "google" | "apple" | "email";

type SocialSignInButtonProps = {
  provider: SocialProvider;
  mode: "signin" | "signup";
  onPress: () => void;
};

const providerConfig: Record<SocialProvider, { icon: string; label: string }> =
  {
    google: {
      icon: "google",
      label: "Continue with Google",
    },
    apple: {
      icon: "apple",
      label: "Sign in with Apple",
    },
    email: {
      icon: "email-outline",
      label: "Continue with Email",
    },
  };

export default function SocialSignInButton({
  provider,
  mode,
  onPress,
}: SocialSignInButtonProps) {
  const { colors } = shadowspeakTheme;
  const { icon, label } = providerConfig[provider];

  const buttonColor = provider === "apple" ? "#111827" : colors.surface;
  const textColor = provider === "apple" ? "#FFFFFF" : colors.onSurface;
  const borderColor = provider === "apple" ? "#111827" : colors.outline;

  return (
    <Button
      mode="outlined"
      onPress={onPress}
      className="rounded-control py-1 mb-3"
      style={{ backgroundColor: buttonColor, borderColor }}
      labelStyle={{ color: textColor, fontSize: 16, fontWeight: "600" }}
      icon={() => (
        <View className="mr-2">
          <Icon
            source={icon}
            size={20}
            color={provider === "apple" ? "#FFFFFF" : colors.primary}
          />
        </View>
      )}
    >
      {mode === "signin" || provider !== "email"
        ? label
        : label.replace("Continue", "Sign up")}
    </Button>
  );
}
