import { View, Text } from "react-native";

type TitleBlockProps = {
  title: string;
  subtitle?: string;
};

export default function TitleBlock({ title, subtitle }: TitleBlockProps) {
  return (
    <View className="items-center mt-6">
      <Text className="text-h1 text-primary font-bold text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-center leading-relaxed text-text-muted text-base mt-3">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
