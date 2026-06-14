import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib'

export interface DevisData {
  date: string
  date_formatee: string
  heure: string
  prenom: string
  nom: string
  telephone: string
  email: string
  societe: string
  adresse: string
  surface_m2: number
  type_toiture: string
  etat_general: string
  accessibilite: string
  description: string
  devis_numero: string
  devis_honoraires: number
  devis_deplacement: number
  devis_distance_km: number
  devis_total_ht: number
  devis_total_ttc: number
  devis_signe: boolean
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 40
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const NAVY = rgb(0.1176, 0.2275, 0.3725)
const SAGE = rgb(0.4824, 0.6588, 0.6078) // #7BA89B
const SAGE_50 = rgb(0.938, 0.959, 0.953) // teinte claire assortie
const SAGE_700 = rgb(0.369, 0.545, 0.494) // nuance foncée lisible pour le texte
const BLUE_50 = rgb(0.937, 0.965, 1)
const BLUE_100 = rgb(0.851, 0.918, 0.996)
const SLATE_50 = rgb(0.973, 0.980, 0.988)
const SLATE_100 = rgb(0.945, 0.961, 0.976)
const SLATE_200 = rgb(0.886, 0.910, 0.941)
const SLATE_400 = rgb(0.580, 0.639, 0.722)
const SLATE_500 = rgb(0.392, 0.455, 0.545)
const SLATE_700 = rgb(0.200, 0.255, 0.333)
const WHITE = rgb(1, 1, 1)

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export async function generateDevisPdf(devis: DevisData): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  function text(value: string, x: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    page.drawText(value, { x, y, size, font: f, color })
  }

  function textRight(value: string, xRight: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    const width = f.widthOfTextAtSize(value, size)
    page.drawText(value, { x: xRight - width, y, size, font: f, color })
  }

  function rect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
    page.drawRectangle({ x, y, width: w, height: h, color })
  }

  // ---- En-tête ----
  const headerHeight = 130
  rect(0, PAGE_HEIGHT - headerHeight, PAGE_WIDTH, headerHeight, NAVY)

  page.drawCircle({ x: MARGIN + 14, y: PAGE_HEIGHT - 40, size: 14, color: SAGE })
  text('N', MARGIN + 14 - bold.widthOfTextAtSize('N', 14) / 2, PAGE_HEIGHT - 45, 14, bold, WHITE)

  text('NORMANDIE ÉTANCHÉITÉ', MARGIN + 38, PAGE_HEIGHT - 35, 16, bold, WHITE)
  text('16 Impasse Beau Vallon, 61100 Flers', MARGIN + 38, PAGE_HEIGHT - 52, 9, font, SLATE_400)
  text('SIRET : XXX XXX XXX XXXXX  |  Assurance : N° XXXXXXXXXXXX', MARGIN + 38, PAGE_HEIGHT - 65, 9, font, SLATE_400)

  textRight('DEVIS', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 45, 24, bold, SAGE)
  textRight(`N° ${devis.devis_numero}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 65, 11, bold, WHITE)
  textRight('Valable 30 jours', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 78, 8, font, SLATE_400)

  // ---- Blocs Client / Intervention ----
  let cursorY = PAGE_HEIGHT - headerHeight - 25
  const boxWidth = (CONTENT_WIDTH - 16) / 2
  const boxHeight = 100
  const boxTop = cursorY
  const boxBottom = boxTop - boxHeight

  rect(MARGIN, boxBottom, boxWidth, boxHeight, SLATE_50)
  rect(MARGIN + boxWidth + 16, boxBottom, boxWidth, boxHeight, SLATE_50)

  // Client
  let cy = boxTop - 18
  const clientX = MARGIN + 14
  text('CLIENT', clientX, cy, 8, bold, SLATE_400)
  cy -= 16
  text(`${devis.prenom} ${devis.nom}`, clientX, cy, 11, bold, NAVY)
  cy -= 15
  if (devis.societe) {
    text(devis.societe, clientX, cy, 9, font, SLATE_500)
    cy -= 13
  }
  text(`${devis.telephone}  |  ${devis.email}`, clientX, cy, 9, font, SLATE_500)
  cy -= 13
  for (const line of wrapText(devis.adresse, font, 9, boxWidth - 28)) {
    text(line, clientX, cy, 9, font, SLATE_500)
    cy -= 12
  }

  // Intervention
  cy = boxTop - 18
  const interX = MARGIN + boxWidth + 16 + 14
  text('INTERVENTION', interX, cy, 8, bold, SLATE_400)
  cy -= 16
  text(capitalize(devis.date_formatee), interX, cy, 11, bold, NAVY)
  cy -= 15
  text(`Créneau : ${devis.heure}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`Surface : ${devis.surface_m2} m²  |  ${devis.type_toiture}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`État : ${devis.etat_general}`, interX, cy, 9, font, SLATE_500)
  cy -= 13
  text(`Accès : ${devis.accessibilite}`, interX, cy, 9, font, SLATE_500)

  cursorY = boxBottom - 16

  // ---- Description ----
  if (devis.description) {
    const descLines = wrapText(devis.description, font, 9, CONTENT_WIDTH - 28)
    const descHeight = 28 + descLines.length * 12
    rect(MARGIN, cursorY - descHeight, CONTENT_WIDTH, descHeight, BLUE_50)
    page.drawRectangle({
      x: MARGIN,
      y: cursorY - descHeight,
      width: CONTENT_WIDTH,
      height: descHeight,
      borderColor: BLUE_100,
      borderWidth: 1,
    })
    let dy = cursorY - 16
    text('DESCRIPTION', MARGIN + 14, dy, 8, bold, SLATE_400)
    dy -= 15
    for (const line of descLines) {
      text(line, MARGIN + 14, dy, 9, font, SLATE_700)
      dy -= 12
    }
    cursorY -= descHeight + 16
  }

  // ---- Tableau de prix ----
  const tva = Math.round((devis.devis_total_ttc - devis.devis_total_ht) * 100) / 100
  const rowHeight = 28
  const rows: Array<{ label: string; value: string; bg?: ReturnType<typeof rgb>; f?: PDFFont; color?: ReturnType<typeof rgb>; size?: number }> = [
    { label: `Honoraires d'expertise (${devis.surface_m2} m²)`, value: `${devis.devis_honoraires.toFixed(2)} €` },
    { label: `Frais de déplacement (${devis.devis_distance_km} km)`, value: `${devis.devis_deplacement.toFixed(2)} €` },
    { label: 'Total HT', value: `${devis.devis_total_ht.toFixed(2)} €`, bg: SLATE_50, f: bold, color: NAVY },
    { label: 'TVA 20 %', value: `${tva.toFixed(2)} €`, color: SLATE_500, size: 9 },
    { label: 'Total TTC', value: `${devis.devis_total_ttc.toFixed(2)} €`, bg: SAGE_50, f: bold, color: SAGE, size: 13 },
  ]

  const tableHeight = rowHeight + rows.length * rowHeight
  const tableTop = cursorY
  rect(MARGIN, tableTop - rowHeight, CONTENT_WIDTH, rowHeight, NAVY)
  text('Désignation', MARGIN + 14, tableTop - rowHeight + 9, 10, bold, WHITE)
  textRight('Montant HT', PAGE_WIDTH - MARGIN - 14, tableTop - rowHeight + 9, 10, bold, WHITE)

  let rowY = tableTop - rowHeight
  for (const row of rows) {
    rowY -= rowHeight
    if (row.bg) rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight, row.bg)
    page.drawLine({
      start: { x: MARGIN, y: rowY },
      end: { x: MARGIN + CONTENT_WIDTH, y: rowY },
      thickness: 0.5,
      color: SLATE_200,
    })
    const f = row.f || font
    const color = row.color || SLATE_700
    const size = row.size || 10
    text(row.label, MARGIN + 14, rowY + 9, size, f, color)
    textRight(row.value, PAGE_WIDTH - MARGIN - 14, rowY + 9, size, f, color)
  }

  cursorY = rowY - 24

  // ---- Mention légale ----
  const legal = 'Ce devis est valable 30 jours. La signature électronique vaut acceptation des conditions générales de vente.'
  for (const line of wrapText(legal, italic, 8, CONTENT_WIDTH)) {
    const width = italic.widthOfTextAtSize(line, 8)
    text(line, MARGIN + (CONTENT_WIDTH - width) / 2, cursorY, 8, italic, SLATE_400)
    cursorY -= 12
  }

  // ---- Zone de signature ----
  const signatureHeight = 110
  const signatureTop = MARGIN + 40 + signatureHeight
  page.drawRectangle({
    x: MARGIN,
    y: signatureTop - signatureHeight,
    width: CONTENT_WIDTH,
    height: signatureHeight,
    borderColor: SLATE_200,
    borderWidth: 1,
    color: SLATE_50,
  })
  text('SIGNATURE DU CLIENT — Bon pour accord', MARGIN + 14, signatureTop - 18, 9, bold, SLATE_700)
  text(`Date : ${devis.date_formatee}`, MARGIN + 14, signatureTop - 34, 9, font, SLATE_500)

  // ---- Pied de page ----
  rect(0, 0, PAGE_WIDTH, 24, NAVY)
  const footer = 'NORMANDIE ÉTANCHÉITÉ — 16 Impasse Beau Vallon, 61100 Flers — normandie-etancheite.fr'
  const footerWidth = font.widthOfTextAtSize(footer, 8)
  text(footer, (PAGE_WIDTH - footerWidth) / 2, 9, 8, font, SLATE_400)

  return pdfDoc.saveAsBase64()
}

/**
 * Génère le PDF "modèle" à téléverser UNE SEULE FOIS dans Docuseal.
 * Mise en page d'un vrai devis professionnel (en-tête société + mentions
 * légales, bandeau N°/Date/Validité, DE/POUR, chantier, tableau des
 * ouvrages, totaux avec bandeau TTC, signatures).
 *
 * Zones où Docuseal insère les champs (à placer dans l'éditeur) :
 *   numero, date, client, chantier, designation, montant_ht,
 *   total_ht, tva, total_ttc, Signature
 */
export async function generateDevisTemplatePdf(logoPng?: Uint8Array): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const H = PAGE_HEIGHT
  const RIGHT = PAGE_WIDTH - MARGIN

  function text(value: string, x: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    page.drawText(value, { x, y, size, font: f, color })
  }
  function textRight(value: string, xRight: number, y: number, size: number, f: PDFFont, color = SLATE_700) {
    const width = f.widthOfTextAtSize(value, size)
    page.drawText(value, { x: xRight - width, y, size, font: f, color })
  }
  function rect(x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) {
    page.drawRectangle({ x, y, width: w, height: h, color })
  }
  function hline(y: number, x1: number, x2: number, color: ReturnType<typeof rgb>, thickness = 0.5) {
    page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color })
  }

  // Colonnes du tableau
  const colDesX = MARGIN + 30
  const colUniteR = MARGIN + 350
  const colQteR = MARGIN + 430
  const colHtR = RIGHT

  // ======================= EN-TÊTE =======================
  const headerH = 138
  rect(0, H - headerH, PAGE_WIDTH, headerH, NAVY)
  rect(0, H - headerH, PAGE_WIDTH, 3, SAGE) // liseré de marque

  // Logo (version blanche) centré dans le bandeau
  if (logoPng) {
    const img = await pdfDoc.embedPng(logoPng)
    const lw = 132
    const lh = (lw * img.height) / img.width
    page.drawImage(img, { x: (PAGE_WIDTH - lw) / 2, y: H - 70 - lh / 2, width: lw, height: lh })
  }

  // Société (gauche)
  text('Normandie Étanchéité S.A.S', MARGIN, H - 34, 13, bold, WHITE)
  text('16 Impasse Beau Vallon', MARGIN, H - 50, 9, font, SLATE_200)
  text('61 100 FLERS', MARGIN, H - 62, 9, font, SLATE_200)
  text('Tél. : 06.51.17.45.64', MARGIN, H - 78, 9, font, SLATE_400)
  text('contact@normandie-etancheite.com', MARGIN, H - 90, 9, font, SLATE_400)

  // Document + mentions légales (droite)
  textRight('DOCUMENT', RIGHT, H - 33, 8, font, SLATE_400)
  textRight('Devis', RIGHT, H - 56, 23, font, WHITE)
  textRight('SIRET : 919 098 210 000 17', RIGHT, H - 78, 8, font, SLATE_400)
  textRight('CODE APE : 4391 B', RIGHT, H - 89, 8, font, SLATE_400)
  textRight('RCS 919 098 210 ALENÇON', RIGHT, H - 100, 8, font, SLATE_400)
  textRight('TVA : FR93919098210', RIGHT, H - 111, 8, font, SLATE_400)

  // ============ BANDEAU N° / DATE / VALIDITÉ ============
  const metaTop = H - headerH
  const metaH = 36
  rect(0, metaTop - metaH, PAGE_WIDTH, metaH, SAGE_50)
  const metaLabelY = metaTop - 14
  const metaValueY = metaTop - 29
  text('N° DEVIS', MARGIN, metaLabelY, 8, bold, SAGE_700)
  text('DATE', MARGIN + 150, metaLabelY, 8, bold, SAGE_700)
  text('VALIDITÉ', MARGIN + 300, metaLabelY, 8, bold, SAGE_700)
  text('30 jours', MARGIN + 300, metaValueY, 10, font, SLATE_700)
  // [CHAMP numero] -> (MARGIN, metaValueY)   [CHAMP date] -> (MARGIN+150, metaValueY)

  // ==================== DE / POUR ====================
  let y = metaTop - metaH - 22
  text('DE', MARGIN, y, 8, bold, SAGE_700)
  textRight('POUR', RIGHT, y, 8, bold, SAGE_700)
  y -= 15
  text('Normandie Étanchéité S.A.S', MARGIN, y, 10, bold, NAVY)
  text('16 Impasse Beau Vallon', MARGIN, y - 13, 9, font, SLATE_500)
  text('61 100 FLERS', MARGIN, y - 25, 9, font, SLATE_500)
  // [CHAMP client] -> zone droite, ~ x=MARGIN+295..RIGHT, haut=y+2, hauteur ~46

  // ==================== CHANTIER ====================
  const chTop = y - 25 - 20
  rect(MARGIN, chTop - 22, CONTENT_WIDTH, 22, SAGE_50)
  text('CHANTIER', MARGIN + 10, chTop - 14, 8, bold, SAGE_700)
  // [CHAMP chantier] -> (MARGIN+78, chTop-14), largeur ~ jusqu'à RIGHT

  // ==================== TABLEAU ====================
  const thY = chTop - 22 - 24
  text('N°', MARGIN, thY, 8, bold, SAGE_700)
  text('DÉSIGNATION DES OUVRAGES', colDesX, thY, 8, bold, SAGE_700)
  textRight('UNITÉ', colUniteR, thY, 8, bold, SAGE_700)
  textRight('QTÉ', colQteR, thY, 8, bold, SAGE_700)
  textRight('TOTAL HT', colHtR, thY, 8, bold, SAGE_700)
  hline(thY - 7, MARGIN, RIGHT, SAGE, 0.75)

  const rowY = thY - 24
  text('01', MARGIN, rowY, 9, font, SLATE_400)
  textRight('forfait', colUniteR, rowY, 9, font, SLATE_700)
  textRight('1', colQteR, rowY, 9, font, SLATE_700)
  // [CHAMP designation] -> (colDesX, rowY+4) zone ~ largeur jusqu'à MARGIN+300, multi-lignes
  // [CHAMP montant_ht] -> aligné à droite sur colHtR, base rowY
  hline(rowY - 16, MARGIN, RIGHT, SLATE_200, 0.5)

  // ==================== TOTAUX ====================
  const sumLabelX = MARGIN + 300
  let sy = rowY - 16 - 20
  text('Total HT', sumLabelX, sy, 9, font, SLATE_500)
  // [CHAMP total_ht] -> droite colHtR, base sy
  hline(sy - 7, sumLabelX, RIGHT, SLATE_200, 0.5)
  sy -= 18
  text('TVA (20%)', sumLabelX, sy, 9, font, SLATE_500)
  // [CHAMP tva] -> droite colHtR, base sy

  // Bandeau TOTAL DEVIS TTC : cellule navy (libellé) + cellule claire (valeur)
  sy -= 30
  const barTop = sy + 10
  const barH = 30
  const barX = sumLabelX - 12
  const barW = RIGHT - barX
  const labelCellW = barW * 0.6
  rect(barX, barTop - barH, labelCellW, barH, NAVY)
  rect(barX + labelCellW, barTop - barH, barW - labelCellW, barH, SAGE_50)
  text('TOTAL DEVIS TTC', barX + 12, barTop - barH + 11, 10, bold, WHITE)
  // [CHAMP total_ttc] -> cellule claire, aligné à droite ~ RIGHT-10, base barTop-barH+10

  // ==================== MENTION LÉGALE ====================
  let ly = barTop - barH - 26
  text("Devis valable 30 jours a compter de la date d'emission.", MARGIN, ly, 8, italic, SLATE_400)

  // ==================== SIGNATURE (centrée) ====================
  ly -= 22
  hline(ly + 6, MARGIN, RIGHT, SLATE_200, 0.5)
  ly -= 10
  // Titre centré
  const sigTitle = 'Bon pour accord — Signature du client'
  const stW = bold.widthOfTextAtSize(sigTitle, 10)
  text(sigTitle, (PAGE_WIDTH - stW) / 2, ly, 10, bold, NAVY)
  // Case de signature centrée
  const sbW = 260
  const sbH = 80
  const sbX = (PAGE_WIDTH - sbW) / 2
  const sbTop = ly - 12
  page.drawRectangle({
    x: sbX,
    y: sbTop - sbH,
    width: sbW,
    height: sbH,
    color: SLATE_50,
    borderColor: SAGE,
    borderWidth: 1,
  })
  text('Signature', sbX + 10, sbTop - 14, 8, bold, SAGE_700)
  // [CHAMP Signature] -> case centrée : (sbX, sbTop) -> (sbX+sbW, sbTop-sbH)

  // ==================== PIED DE PAGE ====================
  const footer = 'normandie-etancheite.com'
  hline(34, MARGIN, RIGHT, SLATE_200, 0.5)
  const fw = font.widthOfTextAtSize(footer, 8)
  text(footer, (PAGE_WIDTH - fw) / 2, 20, 8, font, SAGE_700)

  return pdfDoc.saveAsBase64()
}
