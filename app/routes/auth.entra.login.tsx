/**
 * Solution 3: Entra ID with PKCE Login Route
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  getEntraAuthorizationUrl,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "~/solutions/solution3-entra-pkce/entra.server";
import { sessionStorage } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set("entra_state", state);
  session.set("entra_verifier", codeVerifier);
  
  const authUrl = getEntraAuthorizationUrl(state, codeChallenge);
  
  return redirect(authUrl, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
