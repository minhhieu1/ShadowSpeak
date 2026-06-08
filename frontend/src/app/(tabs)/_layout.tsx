import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const tabs = [
  { name: "index", title: "Home", icon: "home" as const },
  { name: "lessons", title: "Lessons", icon: "book-open-variant" as const },
  { name: "downloads", title: "Downloads", icon: "cloud-download-outline" as const },
  { name: "progress", title: "Progress", icon: "chart-line" as const },
  { name: "settings", title: "Settings", icon: "cog-outline" as const },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D6D9DE",
          borderTopWidth: 1,
          minHeight: 76,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#0E5A6A",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
