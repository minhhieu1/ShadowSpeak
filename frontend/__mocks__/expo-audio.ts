/**
 * Mock for expo-audio module.
 * Used in Jest tests to avoid native module errors.
 */

export interface PermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  granted?: boolean;
  canAskAgain?: boolean;
}

export async function requestPermissionsAsync(): Promise<PermissionStatus> {
  return { status: 'granted', granted: true, canAskAgain: true };
}

export async function getPermissionsAsync(): Promise<PermissionStatus> {
  return { status: 'granted', granted: true, canAskAgain: true };
}

export async function playAsync(source: any, options?: any): Promise<void> {
  return Promise.resolve();
}

export async function stopAsync(): Promise<void> {
  return Promise.resolve();
}

export async function pauseAsync(): Promise<void> {
  return Promise.resolve();
}

export async function resumeAsync(): Promise<void> {
  return Promise.resolve();
}

export async function seekAsync(positionMillis: number): Promise<void> {
  return Promise.resolve();
}

export async function setVolumeAsync(volume: number): Promise<void> {
  return Promise.resolve();
}

export async function setMutedAsync(muted: boolean): Promise<void> {
  return Promise.resolve();
}

export async function setLoopAsync(loop: boolean): Promise<void> {
  return Promise.resolve();
}

export async function setRateAsync(rate: number): Promise<void> {
  return Promise.resolve();
}

export async function recordAsync(options?: any): Promise<{ uri: string }> {
  return { uri: 'mock-recording-uri' };
}

export async function stopRecordingAsync(): Promise<{ uri: string }> {
  return { uri: 'mock-recording-uri' };
}

export async function pauseRecordingAsync(): Promise<void> {
  return Promise.resolve();
}

export async function resumeRecordingAsync(): Promise<void> {
  return Promise.resolve();
}

export default {
  requestPermissionsAsync,
  getPermissionsAsync,
  playAsync,
  stopAsync,
  pauseAsync,
  resumeAsync,
  seekAsync,
  setVolumeAsync,
  setMutedAsync,
  setLoopAsync,
  setRateAsync,
  recordAsync,
  stopRecordingAsync,
  pauseRecordingAsync,
  resumeRecordingAsync,
};
