import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase();

  if (host === "mihadul.dev") {
    const url = req.nextUrl.clone();
    url.hostname = "www.mihadul.dev";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
