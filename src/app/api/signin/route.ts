import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const userId = String(form.get("userId") ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const dest = user.role === "TEACHER" ? "/teacher" : "/feed";
  const res = NextResponse.redirect(new URL(dest, req.url), 303);
  res.cookies.set(USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
