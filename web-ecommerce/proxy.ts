import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/signin", "/signup", "/forgot-password", "/reset-password"];
const ALWAYS_PUBLIC = ["/images", "/_next", "/favicon.ico", "/api", "/manager"];
const PROTECTED_ROUTES = ["/cart", "/checkout", "/concerns", "/my-account", "/wishlist"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (ALWAYS_PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

    const hasToken = req.cookies.has("customer_access_token") ||
        req.cookies.has("customer_refresh_token");

    const isPublicRoute = PUBLIC_ROUTES.some(p => pathname.startsWith(p)) || pathname === "/";
    const isProtected = PROTECTED_ROUTES.some(p => pathname.startsWith(p));

    // Not authenticated + protected route → redirect to signin
    if (!hasToken && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/signin";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Authenticated + signin/signup → redirect to home
    if (hasToken && (pathname.startsWith("/signin") || pathname.startsWith("/signup"))) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};