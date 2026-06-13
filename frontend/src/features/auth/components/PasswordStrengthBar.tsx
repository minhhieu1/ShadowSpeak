import { View, Text } from "react-native";

type PasswordStrength = "weak" | "fair" | "good" | "strong";

type PasswordStrengthBarProps = {
  strength: PasswordStrength;
};

const config: Record<
  PasswordStrength,
  { label: string; color: string; filledSegments: number }
> = {
  weak: { label: "Weak", color: "bg-error", filledSegments: 1 },
  fair: { label: "Fair", color: "bg-warning", filledSegments: 2 },
  good: { label: "Good", color: "bg-info", filledSegments: 3 },
  strong: { label: "Strong", color: "bg-success", filledSegments: 4 },
};

export default function PasswordStrengthBar({
  strength,
}: PasswordStrengthBarProps) {
  const { label, color, filledSegments } = config[strength];

  return (
    <View className="mb-4">
      <View className="flex-row gap-1.5 mb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1.5 rounded-full ${
              index < filledSegments ? color : "bg-border"
            }`}
          />
        ))}
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-text">
          Strength:{" "}
          <Text
            className={`font-semibold ${label.toLowerCase() === "fair" ? "text-warning" : ""}`}
          >
            {label}
          </Text>
        </Text>
        <Text className="text-sm text-text-muted">
          Use 8 or more characters
        </Text>
      </View>
    </View>
  );
}
