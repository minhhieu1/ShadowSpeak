// React Native / Metro sets __DEV__ automatically in dev builds.
// Jest does not, so we define it here so guarded code paths (token
// storage fallback, API URL fallback) work correctly in tests.
global.__DEV__ = true;

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
}));

// Mock expo-audio (replaced expo-av in SDK 56)
jest.mock("expo-audio", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "undetermined" }),
}));

// Note: expo-secure-store is mocked via __mocks__/expo-secure-store.ts
// which provides test helpers (__setAvailable, __setShouldThrow, __resetMockStore)

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaConsumer: ({ children }) => children(null),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-paper
jest.mock("react-native-paper", () => {
  const React = require("react");
  const colors = {
    primary: "#0E5A6A",
    primaryContainer: "#0A4652",
    secondary: "#D97706",
    tertiary: "#0E5A6A",
    success: "#1F8A70",
    background: "#F7F5F0",
    surface: "#FFFFFF",
    surfaceVariant: "#EEF2F5",
    error: "#C2410C",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#111827",
    onSurface: "#111827",
    onSurfaceVariant: "#6B7280",
    outline: "#D6D9DE",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FFFFFF",
    },
  };
  const TextInput = React.forwardRef((props, ref) =>
    React.createElement("TextInput", { ...props, ref })
  );
  TextInput.Icon = (props) => React.createElement("TextInputIcon", props);
  return {
    __esModule: true,
    Provider: ({ children }) => React.createElement(React.Fragment, null, children),
    PaperProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    Button: "Button",
    Icon: "Icon",
    Switch: "Switch",
    Text: "Text",
    View: "View",
    TextInput,
    MD3LightTheme: { colors, roundness: 8 },
    MD3DarkTheme: { colors, roundness: 8 },
    useTheme: () => ({ colors, roundness: 8 }),
  };
});

// Mock react-native BackHandler
jest.mock("react-native/Libraries/Utilities/BackHandler", () => ({
  exitApp: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock NativeWind / react-native-css-interop to strip className in tests
jest.mock("react-native-css-interop", () => ({
  __esModule: true,
  styled: (Component) => Component,
  cssInterop: () => (Component) => Component,
  remapProps: () => {},
  useColorScheme: () => "light",
  StyleSheet: { create: (styles) => styles, flatten: (styles) => styles },
}));
