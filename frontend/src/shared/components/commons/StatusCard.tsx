import { View, Text, Pressable, type ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

const { colors } = shadowspeakTheme;

type StatusCardProps = {
  /** Leading icon name (MaterialCommunityIcons). */
  icon: string;
  /** Color of the leading icon itself (defaults to theme `onBackground`). */
  iconColor?: string;
  /** NativeWind classes for the circular icon container (default: bg-surface-alt). */
  iconContainerClassName?: string;
  /** Main line — bold, single-line recommended. */
  title: string;
  /** Secondary line beneath the title. */
  subtitle?: string;
  /** Called when the user taps the card. Omit to render a non-interactive card. */
  onPress?: () => void;
  /** NativeWind classes applied to the outer card container (e.g. `mt-6`). */
  containerClassName?: string;
  /** Extra container styles for dynamic values only. Prefer `containerClassName`. */
  style?: ViewStyle;
  /** Test ID for e2e / snapshot targeting. */
  testID?: string;
};

/**
 * A reusable status / info card used across error screens, settings, and
 * anywhere the app needs to surface a compact piece of state information
 * (offline availability, error codes, download status, etc.).
 *
 * Visual spec (all driven by theme tokens + NativeWind):
 *   - Surface background (`bg-surface`), border (`border-border`), 16px rounded corners (`rounded-2xl`).
 *   - Horizontal flex-row, 16px padding, 12px gap.
 *   - Leading icon sits in a circular container (default `bg-surface-alt`, 8px padding, `rounded-full`).
 *   - Title uses `text-text font-semibold`.
 *   - Optional subtitle uses `text-text-muted text-sm`.
 *   - Trailing icon is right-aligned, 18-20px, muted color.
 */
export default function StatusCard({
  icon,
  iconColor = colors.onBackground,
  iconContainerClassName = "bg-surface-alt p-2 rounded-full",
  title,
  subtitle,
}: StatusCardProps) {
  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-3">
      {/* Leading icon container */}
      <View className={iconContainerClassName}>
        <Icon source={icon} size={20} color={iconColor} />
      </View>

      {/* Text block */}
      <View className="flex-1">
        <Text className="text-text text-base leading-snug">{title}</Text>
        {subtitle ? (
          <Text className="text-text-muted text-sm leading-relaxed">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
