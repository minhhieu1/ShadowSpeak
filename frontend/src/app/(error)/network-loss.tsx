import NetworkLossScreen from "@/shared/screens/errors/NetworkLossScreen";

export default function NetworkLossRoute() {
  return (
    <NetworkLossScreen
      downloadCount={3}
      onRetry={() => {
        // TODO: wire to network check / retry handler
      }}
    />
  );
}
