import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isValidAuthCookie } from "@/lib/siteAuth";

// Protège l'intégralité du site — pages ET routes API — derrière un mot de
// passe unique partagé par l'équipe. Sans ce fichier, n'importe qui
// connaissant l'adresse du site (ou même juste de son API /api/kv/...)
// pourrait consulter toutes les données sans rien avoir à saisir.
//
// Note : ce fichier s'appelle "proxy.js" (et pas "middleware.js") car
// Next.js 16 a renommé cette convention — voir
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Le comportement est identique à l'ancien "middleware".
export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/");

  if (isPublic) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const valid = await isValidAuthCookie(cookie);
  if (valid) {
    // Important : on ne modifie JAMAIS les en-têtes d'une réponse
    // NextResponse.next() (voir next-response.md dans la doc de cette
    // version de Next.js) — cela peut perturber le routage interne et
    // faire servir la mauvaise page. On laisse donc passer la requête
    // telle quelle, sans y toucher.
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé. Merci de vous reconnecter." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // On laisse passer les fichiers statiques internes de Next (_next/*) sans
  // vérification — ils ne contiennent aucune donnée, juste le JS/CSS compilé.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
