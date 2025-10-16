/**
 * Solution 1: OAuth2 Authorization Code Flow
 * 
 * This is the standard OAuth2 flow for web applications.
 * 
 * Flow:
 * 1. User clicks "Login with Microsoft"
 * 2. Redirect to Microsoft's authorization endpoint
 * 3. User authenticates and consents
 * 4. Microsoft redirects back with authorization code
 * 5. Exchange code for access token
 * 6. Store tokens in secure, httpOnly cookies
 * 7. User is authenticated
 * 
 * Setup:
 * 1. Register app at https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
 * 2. Add redirect URI: http://localhost:5173/auth/callback
 * 3. Generate client secret in "Certificates & secrets"
 * 4. Set environment variables: OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, OAUTH2_TENANT_ID
 * 
 * Security features:
 * - Uses client secret (server-side only)
 * - State parameter to prevent CSRF
 * - HttpOnly cookies to prevent XSS
 * - Secure cookies in production
 */

import type { ActionFunctionArgs } from "react-router";

const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com";

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export function getOAuth2Config(): OAuth2Config {
  const clientId = process.env.OAUTH2_CLIENT_ID;
  const clientSecret = process.env.OAUTH2_CLIENT_SECRET;
  const tenantId = process.env.OAUTH2_TENANT_ID || "common";
  const redirectUri = process.env.OAUTH2_REDIRECT_URI || "http://localhost:5173/auth/callback";

  if (!clientId || !clientSecret) {
    throw new Error("OAUTH2_CLIENT_ID and OAUTH2_CLIENT_SECRET must be set");
  }

  return { clientId, clientSecret, tenantId, redirectUri };
}

export function getAuthorizationUrl(state: string): string {
  const config = getOAuth2Config();
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  });

  return `${MICROSOFT_AUTHORITY}/${config.tenantId}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeCodeForTokens(code: string) {
  const config = getOAuth2Config();
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(
    `${MICROSOFT_AUTHORITY}/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return await response.json();
}

export async function getUserInfo(accessToken: string) {
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
  return Math.random().toString(36).substring(2, 15);
}
