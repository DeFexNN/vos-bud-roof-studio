import type { Locale } from './types';
import type { PriceSource } from '@/data/prices';

const english: Record<string, string> = {
  ruukki: 'Ruukki · 2026 price list', budmat: 'Budmat · price list no. 17', 'venecja-shop': 'DoDachu · Venecja D-MATT PLUS',
  t18: 'Blachy Pruszyński · T18 PS', swissporton: 'swissporTON · TITANIA 2026', 'titania-retail': 'Realbud · TITANIA black glaze',
  concrete: 'Lubar · Braas Celtycka Lumino', 'concrete-retail': 'NaszeDachy · Celtycka Lumino', 'concrete-ridge': 'eDaszek · Celtycka ridge tiles',
  shingle: 'Gonty-24 · IKO Superglass', batten: 'Drewkan · 40 × 60 battens', counter: 'Drewkan · 25 × 50 counter-battens',
  membrane: 'Dachowe-Okna · Corotop Red Strong', 'membrane-premium': 'MegaBlach · Corotop PURE 205', underlay: 'ICMarket · IKO Armourbase Pro Plus',
  osb: 'Castorama · OSB 3 Kronobuild 18 mm', wool: 'Leroy Merlin · URSA Home 37 150 mm', fasteners: 'i-Śruby · Etanco 4.8 × 35',
  clips: 'Folnet · tile clips', flashing: 'Folnet · 2 m eaves flashing', valley: 'Folnet · 2 m valley flashing', 'ridge-tape': 'Bmax · Corotop Airvent 310',
  seal: 'ICMarket · Coroband / Coroblei', window: 'Bricoman · Optilight B 78 × 118', 'window-collar': 'OknaDachowe · Optilight flashing',
  wood: 'Drew-Cal · structural timber', 'labor-kb': 'KB.pl · roofing labor 2026', 'labor-trade': 'Dekarz & Cieśla · 2026 labor guide',
  demolition: 'KB.pl · roof removal', vat: 'VAT · Article 41(12–12c)', nails: 'Armet · galvanized roofing nails', 'counter-seal': 'Folnet · Corotop Pur',
};
export function sourceTitle(source: PriceSource, locale: Locale) { return locale === 'pl' ? source.title : english[source.id] || source.title; }
