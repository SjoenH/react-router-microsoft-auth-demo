/**
 * Solution 1: OAuth2 Login Route
 * 
 * This route initiates the OAuth2 authorization code flow.
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getAuthorizationUrl, generateState } from "~/solutions/solution1-oauth2/oauth2.server";
import { sessionStorage } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Generate a random state parameter for CSRF protection
  const state = generateState();
  
  // Store state in session for verification after redirect
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set("oauth_state", state);
  
  // Get the authorization URL
  const authUrl = getAuthorizationUrl(state);
  
  // Redirect to Microsoft's authorization endpoint
  return redirect(authUrl, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
