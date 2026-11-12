import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GUEST_ACCOUNT_PATHS = new Set([
  "/account/sign-in",
  "/account/create",
  "/account/forgot-password",
]);

/**
 * Keeps the Supabase session fresh on the routes that read it on the server.
 * Public storefront pages are left out on purpose so they stay static and fast.
 * This only refreshes cookies; every page and action still checks the user itself.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Validates the token and refreshes it when it is close to expiry.
  const { data } = await supabase.auth.getClaims();

  // Friendly early redirect for guests. Pages still verify the user themselves (src/lib/auth.ts).
  const { pathname } = request.nextUrl;
  if (!data?.claims && pathname.startsWith("/account") && !GUEST_ACCOUNT_PATHS.has(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/account/sign-in";
    signIn.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(signIn);
  }
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*", "/auth/:path*"],
};
