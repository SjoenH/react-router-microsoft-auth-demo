# Implementation Details

This document provides detailed technical information about each authentication solution.

## Architecture Overview

All three solutions follow the same general architecture:

```
┌─────────┐         ┌──────────────┐         ┌──────────────┐
│ Browser │ ──────> │ React Router │ ──────> │  Microsoft   │
│         │         │    Server    │         │   Identity   │
└─────────┘         └──────────────┘         └──────────────┘
     │                     │                         │
     │  1. Click Login     │                         │
     │ ──────────────────> │                         │
     │                     │                         │
     │                     │  2. Redirect to MS     │
     │                     │ ──────────────────────> │
     │                     │                         │
     │  3. User authenticates on Microsoft site      │
     │ <──────────────────────────────────────────── │
     │                     │                         │
     │  4. Redirect with code                        │
     │ ──────────────────> │                         │
     │                     │                         │
     │                     │  5. Exchange code       │
     │                     │ ──────────────────────> │
     │                     │                         │
     │                     │  6. Return tokens       │
     │                     │ <────────────────────── │
     │                     │                         │
     │  7. Set cookie & redirect                     │
     │ <────────────────── │                         │
     │                     │                         │
```

## Solution 1: OAuth2 Authorization Code Flow

### Technical Details

**Protocol:** OAuth 2.0 Authorization Code Grant
**Microsoft Endpoint:** `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/`

### Flow Diagram

```
Client                   Server                  Microsoft
  │                        │                         │
  │   GET /auth/login      │                         │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Generate state          │
  │                        │ Store in session        │
  │                        │                         │
  │   302 redirect         │                         │
  │ <───────────────────── │                         │
  │                        │                         │
  │   GET /authorize?state=xxx&client_id=xxx         │
  │ ──────────────────────────────────────────────> │
  │                        │                         │
  │   User authenticates   │                         │
  │ <──────────────────────────────────────────────> │
  │                        │                         │
  │   302 redirect         │                         │
  │ <────────────────────────────────────────────── │
  │                        │                         │
  │   GET /callback?code=xxx&state=xxx               │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Verify state            │
  │                        │                         │
  │                        │ POST /token             │
  │                        │ + code + secret         │
  │                        │ ──────────────────────> │
  │                        │                         │
  │                        │ Access Token            │
  │                        │ <────────────────────── │
  │                        │                         │
  │                        │ GET /me                 │
  │                        │ ──────────────────────> │
  │                        │                         │
  │                        │ User Info               │
  │                        │ <────────────────────── │
  │                        │                         │
  │                        │ Create session          │
  │   Set-Cookie           │ Store in cookie         │
  │ <───────────────────── │                         │
  │                        │                         │
```

### Key Files

- `app/solutions/solution1-oauth2/oauth2.server.ts` - Core OAuth2 logic
- `app/routes/auth.oauth2.login.tsx` - Initiates flow
- `app/routes/auth.oauth2.callback.tsx` - Handles callback

### Security Considerations

1. **Client Secret**: Stored server-side only, never exposed to client
2. **State Parameter**: Random value stored in session, verified on callback
3. **HTTPS**: Required in production for secure transmission
4. **Token Storage**: Tokens stored in httpOnly cookies, not accessible via JavaScript

### Environment Variables

```bash
OAUTH2_CLIENT_ID=<Azure App Registration Client ID>
OAUTH2_CLIENT_SECRET=<Client Secret from Azure Portal>
OAUTH2_TENANT_ID=<Tenant ID or "common" for multi-tenant>
OAUTH2_REDIRECT_URI=http://localhost:5173/auth/oauth2/callback
```

## Solution 2: Azure AD B2C

### Technical Details

**Protocol:** OAuth 2.0 / OpenID Connect via Azure B2C
**Microsoft Endpoint:** `https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/`

### Flow Diagram

```
Client                   Server                  B2C Tenant
  │                        │                         │
  │   GET /auth/b2c/login  │                         │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Generate state & nonce  │
  │                        │ Store in session        │
  │                        │                         │
  │   302 redirect         │                         │
  │ <───────────────────── │                         │
  │                        │                         │
  │   GET /authorize?policy=B2C_1_signupsignin1      │
  │ ──────────────────────────────────────────────> │
  │                        │                         │
  │   Custom B2C UI        │                         │
  │ <──────────────────────────────────────────────> │
  │                        │                         │
  │   302 redirect         │                         │
  │ <────────────────────────────────────────────── │
  │                        │                         │
  │   GET /callback?code=xxx&state=xxx               │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Verify state            │
  │                        │                         │
  │                        │ POST /token             │
  │                        │ ──────────────────────> │
  │                        │                         │
  │                        │ ID Token + Access Token │
  │                        │ <────────────────────── │
  │                        │                         │
  │                        │ Parse ID Token (JWT)    │
  │                        │ Extract user claims     │
  │                        │ Create session          │
  │   Set-Cookie           │                         │
  │ <───────────────────── │                         │
```

### Key Files

- `app/solutions/solution2-azure-b2c/b2c.server.ts` - B2C logic
- `app/routes/auth.b2c.login.tsx` - Initiates B2C flow
- `app/routes/auth.b2c.callback.tsx` - Handles B2C callback

### B2C-Specific Features

1. **User Flows**: Pre-built authentication experiences
   - Sign-up and sign-in
   - Profile editing
   - Password reset
   - Multi-factor authentication

2. **Custom Policies**: Advanced customization
   - Custom user journeys
   - Integration with external identity providers
   - Advanced validation rules

3. **Identity Providers**: Easy integration
   - Microsoft Account
   - Google
   - Facebook
   - Twitter
   - LinkedIn
   - Custom OAuth2/OpenID providers

### Environment Variables

```bash
B2C_CLIENT_ID=<B2C Application Client ID>
B2C_CLIENT_SECRET=<B2C Client Secret>
B2C_TENANT_NAME=<B2C Tenant Name (without .onmicrosoft.com)>
B2C_POLICY_NAME=B2C_1_signupsignin1
B2C_REDIRECT_URI=http://localhost:5173/auth/b2c/callback
```

### Setting Up B2C

1. Create B2C tenant in Azure Portal
2. Register application
3. Create user flow:
   - Select "Sign up and sign in"
   - Choose identity providers
   - Configure user attributes
   - Configure application claims
4. Note the policy name (e.g., B2C_1_signupsignin1)

## Solution 3: Entra ID with PKCE

### Technical Details

**Protocol:** OAuth 2.0 Authorization Code Grant with PKCE (RFC 7636)
**Microsoft Endpoint:** `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/`

### Flow Diagram

```
Client                   Server                  Entra ID
  │                        │                         │
  │   GET /auth/entra/login│                         │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Generate:               │
  │                        │ - state                 │
  │                        │ - code_verifier         │
  │                        │ - code_challenge        │
  │                        │   (SHA256 hash)         │
  │                        │ Store verifier in session│
  │                        │                         │
  │   302 redirect         │                         │
  │ <───────────────────── │                         │
  │                        │                         │
  │   GET /authorize?code_challenge=xxx              │
  │ ──────────────────────────────────────────────> │
  │                        │                         │
  │   User authenticates   │                         │
  │ <──────────────────────────────────────────────> │
  │                        │                         │
  │   302 redirect         │                         │
  │ <────────────────────────────────────────────── │
  │                        │                         │
  │   GET /callback?code=xxx&state=xxx               │
  │ ─────────────────────> │                         │
  │                        │                         │
  │                        │ Verify state            │
  │                        │ Get verifier from session│
  │                        │                         │
  │                        │ POST /token             │
  │                        │ + code                  │
  │                        │ + code_verifier         │
  │                        │ (NO CLIENT SECRET!)     │
  │                        │ ──────────────────────> │
  │                        │                         │
  │                        │ Microsoft verifies:     │
  │                        │ SHA256(verifier) ==     │
  │                        │   code_challenge        │
  │                        │                         │
  │                        │ Access Token            │
  │                        │ <────────────────────── │
  │                        │                         │
  │                        │ GET /me                 │
  │                        │ ──────────────────────> │
  │                        │                         │
  │                        │ User Info               │
  │                        │ <────────────────────── │
  │                        │                         │
  │   Set-Cookie           │ Create session          │
  │ <───────────────────── │                         │
```

### Key Files

- `app/solutions/solution3-entra-pkce/entra.server.ts` - PKCE logic
- `app/routes/auth.entra.login.tsx` - Initiates PKCE flow
- `app/routes/auth.entra.callback.tsx` - Handles PKCE callback

### PKCE Mechanics

1. **Code Verifier**: Random 32-byte string
   ```typescript
   const verifier = base64URLEncode(randomBytes(32));
   ```

2. **Code Challenge**: SHA256 hash of verifier
   ```typescript
   const challenge = base64URLEncode(
     createHash("sha256").update(verifier).digest()
   );
   ```

3. **Authorization Request**: Includes code_challenge
   ```
   https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?
     client_id={client_id}&
     response_type=code&
     code_challenge={challenge}&
     code_challenge_method=S256
   ```

4. **Token Request**: Includes code_verifier (no client secret!)
   ```
   POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
   Content-Type: application/x-www-form-urlencoded
   
   code={code}&
   code_verifier={verifier}&
   grant_type=authorization_code
   ```

### Security Advantages

1. **No Client Secret**: Eliminates risk of secret exposure
2. **Authorization Code Protection**: Even if code is intercepted, attacker needs verifier
3. **Dynamic Per-Request**: New verifier/challenge for each login attempt
4. **Cryptographic Binding**: Code is bound to specific PKCE pair

### Environment Variables

```bash
ENTRA_CLIENT_ID=<Azure App Registration Client ID>
ENTRA_TENANT_ID=<Tenant ID or "common">
ENTRA_REDIRECT_URI=http://localhost:5173/auth/entra/callback
```

### Setting Up Entra with PKCE

1. Register app in Azure Portal
2. **Important**: Set platform type to "Public client/native"
   - This enables PKCE
   - Disables client secret requirement
3. Add redirect URIs for your environment
4. Enable "Access tokens" and "ID tokens" in Authentication settings
5. Configure API permissions:
   - Microsoft Graph: User.Read
   - openid, profile, email, offline_access

## Session Management (All Solutions)

All three solutions use the same session management implementation.

### Cookie Configuration

```typescript
createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,        // Can't be accessed by JavaScript
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    path: "/",
    sameSite: "lax",       // CSRF protection
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});
```

### Session Data Structure

```typescript
interface SessionData {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
```

### Helper Functions

1. **createUserSession**: Creates a new session and sets cookie
2. **getUserSession**: Retrieves session from cookie
3. **getUser**: Gets user data from session
4. **requireUser**: Protected route helper - throws 401 if not authenticated
5. **logout**: Destroys session and clears cookie

### Protected Routes

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}
```

## Comparison Table

| Feature | OAuth2 | B2C | Entra PKCE |
|---------|--------|-----|------------|
| Client Secret | Required | Required | Not Required |
| Setup Complexity | Medium | High | Low |
| Custom UI | No | Yes | No |
| Social Login | Manual | Built-in | Manual |
| User Management | External | Built-in | External |
| Security Level | High | High | Highest |
| Best For | Enterprise | Customer Apps | Modern Apps |
| Token Exchange | Server-side | Server-side | Server-side |
| CSRF Protection | State | State | State |
| Code Interception | Protected by secret | Protected by secret | Protected by PKCE |

## Production Checklist

Before deploying to production:

- [ ] Use strong SESSION_SECRET (32+ characters)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper redirect URIs in Azure
- [ ] Enable Azure AD security features:
  - [ ] Conditional Access policies
  - [ ] Multi-factor authentication
  - [ ] Sign-in risk policies
- [ ] Implement token refresh logic
- [ ] Add error logging and monitoring
- [ ] Set up rate limiting on auth routes
- [ ] Configure CORS properly
- [ ] Review and minimize token scopes
- [ ] Implement session timeout handling
- [ ] Add audit logging for authentication events

## Troubleshooting

### Common Issues

1. **"CSRF validation failed"**
   - State parameter mismatch
   - Solution: Check session storage is working correctly

2. **"Invalid redirect_uri"**
   - Redirect URI not registered in Azure
   - Solution: Add exact URI to Azure app registration

3. **"Unauthorized" (401)**
   - Session expired or invalid
   - Solution: Implement token refresh or re-authenticate

4. **"Failed to exchange code"**
   - Incorrect client secret or PKCE verifier
   - Solution: Verify environment variables

5. **B2C: "Policy not found"**
   - Incorrect policy name
   - Solution: Check B2C portal for exact policy name

## Additional Security Recommendations

1. **Implement Token Refresh**: Auto-refresh tokens before expiration
2. **Add Rate Limiting**: Prevent brute force attacks on auth routes
3. **Use Short-Lived Tokens**: Request minimal token lifetimes
4. **Implement Logout Everywhere**: Clear all sessions on logout
5. **Add Activity Logging**: Track authentication events
6. **Use Conditional Access**: Leverage Azure AD security policies
7. **Enable MFA**: Require multi-factor authentication
8. **Monitor Failed Logins**: Alert on suspicious activity
9. **Implement Session Fixation Protection**: Regenerate session ID after login
10. **Use Content Security Policy**: Add CSP headers to prevent XSS
