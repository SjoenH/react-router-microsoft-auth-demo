/**
 * Solution 3: Entra ID (formerly Azure AD) with PKCE
 * 
 * PKCE (Proof Key for Code Exchange) is the most secure flow for public clients.
 * Originally designed for mobile/native apps, it's now recommended for SPAs too.
 * 
 * Flow:
 * 1. Generate code verifier and challenge
 * 2. Redirect to Microsoft with code challenge
 * 3. User authenticates
 * 4. Microsoft redirects back with code
 * 5. Exchange code + verifier for tokens (no client secret needed)
 * 6. Store in secure cookies
 * 
 * Setup:
 * 1. Register app at https://portal.azure.com
 * 2. Set app as "Public client/native" (enables PKCE)
 * 3. Add redirect URIs
 * 4. Set environment variables: ENTRA_CLIENT_ID, ENTRA_TENANT_ID
 * 
 * Benefits:
 * - No client secret required (more secure for public clients)
 * - Prevents authorization code interception attacks
 * - Modern, recommended approach
 * - Works well with SPAs and server-side rendering
 */

import { createHash, randomBytes } from "crypto";

export interface EntraConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
}

export function getEntraConfig(): EntraConfig {
  const clientId = process.env.ENTRA_CLIENT_ID;
  const tenantId = process.env.ENTRA_TENANT_ID || "common";
  const redirectUri = process.env.ENTRA_REDIRECT_URI || "http://localhost:5173/auth/entra-callback";

  if (!clientId) {
    throw new Error("ENTRA_CLIENT_ID must be set");
  }

  return { clientId, tenantId, redirectUri };
}

export function generateCodeVerifier(): string {
  return base64URLEncode(randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(createHash("sha256").update(verifier).digest());
}

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function getEntraAuthorizationUrl(
  state: string,
  codeChallenge: string
): string {
  const config = getEntraConfig();
  const authority = `https://login.microsoftonline.com/${config.tenantId}`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read offline_access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${authority}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeEntraCodeForTokens(
  code: string,
  codeVerifier: string
) {
  const config = getEntraConfig();
  const authority = `https://login.microsoftonline.com/${config.tenantId}`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${authority}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange Entra code for tokens: ${error}`);
  }

  return await response.json();
}

export async function getEntraUserInfo(accessToken: string) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  return await response.json();
}

export function generateState(): string {
  return base64URLEncode(randomBytes(16));
}
