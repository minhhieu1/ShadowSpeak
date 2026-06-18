/**
 * Mock for expo-notifications module.
 * Used in Jest tests to avoid native module errors.
 */

export enum AndroidImportance {
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
}

export enum AndroidVisibility {
  SECRET = -1,
  PRIVATE = 0,
  PUBLIC = 1,
}

export enum NotificationEventType {
  DID_RECEIVE_NOTIFICATION = 'didReceiveNotification',
  DID_SCHEDULE_NOTIFICATION = 'didScheduleNotification',
  DID_CANCEL_NOTIFICATION = 'didCancelNotification',
  DID_TAP_NOTIFICATION = 'didTapNotification',
}

export enum EventSubscriptionSubscription {
  remove = () => {},
}

export interface PermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  granted?: boolean;
}

export interface NotificationPermission {
  status: 'granted' | 'denied' | 'undetermined';
}

export interface DeviceToken {
  data: string;
}

export async function requestPermissionsAsync(): Promise<PermissionStatus> {
  return { status: 'granted' };
}

export async function getPermissionsAsync(): Promise<PermissionStatus> {
  return { status: 'granted' };
}

export async function scheduleLocalNotificationAsync(
  trigger: any,
  notification?: any
): Promise<number> {
  return 1;
}

export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
  return Promise.resolve();
}

export async function cancelScheduledNotificationAsync(
  identifier: number
): Promise<void> {
  return Promise.resolve();
}

export async function getAllScheduledNotificationsAsync(): Promise<any[]> {
  return [];
}

export async function setNotificationHandler(
  handler: any,
  options?: any
): Promise<void> {
  return Promise.resolve();
}

export async function dismissAllNotificationsAsync(): Promise<void> {
  return Promise.resolve();
}

export function addNotificationReceivedListener(
  listener: any
): EventSubscriptionSubscription {
  return { remove: () => {} };
}

export function addNotificationResponseReceivedListener(
  listener: any
): EventSubscriptionSubscription {
  return { remove: () => {} };
}

export async function setBadgeCounterAsync(counter: number): Promise<void> {
  return Promise.resolve();
}

export async function getBadgeCounterAsync(): Promise<number> {
  return 0;
}

export default {
  AndroidImportance,
  AndroidVisibility,
  NotificationEventType,
  requestPermissionsAsync,
  getPermissionsAsync,
  scheduleLocalNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  setNotificationHandler,
  dismissAllNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  setBadgeCounterAsync,
  getBadgeCounterAsync,
};
