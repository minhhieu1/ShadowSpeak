import { View } from "react-native";
import { Button } from "react-native-paper";

export type Action = {
  label: string;
  onPress: () => void;
  mode?: "contained" | "outlined" | "text";
  loading?: boolean;
  disabled?: boolean;
};

type ActionFooterProps = {
  actions: Action[];
  topSpacing?: boolean;
};

export default function ActionFooter({
  actions,
  topSpacing = true,
}: ActionFooterProps) {
  return (
    <View className={`${topSpacing ? "mt-8" : ""} gap-3`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          mode={action.mode ?? (index === 0 ? "contained" : "outlined")}
          onPress={action.onPress}
          loading={action.loading}
          disabled={action.disabled}
          className="rounded-control py-1"
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          {action.label}
        </Button>
      ))}
    </View>
  );
}
