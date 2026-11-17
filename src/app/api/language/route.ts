import { NextResponse } from "next/server";
import { LANG_COOKIE } from "@/lib/auth";
import { publicUrl } from "@/lib/http";

export async function POST(req: Request) {
  const form = await req.formData();
  const lang = String(form.get("lang") ?? "");
  const back = String(form.get("back") ?? "/feed");
  const res = NextResponse.redirect(publicUrl(req, back), 303);
  if (lang === "en" || lang === "hi") {
    res.cookies.set(LANG_COOKIE, lang, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
