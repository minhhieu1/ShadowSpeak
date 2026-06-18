// Mock for expo-router
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

const MockLink = "Link";
const MockRedirect = "Redirect";
const MockStack = "Stack";
const MockTabs = "Tabs";
const MockSlot = "Slot";

const useRouter = () => mockRouter;
const usePathname = () => "/";
const useSearchParams = () => ({});
const useLocalSearchParams = () => ({});
const useGlobalSearchParams = () => ({});
const useNavigation = () => ({
  addListener: jest.fn(() => () => {}),
  navigate: jest.fn(),
  goBack: jest.fn(),
});

const SplashScreen = {
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
};

const ErrorBoundary = ({ children }) => children;

module.exports = {
  router: mockRouter,
  Link: MockLink,
  Redirect: MockRedirect,
  Stack: MockStack,
  Tabs: MockTabs,
  Slot: MockSlot,
  useRouter,
  usePathname,
  useSearchParams,
  useLocalSearchParams,
  useGlobalSearchParams,
  useNavigation,
  SplashScreen,
  ErrorBoundary,
};
