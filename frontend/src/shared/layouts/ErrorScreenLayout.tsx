import { type ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";

import SafeScreen from "@/shared/layouts/SafeLayout";
import Header from "@/shared/components/Header";
import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";
import MessageBlock from "@/shared/components/errors/MessageBlock";

type ErrorScreenLayoutProps = {
  onBack?: () => void;
  illustration: { uri: string } | number;
  illustrationWidth?: number;
  illustrationHeight?: number;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function ErrorScreenLayout({
  illustration,
  illustrationWidth: _illustrationWidth,
  illustrationHeight: _illustrationHeight,
  title,
  description,
  children,
}: ErrorScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const illustrationWidth = _illustrationWidth ?? width * 0.8;
  const illustrationHeight = _illustrationHeight ?? illustrationWidth * 0.7;

  return (
    <SafeScreen>
      <Header />
      <View className="flex-1 mx-8">
        <IllustrationBlock
          source={illustration}
          width={illustrationWidth}
          height={illustrationHeight}
        />
        <MessageBlock
          compact={compact}
          title={title}
          description={description}
        />
        <View className="flex-1 mt-3">{children}</View>
      </View>
    </SafeScreen>
  );
}
