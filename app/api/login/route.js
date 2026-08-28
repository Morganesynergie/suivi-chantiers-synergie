import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, checkPassword, makeAuthCookieValue } from "@/lib/siteAuth";

// Vérifie le mot de passe d'accès au site (SITE_ACCESS_PASSWORD, réglé côté
// serveur) et, s'il est correct, pose un cookie de session (voir
// lib/siteAuth.js pour le détail de ce qu'il contient et pourquoi), puis
// redirige.
//
// Volontairement un vrai formulaire HTML classique (voir app/login/page.js)
// plutôt qu'un fetch() + redirection en JavaScript : ça garantit une
// navigation de page entièrement gérée par le navigateur lui-même, sans
// dépendre du routage client de Next.js — c'est ce qui posait problème
// auparavant (la page affichée ne correspondait pas toujours à l'URL
// réellement chargée).
export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const password = formData?.get("password") || "";
  const next = (formData?.get("next") || "/").toString();
  // Sécurité : on n'autorise que les chemins internes (jamais une URL
  // complète), pour éviter qu'un lien piégé ne redirige vers un autre site.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!process.env.SITE_ACCESS_PASSWORD) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", safeNext);
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url, { status: 303 });
  }

  if (!checkPassword(password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", safeNext);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const value = await makeAuthCookieValue();
  const res = NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
  return res;
}
