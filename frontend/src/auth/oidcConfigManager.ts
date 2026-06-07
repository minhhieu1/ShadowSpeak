import type { OidcConfig } from './oidcConfigTypes';

export class OidcConfigManager {
  private static instance: OidcConfigManager | undefined;
  private config: OidcConfig | null = null;

  private constructor() {}

  static getInstance(): OidcConfigManager {
    if (!OidcConfigManager.instance) {
      OidcConfigManager.instance = new OidcConfigManager();
    }
    return OidcConfigManager.instance;
  }

  /** Reset the singleton (for test isolation). */
  static resetInstance(): void {
    OidcConfigManager.instance = undefined;
  }

  get(): OidcConfig | null {
    return this.config;
  }

  set(config: OidcConfig): void {
    this.config = config;
  }

  clear(): void {
    this.config = null;
  }

  isReady(): boolean {
    return this.config !== null;
  }
}
