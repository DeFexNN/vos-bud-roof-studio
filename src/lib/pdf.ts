import { jsPDF } from 'jspdf';
import type { RoofConfig } from '@/configurator/model';
import type { Estimate } from '@/calculators/estimate';
import { messages } from '@/i18n/messages';
import { money, number, type Locale } from '@/i18n/types';
import { PRICE_REVIEW, sources } from '@/data/prices';
import { productById, productName } from '@/data/materials';
import { asset } from './site';
import { issueMessages } from '@/calculators/validation';
import { sourceTitle } from '@/i18n/sourceTitles';

let fontCache: Promise<[string, string]> | undefined;
function fonts() {
  return fontCache ||= Promise.all(['Regular', 'Bold'].map(async style => {
    const response = await fetch(asset(`/fonts/NotoSans-${style}.ttf`));
    if (!response.ok) throw new Error('font');
    const buffer = new Uint8Array(await response.arrayBuffer());
    let binary = ''; for (let i = 0; i < buffer.length; i += 8192) binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
    return btoa(binary);
  })) as Promise<[string, string]>;
}

export async function createEstimatePdf(c: RoofConfig, r: Estimate, locale: Locale, image?: string): Promise<jsPDF> {
  if (!r.valid || !r.geometry) throw new Error('invalid estimate');
  const d = messages[locale], g = r.geometry, product = productById(c.productId)!;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const [regular, bold] = await fonts();
  pdf.addFileToVFS('NotoSans-Regular.ttf', regular); pdf.addFont('NotoSans-Regular.ttf', 'Noto', 'normal');
  pdf.addFileToVFS('NotoSans-Bold.ttf', bold); pdf.addFont('NotoSans-Bold.ttf', 'Noto', 'bold');
  pdf.setFont('Noto', 'normal'); pdf.setProperties({ title: d.pdfTitle, subject: d.priceNote, author: 'V.O.S_BUD', creator: 'V.O.S Roof Studio' });
  const ink: [number, number, number] = [38, 49, 42], copper: [number, number, number] = [144, 90, 60];
  let y = 20;
  const header = () => {
    pdf.setFillColor(...ink); pdf.rect(0, 0, 210, 37, 'F'); pdf.setTextColor(242, 240, 228); pdf.setFont('Noto', 'bold'); pdf.setFontSize(23); pdf.text('V.O.S_BUD', 17, 23);
    pdf.setFont('Noto', 'normal'); pdf.setFontSize(8); pdf.text(d.brandTag, 193, 22, { align: 'right' }); pdf.setTextColor(...ink); y = 49;
  };
  const newPage = () => { pdf.addPage(); header(); };
  const space = (height: number) => { if (y + height > 275) newPage(); };
  const text = (value: string, size = 9, width = 176, weight: 'normal' | 'bold' = 'normal') => {
    pdf.setFont('Noto', weight); pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(value, width);
    for (const line of lines) { space(size * .42 + 2); pdf.text(line, 17, y); y += size * .42 + 1; }
  };
  const rule = () => { pdf.setDrawColor(211, 215, 202); pdf.line(17, y, 193, y); y += 5; };
  header();
  text(d.pdfTitle, 21, 176, 'bold'); y += 4;
  text(`${d.pdfCreated}: ${new Intl.DateTimeFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { dateStyle: 'long' }).format(new Date())}`);
  text(`${d.reviewed}: ${PRICE_REVIEW}`); y += 5;
  if (image) {
    try { const info = pdf.getImageProperties(image); const h = Math.min(85, 176 * info.height / info.width); pdf.addImage(image, 'PNG', 17, y, 176, h); y += h + 9; } catch { /* Optional snapshot only. */ }
  }
  text(`${d.roofType}: ${d.roofNames[c.type]}`, 11, 176, 'bold');
  text(productName(product, locale));
  text(`${d.length}: ${number(c.length, locale)} m  /  ${d.width}: ${number(c.width, locale)} m  /  ${d.height}: ${number(c.height, locale)} m`);
  text(`${d.pitch}: ${c.pitch}°  /  ${d.overhang}: ${number(c.overhang, locale, 2)} m`);
  if (c.type === 'multi') text(`${d.wingWidth}: ${number(c.wingWidth, locale, 2)} m  /  ${d.wingLength}: ${number(c.wingLength, locale, 2)} m`);
  if (c.type === 'hip') text(`${d.ridgeLength}: ${number(g.ridge, locale, 2)} m`);
  text(`${d.grossArea}: ${number(g.grossArea, locale, 2)} m²  /  ${d.netArea}: ${number(g.netArea, locale, 2)} m²`, 11, 176, 'bold');
  text(`${d.waste}: ${number(c.coveringWaste * 100, locale)}%  /  ${d.rafterSpacing}: ${number(c.rafterSpacing, locale, 2)} m`);
  y += 5; rule();
  text(`${d.total}: ${money(r.gross, locale, 2)} ${d.gross}`, 17, 176, 'bold');
  text(`${d.indicativeRange}: ${money(r.low, locale)} — ${money(r.high, locale)}`);
  text(`${d.materialSubtotal}: ${money(r.materialsNet, locale, 2)} ${d.net}  /  ${d.laborSubtotal}: ${money(r.laborNet, locale, 2)} ${d.net}`);
  text(`VAT ${number(r.vatRate * 100, locale, 2)}%: ${money(r.vat, locale, 2)}`); y += 6;

  newPage(); text(d.billTitle.replace('\n', ' '), 18, 176, 'bold'); y += 5;
  const tableHeader = () => {
    pdf.setFillColor(232, 235, 224); pdf.rect(17, y - 4, 176, 10, 'F'); pdf.setFont('Noto', 'bold'); pdf.setFontSize(7.5);
    pdf.text(d.material, 20, y + 1); pdf.text(d.quantity, 121, y + 1, { align: 'right' }); pdf.text(d.unitPrice, 156, y + 1, { align: 'right' }); pdf.text(d.cost, 190, y + 1, { align: 'right' }); y += 13;
  };
  tableHeader();
  for (const [category, label] of Object.entries(d.categories)) {
    const lines = r.items.filter(i => i.category === category); if (!lines.length) continue;
    space(15); text(label, 10, 176, 'bold'); y += 2;
    for (const item of lines) {
      pdf.setFont('Noto', 'normal'); pdf.setFontSize(8);
      const name: string[] = pdf.splitTextToSize(item.name[locale], 77), height = Math.max(10, name.length * 4 + 4);
      if (y + height > 266) { newPage(); tableHeader(); }
      pdf.text(name, 20, y); pdf.text(`${number(item.quantity, locale, 2)} ${d.units[item.unit]}`, 121, y, { align: 'right' });
      pdf.text(money(item.unitNet, locale, 2), 156, y, { align: 'right' }); pdf.text(money(item.costNet, locale, 2), 190, y, { align: 'right' });
      y += height; pdf.setDrawColor(231, 233, 225); pdf.line(17, y - 3, 193, y - 3);
    }
  }
  space(27); y += 4; rule(); text(`${d.net}: ${money(r.net, locale, 2)}`, 11, 176, 'bold'); text(`VAT: ${money(r.vat, locale, 2)}`, 11);
  text(`${d.gross}: ${money(r.gross, locale, 2)}`, 15, 176, 'bold');

  newPage(); text(d.pdfAssumptions, 18, 176, 'bold'); y += 5;
  text(d.areaDefinition, 9); text(d.rangeNote, 9); text(d.laborNote, 9); text(d.exclusions, 9); y += 4;
  for (const issue of r.issues) if (issue.severity === 'warning') { text(issueMessages[issue.code][locale], 8); y += 2; }
  if (r.quantities!.covering.sheetCuts.length) {
    y += 4; text(d.sheetSchedule, 12, 176, 'bold');
    for (const cut of r.quantities!.covering.sheetCuts) text(`${cut.reserve ? d.reserve : `${d.plane} ${cut.plane}`}: ${cut.count} × ${number(cut.length, locale, 2)} m`, 8);
  }
  y += 5; text(d.formula, 12, 176, 'bold');
  for (const item of r.items) { text(`${item.name[locale]}: ${item.formula[locale]}`, 8); y += 3; }
  newPage(); text(d.pdfSources, 18, 176, 'bold'); y += 5;
  const used = new Set(r.items.map(i => i.sourceId));
  if (used.has('venecja-shop')) used.add('budmat'); if (used.has('swissporton')) used.add('titania-retail'); if (used.has('concrete')) used.add('concrete-retail');
  for (const source of sources.filter(s => used.has(s.id) || s.id === 'vat')) {
    space(32); text(sourceTitle(source, locale), 10, 176, 'bold'); text(`${d.sourceDate}: ${source.date || d.undated}  /  ${d.accessed}: ${PRICE_REVIEW}`, 7.5);
    pdf.setTextColor(...copper); text(source.url, 7.5); pdf.setTextColor(...ink); text(source.note[locale], 8); y += 5;
  }
  space(23); rule(); text(d.priceNote, 10, 176, 'bold'); text(d.productScope, 8);
  for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
    pdf.setPage(i); pdf.setFont('Noto', 'normal'); pdf.setFontSize(7); pdf.setTextColor(101, 109, 96);
    pdf.text(`V.O.S_BUD  /  ${d.reviewed}: ${PRICE_REVIEW}`, 17, 286); pdf.text(`${d.page} ${i} / ${pdf.getNumberOfPages()}`, 193, 286, { align: 'right' });
  }
  return pdf;
}
export async function exportEstimatePdf(c: RoofConfig, r: Estimate, locale: Locale, image?: string) {
  const pdf = await createEstimatePdf(c, r, locale, image);
  pdf.save(`VOS-${locale === 'pl' ? 'kosztorys' : 'estimate'}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
