/**
 * Solution 2: Azure AD B2C Callback Route
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { exchangeB2CCodeForTokens, parseB2CIdToken } from "~/solutions/solution2-azure-b2c/b2c.server";
import { sessionStorage, createUserSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    console.error("B2C error:", error, errorDescription);
    return redirect(`/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code || !state) {
    return redirect("/?error=missing_parameters");
  }

  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const storedState = session.get("b2c_state");
  
  if (state !== storedState) {
    return redirect("/?error=invalid_state");
  }

  try {
    const tokenResponse = await exchangeB2CCodeForTokens(code);
    const userInfo = parseB2CIdToken(tokenResponse.id_token);
    
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    return createUserSession({
      request,
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Failed to complete B2C flow:", error);
    return redirect(`/?error=${encodeURIComponent("authentication_failed")}`);
  }
}
