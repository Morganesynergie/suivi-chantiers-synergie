import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Génère une URL signée d'upload Supabase Storage, pour que le navigateur
// dépose le fichier DIRECTEMENT dans le bucket sans passer par cette route
// (donc sans être limité par la taille de requête d'une fonction serverless
// Vercel, plafonnée à 4,5 Mo — voir /api/documents dont le POST classique
// reste utilisé ailleurs pour les fichiers déjà sous ce seuil). Cette route
// ne reçoit donc jamais les octets du fichier lui-même : le contrôle de
// taille réel est fait par la limite du bucket Supabase (50 Mo par défaut
// sur ce projet) au moment de l'upload effectif.
//
// L'URL signée renvoyée n'autorise l'écriture que sur CE chemin précis et
// expire après 2h (comportement Supabase) — rien d'équivalent à la clé
// service_role n'est jamais exposé au navigateur.

const BUCKET = "chantier-documents";

function sanitizeSegment(v) {
  return String(v || "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { chantierId, docKey, fileName } = body;

    if (!chantierId || !docKey) {
      return NextResponse.json({ error: "Chantier ou document non spécifié." }, { status: 400 });
    }

    const safeChantier = sanitizeSegment(chantierId);
    const safeDocKey = sanitizeSegment(docKey);
    const safeName = sanitizeSegment(fileName || "document");
    const path = `${safeChantier}/${safeDocKey}-${Date.now()}-${safeName}`;

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;

    return NextResponse.json({
      path,
      signedUrl: data.signedUrl,
      fileName: fileName || safeName,
    });
  } catch (e) {
    console.error("POST /api/documents/sign-upload failed", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
