import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/signup"];
export function middleware(req: NextRequest) {
  const has = req.cookies.has("pf_session");
  const p = req.nextUrl.pathname;
  if (PUBLIC.includes(p)) return has ? NextResponse.redirect(new URL("/report", req.url)) : NextResponse.next();
  if (!has) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|favicon.ico|api).*)"] };
