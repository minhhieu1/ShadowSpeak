import { router } from "expo-router";

import SessionExpiredScreen from "@/shared/screens/errors/SessionExpiredScreen";

export default function SessionExpiredRoute() {
  return (
    <SessionExpiredScreen
      onSignInAgain={() => {
        router.replace("/");
      }}
      onContinueOffline={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}
