/**
 * Solution 2: Azure AD B2C Login Route
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getB2CAuthorizationUrl, generateState, generateNonce } from "~/solutions/solution2-azure-b2c/b2c.server";
import { sessionStorage } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const state = generateState();
  const nonce = generateNonce();
  
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  session.set("b2c_state", state);
  session.set("b2c_nonce", nonce);
  
  const authUrl = getB2CAuthorizationUrl(state, nonce);
  
  return redirect(authUrl, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
