import { View, Text, useWindowDimensions } from "react-native";
import { Icon } from "react-native-paper";

import { assets } from "@/assets";
import { shadowspeakTheme } from "@/theme";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ErrorActions from "@/shared/components/errors/ErrorActions";
import StatusCard from "@/shared/components/errors/StatusCard";

type SessionExpiredScreenProps = {
  onSignInAgain?: () => void;
  onContinueOffline?: () => void;
};

const SessionExpiredScreen = ({
  onSignInAgain,
  onContinueOffline,
}: SessionExpiredScreenProps) => {
  const { colors } = shadowspeakTheme;

  return (
    <ErrorScreenLayout
      title="Session expired"
      description="Please sign in again so we can sync your progress safely."
      illustration={assets.illustrations.sessionExpired}
    >
      <StatusCard
        icon="cloud-outline"
        iconColor={colors.onSurfaceVariant}
        title={`Offline lessons stay on this device.`}
        containerClassName="mt-6"
      />
      <ErrorActions
        actions={[
          {
            label: "Sign in again",
            onPress: onSignInAgain,
            icon: "login",
            className: "bg-primary ",
          },
          {
            label: "Continue offline",
            onPress: onContinueOffline,
            icon: "cloud-off-outline",
            className: "border border-primary bg-transparent",
            labelStyle: {
              color: colors.primary,
            },
          },
        ]}
      />
    </ErrorScreenLayout>
  );
};

export default SessionExpiredScreen;
