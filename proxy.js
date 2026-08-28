import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isValidAuthCookie } from "@/lib/siteAuth";

// Protège l'intégralité du site — pages ET routes API — derrière un mot de
// passe unique partagé par l'équipe. Avant ce correctif, n'importe qui
// connaissant l'adresse du site (ou même juste de son API /api/kv/...)
// pouvait consulter toutes les données sans rien avoir à saisir.
//
// Note : ce fichier s'appelle "proxy.js" (et pas "middleware.js") car
// Next.js 16 a renommé cette convention — voir
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Le comportement est identique à l'ancien "middleware".
export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Diagnostic temporaire : indique juste si la variable d'env est visible
  // ici (dans le Proxy / Edge), sans jamais révéler sa valeur. À supprimer
  // une fois le problème de connexion résolu.
  if (pathname === "/__diag") {
    const diagCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    return NextResponse.json({
      hasSecretInProxy: !!process.env.SITE_ACCESS_PASSWORD,
      secretLength: (process.env.SITE_ACCESS_PASSWORD || "").length,
      cookiePresent: !!diagCookie,
      cookieLength: (diagCookie || "").length,
      cookieValid: await isValidAuthCookie(diagCookie),
    });
  }

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname === "/api/diag" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/");

  if (isPublic) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (await isValidAuthCookie(cookie)) {
    const passRes = NextResponse.next();
    // Empêche tout cache (CDN ou navigateur) de servir une ancienne réponse
    // (par ex. une redirection vers /login capturée avant la connexion) à
    // la place d'une vérification fraîche du cookie à chaque requête.
    passRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return passRes;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé. Merci de vous reconnecter." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  // Diagnostic temporaire, visible directement dans l'URL de redirection :
  // permet de voir en un coup d'œil si un cookie est arrivé jusqu'ici et,
  // si oui, sa longueur (jamais sa valeur). À retirer une fois résolu.
  loginUrl.searchParams.set("diagCookiePresent", cookie ? "1" : "0");
  loginUrl.searchParams.set("diagCookieLen", String((cookie || "").length));
  const res = NextResponse.redirect(loginUrl);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}

export const config = {
  // On laisse passer les fichiers statiques internes de Next (_next/*) sans
  // vérification — ils ne contiennent aucune donnée, juste le JS/CSS compilé.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
