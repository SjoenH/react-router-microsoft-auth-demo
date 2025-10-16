/**
 * Solution 1: OAuth2 Callback Route
 * 
 * This route handles the redirect from Microsoft after user authentication.
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { exchangeCodeForTokens, getUserInfo } from "~/solutions/solution1-oauth2/oauth2.server";
import { sessionStorage, createUserSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Check for errors from Microsoft
  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    console.error("OAuth2 error:", error, errorDescription);
    return redirect(`/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  // Verify code and state are present
  if (!code || !state) {
    return redirect("/?error=missing_parameters");
  }

  // Verify state to prevent CSRF attacks
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const storedState = session.get("oauth_state");
  
  if (state !== storedState) {
    return redirect("/?error=invalid_state");
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    
    // Get user information from Microsoft Graph
    const userInfo = await getUserInfo(tokenResponse.access_token);
    
    // Calculate token expiration
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    // Create user session with secure cookies
    return createUserSession({
      request,
      userId: userInfo.id,
      email: userInfo.userPrincipalName || userInfo.mail,
      name: userInfo.displayName,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Failed to complete OAuth2 flow:", error);
    return redirect(`/?error=${encodeURIComponent("authentication_failed")}`);
  }
}
