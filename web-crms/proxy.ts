import { NextRequest, NextResponse } from "next/server";

const ALWAYS_PUBLIC = ["/images", "/_next", "/favicon.ico", "/api"];

const PROTECTED_APP_ROUTES: Record<string, string> = {
  "/customers": "customer-relation",
  "/conversation": "customer-relation",
  "/campaigns": "customer-relation",
  "/tickets": "customer-relation",
};

async function getUser(req: NextRequest) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ERP_AUTH_URL}/api/erp-auth/validate`,
      {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.log("[3001 getUser] validate failed, status:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("[3001 getUser] user.apps:", JSON.stringify(data.user?.apps));

    return data.user ?? null;
  } catch (e) {
    console.log("[3001 getUser] error:", e);
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("[3001 middleware] pathname:", pathname);
  console.log("[3001 middleware] cookies:", req.headers.get("cookie"));

  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  // Redirect auth routes to host app
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname,
        process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000",
      ),
    );
  }

  const hasToken =
    req.cookies.has("erp_access_token") || req.cookies.has("erp_refresh_token");

  // Not authenticated → redirect to host app signin
  if (!hasToken) {
    const signinUrl = new URL(
      `${process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"}/signin`,
    );
    signinUrl.searchParams.set("redirect", req.url);
    return NextResponse.redirect(signinUrl);
  }

  const requiredApp = Object.entries(PROTECTED_APP_ROUTES).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (requiredApp) {
    const user = await getUser(req);
    if (!user) {
      const signinUrl = new URL(
        `${process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"}/signin`,
      );
      signinUrl.searchParams.set("redirect", req.url);
      return NextResponse.redirect(signinUrl);
    }
    const hasAccess = user.apps?.some(
      (a: { appName: string }) => a.appName === requiredApp,
    );
    if (!hasAccess) {
      const referer = req.headers.get("referer");
      return NextResponse.redirect(
        new URL(
          referer ??
            process.env.NEXT_PUBLIC_HOST_URL ??
            "http://localhost:3000",
        ),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
