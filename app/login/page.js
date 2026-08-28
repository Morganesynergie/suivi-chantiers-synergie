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
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Mot de passe incorrect.");
        setLoading(false);
        return;
      }
      // Navigation "dure" (pas de router.replace/refresh) : on veut un vrai
      // rechargement de page pour être sûr que le cookie tout juste posé
      // est bien pris en compte dès la première requête, sans dépendre du
      // cache de navigation côté client.
      window.location.href = next;
    } catch {
      setError("Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center p-4"
      style={{ background: COLORS.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
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
      </form>
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
