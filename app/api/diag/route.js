import { NextResponse } from "next/server";

// Diagnostic temporaire : indique juste si SITE_ACCESS_PASSWORD est visible
// ici (routes API classiques, runtime Node), sans jamais révéler sa valeur.
// À supprimer une fois le problème de connexion résolu.
export async function GET() {
  return NextResponse.json({
    hasSecretInNode: !!process.env.SITE_ACCESS_PASSWORD,
    secretLength: (process.env.SITE_ACCESS_PASSWORD || "").length,
  });
}
