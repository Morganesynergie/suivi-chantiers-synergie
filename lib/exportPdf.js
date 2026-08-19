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

async function generatePdfBlob(html) {
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

    const pdf = new jsPDFCtor({ unit: "px", format: [PAGE_W, PAGE_H] });
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= PAGE_H;
    while (heightLeft > 0) {
      position -= PAGE_H;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= PAGE_H;
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
  if (!isStandalonePwa()) {
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
