import { router } from "expo-router";

import StorageFullScreen from "@/shared/screens/errors/StorageFullScreen";

export default function StorageFullRoute() {
  return (
    <StorageFullScreen
      onManageStorage={() => {
        // TODO: wire to OS settings deep-link for storage management
      }}
      onReturnHome={() => {
        router.replace("/");
      }}
    />
  );
}
