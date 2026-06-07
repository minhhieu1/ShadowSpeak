import type { OidcConfig, OidcProvider } from './oidcConfigTypes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_PROVIDERS: OidcProvider[] = ['keycloak', 'cognito'];

export function validateOidcConfig(config: OidcConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.issuer || typeof config.issuer !== 'string') {
    errors.push('issuer');
  }

  if (!config.clientId || typeof config.clientId !== 'string') {
    errors.push('clientId');
  }

  if (!config.redirectUri || typeof config.redirectUri !== 'string') {
    errors.push('redirectUri');
  }

  if (!VALID_PROVIDERS.includes(config.provider)) {
    errors.push('provider');
  }

  if (!Array.isArray(config.scopes) || config.scopes.length === 0) {
    errors.push('scopes');
  }

  // Per OIDC spec, the "openid" scope is mandatory for OpenID Connect flows.
  if (!Array.isArray(config.scopes) || !config.scopes.includes('openid')) {
    errors.push('scopes (missing openid)');
  }

  if (typeof config.version !== 'number' || config.version < 0) {
    errors.push('version');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
