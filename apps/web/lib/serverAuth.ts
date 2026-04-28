import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buildLoginRedirectUrl, isValidAuthToken, TOKEN_COOKIE } from "@/lib/auth";

export async function requireAuth(pathname: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!isValidAuthToken(token)) {
    redirect(buildLoginRedirectUrl(pathname));
  }

  return token;
}

