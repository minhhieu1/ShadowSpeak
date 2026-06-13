import { View, Text } from "react-native";

import { icons } from "@/shared/constants/icons";
import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";

export default function AgePolicyBlockScreen() {
  const actions = [
    {
      label: "Exit",
      onPress: () => console.log("AgePolicyBlock: Exit pressed"),
      icon: icons.EXIT_TO_APP,
    },
  ];
  return (
    <ErrorScreenLayout
      illustration={assets.onboarding.agePolicy}
      title="Age Policy Block"
      description=""
      actions={actions}
    >
      <View className="flex-1">
        <Text className="text-h3 text-text text-center">
          {`ShadowSpeak is intended for learners \n aged 13 years old and above.`}
        </Text>
        <Text className="text-center mt-3 text-text-muted text-base">
          {`We're sorry, but you can't use \n this app at this time.`}
        </Text>
      </View>
    </ErrorScreenLayout>
  );
}
