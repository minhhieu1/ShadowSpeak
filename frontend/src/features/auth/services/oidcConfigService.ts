import { apiClient } from '../../../api/client';
import { validateOidcConfig } from '../lib/oidcConfigValidator';
import type { OidcConfig } from '../types/oidcConfig';

export interface OidcFetchResult {
  ok: boolean;
  config: OidcConfig | null;
  error?: string;
}

/**
 * Fetch OIDC configuration from the backend's runtime config endpoint.
 *
 * The backend returns the config as a plain JSON object (not wrapped in
 * JsonEnvelope), so we validate and cast directly.
 */
export async function fetchOidcConfigFromBackend(): Promise<OidcFetchResult> {
  try {
    const response = await apiClient.get<OidcConfig>('/v1/config/runtime');
    const config = response.data;

    if (!config || !config.issuer) {
      return { ok: false, config: null, error: 'Backend returned empty config' };
    }

    const validation = validateOidcConfig(config);
    if (!validation.valid) {
      return {
        ok: false,
        config: null,
        error: `Invalid config from backend: ${validation.errors.join(', ')}`,
      };
    }

    return { ok: true, config };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch OIDC config';
    return { ok: false, config: null, error: message };
  }
}
