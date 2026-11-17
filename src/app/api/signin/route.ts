import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { USER_COOKIE } from "@/lib/auth";
import { publicUrl } from "@/lib/http";

export async function POST(req: Request) {
  const form = await req.formData();
  const userId = String(form.get("userId") ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.redirect(publicUrl(req, "/"));
  }
  const dest = user.role === "TEACHER" ? "/teacher" : "/feed";
  const res = NextResponse.redirect(publicUrl(req, dest), 303);
  res.cookies.set(USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
