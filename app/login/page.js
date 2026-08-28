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

// Volontairement un composant serveur (pas "use client") avec un vrai
// formulaire HTML classique (method="POST" vers /api/login) : la
// navigation après connexion est alors entièrement gérée par le
// navigateur lui-même (comme n'importe quel site depuis toujours), sans
// passer par fetch()/JavaScript ni par le routage client de Next.js.
export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : "/";
  const error = params?.error;

  const errorMessage =
    error === "config"
      ? "Accès au site non configuré. Contactez l'administrateur."
      : error
        ? "Mot de passe incorrect."
        : null;

  return (
    <div
      className="w-full h-screen flex items-center justify-center p-4"
      style={{ background: COLORS.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm p-6 rounded-lg"
        style={{ background: COLORS.paper, border: "1px solid " + COLORS.line, boxShadow: "0 1px 3px rgba(22,35,59,0.08)" }}
      >
        <h1 className="text-lg font-semibold mb-1" style={{ color: COLORS.ink }}>
          Suivi Chantiers
        </h1>
        <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
          Accès réservé — merci de saisir le mot de passe.
        </p>
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Mot de passe"
          className="w-full px-3 py-2 rounded-md text-sm mb-3"
          style={{ border: "1px solid " + COLORS.line, color: COLORS.ink, outline: "none" }}
        />
        {errorMessage && (
          <div className="text-xs px-3 py-2 rounded-md mb-3" style={{ background: COLORS.redSoft, color: COLORS.red }}>
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-2 rounded-md text-sm font-medium"
          style={{ background: COLORS.accent, color: "#fff", cursor: "pointer" }}
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
