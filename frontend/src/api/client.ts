export type JsonEnvelope<T> = {
  ok: boolean;
  requestId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/v1';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': `${Date.now()}`,
    },
  });
  const envelope = (await response.json()) as JsonEnvelope<T>;
  if (!response.ok || !envelope.ok || envelope.data === undefined) {
    throw new Error(envelope.error?.message ?? 'ShadowSpeak API request failed');
  }
  return envelope.data;
}
