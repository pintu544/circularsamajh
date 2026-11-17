import { NextResponse } from "next/server";
import { LANG_COOKIE, USER_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.delete(USER_COOKIE);
  res.cookies.delete(LANG_COOKIE);
  return res;
}
