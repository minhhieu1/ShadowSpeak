import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

export default function RetryableErrorScreen() {
  const { colors } = shadowspeakTheme;

  const actions = [
    {
      label: "Retry",
      onPress: () => console.log(`[RetryableError] Primary action pressed`),
      icon: icons.REFRESH,
      className: "bg-primary rounded-card",
    },
    {
      label: "Return to Catalog",
      onPress: () => console.log(`[RetryableError] Secondary action pressed`),
      className: "border border-primary rounded-card bg-transparent",
    },
  ];

  const cards = [
    {
      icon: icons.BOOKMARK,
      iconColor: colors.onBackground,
      title: "Your progress is saved",
      subtitle: "Try again or return to the catalog.",
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.retryableError}
      title="Unable to load lesson"
      description={`Your place is saved\nTry loading the audio again`}
      cards={cards}
      actions={actions}
    />
  );
}
