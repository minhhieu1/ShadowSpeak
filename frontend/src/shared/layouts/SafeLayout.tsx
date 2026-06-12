import { type ReactNode } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeScreenProps = {
  children: ReactNode;
};

export default function SafeScreen({ children }: SafeScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="dark-content" />
      {children}
    </SafeAreaView>
  );
}
