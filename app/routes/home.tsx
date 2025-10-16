import type { Route } from "./+types/home";
import { Link, useLoaderData } from "react-router";
import { getUser } from "~/lib/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Microsoft Auth Demo - React Router v7" },
    { name: "description", content: "Multiple Microsoft authentication solutions for React Router" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  return { user, error };
}

export default function Home() {
  const { user, error } = useLoaderData<typeof loader>();

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You're logged in!
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome back, <strong>{user.name}</strong>
          </p>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full text-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/auth/logout"
              className="block w-full text-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Error:</strong> {decodeURIComponent(error)}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Microsoft Authentication Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            React Router v7 - Web Standards Based Authentication
          </p>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">
              This demo showcases three different approaches to implement Microsoft authentication
              using web standards (not React-based auth). All solutions use:
            </p>
            <ul className="text-gray-600 mt-2">
              <li>✅ Server-side authentication flows</li>
              <li>✅ Secure, httpOnly cookies (following React Router best practices)</li>
              <li>✅ No client-side token storage</li>
              <li>✅ Protection against XSS and CSRF attacks</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Solution 1: OAuth2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Solution 1: OAuth2
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Standard OAuth2 Authorization Code Flow with client secret. 
              Traditional approach for server-side web applications.
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500">
                <strong>Best for:</strong> Traditional web apps
              </div>
              <div className="text-xs text-gray-500">
                <strong>Security:</strong> Client secret + State
              </div>
            </div>
            <Link
              to="/auth/oauth2/login"
              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign in with OAuth2
            </Link>
          </div>

          {/* Solution 2: Azure AD B2C */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Solution 2: Azure B2C
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Customer Identity Access Management with customizable user flows.
              Ideal for customer-facing applications.
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500">
                <strong>Best for:</strong> Customer apps
              </div>
              <div className="text-xs text-gray-500">
                <strong>Features:</strong> Custom UI, social login
              </div>
            </div>
            <Link
              to="/auth/b2c/login"
              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Sign in with B2C
            </Link>
          </div>

          {/* Solution 3: Entra with PKCE */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Solution 3: Entra PKCE
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Modern PKCE flow without client secret. Most secure for public clients
              and recommended for modern applications.
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500">
                <strong>Best for:</strong> Modern apps, SPAs
              </div>
              <div className="text-xs text-gray-500">
                <strong>Security:</strong> PKCE + No secret
              </div>
            </div>
            <Link
              to="/auth/entra/login"
              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Sign in with Entra
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📚 Implementation Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold mb-1">Cookie Security</h4>
              <ul className="space-y-1 text-xs">
                <li>• HttpOnly: Prevents XSS attacks</li>
                <li>• SameSite=Lax: CSRF protection</li>
                <li>• Secure: HTTPS only (production)</li>
                <li>• 7-day expiration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Authentication Flow</h4>
              <ul className="space-y-1 text-xs">
                <li>• Server-side token exchange</li>
                <li>• State parameter for CSRF</li>
                <li>• No client-side secrets</li>
                <li>• Secure session storage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
