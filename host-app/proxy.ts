import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/signin", "/signup", "/forgot-password", "/reset-password"];
const ALWAYS_PUBLIC = ["/images", "/_next", "/favicon.ico", "/api"];

const PROTECTED_APP_ROUTES: Record<string, string> = {
  "/users": "settings",
  "/access-control": "settings",
  "/product-config": "settings",
};

async function getUser(req: NextRequest) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ERP_AUTH_URL}/api/erp-auth/validate`,
      {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.log("[3001 getUser] validate call failed, status:", res.status);
      return null;
    }
    const data = await res.json();

    console.log("[3001 getUser] user.apps:", JSON.stringify(data.user?.apps));
    return (await res.json()).user ?? null;
  } catch (e) {
    console.error("[3000 getUser] Error occurred:", e);
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("[3000 middleware] pathname:", pathname);
  console.log("[3000 middleware] cookies:", req.headers.get("cookie"));

  if (ALWAYS_PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  const hasToken =
    req.cookies.has("erp_access_token") ||
    req.cookies.has("erp_refresh_token");

  const isPublicRoute = PUBLIC_ROUTES.some(p => pathname.startsWith(p));

  if (!hasToken && !isPublicRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (hasToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const requiredApp = Object.entries(PROTECTED_APP_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredApp) {
    const user = await getUser(req);
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const hasAccess = user.apps?.some((a: { appName: string }) => a.appName === requiredApp);
    if (!hasAccess) {
      const referer = req.headers.get("referer");
      return NextResponse.redirect(new URL(referer ?? "/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};