import { View } from "react-native";

import { assets } from "@/assets";
import ErrorScreenLayout from "@/shared/layouts/ErrorScreenLayout";
import ActionFooter from "../components/ActionFooter";

export default function AgePolicyBlockScreen() {
  return (
    <ErrorScreenLayout
      illustration={assets.onboarding.agePolicy}
      title="Age Policy Block"
      description="ShadowSpeak is for learners 13 years old and above. We're sorry, but you can't use this app at this time."
    >
      <View className="justify-end flex-1">
        <ActionFooter
          topSpacing={false}
          actions={[
            {
              label: "Exit",
              onPress: () => console.log("AgePolicyBlock: Exit pressed"),
            },
            {
              label: "Support",
              mode: "outlined",
              onPress: () => console.log("AgePolicyBlock: Support pressed"),
            },
          ]}
        />
      </View>
    </ErrorScreenLayout>
  );
}
