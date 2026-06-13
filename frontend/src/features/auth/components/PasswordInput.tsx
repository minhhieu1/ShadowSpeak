import { useState } from "react";

import LabeledInput from "./LabeledInput";

import { shadowspeakTheme } from "@/theme";

type PasswordInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
}: PasswordInputProps) {
  const [secure, setSecure] = useState(true);
  const { colors } = shadowspeakTheme;

  return (
    <LabeledInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secure}
      autoCapitalize="none"
      right={
        <LabeledInput.Icon
          icon={secure ? "eye-outline" : "eye-off-outline"}
          color={colors.onSurfaceVariant}
          onPress={() => setSecure((prev) => !prev)}
        />
      }
    />
  );
}
