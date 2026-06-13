import { Image, Text, useWindowDimensions, View } from "react-native";
import { Icon } from "react-native-paper";

import { icons } from "@/shared/constants/icons";
import { assets } from "@/assets";
import { shadowspeakTheme } from "@/theme";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

export type AudioLoadFailureScreenProps = {
  lessonTitle: string;
  lessonDuration: string;
  lessonThumbnail: { uri: string };
  progressSaved: boolean;
};

export default function AudioLoadFailureScreen({
  lessonTitle,
  lessonDuration,
  lessonThumbnail,
  progressSaved,
}: AudioLoadFailureScreenProps) {
  const { width } = useWindowDimensions();
  const { colors } = shadowspeakTheme;
  const compact = width < 360;
  const thumbSize = compact ? 78 : 92;
  const actions = [
    {
      label: "Retry audio",
      onPress: () => console.log("[AudioLoadFailure] Retry audio pressed"),
      icon: icons.REFRESH,
      className: "bg-primary",
    },
    {
      label: "Return to lesson",
      onPress: () => console.log("[AudioLoadFailure] Return to lesson pressed"),
      icon: icons.ARROW_LEFT,
      className: "border border-primary bg-transparent",
      labelStyle: {
        color: colors.primary,
      },
    },
  ];

  return (
    <ErrorScreenLayout
      illustration={assets.illustrations.audioLoadFailure}
      title="Audio couldn't load"
      description={`We kept your place in the lesson.\nTry loading the track again.`}
      actions={actions}
    >
      {/* Lesson context card */}
      <View className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3">
        <Image
          source={lessonThumbnail}
          className="rounded-3xl"
          style={{ width: thumbSize, height: thumbSize }}
          resizeMode="cover"
        />
        <View className="flex-1 px-4 py-3 justify-center">
          <Text className="leading-snug text-text font-semibold">
            {lessonTitle}
          </Text>
          <View className="flex-row items-center mt-2 gap-2">
            <View className="px-2.5 py-1 rounded-full bg-surface-alt">
              <Text className="text-text-muted text-xs font-medium">
                {lessonDuration}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon
                source={icons.CHECK_CIRCLE}
                size={14}
                color={colors.success}
              />
              <Text className="text-success text-xs font-medium">
                Position saved
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ErrorScreenLayout>
  );
}
