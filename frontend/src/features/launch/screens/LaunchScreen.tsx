import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Button } from "react-native-paper";

import { assets } from "@/assets";
import SafeScreen from "@/shared/layouts/SafeLayout";
import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";

const onboardingRoutes = [
  { label: "Age Gate", path: "/(onboarding)/age-gate" },
  { label: "Age Policy Block", path: "/(onboarding)/age-policy-block" },
  { label: "Privacy and Ad Consent", path: "/(onboarding)/consent" },
  { label: "Sign In", path: "/(onboarding)/sign-in" },
  { label: "Sign Up", path: "/(onboarding)/sign-up" },
  { label: "Level Selection", path: "/(onboarding)/level-selection" },
  { label: "Reminder Setup", path: "/(onboarding)/reminder-setup" },
  { label: "Permission Prompts", path: "/(onboarding)/permission-prompts" },
];

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const logoWidth = width * 0.7;
  const logoHeight = logoWidth * 0.5;

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center justify-center py-10">
          <IllustrationBlock
            source={assets.logos.splashLockup}
            width={logoWidth}
            height={logoHeight}
          />
          <ActivityIndicator size="large" className="mt-10 color-primary" />
          <Text className="text-base text-text-muted text-center mt-4">
            Checking your setup...
          </Text>
        </View>

        <View className="px-5">
          <Text className="text-sm text-text-muted text-center mb-4">
            Dev links — tap to verify onboarding layouts
          </Text>
          {onboardingRoutes.map((route) => (
            <Button
              key={route.path}
              mode="outlined"
              onPress={() => {
                console.log(`LaunchScreen: navigate to ${route.path}`);
                router.push(route.path as any);
              }}
              className="rounded-control py-1 mb-2"
              labelStyle={{ fontSize: 14 }}
            >
              {route.label}
            </Button>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
