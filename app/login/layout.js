import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, isValidAuthCookie } from "@/lib/siteAuth";

// Force le rendu dynamique (jamais de mise en cache statique / ISR) pour
// toute la page de connexion. Sans ça, Vercel peut continuer à servir une
// version mise en cache de /login pendant plusieurs minutes après un
// déploiement (en-tête observé : x-vercel-cache: HIT, age > 100s), ce qui
// donnait l'impression que les correctifs n'étaient jamais pris en compte.
export const dynamic = "force-dynamic";

// Diagnostic temporaire, calculé côté serveur et écrit directement dans le
// HTML (donc visible même si un bloqueur de pub / une protection anti-
// pistage supprime les paramètres "suspects" de l'URL, ou si le
// sessionStorage est restreint en navigation privée). À retirer une fois
// le problème de connexion résolu.
export default async function LoginLayout({ children }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const valid = await isValidAuthCookie(raw);
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "#16233B",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 12,
          padding: "6px 10px",
          textAlign: "center",
        }}
      >
        DIAG SERVEUR — cookiePresent={raw ? "1" : "0"} cookieLen={(raw || "").length} cookieValid={valid ? "1" : "0"}
      </div>
      {children}
    </>
  );
}
