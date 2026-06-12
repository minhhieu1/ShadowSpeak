import {
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";
import { Button } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type ErrorAction = {
  label: string;
  onPress?: () => void;
  icon?: string;
  mode?: "contained" | "outlined";
  className?: string;
  labelStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
};

type ErrorActionsProps = {
  actions: ErrorAction[];
};

/**
 * Bottom-pinned action stack shared by error screens.
 * - Renders a vertical column of buttons (`gap-3`) pinned to the bottom of
 *   its parent (relies on the parent providing `flex-1`).
 * - The first action is styled as the primary (contained) by default;
 *   every subsequent action is rendered as outlined/secondary.
 * - Pass `mode` per action to override the default.
 * - Pass `className`, `labelStyle`, or `contentStyle` per action to override
 *   the default styles applied to the underlying Button.
 *   Note: `contentStyle` is a *view* style (it styles the inner container of
 *   the button), while `labelStyle` is a *text* style.
 * - `labelStyle.fontWeight` (defaults to `"600"`) and
 *   `contentStyle.height` (defaults to `50`) are always applied — any
 *   per-action override is merged on top of these baselines.
 */
const BASE_LABEL_STYLE: TextStyle = {
  fontWeight: "600",
};
const BASE_CONTENT_STYLE: ViewStyle = {
  height: 50,
};

export default function ErrorActions({ actions }: ErrorActionsProps) {
  if (actions.length === 0) return null;

  return (
    <View className="mt-auto mb-4 gap-3">
      {actions.map((action, index) => {
        const mode = action.mode ?? (index === 0 ? "contained" : "outlined");
        const isContained = mode === "contained";
        const defaultClassName = isContained
          ? "bg-primary rounded-card"
          : "border border-primary rounded-card bg-transparent";
        const className = action.className ?? defaultClassName;

        // Merge the screen's style on top of the baseline so the baselines
        // (fontWeight / height) are always present.
        const labelStyle: StyleProp<TextStyle> = [
          BASE_LABEL_STYLE,
          ...(Array.isArray(action.labelStyle)
            ? action.labelStyle
            : action.labelStyle
              ? [action.labelStyle]
              : []),
        ];
        const contentStyle: StyleProp<ViewStyle> = [
          BASE_CONTENT_STYLE,
          ...(Array.isArray(action.contentStyle)
            ? action.contentStyle
            : action.contentStyle
              ? [action.contentStyle]
              : []),
        ];

        return (
          <Button
            key={`${action.label}-${index}`}
            mode={mode}
            onPress={action.onPress}
            icon={action.icon}
            disabled={action.disabled}
            loading={action.loading}
            contentStyle={contentStyle}
            labelStyle={labelStyle}
            className={className}
          >
            {action.label}
          </Button>
        );
      })}
    </View>
  );
}
