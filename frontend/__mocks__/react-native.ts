// Mock for react-native
// Used in tests to avoid ESM/import issues from react-native package itself

const ReactNative: any = {
  Platform: {
    OS: "ios",
    Version: "16.0",
    select: (obj: any) => obj.ios || obj.default,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (styles: any) => styles,
    hairlineWidth: 1,
    absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  },
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size: number) => size * 2,
    roundToNearestPixel: (size: number) => Math.round(size),
  },
  BackHandler: {
    exitApp: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  View: "View",
  Text: "Text",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  ActivityIndicator: "ActivityIndicator",
  Image: "Image",
  TextInput: "TextInput",
  Switch: "Switch",
  TouchableOpacity: "TouchableOpacity",
  TouchableHighlight: "TouchableHighlight",
  TouchableWithoutFeedback: "TouchableWithoutFeedback",
  KeyboardAvoidingView: "KeyboardAvoidingView",
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    openSettings: jest.fn(),
  },
  NativeModules: {},
  useColorScheme: () => "light",
  useWindowDimensions: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
};

module.exports = ReactNative;
module.exports.default = ReactNative;
