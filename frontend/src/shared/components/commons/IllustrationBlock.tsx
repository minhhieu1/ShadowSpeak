import { Image, View } from "react-native";

type IllustrationBlockProps = {
  source: { uri: string } | number;
  width: number;
  height: number;
};

export default function IllustrationBlock({
  source,
  width,
  height,
}: IllustrationBlockProps) {
  return (
    <View className="items-center">
      <Image source={source} style={{ width, height }} resizeMode="contain" />
    </View>
  );
}
