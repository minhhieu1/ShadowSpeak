import {
  Image as RNImage,
  Platform,
  ScrollView as RNScrollView,
  StatusBar,
  Text as RNText,
  useWindowDimensions,
  View as RNView,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {
  Button as PaperButton,
  Icon,
  IconButton as PaperIconButton,
  Surface as PaperSurface,
} from "react-native-paper";
import { cssInterop } from "nativewind";

import { assets } from "@/assets";

const View = cssInterop(RNView, { className: "style" });
const Text = cssInterop(RNText, { className: "style" });
const Image = cssInterop(RNImage, { className: "style" });
const ScrollView = cssInterop(RNScrollView, { className: "style" });
const SafeAreaView = cssInterop(RNSafeAreaView, { className: "style" });
const Surface = cssInterop(PaperSurface, { className: "style" });
const Button = cssInterop(PaperButton, { className: "style" });
const IconButton = cssInterop(PaperIconButton, { className: "style" });

export type AudioLoadFailureScreenProps = {
  onRetry: () => void | Promise<void>;
  onReturnToLesson: () => void;
  onBack?: () => void;
  lessonTitle: string;
  lessonSubtitle: string;
  lessonDuration: string;
  lessonThumbnail: { uri: string };
  progressSaved: boolean;
};

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export default function AudioLoadFailureScreen({
  onRetry,
  onReturnToLesson,
  onBack,
  lessonTitle,
  lessonSubtitle,
  lessonDuration,
  lessonThumbnail,
  progressSaved,
}: AudioLoadFailureScreenProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const titleSize = compact ? 32 : 36;
  const bodySize = compact ? 16 : 18;
  const thumbnailSize = compact ? 78 : 92;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="dark-content" />

      <View className="h-16 flex-row items-center px-5 sm:px-6">
        {onBack ? (
          <IconButton
            accessibilityLabel="Go back"
            className="-ml-2"
            icon="chevron-left"
            iconColor="#0E5A6A"
            onPress={onBack}
            size={36}
          />
        ) : (
          <View className="h-11 w-11" />
        )}
        <Text className="ml-1 text-xl font-bold leading-7 text-primary">
          Practice Session
        </Text>
      </View>

      <ScrollView
        bounces={false}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center px-6 pb-8 pt-8 sm:pt-10">
          <Surface
            className="aspect-[1.1] w-[82%] max-w-[310px] overflow-hidden rounded-[28px] bg-[#FEFCF8]"
            elevation={1}
            mode="elevated"
          >
            <Image
              className="h-full w-full"
              resizeMode="stretch"
              source={assets.illustrations.audioLoadFailure}
            />
          </Surface>

          <Text
            adjustsFontSizeToFit
            className="mt-9 w-full max-w-[360px] text-center font-bold text-primary"
            minimumFontScale={0.86}
            numberOfLines={1}
            style={{
              fontFamily: serifFont,
              fontSize: titleSize,
              lineHeight: titleSize + 9,
            }}
          >
            Audio couldn't load
          </Text>

          <Text
            className="mt-3 text-center text-[#526473]"
            style={{ fontSize: bodySize, lineHeight: bodySize * 1.5 }}
          >
            We kept your place in the lesson.{"\n"}
            Try loading the track again.
          </Text>

          <Surface
            className="mt-7 w-full max-w-[330px] rounded-xl bg-surface"
            elevation={1}
            mode="elevated"
          >
            <View className="min-h-[112px] flex-row items-center p-3">
              <Image
                className="rounded-[9px]"
                resizeMode="cover"
                source={lessonThumbnail}
                style={{
                  width: thumbnailSize,
                  height: thumbnailSize,
                }}
              />

              <View className="ml-4 min-w-0 flex-1">
                <Text
                  className="text-text"
                  numberOfLines={2}
                  style={{
                    fontSize: compact ? 16 : 17,
                    fontWeight: "800",
                    lineHeight: compact ? 22 : 23,
                  }}
                >
                  {lessonTitle}
                </Text>
                <Text
                  className="text-text"
                  numberOfLines={2}
                  style={{
                    fontSize: compact ? 16 : 17,
                    fontWeight: "800",
                    lineHeight: compact ? 22 : 23,
                  }}
                >
                  {lessonSubtitle}
                </Text>

                <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-2">
                  <View className="h-[34px] items-center justify-center rounded-full bg-[#DDEFF4] px-3.5">
                    <Text className="text-base leading-5 text-[#123545]">
                      {lessonDuration}
                    </Text>
                  </View>

                  {progressSaved ? (
                    <View className="flex-row items-center">
                      <Icon
                        color="#167A35"
                        source="check-circle-outline"
                        size={26}
                      />
                      <Text className="ml-2 text-[15px] leading-5 text-success">
                        Position saved
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </Surface>

          <View className="mt-8 w-full max-w-[340px] gap-4">
            <Button
              buttonColor="#005465"
              className="rounded-[14px]"
              contentStyle={{ height: compact ? 54 : 58 }}
              icon="refresh"
              labelStyle={{
                color: "#FFFFFF",
                fontSize: compact ? 17 : 19,
                fontWeight: "800",
                lineHeight: 24,
              }}
              mode="contained"
              onPress={() => {
                void onRetry();
              }}
            >
              Retry audio
            </Button>

            <Button
              className="rounded-[14px] border border-primary"
              contentStyle={{ height: compact ? 54 : 58 }}
              icon="keyboard-return"
              labelStyle={{
                color: "#0E5A6A",
                fontSize: compact ? 16 : 18,
                fontWeight: "800",
                lineHeight: 24,
              }}
              mode="outlined"
              onPress={onReturnToLesson}
              textColor="#0E5A6A"
            >
              Return to lesson
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
