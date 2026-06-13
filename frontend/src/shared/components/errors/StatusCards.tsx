import { View } from "react-native";

import StatusCard from "./StatusCard";

export type StatusCardItem = {
  /** Leading icon name (MaterialCommunityIcons). */
  icon: string;
  /** Color of the leading icon itself. */
  iconColor?: string;
  /** NativeWind classes for the circular icon container. */
  iconContainerClassName?: string;
  /** Main line. */
  title: string;
  /** Secondary line beneath the title. */
  subtitle?: string;
  /** Called when the user taps the card. */
  onPress?: () => void;
  /** Per-card container override. */
  containerClassName?: string;
  /** Test ID. */
  testID?: string;
};

type StatusCardsProps = {
  cards: StatusCardItem[];
  /** NativeWind classes for the outer wrapper (e.g. `mt-6`). */
  wrapperClassName?: string;
};

/**
 * Renders a vertical stack of StatusCards with consistent gap spacing.
 * Mirrors the ErrorActions pattern: pass a list of items instead of
 * manually repeating `<StatusCard>` JSX and wrapper `<View>` markup.
 */
export default function StatusCards({
  cards,
  wrapperClassName = "gap-3",
}: StatusCardsProps) {
  if (cards.length === 0) return null;

  return (
    <View className={wrapperClassName}>
      {cards.map((card, index) => (
        <StatusCard
          key={`${card.title}-${index}`}
          icon={card.icon}
          iconColor={card.iconColor}
          iconContainerClassName={card.iconContainerClassName}
          title={card.title}
          subtitle={card.subtitle}
          onPress={card.onPress}
          containerClassName={card.containerClassName}
          testID={card.testID}
        />
      ))}
    </View>
  );
}
