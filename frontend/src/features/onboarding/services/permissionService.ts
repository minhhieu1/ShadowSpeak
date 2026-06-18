/**
 * Permission service for ShadowSpeak onboarding.
 *
 * Wraps expo-notifications and expo-audio permission APIs for:
 * - Notification permission (for daily practice reminders)
 * - Microphone permission (for recording shadowing practice)
 *
 * Provides platform-agnostic permission check and request functions.
 *
 * Note: In Expo Go, notification APIs may be limited. Use development build
 * for full functionality.
 */

import { Platform } from "react-native";

/**
 * Permission status enum.
 */
export type PermissionStatus = "granted" | "denied" | "undetermined";

/**
 * Lazily load expo-notifications module.
 * This avoids import-time errors in Expo Go.
 */
async function getNotificationsModule(): Promise<typeof import("expo-notifications") | null> {
  try {
    return await import("expo-notifications");
  } catch (error) {
    if (__DEV__) {
      console.log(
        "[permissionService] expo-notifications not available - use development build for full functionality"
      );
    }
    return null;
  }
}

/**
 * Lazily load expo-audio module.
 * This avoids import-time errors in environments without native modules.
 */
async function getAudioModule(): Promise<typeof import("expo-audio") | null> {
  try {
    return await import("expo-audio");
  } catch (error) {
    if (__DEV__) {
      console.log("[permissionService] expo-audio not available", error);
    }
    return null;
  }
}

/**
 * Request notification permission from the user.
 *
 * @returns The permission status after the request
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return "undetermined";
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";
  } catch (error) {
    console.warn(
      "[permissionService] Failed to request notification permission",
      error
    );
    return "denied";
  }
}

/**
 * Get the current notification permission status.
 *
 * @returns The current permission status
 */
export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  const Notifications = await getNotificationsModule();

  if (!Notifications) {
    return "undetermined";
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";
  } catch (error) {
    console.warn(
      "[permissionService] Failed to get notification permission status",
      error
    );
    return "denied";
  }
}

/**
 * Request microphone permission from the user.
 *
 * @returns The permission status after the request
 */
export async function requestMicrophonePermission(): Promise<PermissionStatus> {
  const audioModule = await getAudioModule();

  if (!audioModule) {
    return "undetermined";
  }

  try {
    const { status } = await audioModule.requestPermissionsAsync();
    return status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";
  } catch (error) {
    console.warn(
      "[permissionService] Failed to request microphone permission",
      error
    );
    return "denied";
  }
}

/**
 * Get the current microphone permission status.
 *
 * @returns The current permission status
 */
export async function getMicrophonePermissionStatus(): Promise<PermissionStatus> {
  const audioModule = await getAudioModule();

  if (!audioModule) {
    return "undetermined";
  }

  try {
    const { status } = await audioModule.getPermissionsAsync();
    return status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";
  } catch (error) {
    console.warn(
      "[permissionService] Failed to get microphone permission status",
      error
    );
    return "denied";
  }
}

/**
 * Open the app's settings page in the OS settings app.
 *
 * Used for permission recovery when user has denied permissions.
 */
export async function openAppSettings(): Promise<void> {
  try {
    const Linking = await import("react-native/Libraries/Linking/Linking");
    const linkingModule: any = Linking.default || Linking;
    if (linkingModule?.openSettings) {
      await linkingModule.openSettings();
    } else {
      // Fallback to Linking.openURL with app settings URL
      await linkingModule.openURL("app-settings:");
    }
  } catch (error) {
    console.warn("[permissionService] Failed to open app settings", error);
  }
}
