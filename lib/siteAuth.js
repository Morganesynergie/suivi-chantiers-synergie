// Vérification d'accès à l'ensemble du site : un seul mot de passe partagé,
// stocké côté serveur dans la variable d'environnement SITE_ACCESS_PASSWORD
// (jamais exposée au navigateur, jamais commitée). Utilisé par :
//   - middleware.js, qui bloque toute page ET toute route API tant que la
//     personne n'est pas authentifiée ;
//   - app/api/login/route.js, qui vérifie le mot de passe saisi et pose le
//     cookie ;
//   - app/api/logout/route.js, qui l'efface.
//
// Le cookie ne contient jamais le mot de passe lui-même : juste une
// signature HMAC-SHA256 (calculée avec Web Crypto, compatible Edge et
// Node) qu'on ne peut pas fabriquer sans connaître SITE_ACCESS_PASSWORD.
// Ce n'est pas un vrai système de comptes (pas de nom d'utilisateur, pas
// d'expiration individuelle) — juste un verrou d'accès pour l'équipe,
// cohérent avec le niveau de sécurité du reste de l'outil.

export const AUTH_COOKIE_NAME = "sc_auth";

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function makeAuthCookieValue() {
  return sign("authenticated", process.env.SITE_ACCESS_PASSWORD || "");
}

export async function isValidAuthCookie(cookieValue) {
  const secret = process.env.SITE_ACCESS_PASSWORD;
  if (!secret || !cookieValue) return false;
  const expected = await sign("authenticated", secret);
  return timingSafeEqual(String(cookieValue), expected);
}

export function checkPassword(candidate) {
  const secret = process.env.SITE_ACCESS_PASSWORD;
  if (!secret) return false;
  return timingSafeEqual(String(candidate || ""), secret);
}
