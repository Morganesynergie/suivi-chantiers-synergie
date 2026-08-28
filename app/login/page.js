"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const COLORS = {
  bg: "#F3F1EA",
  paper: "#FFFFFF",
  ink: "#1C2431",
  inkSoft: "#5B6472",
  navy: "#16233B",
  line: "#E1DCCE",
  accent: "#2B6CB0",
  red: "#B23A2E",
  redSoft: "#F7E1DD",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const diagCookiePresent = searchParams.get("diagCookiePresent");
  const diagCookieLen = searchParams.get("diagCookieLen");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) {
      console.log("[login] soumission ignorée : déjà en cours");
      return;
    }
    setError("");
    setLoading(true);
    console.log("[login] envoi de la requête...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      console.log("[login] réponse reçue, status =", res.status);
      const data = await res.json().catch((jsonErr) => {
        console.log("[login] échec du parsing JSON de la réponse", jsonErr);
        return {};
      });
      if (!res.ok) {
        console.log("[login] échec (status non-ok), message =", data.error);
        setError(data.error || "Mot de passe incorrect.");
        setLoading(false);
        return;
      }
      // Navigation "dure" (pas de router.replace/refresh) : on veut un vrai
      // rechargement de page pour être certaines que le cookie tout juste
      // posé est bien pris en compte dès la première requête, sans dépendre
      // du cache de navigation côté client. On affiche aussi un lien de
      // secours au cas où la redirection automatique ne se déclencherait
      // pas (certains environnements bloquent parfois la navigation
      // programmatique) — jamais bloquée sans issue.
      //
      // Délai volontaire de 3 secondes avant la redirection : ça laisse le
      // temps de lire les messages de diagnostic dans la Console avant que
      // la page ne change, sans avoir besoin d'activer "Preserve log".
      console.log("[login] succès ! Redirection vers", next, "dans 3 secondes (le temps de lire ce message)...");
      setSuccess(true);
      setTimeout(() => {
        console.log("[login] redirection en cours maintenant, via window.location.replace()");
        window.location.replace(next);
      }, 3000);
    } catch (err) {
      console.log("[login] exception attrapée :", err);
      setError("Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center p-4"
      style={{ background: COLORS.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {success ? (
        <div
          className="w-full max-w-sm p-6 rounded-lg text-center"
          style={{ background: COLORS.paper, border: "1px solid " + COLORS.line, boxShadow: "0 1px 3px rgba(22,35,59,0.08)" }}
        >
          <h1 className="text-lg font-semibold mb-1" style={{ color: COLORS.ink }}>
            Connexion réussie
          </h1>
          <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
            Redirection en cours...
          </p>
          <a
            href={next}
            className="inline-block w-full py-2 rounded-md text-sm font-medium"
            style={{ background: COLORS.accent, color: "#fff", textDecoration: "none" }}
          >
            Cliquez ici si rien ne se passe
          </a>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-6 rounded-lg"
          style={{ background: COLORS.paper, border: "1px solid " + COLORS.line, boxShadow: "0 1px 3px rgba(22,35,59,0.08)" }}
        >
          <h1 className="text-lg font-semibold mb-1" style={{ color: COLORS.ink }}>
            Suivi Chantiers
          </h1>
          <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
            Accès réservé — merci de saisir le mot de passe.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-3 py-2 rounded-md text-sm mb-3"
            style={{ border: "1px solid " + COLORS.line, color: COLORS.ink, outline: "none" }}
          />
          {error && (
            <div className="text-xs px-3 py-2 rounded-md mb-3" style={{ background: COLORS.redSoft, color: COLORS.red }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2 rounded-md text-sm font-medium"
            style={{
              background: loading || !password ? "#9AB2CE" : COLORS.accent,
              color: "#fff",
              cursor: loading || !password ? "default" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          {diagCookiePresent !== null && (
            <div className="text-xs mt-3 p-2 rounded-md" style={{ background: "#EFEAE0", color: COLORS.inkSoft }}>
              Diagnostic (temporaire) — diagCookiePresent = {diagCookiePresent}, diagCookieLen = {diagCookieLen}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
