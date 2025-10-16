# Setup Guide

This guide will help you set up Microsoft authentication for your React Router v7 application.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm
- Azure account (free tier works)
- Basic understanding of OAuth2

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/SjoenH/react-router-microsoft-auth-demo.git
cd react-router-microsoft-auth-demo

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Generate Session Secret

```bash
# Generate a secure random secret (32+ characters)
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using online generator
# Visit: https://www.grc.com/passwords.htm
```

Add the generated secret to `.env`:
```bash
SESSION_SECRET=your-generated-secret-here
```

### 3. Choose Your Solution

You can set up one, two, or all three solutions. Follow the guide for your chosen solution(s).

---

## Solution 1: OAuth2 Setup

### A. Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name:** Your app name (e.g., "My React Router App")
   - **Supported account types:** Choose based on your needs:
     - Single tenant: Only your organization
     - Multi-tenant: Any Azure AD organization
     - Multi-tenant + Personal accounts: Recommended for most apps
   - **Redirect URI:** 
     - Platform: **Web**
     - URI: `http://localhost:5173/auth/oauth2/callback`
5. Click **Register**

### B. Configure Application

1. On the app overview page, copy the **Application (client) ID**
2. Copy the **Directory (tenant) ID**
3. Go to **Certificates & secrets**
4. Click **New client secret**
5. Add description (e.g., "Development secret")
6. Choose expiration (recommended: 6 months for dev)
7. Click **Add**
8. **Important:** Copy the secret VALUE immediately (you can't see it again!)

### C. Set API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `openid`
   - `profile`
   - `email`
6. Click **Add permissions**
7. (Optional) Click **Grant admin consent** if you're admin

### D. Update .env File

```bash
OAUTH2_CLIENT_ID=your-client-id-from-step-B
OAUTH2_CLIENT_SECRET=your-client-secret-from-step-B
OAUTH2_TENANT_ID=your-tenant-id-from-step-B
OAUTH2_REDIRECT_URI=http://localhost:5173/auth/oauth2/callback
```

### E. Test Solution 1

```bash
npm run dev
# Visit http://localhost:5173
# Click "Sign in with OAuth2"
```

---

## Solution 2: Azure AD B2C Setup

### A. Create B2C Tenant

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **Azure AD B2C**
3. Click **Create a B2C tenant**
4. Fill in:
   - **Organization name:** Your organization
   - **Initial domain name:** yourcompany (will be yourcompany.onmicrosoft.com)
   - **Country/Region:** Your country
5. Click **Create** (takes 1-2 minutes)

### B. Switch to B2C Tenant

1. Click your profile in top-right
2. Click **Switch directory**
3. Select your new B2C tenant

### C. Register Application

1. In B2C tenant, go to **App registrations**
2. Click **New registration**
3. Fill in:
   - **Name:** Your app name
   - **Supported account types:** Accounts in any identity provider
   - **Redirect URI:** 
     - Platform: **Web**
     - URI: `http://localhost:5173/auth/b2c/callback`
4. Click **Register**
5. Copy the **Application (client) ID**

### D. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and expiration
4. Click **Add**
5. Copy the secret VALUE

### E. Create User Flow

1. In B2C menu, go to **User flows**
2. Click **New user flow**
3. Select **Sign up and sign in**
4. Select **Recommended** version
5. Give it a name (e.g., `signupsignin1`)
   - Will become `B2C_1_signupsignin1`
6. Under **Identity providers**, select:
   - ✓ Email signup
   - (Optional) Social identity providers
7. Under **User attributes and claims**, select:
   - ✓ Email Address (collect and return)
   - ✓ Display Name (collect and return)
   - ✓ Given Name (collect and return)
   - ✓ Surname (collect and return)
8. Click **Create**

### F. (Optional) Customize User Flow UI

1. Click on your user flow
2. Go to **Page layouts**
3. Upload custom HTML templates
4. Configure branding

### G. Update .env File

```bash
B2C_CLIENT_ID=your-client-id-from-step-C
B2C_CLIENT_SECRET=your-client-secret-from-step-D
B2C_TENANT_NAME=yourcompany  # Just the name, without .onmicrosoft.com
B2C_POLICY_NAME=B2C_1_signupsignin1  # From step E
B2C_REDIRECT_URI=http://localhost:5173/auth/b2c/callback
```

### H. Test Solution 2

```bash
npm run dev
# Visit http://localhost:5173
# Click "Sign in with B2C"
```

---

## Solution 3: Entra ID with PKCE Setup

### A. Register Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name:** Your app name
   - **Supported account types:** Choose based on your needs
   - **Redirect URI:**
     - Platform: **Single-page application (SPA)** or **Web**
     - URI: `http://localhost:5173/auth/entra/callback`
5. Click **Register**

### B. Configure as Public Client

1. On app overview page, copy **Application (client) ID**
2. Copy **Directory (tenant) ID**
3. Go to **Authentication**
4. Under **Advanced settings**, set:
   - **Allow public client flows:** Yes
5. Add redirect URIs if needed
6. Under **Implicit grant and hybrid flows**:
   - ✓ Access tokens (optional)
   - ✓ ID tokens (optional)
7. Click **Save**

### C. Set API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `openid`
   - `profile`
   - `email`
   - `offline_access` (for refresh tokens)
6. Click **Add permissions**
7. (Optional) Click **Grant admin consent**

### D. Update .env File

```bash
ENTRA_CLIENT_ID=your-client-id-from-step-B
ENTRA_TENANT_ID=your-tenant-id-from-step-B
ENTRA_REDIRECT_URI=http://localhost:5173/auth/entra/callback
```

**Note:** No client secret needed for PKCE! 🎉

### E. Test Solution 3

```bash
npm run dev
# Visit http://localhost:5173
# Click "Sign in with Entra"
```

---

## Production Deployment

### 1. Update Environment Variables

**Generate new SESSION_SECRET:**
```bash
openssl rand -hex 32
```

**Update redirect URIs in Azure:**
- Add production URLs
- Remove localhost URLs (or keep for testing)

### 2. Update .env for Production

```bash
SESSION_SECRET=your-new-production-secret
NODE_ENV=production

# Update redirect URIs to production URLs
OAUTH2_REDIRECT_URI=https://yourdomain.com/auth/oauth2/callback
B2C_REDIRECT_URI=https://yourdomain.com/auth/b2c/callback
ENTRA_REDIRECT_URI=https://yourdomain.com/auth/entra/callback

BASE_URL=https://yourdomain.com
```

### 3. Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to your hosting platform
# - Vercel
# - Netlify
# - AWS
# - Azure
# - Google Cloud
```

### 4. Configure Azure for Production

1. In Azure app registrations, add production redirect URIs
2. Update CORS settings if needed
3. Configure monitoring and logging
4. Set up alerts for failed authentications
5. Review security settings

---

## Troubleshooting

### Issue: "CSRF validation failed"

**Solution:**
- Clear browser cookies
- Verify SESSION_SECRET is set
- Check that state parameter is being stored correctly

### Issue: "Invalid redirect_uri"

**Solution:**
- Ensure redirect URI in .env matches exactly what's in Azure
- Include protocol (http:// or https://)
- Match port number
- No trailing slashes

### Issue: "Unauthorized" (401)

**Solution:**
- Check API permissions in Azure
- Grant admin consent for permissions
- Verify token has correct scopes

### Issue: B2C "Policy not found"

**Solution:**
- Check policy name includes `B2C_1_` prefix
- Verify policy exists in B2C tenant
- Check tenant name is correct

### Issue: PKCE "Invalid code_verifier"

**Solution:**
- Verify code verifier is stored in session
- Check that verifier/challenge are generated correctly
- Ensure app is configured as public client

### Issue: "Failed to fetch user info"

**Solution:**
- Check access token is valid
- Verify User.Read permission is granted
- Check token hasn't expired

---

## Testing Checklist

- [ ] Login works
- [ ] Callback handles success
- [ ] Callback handles errors
- [ ] Session persists across page reloads
- [ ] Protected routes require authentication
- [ ] Logout clears session
- [ ] Tokens refresh before expiry
- [ ] HTTPS works in production
- [ ] Cookies are secure and httpOnly
- [ ] CSRF protection works

---

## Security Checklist

- [ ] SESSION_SECRET is strong and unique
- [ ] Client secrets not exposed to client
- [ ] HTTPS enabled in production
- [ ] Cookies are httpOnly
- [ ] Cookies are secure in production
- [ ] SameSite cookie attribute set
- [ ] State parameter validated
- [ ] Code verifier stored securely (PKCE)
- [ ] Tokens stored in httpOnly cookies only
- [ ] No sensitive data in URLs
- [ ] Error messages don't leak information
- [ ] Logging doesn't expose secrets
- [ ] Rate limiting on auth routes
- [ ] CORS configured correctly

---

## Next Steps

1. Choose which solution(s) to implement
2. Follow the setup guide for your chosen solution(s)
3. Test authentication flow
4. Customize the UI to match your brand
5. Add additional protected routes
6. Implement token refresh logic
7. Add error handling and logging
8. Deploy to production

---

## Need Help?

- Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- Read [SOLUTIONS.md](./SOLUTIONS.md) to compare solutions
- Check [React Router docs](https://reactrouter.com/explanation/sessions-and-cookies)
- Review [Microsoft Identity Platform docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/)

## Support

This is a demo project. For production support:
- Microsoft Identity Platform: [Azure Support](https://azure.microsoft.com/support/)
- React Router: [Community Discord](https://rmx.as/discord)
