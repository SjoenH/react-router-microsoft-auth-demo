# React Router Microsoft Auth Demo

This repository demonstrates **three different approaches** to implement Microsoft authentication in React Router v7 using **web standards-based authentication** (not React-based auth). All solutions follow React Router's best practices for sessions and cookies.

## 🌟 Features

- ✅ **Server-side authentication flows** (no client-side token storage)
- ✅ **Secure httpOnly cookies** following [React Router cookie best practices](https://reactrouter.com/explanation/sessions-and-cookies)
- ✅ **Protection against XSS and CSRF attacks**
- ✅ **Three complete, working solutions** you can choose from
- ✅ **TypeScript** with full type safety
- ✅ **React Router v7** in framework mode

## 🔐 Three Solutions

### Solution 1: OAuth2 Authorization Code Flow (Standard)

**Best for:** Traditional server-side web applications

**How it works:**
1. User clicks "Sign in with OAuth2"
2. Redirects to Microsoft authorization endpoint
3. User authenticates and grants consent
4. Microsoft redirects back with authorization code
5. Server exchanges code for access token using client secret
6. Token stored in secure, httpOnly cookie
7. User is authenticated

**Security features:**
- Client secret (server-side only)
- State parameter for CSRF protection
- HttpOnly cookies prevent XSS
- No tokens exposed to client

**Setup required:**
```bash
# Register app at https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
# Add redirect URI: http://localhost:5173/auth/oauth2/callback
# Create client secret in "Certificates & secrets"

OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret
OAUTH2_TENANT_ID=your-tenant-id-or-common
OAUTH2_REDIRECT_URI=http://localhost:5173/auth/oauth2/callback
```

**Routes:**
- `/auth/oauth2/login` - Initiates OAuth2 flow
- `/auth/oauth2/callback` - Handles Microsoft redirect

---

### Solution 2: Azure AD B2C (Customer Identity)

**Best for:** Customer-facing applications with custom user experiences

**How it works:**
1. User clicks "Sign in with B2C"
2. Redirects to Azure B2C tenant with custom policy
3. User signs in/up through customizable B2C UI
4. B2C redirects back with authorization code
5. Server exchanges code for tokens
6. Session stored in secure cookie

**Benefits:**
- Customizable sign-in/sign-up UI
- Built-in user management
- Social identity providers (Google, Facebook, etc.)
- Self-service password reset
- Multi-factor authentication

**Setup required:**
```bash
# Create Azure AD B2C tenant at https://portal.azure.com
# Register application in B2C tenant
# Create user flow (e.g., B2C_1_signupsignin1)
# Configure redirect URIs

B2C_CLIENT_ID=your-b2c-client-id
B2C_CLIENT_SECRET=your-b2c-client-secret
B2C_TENANT_NAME=your-b2c-tenant-name
B2C_POLICY_NAME=B2C_1_signupsignin1
B2C_REDIRECT_URI=http://localhost:5173/auth/b2c/callback
```

**Routes:**
- `/auth/b2c/login` - Initiates B2C flow
- `/auth/b2c/callback` - Handles B2C redirect

---

### Solution 3: Entra ID with PKCE (Modern & Secure)

**Best for:** Modern applications, SPAs, and highest security requirements

**How it works:**
1. Generate code verifier and SHA256 challenge
2. User clicks "Sign in with Entra"
3. Redirects to Microsoft with code challenge (no secret!)
4. User authenticates
5. Microsoft redirects back with authorization code
6. Server exchanges code + verifier for tokens
7. Session stored in secure cookie

**Benefits:**
- **Most secure** - No client secret needed
- Prevents authorization code interception
- Recommended by Microsoft for modern apps
- Works great with SPAs and SSR
- PKCE (RFC 7636) standard

**Setup required:**
```bash
# Register app at https://portal.azure.com
# Set platform to "Public client/native" (enables PKCE)
# Add redirect URIs
# No client secret needed!

ENTRA_CLIENT_ID=your-entra-client-id
ENTRA_TENANT_ID=your-entra-tenant-id
ENTRA_REDIRECT_URI=http://localhost:5173/auth/entra/callback
```

**Routes:**
- `/auth/entra/login` - Initiates PKCE flow
- `/auth/entra/callback` - Handles Entra redirect

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required for all solutions:**
```bash
SESSION_SECRET=your-secret-key-at-least-32-characters-long
```

**Then choose ONE solution** and configure its specific environment variables (see solution details above).

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see all three authentication options.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
app/
├── lib/
│   └── session.server.ts          # Cookie session management
├── solutions/
│   ├── solution1-oauth2/           # OAuth2 implementation
│   ├── solution2-azure-b2c/        # Azure B2C implementation
│   └── solution3-entra-pkce/       # Entra PKCE implementation
├── routes/
│   ├── home.tsx                    # Landing page with login options
│   ├── dashboard.tsx               # Protected route example
│   ├── auth.logout.tsx             # Logout handler
│   ├── auth.oauth2.login.tsx       # OAuth2 login
│   ├── auth.oauth2.callback.tsx    # OAuth2 callback
│   ├── auth.b2c.login.tsx          # B2C login
│   ├── auth.b2c.callback.tsx       # B2C callback
│   ├── auth.entra.login.tsx        # Entra login
│   └── auth.entra.callback.tsx     # Entra callback
└── root.tsx                        # App root layout
```

## 🔒 Security Best Practices

All solutions implement:

### Cookie Security
- **HttpOnly:** Cookies can't be accessed by JavaScript (XSS protection)
- **SameSite=Lax:** Protection against CSRF attacks
- **Secure:** Only sent over HTTPS in production
- **7-day expiration:** Reasonable session length

### Authentication Flow Security
- **State parameter:** CSRF protection on OAuth redirects
- **Server-side token exchange:** No tokens exposed to client
- **PKCE (Solution 3):** Protection against authorization code interception
- **No client-side secrets:** All secrets stay on server

### Session Management
Following [React Router's session documentation](https://reactrouter.com/explanation/sessions-and-cookies):
- Uses `createCookieSessionStorage` from React Router
- Encrypted session data
- Automatic cookie management
- Built-in CSRF protection

## 🤔 Which Solution Should I Choose?

| Scenario | Recommended Solution | Why? |
|----------|---------------------|------|
| Enterprise internal app | **Solution 1: OAuth2** | Standard, well-supported, works with existing Azure AD |
| Customer-facing app | **Solution 2: B2C** | Customizable UI, social login, user management |
| New modern app | **Solution 3: Entra PKCE** | Most secure, no secrets, future-proof |
| SPA with SSR | **Solution 3: Entra PKCE** | Best security without backend secrets |
| Need social login | **Solution 2: B2C** | Built-in social identity providers |
| Highest security | **Solution 3: Entra PKCE** | No client secret, PKCE protection |

## 📚 Additional Resources

- [React Router Sessions and Cookies](https://reactrouter.com/explanation/sessions-and-cookies)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [PKCE (RFC 7636)](https://oauth.net/2/pkce/)
- [Azure AD B2C Documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/)

## 🛠️ Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Run production build
npm run typecheck  # Run TypeScript type checking
```

## �� License

MIT

## 🤝 Contributing

Feedback and contributions are welcome! This demo is meant to showcase different approaches to Microsoft authentication in React Router v7.
