import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Stockage des documents de chantier (CCAP, acte d'engagement, DC4, contrat
// de sous-traitance, devis signé...) dans le bucket Supabase Storage privé
// "chantier-documents". Cette route tourne uniquement côté serveur avec la
// clé service_role — jamais exposée au navigateur — et sert de seule porte
// d'entrée vers le stockage, exactement comme /api/kv pour les données.

const BUCKET = "chantier-documents";
const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo — marge de sécurité sous la limite Vercel

function sanitizeSegment(v) {
  return String(v || "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const chantierId = form.get("chantierId");
    const docKey = form.get("docKey");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    if (!chantierId || !docKey) {
      return NextResponse.json({ error: "Chantier ou document non spécifié." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (4 Mo max)." }, { status: 400 });
    }

    const safeChantier = sanitizeSegment(chantierId);
    const safeDocKey = sanitizeSegment(docKey);
    const safeName = sanitizeSegment(file.name || "document");
    const path = `${safeChantier}/${safeDocKey}-${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = getSupabaseServer();
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;

    return NextResponse.json({
      path,
      fileName: file.name || safeName,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("POST /api/documents failed", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Chemin de fichier manquant." }, { status: 400 });
  }
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (error) throw error;
    return NextResponse.json({ url: data.signedUrl });
  } catch (e) {
    console.error("GET /api/documents failed", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Chemin de fichier manquant." }, { status: 400 });
  }
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/documents failed", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
