import { View, Text } from "react-native";
import { TextInput, type TextInputProps } from "react-native-paper";

import { shadowspeakTheme } from "@/theme";

type LabeledInputProps = TextInputProps & {
  label: string;
  error?: string;
};

function LabeledInput({
  label,
  error,
  style,
  ...textInputProps
}: LabeledInputProps) {
  const { colors } = shadowspeakTheme;

  return (
    <View className="mb-4">
      <Text className="text-base text-text mb-2">{label}</Text>
      <TextInput
        mode="outlined"
        outlineColor={colors.outline}
        activeOutlineColor={colors.primary}
        textColor={colors.onSurface}
        className="bg-surface rounded-control"
        style={[{ height: 52 }, style]}
        {...textInputProps}
      />
      {error ? <Text className="text-sm text-error mt-1">{error}</Text> : null}
    </View>
  );
}

LabeledInput.Icon = TextInput.Icon;

export default LabeledInput;
