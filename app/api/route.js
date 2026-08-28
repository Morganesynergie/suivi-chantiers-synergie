import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, checkPassword, makeAuthCookieValue } from "@/lib/siteAuth";

// Vérifie le mot de passe d'accès au site (SITE_ACCESS_PASSWORD, réglé côté
// serveur) et, s'il est correct, pose un cookie de session (voir
// lib/siteAuth.js pour le détail de ce qu'il contient et pourquoi).
export async function POST(request) {
  try {
    if (!process.env.SITE_ACCESS_PASSWORD) {
      return NextResponse.json(
        { error: "Accès au site non configuré : il manque la variable SITE_ACCESS_PASSWORD côté serveur." },
        { status: 501 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (!checkPassword(body.password)) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }

    const value = await makeAuthCookieValue();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE_NAME, value, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });
    return res;
  } catch (e) {
    console.error("POST /api/login failed", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
