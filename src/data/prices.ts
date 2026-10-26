import { bi, type Bilingual } from '@/i18n/types';

export const PRICE_REVIEW = '2026-10-26';
export type Unit = 'm2' | 'm' | 'piece' | 'roll' | 'pack' | 'm3';
export type Category = 'covering' | 'underlay' | 'timber' | 'accessories' | 'drainage' | 'labor' | 'demolition' | 'structure' | 'extras';
export interface PriceSource {
  id: string;
  title: string;
  url: string;
  date: string | null;
  note: Bilingual;
}
const observed = bi('Cena internetowa odczytana 26.10.2026; brak daty cennika. Transport poza ceną.', 'Web price observed 26 October 2026; no published price-list date. Delivery excluded.');
export const sources: PriceSource[] = [
  { id: 'ruukki', title: 'Ruukki · cennik 2026', url: 'https://www.ruukki.com/docs/default-source/roofing-documents/poland-ruukki/cennik-ruukki.pdf?sfvrsn=103639129534143130000', date: '2026-08-28', note: bi('Cennik producenta. Str. 7: cena efektywna / całkowita; str. 17–27: obróbki; str. 42–44: Siba Round. Netto i 23% VAT.', 'Manufacturer list. P. 7: effective / physical area; pp. 17–27: accessories; pp. 42–44: Siba Round. Net and 23% VAT.') },
  { id: 'budmat', title: 'Budmat · cennik nr 17', url: 'https://icmarket.sk/__files/_cenniki/cennik-budmat-2026-07-31-dachy.pdf', date: '2026-07-31', note: bi('Oryginalny cennik Budmat udostępniony przez dystrybutora. Venecja D-MATT: 52,68 zł netto/arkusz. Gąsior GS-LUX: 75,39 zł netto. Cena katalogowa jako górny punkt porównania.', 'Original Budmat list hosted by a distributor. Venecja D-MATT: PLN 52.68 net/sheet. GS-LUX ridge: PLN 75.39 net. List price is the upper comparison point.') },
  { id: 'venecja-shop', title: 'DoDachu · Venecja D-MATT PLUS', url: 'https://dodachu.pl/pokrycia-dachowe/373-budmat-blachodach%C3%B3wka-modu%C5%82owa-venecja-d-matt.html', date: null, note: bi('44,06 zł brutto/arkusz w odczytanej stronie (wynik wyszukiwarki miał starszą cenę). Krycie 0,805 m², 1,15 × 0,70 m.', 'PLN 44.06 gross/sheet on the fetched page (search results showed an older price). Coverage 0.805 m², 1.15 × 0.70 m.') },
  { id: 't18', title: 'Blachy Pruszyński · T18 PS', url: 'https://pruszynski.com.pl/warto-wiedziec/cena-blachy-trapezowej-za-m2/', date: '2026-08-20', note: bi('T18 PS 0,5 mm: 42,99 zł brutto/m² całkowitego. 1173 mm całkowite, 1128 mm użytkowe. 0,7 mm to inny produkt — nie używamy go do widełek.', 'T18 PS 0.5 mm: PLN 42.99 gross/physical m². 1173 mm overall, 1128 mm effective. 0.7 mm is a different product and is not used for its price range.') },
  { id: 'swissporton', title: 'swissporTON · TITANIA 2026', url: 'https://www.swissporton.pl/media/11334/download/cennik-swissporTON-2026-pl.pdf?v=5', date: '2026-07-01', note: bi('Cennik dla partnerów, str. 24–25, ceny netto: czarna glazura 9070 zł/1000 szt.; PT z klamrą 56,40 zł/szt. Parametry z aktualnej karty TITANIA.', 'Trade list, pp. 24–25, net prices: black glaze PLN 9070/1000 tiles; PT ridge with clip PLN 56.40 each. Dimensions follow the current TITANIA datasheet.') },
  { id: 'titania-retail', title: 'Realbud · TITANIA czarna glazura', url: 'https://realbud.com/pl/p/CREATON-TITANIA-czarna-glazura-dachowka-podstawowa/67971026', date: null, note: bi('12,40 zł brutto/szt. Starsze parametry w opisie nie zastępują bieżącej karty producenta. Porównanie ceny detalicznej z katalogową.', 'PLN 12.40 gross/tile. Older specifications in the listing do not replace the current manufacturer datasheet. Retail versus list-price comparison.') },
  { id: 'concrete', title: 'Lubar · Braas Celtycka Lumino', url: 'https://sklep-lubar.pl/dachowka-betonowa/dachowka-betonowa-braas-celtycka-podstawowa-lumino-grafitowa', date: null, note: bi('3,92 zł brutto/szt., grafit. Porównanie: NaszeDachy 5,87 zł brutto/szt. Transport i palety poza zakresem.', 'PLN 3.92 gross/tile, graphite. Comparison: NaszeDachy PLN 5.87 gross/tile. Shipping and pallet deposits excluded.') },
  { id: 'concrete-retail', title: 'NaszeDachy · Celtycka Lumino', url: 'https://naszedachy.pl/dachowka-betonowa-braas-celtycka-lumino-kolor-grafitowy-p-1065.html', date: null, note: observed },
  { id: 'concrete-ridge', title: 'eDaszek · Celtycka gąsior', url: 'https://www.edaszek.pl/pl/p/BMI-BRAAS-Celtycka-Lumino-gasior/1747', date: null, note: bi('20,66 zł/szt., sprzedaż detaliczna; 2,5 szt./mb. Klamra liczona osobno.', 'PLN 20.66 each, retail; 2.5 pieces/m. Clips priced separately.') },
  { id: 'shingle', title: 'Gonty-24 · IKO Superglass', url: 'https://gonty-24.pl/pl/c/Gont-bitumiczny/18', date: null, note: bi('Superglass 3 TAB: cena odniesienia 49,90 zł brutto/m². Przeliczenie paczki według aktualnej generacji 2.0 (2 m²); wersję dostawy trzeba potwierdzić.', 'Superglass 3 TAB: reference PLN 49.90 gross/m². Bundles use current generation 2.0 coverage (2 m²); confirm the supplied generation.') },
  { id: 'batten', title: 'Drewkan · łata 40 × 60', url: 'https://drewkan.pl/szorstkie/170-azalia.html', date: null, note: bi('4,50 zł brutto/mb; długość handlowa 4 m, impregnacja. Inne długości są scenariuszem użytkownika w tej samej stawce mb.', 'PLN 4.50 gross/m; 4 m stock length, treated. Other lengths are user scenarios at the same linear rate.') },
  { id: 'counter', title: 'Drewkan · kontrłata 25 × 50', url: 'https://drewkan.pl/szorstkie/171-azalia.html', date: null, note: bi('2,70 zł brutto/mb; długość handlowa 4 m.', 'PLN 2.70 gross/m; 4 m stock length.') },
  { id: 'membrane', title: 'Dachowe-Okna · Corotop Red Strong', url: 'https://dachowe-okna.pl/akcesoria-dachowe/mambrana-dachowa/corotop/membrana-dachowa-corotop-red-strong/', date: null, note: bi('475 zł/rolka bez pasków; 536 zł z paskami. 1,5 × 50 m. Model podstawowy bez pasków, taśma złączy osobno.', 'PLN 475/roll without adhesive strips; PLN 536 with strips. 1.5 × 50 m. Base model has no strips; joint tape is separate.') },
  { id: 'membrane-premium', title: 'MegaBlach · Corotop PURE 205', url: 'https://megablach.pl/membrany-dachowe-c-454_518.html', date: null, note: bi('Odczyt indeksu oferty: 627,67 zł brutto/rolka 75 m². Dostępność wymaga potwierdzenia.', 'Indexed listing: PLN 627.67 gross/75 m² roll. Availability requires confirmation.') },
  { id: 'underlay', title: 'ICMarket · IKO Armourbase Pro Plus', url: 'https://pokrycia-dachowe-sklep.pl/iko-armourbase-pro-undercoating-felt-en.html', date: null, note: bi('Indeksowane ceny netto 17,41–18,91 zł/m², rolka 30 m². Strona oznacza cenę na zapytanie; budżet odniesienia, dostępność do potwierdzenia.', 'Indexed net prices PLN 17.41–18.91/m², 30 m² roll. Page marks price on request; budget reference, availability to confirm.') },
  { id: 'osb', title: 'Castorama · OSB 3 Kronobuild 18 mm', url: 'https://www.castorama.pl/plyta-osb-3-kronobuild-18-x-1250-x-2500-mm/5902115300158_CAPL.prd', date: null, note: bi('104 zł brutto/płyta 1250 × 2500 mm = 3,125 m². 18 mm to parametr przedmiaru, nie dobór statyczny.', 'PLN 104 gross/1250 × 2500 mm board = 3.125 m². 18 mm is a takeoff parameter, not a structural specification.') },
  { id: 'wool', title: 'Leroy Merlin · URSA Home 37 150 mm', url: 'https://www.leroymerlin.pl/produkty/welna-mineralna-szklana-home-37-150-mm-ursa-45428005.html', date: null, note: bi('104,79 zł brutto/opak. 4,56 m². Jedna warstwa 150 mm; nie kompletny pakiet wykończenia poddasza.', 'PLN 104.79 gross/4.56 m² pack. One 150 mm layer; not a complete attic lining package.') },
  { id: 'fasteners', title: 'i-Śruby · Etanco 4,8 × 35', url: 'https://www.i-sruby.pl/p/238/628/wkrety-farmerskie-4-8x35-op-250szt-ral-7016-4-8x35-farmerskie-do-drewna-wkrety.html', date: null, note: bi('39 zł brutto/opak. 250 szt. Ilość przyjęta do budżetu: 8 szt./m²; strefy brzegowe wymagają projektu mocowań.', 'PLN 39 gross/250 pieces. Budget allowance: 8/m²; edge zones require a fastening design.') },
  { id: 'clips', title: 'Folnet · spinki do dachówek', url: 'https://folnet.pl/pl/products/akcesoria-dachowe/mocowanie-elementow-pokrycia/spinki-do-dachowek/spinka-uniwersalna-do-dachowek-typ-r-3832.html', date: null, note: bi('27,90 zł brutto/100 szt. Budżet 1 spinki/dachówkę. Typ spinki i strefy mocowania do zatwierdzenia.', 'PLN 27.90 gross/100 clips. Budget: one clip/tile. Clip type and fixing zones require approval.') },
  { id: 'flashing', title: 'Folnet · pas nadrynnowy 2 m', url: 'https://folnet.pl/pl/products/akcesoria-dachowe/okap/pasy-okapowe/pas-okapowy-nadrynnowy-2mb-6712.html', date: null, note: bi('37,50 zł brutto/szt. 2 m. Model przyjmuje zakład 100 mm.', 'PLN 37.50 gross/2 m piece. The model assumes 100 mm overlaps.') },
  { id: 'valley', title: 'Folnet · kosz podłużny 2 m', url: 'https://folnet.pl/pl/products/akcesoria-dachowe/kosz-dachowy/kosze-dachowe/kosz-dachowy-tloczony-podluznie-2mb-5805.html', date: null, note: bi('77,50 zł brutto/szt. 2 m. Zakład budżetowy 200 mm.', 'PLN 77.50 gross/2 m piece. Budget overlap: 200 mm.') },
  { id: 'ridge-tape', title: 'Bmax · Corotop Airvent 310', url: 'https://bmax.pl/pl/products/tasma-kalenicowa-pod-gasior-corotop-airvent-310-antracyt-12956.html', date: null, note: bi('27 zł brutto/rolka 310 mm × 5 m. Dobór szerokości i powierzchni wentylacji wymaga sprawdzenia.', 'PLN 27 gross/310 mm × 5 m roll. Width and ventilation capacity require checking.') },
  { id: 'seal', title: 'ICMarket · Coroband / Coroblei', url: 'https://icmarket.pl/pl/corotop.html', date: null, note: bi('Coroband: 56,03 zł brutto/25 m; Coroblei B: 266,76 zł brutto/5 m. Indeks ofert, dostępność do potwierdzenia.', 'Coroband: PLN 56.03 gross/25 m; Coroblei B: PLN 266.76 gross/5 m. Indexed listings; confirm availability.') },
  { id: 'window', title: 'Bricoman · Optilight B 78 × 118', url: 'https://www.bricoman.pl/okno-dachowe-optilight-b-78x118-cm-167083.html', date: null, note: bi('830 zł brutto/szt. Kołnierz TZ/TS 215,81 zł: oknadachowe.info.pl. Dobór do profilu i rąbka wymaga potwierdzenia; obróbka wnętrza nie jest wliczona.', 'PLN 830 gross/window. TZ/TS flashing PLN 215.81: oknadachowe.info.pl. Confirm the collar for profile/seam; interior finishing excluded.') },
  { id: 'window-collar', title: 'OknaDachowe · kołnierz Optilight', url: 'https://oknadachowe.info.pl/okno-dachowe-optilight-b-78x118', date: null, note: observed },
  { id: 'wood', title: 'Drew-Cal · drewno konstrukcyjne', url: 'https://drewcal.pl/drewno-konstrukcyjne/', date: null, note: bi('C24: 2350 zł brutto/m³ dla wskazanych przekrojów. W modelu stawka referencyjna dla uproszczonego przedmiaru; inne przekroje i konstrukcja wymagają oferty.', 'C24: PLN 2350 gross/m³ for listed sections. Reference rate for a simplified takeoff; other sections and the actual structure require a quote.') },
  { id: 'labor-kb', title: 'KB.pl · pokrycia dachowe 2026', url: 'https://kb.pl/cenniki/uslugi/pokrycia-dachowe/', date: '2026-01-07', note: bi('Robocizna na dachu dwuspadowym bez lukarn, z 8% VAT. Normalizacja ÷1,08. Krycie: metal 75–145, rąbek 70–110, ceramika 85–160, beton 80–150, gont 50–90 zł/m². Membrana osobno 20–40 zł/m².', 'Labor on a gable roof without dormers, including 8% VAT. Normalize ÷1.08. Covering: metal 75–145, seam 70–110, clay 85–160, concrete 80–150, shingle 50–90 PLN/m². Membrane separately: 20–40 PLN/m².') },
  { id: 'labor-trade', title: 'Dekarz & Cieśla · cennik 2026', url: 'https://fachowydekarz.pl/cennik-uslug-dekarskich/', date: '2026-04', note: bi('Osobne czynności: łaty 22–28/m², obróbki 30–60/mb, rynny/rury 29–32/mb, okno 900–1900/szt. Źródło nie określa VAT: w budżecie traktowane jako netto, jawne założenie do weryfikacji.', 'Separate tasks: battens 22–28/m², flashings 30–60/m, gutters/pipes 29–32/m, windows 900–1900 each. Source does not specify VAT: treated as net in this budget, an explicit assumption to verify.') },
  { id: 'demolition', title: 'KB.pl · demontaż pokryć', url: 'https://kb.pl/cenniki/miejskie/dachy/krakow/', date: '2026-04-29', note: bi('Stawka referencyjna netto: demontaż blachy 22,10 zł/m². To punkt odniesienia z Krakowa, bez mnożników regionalnych i bez utylizacji.', 'Net reference: metal removal PLN 22.10/m². A Kraków reference point, without region multipliers or waste disposal.') },
  { id: 'vat', title: 'VAT · art. 41 ust. 12–12c', url: 'https://poradnikprzedsiebiorcy.pl/-kiedy-mozna-zastosowac-stawke-8-dla-uslug-budowlanych', date: '2026-02-11', note: bi('23% standardowo. 8% tylko po potwierdzeniu kwalifikowanej usługi mieszkaniowej; proporcja limitu 300 m² domu / 150 m² lokalu.', '23% by default. 8% only for confirmed eligible residential service; proportional limits of 300 m² house / 150 m² apartment.') },
  { id: 'nails', title: 'Armet · gwoździe papowe ocynk', url: 'https://e-armet.pl/pl/c/Gwozdzie-papowe/215', date: null, note: bi('55 zł brutto/opak. 5 kg, 3 × 30 mm. Budżet 5 kg/80 m²; rzeczywisty typ i zużycie mocowań według instrukcji gontu.', 'PLN 55 gross/5 kg pack, 3 × 30 mm. Budget: 5 kg/80 m²; confirm nail type and consumption in the shingle instructions.') },
  { id: 'counter-seal', title: 'Folnet · Corotop Pur', url: 'https://folnet.pl/pl/products/membrany-dachowe/dodatki-do-folii-i-membran/tasmy-uszczelniajace/corotop-pur-tasma-pod-kontrlaty-9151.html', date: null, note: bi('30,90 zł brutto/rolka 40 mm × 30 m, uszczelnienie przebicia pod kontrłatami.', 'PLN 30.90 gross/40 mm × 30 m roll, nail-penetration sealing under counter-battens.') },
];

export interface PriceRecord {
  materialId: string;
  name: Bilingual;
  category: Category;
  unit: Unit;
  unitPricePLN: number;
  minimumPricePLN: number;
  maximumPricePLN: number;
  sourceURL: string;
  sourceDate: string | null;
  sourceId: string;
  vatTreatment: 'net' | 'gross23' | 'gross8' | 'unspecified';
  productSpecifications: string;
  wasteFactor: number;
  effectiveCoverage: number;
  priceBasis?: 'physical' | 'effective';
}
function price(id: string, name: Bilingual, category: Category, unit: Unit, value: number, sourceId: string,
  vatTreatment: PriceRecord['vatTreatment'] = 'gross23', specs = '', coverage = 1, range: [number, number] = [value, value], basis?: PriceRecord['priceBasis']): PriceRecord {
  const source = sources.find(s => s.id === sourceId)!;
  return { materialId: id, name, category, unit, unitPricePLN: value, minimumPricePLN: range[0], maximumPricePLN: range[1],
    sourceURL: source.url, sourceDate: source.date, sourceId, vatTreatment, productSpecifications: specs, wasteFactor: 0, effectiveCoverage: coverage, priceBasis: basis };
}
const ruukki = (id: string, pl: string, en: string, cat: Category, unit: Unit, value: number, specs = '', coverage = 1) => price(id, bi(pl, en), cat, unit, value, 'ruukki', 'net', specs, coverage);
export const prices: Record<string, PriceRecord> = Object.fromEntries([
  price('venecja', bi('Venecja D-MATT · arkusze', 'Venecja D-MATT · sheets'), 'covering', 'piece', 44.06, 'venecja-shop', 'gross23', '1.15 × 0.70 m', .805, [44.06, 64.80]),
  price('t18', bi('Pruszyński T18 · powierzchnia całkowita', 'Pruszyński T18 · physical area'), 'covering', 'm2', 42.99, 't18', 'gross23', '1173 / 1128 mm', 1, undefined, 'physical'),
  price('classic-design', bi('Classic Design C · krycie efektywne', 'Classic Design C · effective coverage'), 'covering', 'm2', 83.11, 'ruukki', 'net', '512 / 475 mm', 1, undefined, 'effective'),
  price('titania', bi('TITANIA · dachówki połaciowe', 'TITANIA · field tiles'), 'covering', 'piece', 9.07, 'swissporton', 'net', '262 × 400 mm; 4 / 192', .1048, [9.07, 12.4 / 1.23]),
  price('celtycka', bi('Celtycka Lumino · dachówki połaciowe', 'Celtycka Lumino · field tiles'), 'covering', 'piece', 3.92, 'concrete', 'gross23', '300 × 333 mm', .0999, [3.92, 5.87]),
  price('superglass', bi('Superglass 2.0 · paczki', 'Superglass 2.0 · bundles'), 'covering', 'pack', 49.9 * 2, 'shingle', 'gross23', '14 / 2 m²', 2),
  price('batten', bi('Łaty impregnowane 40 × 60 mm', 'Treated battens 40 × 60 mm'), 'timber', 'm', 4.5, 'batten'),
  price('counter', bi('Kontrłaty impregnowane 25 × 50 mm', 'Treated counter-battens 25 × 50 mm'), 'timber', 'm', 2.7, 'counter'),
  price('membrane-red', bi('Corotop Red Strong 180 · rolki', 'Corotop Red Strong 180 · rolls'), 'underlay', 'roll', 475, 'membrane', 'gross23', '1.5 × 50 m', 75),
  price('membrane-pure', bi('Corotop PURE 205 · rolki', 'Corotop PURE 205 · rolls'), 'underlay', 'roll', 627.67, 'membrane-premium', 'gross23', '1.5 × 50 m', 75),
  price('bitumen-underlay', bi('IKO Armourbase Pro Plus · rolki', 'IKO Armourbase Pro Plus · rolls'), 'underlay', 'roll', 17.41 * 30, 'underlay', 'net', '1 × 30 m', 30, [17.41 * 30, 18.91 * 30]),
  price('osb', bi('OSB 3 · 18 mm · płyty 1250 × 2500', 'OSB 3 · 18 mm · 1250 × 2500 boards'), 'underlay', 'piece', 104, 'osb', 'gross23', '3.125 m²', 3.125),
  price('wool', bi('URSA Home 37 · wełna 150 mm', 'URSA Home 37 · 150 mm insulation'), 'extras', 'pack', 104.79, 'wool', 'gross23', '4.56 m²', 4.56),
  price('screws', bi('Wkręty Etanco EPDM · 250 szt.', 'Etanco EPDM screws · 250 pcs'), 'accessories', 'pack', 39, 'fasteners', 'gross23', '250', 250),
  ruukki('seam-screws', 'Wkręty nierdzewne 4,2 × 25 · 250 szt.', 'Stainless screws 4.2 × 25 · 250 pcs', 'accessories', 'pack', 104.35, '250', 250),
  price('tile-clips', bi('Spinki dachówek · 100 szt.', 'Tile clips · 100 pcs'), 'accessories', 'pack', 27.90, 'clips', 'gross23', '100', 100),
  price('metal-ridge', bi('Gąsior GS-LUX · 1,145 m krycia', 'GS-LUX ridge · 1.145 m coverage'), 'accessories', 'piece', 75.39, 'budmat', 'net', '1.205 / 1.145 m', 1.145),
  ruukki('seam-ridge', 'Gąsior prosty RA1AR · 2 m', 'RA1AR flat ridge · 2 m', 'accessories', 'piece', 84.17, '2 m; 0.1 m lap', 1.9),
  price('clay-ridge', bi('TITANIA PT z klamrą', 'TITANIA PT with clip'), 'accessories', 'piece', 56.4, 'swissporton', 'net', '2.5 / m', .4),
  price('clay-ridge-end', bi('Zaślepka ceramiczna PT', 'PT ceramic ridge end'), 'accessories', 'piece', 196, 'swissporton', 'net'),
  price('clay-ridge-junction', bi('Trójnik ceramiczny PT', 'PT ceramic three-way ridge'), 'accessories', 'piece', 342, 'swissporton', 'net'),
  price('concrete-ridge', bi('Gąsior Celtycka Lumino', 'Celtycka Lumino ridge tile'), 'accessories', 'piece', 20.66, 'concrete-ridge', 'gross23', '2.5 / m', .4),
  ruukki('ridge-vent', 'Listwa podgąsiorowa RA1AH · 3 m', 'RA1AH ventilated ridge support · 3 m', 'accessories', 'piece', 76.80, '3 m', 3),
  price('ridge-tape', bi('Taśma kalenicowa · 5 m', 'Ventilated ridge tape · 5 m'), 'accessories', 'roll', 27, 'ridge-tape', 'gross23', '310 mm × 5 m', 4.9),
  price('eave-flashing', bi('Pas nadrynnowy · 2 m', 'Eaves flashing · 2 m'), 'drainage', 'piece', 37.5, 'flashing', 'gross23', '2 m', 1.9),
  ruukki('seam-eave', 'Pas nadrynnowy RA1AE · 2 m', 'RA1AE standing-seam eaves flashing · 2 m', 'drainage', 'piece', 53.60, '2 m', 1.9),
  ruukki('seam-barge', 'Wiatrownica rąbka RA1AG · 2 m', 'RA1AG standing-seam verge · 2 m', 'drainage', 'piece', 63.73, '2 m', 1.9),
  ruukki('seam-valley', 'Rynna koszowa rąbka RA1DV · 2 m', 'RA1DV standing-seam valley · 2 m', 'drainage', 'piece', 95.46, '2 m', 1.8),
  price('barge', bi('Wiatrownica WZ 224 · 1,2 m', 'WZ 224 verge flashing · 1.2 m'), 'drainage', 'piece', 31.86, 'budmat', 'net', '1.2 m; 0.1 m lap', 1.1),
  price('valley', bi('Kosz dachowy · 2 m', 'Valley flashing · 2 m'), 'drainage', 'piece', 77.50, 'valley', 'gross23', '2 m; 0.2 m lap', 1.8),
  price('sealing-tape', bi('Coroband · taśma złączy 25 m', 'Coroband · 25 m joint tape'), 'underlay', 'roll', 56.03, 'seal', 'gross23', '25 m', 25),
  price('counter-seal', bi('Corotop Pur · uszczelnienie kontrłat', 'Corotop Pur · counter-batten sealing'), 'underlay', 'roll', 30.90, 'counter-seal', 'gross23', '40 mm × 30 m', 30),
  price('shingle-nails', bi('Gwoździe papowe ocynkowane · 5 kg', 'Galvanized roofing nails · 5 kg'), 'accessories', 'pack', 55, 'nails', 'gross23', '5 kg', 5),
  price('chimney-flashing', bi('Coroblei B · taśma kominowa 5 m', 'Coroblei B · 5 m chimney flashing'), 'accessories', 'roll', 266.76, 'seal', 'gross23', '300 mm × 5 m', 5),
  ruukki('acoustic-tape', 'Taśma akustyczna RA3ASIB · rolka 20 m', 'RA3ASIB acoustic tape · 20 m roll', 'underlay', 'roll', 3.9 * 20, '20 m', 20),
  ruukki('gutter', 'Siba Round · rynna 125 mm · 4 m', 'Siba Round · 125 mm gutter · 4 m', 'drainage', 'piece', 127, '4 m', 4),
  ruukki('gutter-hook', 'Siba Round · hak DDC H', 'Siba Round · DDC H bracket', 'drainage', 'piece', 15.5),
  ruukki('gutter-joint', 'Siba Round · łącznik z klamrą', 'Siba Round · clip connector', 'drainage', 'piece', 25),
  ruukki('gutter-end', 'Siba Round · zaślepka', 'Siba Round · end cap', 'drainage', 'piece', 18),
  ruukki('gutter-corner', 'Siba Round · narożnik 90°', 'Siba Round · 90° corner', 'drainage', 'piece', 101),
  ruukki('downpipe', 'Siba Round · rura 90 mm · 3 m', 'Siba Round · 90 mm downpipe · 3 m', 'drainage', 'piece', 133, '3 m', 3),
  ruukki('outlet', 'Siba Round · sztucer 125/90', 'Siba Round · 125/90 outlet', 'drainage', 'piece', 48),
  ruukki('elbow', 'Siba Round · kolano / wylewka 90', 'Siba Round · 90 mm bend / shoe', 'drainage', 'piece', 45),
  ruukki('pipe-clamp', 'Siba Round · uchwyt rury z trzpieniem', 'Siba Round · pipe clamp with stud', 'drainage', 'piece', 16.5 + 13.5),
  price('window', bi('Okno Optilight B · 78 × 118 cm', 'Optilight B roof window · 78 × 118 cm'), 'extras', 'piece', 830, 'window'),
  price('window-collar', bi('Kołnierz okna TZ/TS · budżet odniesienia', 'TZ/TS window flashing · reference allowance'), 'extras', 'piece', 215.81, 'window-collar'),
  price('snow-stop', bi('Śniegołap Budmat · D-MATT', 'Budmat snow stop · D-MATT'), 'extras', 'piece', 8.1, 'budmat', 'net'),
  price('structural-wood', bi('Drewno konstrukcji · przedmiar uproszczony', 'Structural timber · simplified takeoff'), 'structure', 'm3', 2350, 'wood'),
  ...(['metal', 'seam', 'ceramic', 'concrete', 'shingle'] as const).map((id, i) => {
    const ranges: [number, number][] = [[75, 145], [70, 110], [85, 160], [80, 150], [50, 90]];
    const [lo, hi] = ranges[i];
    return price(`labor-${id}`, bi('Montaż pokrycia · bez warstw podkładowych', 'Covering installation · underlay excluded'), 'labor', 'm2', (lo + hi) / 2, 'labor-kb', 'gross8', '', 1, [lo, hi]);
  }),
  price('labor-trapezoid', bi('Montaż blachy trapezowej', 'Trapezoidal sheet installation'), 'labor', 'm2', 44.5, 'labor-trade', 'unspecified', '', 1, [40, 49]),
  price('labor-underlay', bi('Montaż warstwy wstępnego krycia i kontrłat', 'Underlay and counter-batten installation'), 'labor', 'm2', 30, 'labor-kb', 'gross8', '', 1, [20, 40]),
  price('labor-battens', bi('Montaż łat', 'Batten installation'), 'labor', 'm2', 25, 'labor-trade', 'unspecified', '', 1, [22, 28]),
  price('labor-osb', bi('Montaż płyt poszycia', 'Deck board installation'), 'labor', 'm2', 15, 'labor-trade', 'unspecified'),
  price('labor-flashing', bi('Montaż obróbek · okapy, szczyty, kosze', 'Flashing installation · eaves, verges, valleys'), 'labor', 'm', 45, 'labor-trade', 'unspecified', '', 1, [30, 60]),
  price('labor-ridge', bi('Montaż gąsiorów poziomych', 'Horizontal ridge installation'), 'labor', 'm', 24.5, 'labor-trade', 'unspecified', '', 1, [22, 27]),
  price('labor-hip', bi('Montaż gąsiorów skośnych', 'Hip ridge installation'), 'labor', 'm', 29, 'labor-trade', 'unspecified', '', 1, [25, 33]),
  price('labor-gutters', bi('Montaż rynien i rur spustowych', 'Gutter and downpipe installation'), 'labor', 'm', 30.5, 'labor-trade', 'unspecified', '', 1, [29, 32]),
  price('labor-window', bi('Montaż okien dachowych', 'Roof window installation'), 'labor', 'piece', 1400, 'labor-trade', 'unspecified', '', 1, [900, 1900]),
  price('labor-chimney', bi('Obróbka komina · obwód do 3 m', 'Chimney flashing · perimeter up to 3 m'), 'labor', 'piece', 350, 'labor-trade', 'unspecified', '', 1, [200, 500]),
  price('labor-wool', bi('Montaż wełny', 'Insulation installation'), 'labor', 'm2', 50, 'labor-trade', 'unspecified'),
  price('labor-structure', bi('Montaż konstrukcji · stawka orientacyjna', 'Frame assembly · indicative rate'), 'labor', 'm2', 80, 'labor-trade', 'unspecified', '', 1, [60, 100]),
  price('demolition-metal', bi('Demontaż blachy · bez utylizacji', 'Metal roof removal · disposal excluded'), 'demolition', 'm2', 22.1, 'demolition', 'net'),
  price('demolition-felt', bi('Zerwanie starej papy', 'Old roofing felt removal'), 'demolition', 'm2', 18, 'labor-trade', 'unspecified', '', 1, [16, 20]),
  price('disposal', bi('Utylizacja papy · objętość użytkownika', 'Felt disposal · user-entered volume'), 'demolition', 'm3', 600, 'labor-trade', 'unspecified'),
].map(p => [p.materialId, p]));

export function netPrice(p: PriceRecord, value = p.unitPricePLN) {
  return value / (p.vatTreatment === 'gross23' ? 1.23 : p.vatTreatment === 'gross8' ? 1.08 : 1);
}
