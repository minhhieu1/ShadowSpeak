/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setup-after-env.js'],
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|expo-secure-store|@react-native-async-storage|uuid|@expo|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-paper|react-native-css-interop)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.ts',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.ts',
    '^expo-audio$': '<rootDir>/__mocks__/expo-audio.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    '^@react-native-async-storage/async-storage/mock$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/jest/async-storage-mock.js',
    '\\.(webp|png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
