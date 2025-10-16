/**
 * Solution 2: Azure AD B2C Authentication
 * 
 * Azure AD B2C is a customer identity access management (CIAM) solution.
 * It's ideal for customer-facing applications with customizable user flows.
 * 
 * Flow:
 * 1. User clicks "Sign in with Microsoft"
 * 2. Redirect to B2C policy endpoint
 * 3. User signs in/signs up through B2C user flow
 * 4. B2C redirects back with authorization code
 * 5. Exchange code for tokens
 * 6. Store in secure cookies
 * 
 * Setup:
 * 1. Create Azure AD B2C tenant at https://portal.azure.com
 * 2. Register application in B2C tenant
 * 3. Create sign-up/sign-in user flow
 * 4. Configure redirect URIs
 * 5. Set environment variables: B2C_CLIENT_ID, B2C_CLIENT_SECRET, B2C_TENANT_NAME, B2C_POLICY_NAME
 * 
 * Benefits:
 * - Customizable sign-in UI
 * - Built-in user management
 * - Support for social identity providers
 * - Self-service password reset
 */

export interface B2CConfig {
  clientId: string;
  clientSecret: string;
  tenantName: string;
  policyName: string;
  redirectUri: string;
}

export function getB2CConfig(): B2CConfig {
  const clientId = process.env.B2C_CLIENT_ID;
  const clientSecret = process.env.B2C_CLIENT_SECRET;
  const tenantName = process.env.B2C_TENANT_NAME;
  const policyName = process.env.B2C_POLICY_NAME || "B2C_1_signupsignin1";
  const redirectUri = process.env.B2C_REDIRECT_URI || "http://localhost:5173/auth/b2c-callback";

  if (!clientId || !clientSecret || !tenantName) {
    throw new Error("B2C_CLIENT_ID, B2C_CLIENT_SECRET, and B2C_TENANT_NAME must be set");
  }

  return { clientId, clientSecret, tenantName, policyName, redirectUri };
}

export function getB2CAuthorizationUrl(state: string, nonce: string): string {
  const config = getB2CConfig();
  const authority = `https://${config.tenantName}.b2clogin.com/${config.tenantName}.onmicrosoft.com/${config.policyName}`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: `openid profile email ${config.clientId}`,
    state,
    nonce,
  });

  return `${authority}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeB2CCodeForTokens(code: string) {
  const config = getB2CConfig();
  const authority = `https://${config.tenantName}.b2clogin.com/${config.tenantName}.onmicrosoft.com/${config.policyName}`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
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
    throw new Error(`Failed to exchange B2C code for tokens: ${error}`);
  }

  return await response.json();
}

export function parseB2CIdToken(idToken: string) {
  // Decode JWT (simple base64 decode for payload)
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid ID token");
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64").toString("utf-8")
  );

  return {
    id: payload.sub,
    email: payload.emails?.[0] || payload.email,
    name: payload.name,
  };
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}
