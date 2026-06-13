import { View } from "react-native";

import HeroBlock from "./HeroBlock";
import TitleBlock from "./TitleBlock";

type OnboardingHeaderProps = {
  source: { uri: string } | number;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
};

export default function OnboardingHeader({
  source,
  title,
  subtitle,
  size = "md",
}: OnboardingHeaderProps) {
  return (
    <View>
      <HeroBlock source={source} size={size} />
      <TitleBlock title={title} subtitle={subtitle} />
    </View>
  );
}
