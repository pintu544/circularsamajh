import { cookies } from "next/headers";
import { prisma } from "./db";

export const USER_COOKIE = "cs_user";
export const LANG_COOKIE = "cs_lang";

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  language: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const id = store.get(USER_COOKIE)?.value;
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return { id: user.id, name: user.name, role: user.role, language: user.language };
}

/** The language the parent feed should render in: toggle cookie wins over the stored preference. */
export async function getFeedLanguage(user: SessionUser): Promise<"en" | "hi"> {
  const store = await cookies();
  const override = store.get(LANG_COOKIE)?.value;
  if (override === "en" || override === "hi") return override;
  return user.language === "hi" ? "hi" : "en";
}
