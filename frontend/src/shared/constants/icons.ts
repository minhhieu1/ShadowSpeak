// icon from Matetial Community Icons: https://materialdesignicons.com/

export const icons = {
  REFRESH: "refresh",
  ARROW_LEFT: "arrow-left",
  CHECK_CIRCLE: "check-circle",
  BUG_OUTLINE: "bug-outline",
  HOME_OUTLINE: "home-outline",
  DOWNLOAD: "download",
  MICROPHONE: "microphone",
  BELL_OUTLINE: "bell-outline",
  COG: "cog",
  CLOSE: "close",
  MICROPHONE_OFF: "microphone-off",
  HEADPHONES: "headphones",
  CLOUD_OUTLINE: "cloud-outline",
  LOGIN: "login",
  CLOUD_OFF_OUTLINE: "cloud-off-outline",
  TRASH_CAN_OUTLINE: "trash-can-outline",
  TUNE: "tune",
  BOOKMARK: "bookmark",
  CLOCK: "clock",
  SHIELD_CHECK: "shield-check",
  INFO_OUTLINE: "information-outline",
  EXIT_TO_APP: "exit-to-app",
} as const;

export type ErrorIcon = (typeof icons)[keyof typeof icons];
