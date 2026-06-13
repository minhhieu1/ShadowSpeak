import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

type SessionExpiredScreenProps = {
  onSignInAgain?: () => void;
  onContinueOffline?: () => void;
};

export default function SessionExpiredScreen() {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: icons.CLOUD_OUTLINE,
      iconColor: colors.onSurfaceVariant,
      title: "Offline lessons stay on this device.",
    },
  ];

  const actions = [
    {
      label: "Sign in again",
      onPress: () => console.log("[SessionExpired] Sign in again pressed"),
      icon: icons.LOGIN,
      className: "bg-primary",
    },
    {
      label: "Continue offline",
      onPress: () => console.log("[SessionExpired] Continue offline pressed"),
      icon: icons.CLOUD_OFF_OUTLINE,
      className: "border border-primary bg-transparent",
    },
  ];

  return (
    <ErrorScreenLayout
      title="Session expired"
      description="Please sign in again so we can sync your progress safely."
      illustration={assets.illustrations.sessionExpired}
      cards={cards}
      actions={actions}
    />
  );
}
