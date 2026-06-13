import { icons } from "@/shared/constants/icons";
import { shadowspeakTheme } from "@/theme";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

export type StorageFullScreenProps = {
  onManageStorage?: () => void;
  onReturnHome?: () => void;
};

export default function StorageFullScreen({
  onManageStorage,
  onReturnHome,
}: StorageFullScreenProps) {
  const { colors } = shadowspeakTheme;

  const cards = [
    {
      icon: icons.TRASH_CAN_OUTLINE,
      iconColor: colors.onSurfaceVariant,
      title: "Remove old recordings",
    },
    {
      icon: icons.DOWNLOAD,
      iconColor: colors.onSurfaceVariant,
      title: "Delete unused downloads",
    },
  ];

  const actions = [
    {
      label: "Try again",
      onPress: onManageStorage,
      icon: icons.REFRESH,
      className: "bg-primary rounded-card",
    },
    {
      label: "Manage Download",
      onPress: onReturnHome,
      icon: icons.TUNE,
      className: "border border-primary rounded-card bg-transparent",
      labelStyle: {
        color: colors.primary,
      },
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.storageFull}
      title="Not enough space"
      description={`Free up a little storage, then try again \n We saved your current progress.`}
      cards={cards}
      actions={actions}
    />
  );
}
