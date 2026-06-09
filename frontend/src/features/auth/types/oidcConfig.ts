export type OidcProvider = 'keycloak' | 'cognito';

export interface OidcConfig {
  version: number;
  provider: OidcProvider;
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  revocationEndpoint?: string;
  endSessionEndpoint?: string;
}
