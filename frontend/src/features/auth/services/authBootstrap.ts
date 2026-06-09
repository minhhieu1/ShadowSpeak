import { OidcConfigManager } from '../lib/oidcConfigManager';
import { loadOidcConfig, saveOidcConfig } from '../store/oidcConfigStore';
import { fetchOidcConfigFromBackend } from './oidcConfigService';
import { validateOidcConfig } from '../lib/oidcConfigValidator';

export interface BootstrapResult {
  ok: boolean;
  source: 'backend' | 'cache' | 'none';
  error?: string;
}

export async function authBootstrap(): Promise<BootstrapResult> {
  const mgr = OidcConfigManager.getInstance();

  // 1. Check cache first — OIDC config rarely changes, avoid unnecessary
  //    backend calls on every app start.
  //    Validate cached config before using it — a tampered or corrupt
  //    cache should fall through to the backend rather than break auth.
  const cached = await loadOidcConfig();

  if (cached) {
    const validation = validateOidcConfig(cached);
    if (validation.valid) {
      mgr.set(cached);
      return { ok: true, source: 'cache' };
    }
    // Invalid cache — log and fall through to backend.
    console.warn('[authBootstrap] Cached config invalid, fetching from backend');
  }

  // 2. Cache empty or invalid — fetch from backend and persist.
  const backendResult = await fetchOidcConfigFromBackend();

  if (backendResult.ok && backendResult.config) {
    mgr.set(backendResult.config);
    await saveOidcConfig(backendResult.config);
    return { ok: true, source: 'backend' };
  }

  // 3. Nothing available anywhere.
  return {
    ok: false,
    source: 'none',
    error: backendResult.error ?? 'No OIDC config available',
  };
}
