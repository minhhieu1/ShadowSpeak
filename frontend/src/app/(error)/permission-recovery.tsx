import { router } from "expo-router";

import PermissionRecoveryScreen from "@/shared/screens/errors/PermissionRecoveryScreen";

export default function PermissionRecoveryRoute() {
  return (
    <PermissionRecoveryScreen
      onOpenSettings={() => {
        // TODO: wire to OS settings deep-link
      }}
      onNotNow={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/");
        }
      }}
    />
  );
}
