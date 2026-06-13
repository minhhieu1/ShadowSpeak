import { type ReactNode } from "react";
import { View } from "react-native";

type BodySlotProps = {
  children: ReactNode;
  centered?: boolean;
  grow?: boolean;
};

export default function BodySlot({
  children,
  centered = true,
  grow = true,
}: BodySlotProps) {
  return (
    <View
      className={`${grow ? "flex-1" : ""} ${centered ? "justify-center" : ""}`}
    >
      {children}
    </View>
  );
}
