import { type ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";

import SafeScreen from "@/shared/layouts/SafeLayout";
import Header from "@/shared/components/Header";
import IllustrationBlock from "@/shared/components/commons/IllustrationBlock";
import MessageBlock from "@/shared/components/errors/MessageBlock";
import StatusCards, {
  type StatusCardItem,
} from "@/shared/components/errors/StatusCards";
import ErrorActions, {
  type ErrorAction,
} from "@/shared/components/errors/ErrorActions";

type ErrorScreenLayoutProps = {
  onBack?: () => void;
  illustration: { uri: string } | number;
  illustrationWidth?: number;
  illustrationHeight?: number;
  title: string;
  description: string;
  cards?: StatusCardItem[];
  actions?: ErrorAction[];
  children?: ReactNode;
};

export default function ErrorScreenLayout({
  illustration,
  illustrationWidth: _illustrationWidth,
  illustrationHeight: _illustrationHeight,
  title,
  description,
  cards,
  actions,
  children,
}: ErrorScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const illustrationWidth = _illustrationWidth ?? width * 0.8;
  const illustrationHeight = _illustrationHeight ?? illustrationWidth * 0.7;
  const hasCards = cards && cards.length > 0;
  const hasActions = actions && actions.length > 0;

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
        <View className="flex-1 mt-3">
          {children}
          {hasCards && (
            <StatusCards wrapperClassName="mt-6 gap-3" cards={cards} />
          )}
          {hasActions && <ErrorActions actions={actions} />}
        </View>
      </View>
    </SafeScreen>
  );
}
