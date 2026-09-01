"use client";

// Ouverture des documents imprimables (situations, règlements, RG...).
//
// Dans un navigateur classique (Chrome/Safari desktop, onglet mobile normal),
// on garde le flux historique : une nouvelle fenêtre avec le HTML du
// document, et un bouton "Imprimer / Enregistrer en PDF" qui appelle
// window.print().
//
// MAIS : quand l'appli est installée sur l'écran d'accueil d'un iPhone
// ("Ajouter à l'écran d'accueil", mode PWA "standalone"), iOS/Safari ne
// fournit tout simplement AUCUNE interface d'impression aux apps lancées
// depuis l'écran d'accueil — window.print() ne fait rigoureusement rien,
// silencieusement, y compris dans une fenêtre ouverte avec window.open().
// C'est ce qui provoquait "je clique sur Imprimer/Enregistrer et il ne se
// passe rien" : l'app est bien installée en PWA sur le téléphone du
// collègue (pas d'onglet Safari visible dans sa vidéo).
//
// Dans ce cas, on génère un vrai fichier PDF côté client (html2canvas pour
// rendre le HTML en image, jsPDF pour assembler les pages) puis on
// l'ouvre via la fenêtre de partage native du téléphone (Enregistrer dans
// Fichiers, Imprimer, envoyer par mail/WhatsApp...), qui elle fonctionne
// très bien depuis une PWA.

let jsPDFPromise = null;
function loadJsPDF() {
  if (!jsPDFPromise) {
    jsPDFPromise = import("jspdf").then((m) => m.jsPDF || m.default);
  }
  return jsPDFPromise;
}

let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (!html2canvasPromise) {
    html2canvasPromise = import("html2canvas").then((m) => m.default || m);
  }
  return html2canvasPromise;
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.navigator.standalone === true ||
    (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches)
  );
}

// iPhone/iPad (y compris iPadOS 13+, qui se fait passer pour un Mac mais a
// un écran tactile — d'où le test maxTouchPoints).
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

// Le flux "génère un vrai PDF côté client puis ouvre le partage natif" n'a
// été conçu QUE pour contourner l'absence totale d'interface d'impression
// sur iOS/Safari en PWA installée (voir le commentaire en tête de fichier).
// isStandalonePwa() seule est trop large : une appli "installée" sous
// Windows (Edge/Chrome "Installer cette appli") matche aussi
// display-mode:standalone, alors que window.print() y fonctionne
// normalement. Sans ce garde-fou supplémentaire sur iOS, "Générer le PDF"
// déclenchait navigator.share() sur Windows, qui ouvre le volet de partage
// natif de Windows (Contacts, Partage à proximité, "Obtenir des
// applications"...) au lieu de simplement enregistrer/imprimer le PDF —
// c'est ce qui provoquait "ça me demande un contact / partage à
// proximité / obtenir des applications du store" chez Morgane.
function needsPdfShareFlow() {
  return isStandalonePwa() && isIOS();
}

// `pageNumbers`: quand true, tamponne "Page i / N" (texte vectoriel réel,
// pas rasterisé) en bas à droite de chaque page du PDF généré — utilisé par
// les documents qui doivent afficher une pagination fiable (contrat de
// sous-traitance, DC4). Chrome ne supporte pas les compteurs CSS
// (@page { @bottom-right { content: counter(page) } }) pour l'impression
// classique (window.print()), d'où le choix de sortir un vrai PDF (voir
// openGeneratedPdf ci-dessous) plutôt que de compter sur le CSS.
export async function generatePdfBlob(html, { pageNumbers = false } = {}) {
  const [jsPDFCtor, html2canvas] = await Promise.all([loadJsPDF(), loadHtml2Canvas()]);

  const PAGE_W = 794; // ~A4 à 96dpi
  const PAGE_H = 1123;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = PAGE_W + "px";
  iframe.style.height = PAGE_H + "px";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    await new Promise((resolve) => {
      iframe.onload = resolve;
      iframe.srcdoc = html;
    });
    // Laisse le temps au DOM/images (logo en base64, déjà inline) de se stabiliser.
    await new Promise((r) => setTimeout(r, 150));

    const doc = iframe.contentDocument;
    // Le bandeau "Imprimer / Fermer" n'a de sens qu'à l'écran, pas dans le PDF final.
    const closeBar = doc.querySelector(".close-bar");
    if (closeBar) closeBar.remove();

    const canvas = await html2canvas(doc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: PAGE_W,
    });

    const imgWidth = PAGE_W;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pageCount = Math.max(1, Math.ceil(imgHeight / PAGE_H));

    const pdf = new jsPDFCtor({ unit: "px", format: [PAGE_W, PAGE_H] });
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -i * PAGE_H, imgWidth, imgHeight);
      if (pageNumbers) {
        pdf.setFontSize(9);
        pdf.setTextColor(130, 130, 130);
        pdf.text(`Page ${i + 1} / ${pageCount}`, PAGE_W - 70, PAGE_H - 18);
      }
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(iframe);
  }
}

async function shareOrDownloadBlob(blob, fileName) {
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (e) {
      // L'utilisateur a annulé le partage, ou le partage a échoué : on
      // retombe sur le téléchargement direct plutôt que de rester bloqué.
      if (e && e.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Ouvre un document imprimable à partir d'un HTML complet (déjà généré par
 * les fonctions d'export). `fileName` sert de nom de fichier si un vrai PDF
 * doit être généré (mode PWA installée).
 */
export async function openPrintableDocument(html, { fileName = "export.pdf", onError } = {}) {
  if (!needsPdfShareFlow()) {
    const win = window.open("", "_blank");
    if (!win) {
      if (onError) onError("La fenêtre d'aperçu a été bloquée par le navigateur. Autorisez les pop-ups pour ce site puis réessayez.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
    return;
  }

  try {
    const blob = await generatePdfBlob(html);
    await shareOrDownloadBlob(blob, fileName);
  } catch (e) {
    console.error("openPrintableDocument (PWA) failed", e);
    if (onError) {
      onError(
        "Impossible de générer le PDF automatiquement. Réessayez, ou ouvrez l'appli dans Safari (pas depuis l'icône ajoutée à l'écran d'accueil) pour utiliser l'impression classique."
      );
    }
  }
}

/**
 * Génère un vrai fichier PDF (voir generatePdfBlob) et l'ouvre directement
 * dans un nouvel onglet, au lieu d'ouvrir une page HTML "à imprimer" comme
 * openPrintableDocument. Utilisé pour les documents où la pagination réelle
 * compte (contrat de sous-traitance, DC4) : le visualiseur PDF intégré du
 * navigateur affiche nativement le numéro de page / nombre total de pages,
 * et le contenu s'écoule sans les grands blancs que peut provoquer un
 * `page-break-after` CSS mal calé sur un contenu de longueur variable.
 * Fonctionne aussi bien sur desktop (onglet PDF natif) qu'en PWA iOS
 * installée (partage/téléchargement, comme openPrintableDocument).
 */
export async function openGeneratedPdf(html, { fileName = "export.pdf", onError, pageNumbers = false } = {}) {
  try {
    const blob = await generatePdfBlob(html, { pageNumbers });
    if (needsPdfShareFlow()) {
      await shareOrDownloadBlob(blob, fileName);
      return;
    }
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // Pop-up bloquée : on retombe sur le téléchargement direct plutôt
      // que de laisser Morgane sans aucun moyen de récupérer le document.
      await shareOrDownloadBlob(blob, fileName);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    console.error("openGeneratedPdf failed", e);
    if (onError) {
      onError("Impossible de générer le PDF. Réessayez, ou vérifiez que les pop-ups sont autorisées pour ce site.");
    }
  }
}
