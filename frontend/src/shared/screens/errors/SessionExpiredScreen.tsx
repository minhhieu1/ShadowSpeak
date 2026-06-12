import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCards from "@/shared/components/errors/StatusCards";

type SessionExpiredScreenProps = {
  onSignInAgain?: () => void;
  onContinueOffline?: () => void;
};

export default function SessionExpiredScreen() {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: "cloud-outline" as const,
      iconColor: colors.onSurfaceVariant,
      title: "Offline lessons stay on this device.",
    },
  ];

  const actions = [
    {
      label: "Sign in again",
      onPress: () => console.log("[SessionExpired] Sign in again pressed"),
      icon: "login" as const,
      className: "bg-primary",
    },
    {
      label: "Continue offline",
      onPress: () => console.log("[SessionExpired] Continue offline pressed"),
      icon: "cloud-off-outline" as const,
      className: "border border-primary bg-transparent",
    },
  ];

  return (
    <ErrorScreenLayout
      title="Session expired"
      description="Please sign in again so we can sync your progress safely."
      illustration={assets.illustrations.sessionExpired}
    >
      <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />
      <ErrorActions actions={actions} />
    </ErrorScreenLayout>
  );
}
