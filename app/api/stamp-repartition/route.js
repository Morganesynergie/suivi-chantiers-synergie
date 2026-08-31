import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import path from "path";

// Route serveur (Node, jamais l'edge runtime — pdfjs-dist et fs ont besoin
// de Node) qui superpose sur la DERNIÈRE page du PDF "Récapitulatif" déposé
// par Morgane : l'encadré rouge "Répartition de règlement" (si des
// fournisseurs cessionnaires sont concernés) et la signature.
//
// Pourquoi côté serveur et pas via pdf-lib seul côté navigateur (comme
// avant) : pdf-lib sait uniquement ÉCRIRE sur un PDF, jamais lire la
// position réelle du texte déjà présent. L'ancienne version se calait donc
// sur des coordonnées FIGÉES, mesurées une fois sur un exemple modèle. Or le
// gabarit Sage n'a pas une hauteur fixe : des lignes optionnelles
// ("Remboursement Acompte", "Retenue de garantie T.T.C. ...") apparaissent
// ou non selon la situation, ce qui décale tout le bas de page — l'encadré
// figé finissait alors par chevaucher "Règlement : Comptant" sur certains
// documents. pdfjs-dist (utilisé ici uniquement pour LIRE la position du
// texte, jamais pour le modifier) permet de retrouver la vraie position de
// "Règlement :" sur CE document précis et de positionner l'encadré juste en
// dessous, à chaque fois — avec les anciennes coordonnées figées gardées en
// secours si jamais ce texte n'est pas trouvé (PDF scanné, gabarit
// totalement différent...).
export const runtime = "nodejs";

// Les polices standard PDF (WinAnsiEncoding) ne couvrent que Latin-1 + le
// symbole euro — on neutralise tout le reste (guillemets "intelligents",
// tirets longs, espaces insécables fines, emoji...) pour ne jamais faire
// planter la génération du PDF, y compris avec des noms de fournisseurs
// saisis librement.
function sanitizeForPdfText(value) {
  const s = String(value ?? "")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[    ]/g, " ");
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0);
    out += code === 0x20ac || (code >= 0x20 && code <= 0xff) ? ch : "?";
  }
  return out;
}
function pdfSafeEUR(n) {
  const num = Number(n);
  if (!isFinite(num)) return "-";
  const rounded = Math.round(num * 100) / 100;
  const negative = rounded < 0;
  const [intPart, decPart] = Math.abs(rounded).toFixed(2).split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (negative ? "-" : "") + withSpaces + "," + decPart + " €";
}
// Regroupe les cessions d'une situation par nom de fournisseur (au cas où le
// même nom apparaîtrait sur plusieurs lignes de la même situation) et
// retourne [[nom, montantTotal], ...].
function regrouperFournisseurs(fournisseurs) {
  const parNom = new Map();
  for (const f of fournisseurs || []) {
    const nom = (f?.nom || "").trim() || "Fournisseur";
    const montant = Number(f?.montant) || 0;
    parNom.set(nom, (parNom.get(nom) || 0) + montant);
  }
  return [...parNom.entries()];
}

// ---------- Position de l'encadré "Répartition de règlement" ----------
// Valeurs de secours (mesurées une fois sur le modèle "HTA RECAP.pdf",
// page A4 595,32 × 841,92 pt) utilisées UNIQUEMENT si la détection
// dynamique du texte "Règlement :" échoue sur le document déposé.
const REF_PAGE_WIDTH = 595.32;
const REF_PAGE_HEIGHT = 841.92;
const REF_BLOCK_X = 26;
const REF_ZONE_TOP_Y_FALLBACK = 233;
const REF_ZONE_BOTTOM_Y_FALLBACK = 193;
const REF_TITLE_TOP_GAP = 5; // pt d'air entre le trait du haut de l'encadré et "Répartition de règlement :"
const REF_LINE_HEIGHT_MAX = 12.5;
const REF_LINE_HEIGHT_MIN = 6.5;
const REF_SIGNATURE_WIDTH = 125;
const REF_SIGNATURE_MARGIN_RIGHT = 20;
const REF_SIGNATURE_Y = 28;
// Marge de sécurité sous la ligne de base du texte "Règlement :" repéré
// dynamiquement — pour bien passer sous ses descendantes (le "g" de
// "Règlement" par exemple) avant de démarrer l'encadré rouge.
const REGLEMENT_CLEARANCE = 8.5;
// Idem, au-dessus de "CLAUSE PENALE..." repéré dynamiquement, pour ne
// jamais empiéter dessus même avec beaucoup de fournisseurs à lister.
const CLAUSE_CLEARANCE = 14;
// Si la zone calculée dynamiquement est anormalement petite (détection
// aberrante), on préfère revenir aux coordonnées de secours plutôt que de
// produire un encadré illisible ou qui déborde.
const MIN_ZONE_HEIGHT = 20;

// Repère, sur la dernière page du PDF déposé, la position réelle de
// "Règlement :" (haut de la zone à éviter) et "CLAUSE PENALE" (bas de la
// zone à éviter) — jamais une modification du document, uniquement une
// lecture. Retourne null si la lecture échoue (PDF scanné/image, gabarit
// non reconnu...) pour que l'appelant retombe sur les coordonnées de
// secours.
async function findAnchors(bytes) {
  try {
    const data = new Uint8Array(bytes);
    const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
    const page = await doc.getPage(doc.numPages);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    // On garde l'occurrence la plus HAUTE sur la page (Y le plus grand, en
    // coordonnées PDF origine en bas) pour "Règlement :" — jamais la
    // première rencontrée. Important si ce PDF a déjà été tamponné une
    // première fois (redépôt du même fichier, par exemple) : notre propre
    // encadré contient aussi le texte "règlement :" (dans "Répartition de
    // règlement :"), mais celui-ci est nécessairement plus bas sur la page
    // que le vrai "Règlement :" imprimé par Sage — prendre le plus haut
    // retombe donc toujours sur le bon repère.
    let reglementY = null;
    let clauseY = null;
    for (const item of content.items) {
      const txt = item.str || "";
      if (/r[eè]glement\s*:/i.test(txt)) {
        const y = item.transform[5];
        if (reglementY === null || y > reglementY) reglementY = y;
      }
      if (clauseY === null && /clause\s+p[eé]nale/i.test(txt)) {
        clauseY = item.transform[5];
      }
    }
    return { pageWidth: viewport.width, pageHeight: viewport.height, reglementY, clauseY };
  } catch (err) {
    console.error("Échec de la localisation dynamique du texte sur le PDF récapitulatif", err);
    return null;
  }
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const dataRaw = form.get("data");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    let data = {};
    try {
      data = dataRaw ? JSON.parse(dataRaw) : {};
    } catch {
      data = {};
    }
    const lignes = regrouperFournisseurs(data.fournisseurs || []);
    const prorata = Number(data.prorata) || 0;
    const totalARecevoir = Number(data.totalARecevoir) || 0;
    // Part qui revient à Synergie BTP elle-même une fois les cessions
    // fournisseurs déduites (totalARecevoir est déjà net des cessions ET du
    // prorata — voir le calcul auto "TTC − RG − Prorata − Cession fournisseur
    // − Remb. ADD" côté appli — donc avant prorata, la part Synergie BTP est
    // totalARecevoir + prorata).
    const partSynergie = totalARecevoir + prorata;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const page = pages[pages.length - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const scaleX = pageWidth / REF_PAGE_WIDTH;
    const scaleY = pageHeight / REF_PAGE_HEIGHT;

    const red = rgb(0.858824, 0.2, 0.141176); // même rouge que sur le modèle de Morgane

    // L'encadré rouge "Répartition de règlement" ne veut dire quelque chose
    // que s'il y a au moins une cession fournisseur à détailler ; sans
    // cession, on saute directement à la signature (elle, en revanche, est
    // ajoutée systématiquement, cession ou pas).
    if (lignes.length > 0) {
      const anchors = await findAnchors(arrayBuffer);
      let boxTopY = REF_ZONE_TOP_Y_FALLBACK * scaleY;
      let zoneBottomY = REF_ZONE_BOTTOM_Y_FALLBACK * scaleY;
      if (anchors) {
        if (typeof anchors.reglementY === "number") {
          boxTopY = anchors.reglementY - REGLEMENT_CLEARANCE;
        }
        if (typeof anchors.clauseY === "number") {
          zoneBottomY = anchors.clauseY + CLAUSE_CLEARANCE;
        }
      }
      // Détection aberrante (page inhabituelle, texte non trouvé au bon
      // endroit...) : on revient aux coordonnées de secours plutôt que de
      // risquer un chevauchement ou un encadré illisible.
      if (!(boxTopY - zoneBottomY >= MIN_ZONE_HEIGHT)) {
        boxTopY = REF_ZONE_TOP_Y_FALLBACK * scaleY;
        zoneBottomY = REF_ZONE_BOTTOM_Y_FALLBACK * scaleY;
      }

      const numLines = 1 + lignes.length + 1;
      const zoneHeight = boxTopY - zoneBottomY - REF_TITLE_TOP_GAP * scaleY;
      const lineHeight = Math.min(
        REF_LINE_HEIGHT_MAX * scaleY,
        Math.max(REF_LINE_HEIGHT_MIN * scaleY, zoneHeight / numLines)
      );
      const fontSize = Math.max(7.5, lineHeight - 0.8);

      const x = REF_BLOCK_X * scaleX;
      const firstBaselineY = boxTopY - REF_TITLE_TOP_GAP * scaleY - fontSize * 0.85;
      let curY = firstBaselineY;
      let maxLineWidth = 0;

      const drawLine = (text, { bold = false, color = red, size = fontSize } = {}) => {
        const sanitized = sanitizeForPdfText(text);
        const usedFont = bold ? fontBold : font;
        const width = usedFont.widthOfTextAtSize(sanitized, size);
        if (width > maxLineWidth) maxLineWidth = width;
        page.drawText(sanitized, { x, y: curY, size, font: usedFont, color });
        curY -= lineHeight;
      };

      drawLine("Répartition de règlement :", { bold: true });
      for (const [nom, montant] of lignes) {
        drawLine(`${nom} : ${pdfSafeEUR(montant)}`);
      }
      drawLine(`SYNERGIE BTP : ${pdfSafeEUR(partSynergie)}`);

      // Encadré rouge autour du bloc, ajusté à la largeur de sa ligne la plus
      // longue et à sa hauteur réelle (qui varie avec le nombre de
      // fournisseurs), pour que le client repère immédiatement la
      // répartition.
      const lastBaselineY = curY + lineHeight; // annule la dernière décrémentation
      const boxPadX = 5 * scaleX;
      const boxPadBottom = fontSize * 0.3;
      const boxBottomY = lastBaselineY - boxPadBottom;
      page.drawRectangle({
        x: x - boxPadX,
        y: boxBottomY,
        width: maxLineWidth + boxPadX * 2,
        height: boxTopY - boxBottomY,
        borderColor: red,
        borderWidth: 1,
      });
    }

    // Signature/cachet, en bas à droite de la page. Ne bloque jamais le
    // dépôt du PDF si elle ne peut pas être chargée/intégrée. Toujours
    // ajoutée, avec ou sans cession fournisseur.
    try {
      const sigPath = path.join(process.cwd(), "public", "signature-morgane.png");
      const sigBytes = fs.readFileSync(sigPath);
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const sigWidth = REF_SIGNATURE_WIDTH * scaleX;
      const sigHeight = sigWidth * (sigImage.height / sigImage.width);
      const sigX = (REF_PAGE_WIDTH - REF_SIGNATURE_MARGIN_RIGHT - REF_SIGNATURE_WIDTH) * scaleX;
      const sigY = REF_SIGNATURE_Y * scaleY;
      page.drawImage(sigImage, { x: sigX, y: sigY, width: sigWidth, height: sigHeight });
    } catch (sigErr) {
      console.error("Échec de l'ajout de la signature sur le PDF", sigErr);
    }

    const outBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(outBytes), {
      status: 200,
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (err) {
    console.error("Échec du tamponnage du PDF récapitulatif", err);
    return NextResponse.json({ error: err.message || "Échec du traitement du PDF." }, { status: 500 });
  }
}
