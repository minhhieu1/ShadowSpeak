import { MD3LightTheme } from "react-native-paper";

export const shadowspeakTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0E5A6A",
    primaryContainer: "#0A4652",
    secondary: "#D97706",
    tertiary: "#0E5A6A",
    success: "#1F8A70",
    background: "#F7F5F0",
    surface: "#FFFFFF",
    surfaceVariant: "#EEF2F5",
    error: "#C2410C",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#111827",
    onSurface: "#111827",
    onSurfaceVariant: "#6B7280",
    outline: "#D6D9DE",
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FFFFFF",
    },
  },
  roundness: 8,
};
