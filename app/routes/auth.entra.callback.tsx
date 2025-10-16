/**
 * Solution 3: Entra ID with PKCE Callback Route
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { exchangeEntraCodeForTokens, getEntraUserInfo } from "~/solutions/solution3-entra-pkce/entra.server";
import { sessionStorage, createUserSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    console.error("Entra error:", error, errorDescription);
    return redirect(`/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code || !state) {
    return redirect("/?error=missing_parameters");
  }

  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const storedState = session.get("entra_state");
  const codeVerifier = session.get("entra_verifier");
  
  if (state !== storedState) {
    return redirect("/?error=invalid_state");
  }

  if (!codeVerifier) {
    return redirect("/?error=missing_verifier");
  }

  try {
    const tokenResponse = await exchangeEntraCodeForTokens(code, codeVerifier);
    const userInfo = await getEntraUserInfo(tokenResponse.access_token);
    
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
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
    console.error("Failed to complete Entra PKCE flow:", error);
    return redirect(`/?error=${encodeURIComponent("authentication_failed")}`);
  }
}
