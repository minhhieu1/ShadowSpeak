import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { assets } from "@/assets";
import { AppHeader } from "@/components/AppHeader";
import { InfoCard } from "@/components/InfoCard";
import { SectionTitle } from "@/components/SectionTitle";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 92 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <SectionTitle title="Settings" action="Edit" />
          <InfoCard
            image={assets.badges.brandWaveformAudio}
            title="Playback"
            body="Speed, pause timing, and screen-off practice preferences."
          />
          {[
            "Reminder settings",
            "Consent settings",
            "Recording library",
            "Account management",
          ].map((item) => (
            <View key={item} className="min-h-[56px] bg-surface border border-border rounded-card flex-row items-center justify-between px-4">
              <Text className="text-base text-text">{item}</Text>
              <Text className="text-h2 text-text-muted">›</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
