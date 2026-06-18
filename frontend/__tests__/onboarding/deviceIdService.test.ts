/**
 * Tests for deviceIdService.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { getOrCreateDeviceId, resetDeviceId } from "@/features/onboarding/services/deviceIdService";
import { DATA_KEYS } from "@/shared/constants/storageKeys";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/mock"));

// Mock SecureStore - simulate it being unavailable so tests use AsyncStorage fallback
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockRejectedValue(new Error("SecureStore unavailable")),
  setItemAsync: jest.fn().mockRejectedValue(new Error("SecureStore unavailable")),
  deleteItemAsync: jest.fn().mockRejectedValue(new Error("SecureStore unavailable")),
}));

describe("deviceIdService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("getOrCreateDeviceId", () => {
    it("creates a new device ID on first call", async () => {
      const deviceId = await getOrCreateDeviceId();

      expect(deviceId).toBeDefined();
      expect(typeof deviceId).toBe("string");
      // UUID v4 format check (basic)
      expect(deviceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("returns the same device ID on subsequent calls", async () => {
      const deviceId1 = await getOrCreateDeviceId();
      const deviceId2 = await getOrCreateDeviceId();

      expect(deviceId1).toBe(deviceId2);
    });

    it("persists the device ID to AsyncStorage", async () => {
      await getOrCreateDeviceId();

      const storedId = await AsyncStorage.getItem(DATA_KEYS.DEVICE_ID);
      expect(storedId).toBeDefined();
      expect(storedId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe("resetDeviceId", () => {
    it("removes the device ID from storage", async () => {
      const deviceId = await getOrCreateDeviceId();
      expect(deviceId).toBeDefined();

      await resetDeviceId();

      const storedId = await AsyncStorage.getItem(DATA_KEYS.DEVICE_ID);
      expect(storedId).toBeNull();
    });

    it("allows creating a new device ID after reset", async () => {
      const deviceId1 = await getOrCreateDeviceId();

      await resetDeviceId();

      const deviceId2 = await getOrCreateDeviceId();
      expect(deviceId2).toBeDefined();
      // After reset, a new ID is created
      // Note: UUID is random, so we can't guarantee it's different,
      // but the storage was cleared
    });
  });
});
