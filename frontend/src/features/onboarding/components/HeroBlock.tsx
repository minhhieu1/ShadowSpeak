import { Image, View, useWindowDimensions } from "react-native";

type HeroBlockProps = {
  source: { uri: string } | number;
  size?: "sm" | "md" | "lg";
};

export default function HeroBlock({ source, size = "md" }: HeroBlockProps) {
  const { width } = useWindowDimensions();

  const sizeMap = {
    sm: 120,
    md: 160,
    lg: width * 0.55,
  };

  const imageSize = sizeMap[size];

  return (
    <View
      className="items-center justify-center mt-4"
      style={{ width: imageSize, height: imageSize, alignSelf: "center" }}
    >
      <Image
        source={source}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
