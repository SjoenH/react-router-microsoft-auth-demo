import { createCookieSessionStorage } from "react-router";

// Session secret should be set in environment variables
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

// Create session storage using React Router's cookie session storage
// This follows the best practices from https://reactrouter.com/explanation/sessions-and-cookies
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true, // Prevent JavaScript access to cookies
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  },
});

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export async function createUserSession({
  request,
  userId,
  email,
  name,
  accessToken,
  refreshToken,
  expiresAt,
  redirectTo,
}: {
  request: Request;
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  redirectTo: string;
}) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  
  session.set("userId", userId);
  session.set("email", email);
  session.set("name", name);
  session.set("accessToken", accessToken);
  if (refreshToken) {
    session.set("refreshToken", refreshToken);
  }
  session.set("expiresAt", expiresAt);

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return session;
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  return userId;
}

export async function getUser(request: Request): Promise<SessionData | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  
  if (!userId) return null;

  return {
    userId,
    email: session.get("email"),
    name: session.get("name"),
    accessToken: session.get("accessToken"),
    refreshToken: session.get("refreshToken"),
    expiresAt: session.get("expiresAt"),
  };
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
