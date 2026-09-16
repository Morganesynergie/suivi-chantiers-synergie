import { NextResponse } from "next/server";

// Relais éphémère : reçoit un PDF généré côté client (contrat de
// sous-traitance, DC4, récapitulatif de documents manquants...) en POST et
// le renvoie tel quel, mais comme une VRAIE réponse HTTP portant un en-tête
// Content-Disposition avec le nom de fichier voulu.
//
// Pourquoi ce détour : ouvrir directement une URL blob: (générée côté
// navigateur avec URL.createObjectURL) fonctionne pour l'affichage, mais le
// nom par défaut proposé par "Enregistrer sous" dépend alors entièrement du
// lecteur PDF — le plugin Adobe Acrobat utilisé sur le poste de Morgane
// ignore le nom du Blob/File et affiche à la place l'identifiant brut de
// l'URL blob:. Un en-tête Content-Disposition, lui, est une donnée HTTP
// standard que tous les lecteurs (Adobe Acrobat, Chrome, Edge...) respectent
// pour proposer le nom de fichier à l'enregistrement — d'où ce petit aller-
// retour serveur plutôt qu'un blob purement client. Rien n'est persisté :
// la requête est simplement relayée puis oubliée.

export async function POST(request, { params }) {
  try {
    const { filename } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = decodeURIComponent(filename || "document.pdf");
    // filename= (ASCII, pour les vieux clients) + filename*= (UTF-8, pour
    // conserver les accents) — double syntaxe standard RFC 6266.
    const asciiName = name.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("POST /api/pdf-preview failed", e);
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
