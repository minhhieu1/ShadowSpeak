import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";

import { assets } from "@/assets";
import OnboardingLayout from "../layouts/OnboardingLayout";
import PermissionStatusCard from "../components/PermissionStatusCard";
import {
  getNotificationPermissionStatus,
  getMicrophonePermissionStatus,
  requestNotificationPermission,
  requestMicrophonePermission,
  openAppSettings,
  type PermissionStatus,
} from "../services/permissionService";
import { completeOnboarding } from "../services/onboardingApi";
import { useOnboardingStore } from "../stores/onboardingStore";
import {
  handleOnboardingError,
  getErrorCategory,
} from "../services/errorHandler";

export default function PermissionPromptsScreen() {
  const [notificationStatus, setNotificationStatus] =
    useState<PermissionStatus>("undetermined");
  const [microphoneStatus, setMicrophoneStatus] =
    useState<PermissionStatus>("undetermined");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setComplete = useOnboardingStore((state) => state.setComplete);

  useEffect(() => {
    const checkPermissions = async () => {
      const [notif, mic] = await Promise.all([
        getNotificationPermissionStatus(),
        getMicrophonePermissionStatus(),
      ]);
      setNotificationStatus(notif);
      setMicrophoneStatus(mic);
    };

    checkPermissions();
  }, []);

  const handleRequestNotification = async () => {
    const status = await requestNotificationPermission();
    setNotificationStatus(status);
  };

  const handleRequestMicrophone = async () => {
    const status = await requestMicrophonePermission();
    setMicrophoneStatus(status);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mark onboarding as complete
      await completeOnboarding();
      setComplete();

      // Navigate to home
      router.replace("/(tabs)/home" as any);
    } catch (err) {
      console.error(
        "[PermissionPromptsScreen] Failed to complete onboarding",
        err,
      );
      const category = getErrorCategory(err);

      if (category === "network" || category === "server") {
        setError("Connection issue. Please try again.");
      } else {
        handleOnboardingError(err, { errorCode: "COMPLETE_ONBOARDING" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    openAppSettings();
  };

  const actions = [
    {
      label: isLoading ? "Completing..." : "Continue",
      onPress: handleContinue,
      loading: isLoading,
    },
    {
      label: "Open Settings",
      mode: "outlined" as const,
      onPress: handleOpenSettings,
    },
  ];

  const mapStatus = (
    status: PermissionStatus,
  ): "granted" | "optional" | "denied" => {
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "optional";
  };

  return (
    <OnboardingLayout
      variant="cards"
      source={assets.badges.brandWaveformNeutral}
      title="Permission Prompts"
      subtitle="Enable these permissions to get the most out of ShadowSpeak."
      heroSize="sm"
      bodyCentered={false}
      actions={actions}
    >
      <View className="gap-3 mt-6">
        <PermissionStatusCard
          icon="bell"
          title="Notifications"
          description="Daily practice reminders"
          status={mapStatus(notificationStatus)}
          helperText={
            notificationStatus === "granted"
              ? "You'll get helpful reminders to stay consistent."
              : notificationStatus === "denied"
                ? "Reminders are disabled. Enable in settings to receive daily nudges."
                : "Allow notifications to receive daily practice reminders."
          }
          onRequest={
            notificationStatus === "undetermined"
              ? handleRequestNotification
              : undefined
          }
        />
        <PermissionStatusCard
          icon="microphone"
          title="Microphone"
          description="Record your shadowing"
          status={mapStatus(microphoneStatus)}
          helperText={
            microphoneStatus === "granted"
              ? "Allows you to record and review your practice."
              : microphoneStatus === "denied"
                ? "Recording is unavailable. Enable in settings to record your practice."
                : "Allows you to record and review your practice."
          }
          onRequest={
            microphoneStatus === "undetermined"
              ? handleRequestMicrophone
              : undefined
          }
        />
      </View>
    </OnboardingLayout>
  );
}
