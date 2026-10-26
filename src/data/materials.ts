import { bi, type Bilingual } from '@/i18n/types';
import type { LayerId, RoofColor, SystemId } from '@/configurator/model';

export interface RoofProduct {
  id: string;
  system: SystemId;
  name: string;
  description: Bilingual;
  kind: 'module' | 'sheet' | 'tile' | 'shingle';
  effectiveWidth: number;
  physicalWidth: number;
  effectiveLength: number;
  physicalLength: number;
  maxLength: number;
  minLength: number;
  endLap: number;
  packageSize: number;
  palletSize?: number;
  packageCoverage?: number;
  battenSpacing: number;
  minBattenSpacing: number;
  maxBattenSpacing: number;
  minimumPitch: number;
  standardPitch: number;
  weightKgM2: number;
  specificationURL: string;
  maintenance: Bilingual;
  requirements: Bilingual;
}

export const systemNames: Record<SystemId, Bilingual> = {
  metal: bi('Blachodachówka', 'Metal roof tiles'), trapezoid: bi('Blacha trapezowa', 'Trapezoidal metal'),
  seam: bi('Blacha na rąbek', 'Standing seam'), ceramic: bi('Dachówka ceramiczna', 'Clay roof tiles'),
  concrete: bi('Dachówka betonowa', 'Concrete roof tiles'), shingle: bi('Gont bitumiczny', 'Bitumen shingles'),
};

export const products: RoofProduct[] = [
  {
    id: 'venecja', system: 'metal', name: 'Budmat Venecja · D-MATT PLUS', kind: 'module',
    description: bi('Klasyczny rytm dachówki w lekkiej, stalowej formie. Dwa moduły w jednym arkuszu ułatwiają planowanie zamówienia.', 'A classic tile rhythm in lightweight steel. Two modules per sheet make purchasing straightforward.'),
    effectiveWidth: 1.15, physicalWidth: 1.19, effectiveLength: .7, physicalLength: .736, maxLength: .736, minLength: .736, endLap: .036,
    packageSize: 1, palletSize: 350, battenSpacing: .35, minBattenSpacing: .35, maxBattenSpacing: .35, minimumPitch: 9, standardPitch: 14, weightKgM2: 3.7 / .805,
    specificationURL: 'https://www.budmat.com/pl/produkt/venecja-pierwsza-w-rodzinie-133',
    maintenance: bi('Kontrola powłoki, ciętych krawędzi i mocowań. Delikatne czyszczenie zgodnie z instrukcją.', 'Check coatings, cut edges and fixings. Clean gently in accordance with the manual.'),
    requirements: bi('Stały moduł łat 350 mm. Producent dopuszcza 9°; przy małych spadkach wymagany indywidualny dobór warstwy wstępnego krycia.', 'Fixed 350 mm batten module. The manufacturer permits 9°; low pitches require a specifically designed underlay.'),
  },
  {
    id: 't18', system: 'trapezoid', name: 'Pruszyński T18 · PS 0,5 mm', kind: 'sheet',
    description: bi('Szczera, wyrazista geometria. Blacha cięta do długości połaci, z wyceną od całkowitej powierzchni arkuszy.', 'Honest, expressive geometry. Sheets cut to slope length and priced by their physical area.'),
    effectiveWidth: 1.128, physicalWidth: 1.173, effectiveLength: 0, physicalLength: 0, maxLength: 6, minLength: .5, endLap: .2,
    packageSize: 1, battenSpacing: .5, minBattenSpacing: .25, maxBattenSpacing: .6, minimumPitch: 9, standardPitch: 14, weightKgM2: 5,
    specificationURL: 'https://pruszynski.com.pl/warto-wiedziec/cena-blachy-trapezowej-za-m2/',
    maintenance: bi('Kontrola wkrętów z EPDM, powłoki i miejsc odprowadzenia wody.', 'Inspect EPDM fasteners, the coating and water drainage.'),
    requirements: bi('Rozstaw podpór 500 mm jest założeniem przedmiaru, nie doborem nośności. Długość transportowa 6 m; zakład poprzeczny 200 mm do potwierdzenia przez producenta.', '500 mm support spacing is a takeoff assumption, not a load-bearing design. 6 m handling length; 200 mm end laps require manufacturer confirmation.'),
  },
  {
    id: 'classic-design', system: 'seam', name: 'Ruukki Classic Design C · 475', kind: 'sheet',
    description: bi('Spokojna płaszczyzna. Precyzyjna linia rąbka. Nowoczesny panel zatrzaskowy, który podkreśla proporcje architektury.', 'A quiet surface. A precise seam. A contemporary click-fit panel that brings architectural proportions into focus.'),
    effectiveWidth: .475, physicalWidth: .512, effectiveLength: 0, physicalLength: 0, maxLength: 10, minLength: .8, endLap: .2,
    packageSize: 1, battenSpacing: .25, minBattenSpacing: .2, maxBattenSpacing: .25, minimumPitch: 8, standardPitch: 8, weightKgM2: 5.2,
    specificationURL: 'https://www.ruukki.com/roofing/products/roofing-sheets/roofing-sheets-detail/ruukki-classic-design-c',
    maintenance: bi('Okresowe mycie i kontrola złączy. Naturalne falowanie płaskiej blachy nie jest odwzorowane w kosztorysie.', 'Periodic washing and joint inspection. Natural sheet waviness is not modeled in the estimate.'),
    requirements: bi('Łaty co 250 mm według broszury Classic Design. Dodatkowa taśma akustyczna. Łączenie paneli po długości wymaga co najmniej 14°.', 'Battens at 250 mm per the Classic Design brochure, plus acoustic tape. End-to-end panel joints require at least 14°.'),
  },
  {
    id: 'titania', system: 'ceramic', name: 'swissporTON TITANIA · czarna glazura', kind: 'tile',
    description: bi('Ceramika o wyraźnym profilu i głębi koloru. Duży format i przesuwne zamki umożliwiają precyzyjne rozmierzenie połaci.', 'Profiled clay with depth and character. A large format and adjustable interlocks allow precise roof setting-out.'),
    effectiveWidth: .262, physicalWidth: .324, effectiveLength: .4, physicalLength: .514, maxLength: .514, minLength: .514, endLap: .114,
    packageSize: 4, palletSize: 192, battenSpacing: .4, minBattenSpacing: .38, maxBattenSpacing: .42, minimumPitch: 10, standardPitch: 22, weightKgM2: 44.7,
    specificationURL: 'https://www.swissporton.pl/produkty/titania',
    maintenance: bi('Przegląd dachówek, mocowań i wentylacji. Uszkodzone elementy wymienia się pojedynczo.', 'Inspect tiles, fixings and ventilation. Damaged elements can be replaced individually.'),
    requirements: bi('Aktualna karta: 380–420 mm między łatami; 9,1–10,1 szt./m². W modelu zużycie wynika z szerokości krycia i wybranego rozstawu. Niższy spadek wymaga dodatkowego zabezpieczenia.', 'Current datasheet: 380–420 mm gauge; 9.1–10.1 tiles/m². Consumption follows effective width and selected gauge. Lower pitches need additional waterproofing.'),
  },
  {
    id: 'celtycka', system: 'concrete', name: 'BMI Braas Celtycka · Lumino', kind: 'tile',
    description: bi('Klasyczna fala w betonie. Wyrazista, regularna powierzchnia i modularne elementy kalenicy.', 'A classic concrete wave. A regular, expressive surface with modular ridge components.'),
    effectiveWidth: .3, physicalWidth: .33, effectiveLength: .333, physicalLength: .42, maxLength: .42, minLength: .42, endLap: .087,
    packageSize: 1, palletSize: 240, battenSpacing: .333, minBattenSpacing: .312, maxBattenSpacing: .345, minimumPitch: 10, standardPitch: 22, weightKgM2: 43,
    specificationURL: 'https://dachygt.pl/dachowka-celtycka-braas',
    maintenance: bi('Przegląd połaci, klamer, gąsiorów i orynnowania. Czyszczenie dobierane do powłoki.', 'Check the roof, clips, ridge tiles and gutters. Choose cleaning methods appropriate to the coating.'),
    requirements: bi('312–345 mm między łatami; 9,7–10,7 szt./m². Znaczna masa pokrycia wymaga sprawdzenia istniejącej konstrukcji.', '312–345 mm gauge; 9.7–10.7 tiles/m². The weight requires assessment of the existing supporting structure.'),
  },
  {
    id: 'superglass', system: 'shingle', name: 'IKO Superglass · 2.0', kind: 'shingle',
    description: bi('Drobna, mineralna faktura i spokojny rysunek. Gont pracuje na ciągłym, sztywnym poszyciu z właściwym podkładem bitumicznym.', 'A fine mineral texture and quiet pattern. Shingles sit on continuous rigid decking with a suitable bituminous underlay.'),
    effectiveWidth: 1, physicalWidth: 1, effectiveLength: 1 / 7, physicalLength: .336, maxLength: .336, minLength: .336, endLap: .193,
    packageSize: 1, packageCoverage: 2, palletSize: 87, battenSpacing: 0, minBattenSpacing: 0, maxBattenSpacing: 0, minimumPitch: 15, standardPitch: 21, weightKgM2: 8.3,
    specificationURL: 'https://www.iko.eu/en/products/shingles/superglass',
    maintenance: bi('Kontrola uszczelnień, posypki i wentylacji. Podkład i poszycie są częścią zestawienia.', 'Inspect seals, granules and ventilation. Underlay and decking are included in the takeoff.'),
    requirements: bi('Generacja 2.0: 14 pasów / 2 m² w paczce. OSB i podkład obowiązkowe. Poniżej 21° model przyjmuje zakład podkładu 550 mm (podwójne krycie).', 'Generation 2.0: 14 shingles / 2 m² per bundle. Decking and underlay are mandatory. Below 21°, the model uses a 550 mm underlay overlap (double coverage).'),
  },
];
export const productById = (id: string) => products.find(p => p.id === id);
export const productName = (p: RoofProduct, locale: 'pl' | 'en') => locale === 'en' ? p.name.replace('czarna glazura', 'black glaze').replace('0,5', '0.5') : p.name;

export const colors: { id: RoofColor; hex: string; name: Bilingual; ral: string }[] = [
  { id: 'anthracite', hex: '#343b3e', name: bi('Antracyt', 'Anthracite'), ral: 'RAL 7016' },
  { id: 'black', hex: '#1e2223', name: bi('Czarny', 'Black'), ral: 'RAL 9005' },
  { id: 'terracotta', hex: '#974e37', name: bi('Ceglasty', 'Tile red'), ral: 'RAL 8004' },
  { id: 'brown', hex: '#594039', name: bi('Brązowy', 'Brown'), ral: 'RAL 8017' },
  { id: 'graphite', hex: '#53575b', name: bi('Grafitowy', 'Graphite'), ral: 'RAL 7024' },
  { id: 'silver', hex: '#919794', name: bi('Srebrnoszary', 'Silver grey'), ral: 'RAL 9006' },
];

export const layerInfo: Record<LayerId, { title: Bilingual; purpose: Bilingual; color: string }> = {
  covering: { title: bi('Pokrycie dachowe', 'Roof covering'), purpose: bi('Zewnętrzna warstwa chroni dach przed opadami i nadaje mu charakter. Ilość wynika z powierzchni połaci oraz rzeczywistego modułu krycia.', 'The outer layer sheds rain and defines the roof’s character. Its quantity follows the roof planes and actual effective module.'), color: '#414a49' },
  battens: { title: bi('Łaty', 'Battens'), purpose: bi('Poziome podparcie pokrycia. Każdy rząd jest przycinany do granic połaci; rozstaw zależy od wybranego systemu.', 'Horizontal covering supports. Every row is clipped to the roof plane boundaries; spacing follows the chosen system.'), color: '#c79b70' },
  counter: { title: bi('Kontrłaty', 'Counter-battens'), purpose: bi('Biegną wzdłuż spadku i tworzą przestrzeń wentylacyjną. Długość liczymy w osiach krokwi, na rzeczywistych połaciach.', 'Run up the slope and create a ventilation space. Length is measured along rafter positions on the actual planes.'), color: '#a78158' },
  membrane: { title: bi('Warstwa wstępnego krycia', 'Roof underlay'), purpose: bi('Dodatkowa ochrona przed wodą. Pasma, zakłady i odpady są liczone oddzielnie. Pod gontem stosujemy podkład bitumiczny.', 'Secondary water protection. Strips, overlaps and cutting waste are calculated separately. Shingles use bituminous underlay.'), color: '#ad6152' },
  sheathing: { title: bi('Sztywne poszycie', 'Rigid decking'), purpose: bi('Ciągłe podłoże z płyt. Obowiązkowe dla gontu; opcjonalne dla pozostałych systemów. Grubość wymaga sprawdzenia konstrukcyjnego.', 'A continuous board substrate. Mandatory for shingles; optional for other systems. Board thickness requires a structural check.'), color: '#bca77d' },
  structure: { title: bi('Konstrukcja wsporcza', 'Supporting structure'), purpose: bi('Uproszczony układ krokwi i belek. Przedmiar drewna, a nie obliczenia statyczne. Dobór przekrojów, wymianów i połączeń wymaga projektu.', 'A simplified rafter and beam layout. A timber takeoff, not structural analysis. Sections, trimmers and connections require engineering.'), color: '#9b714e' },
};
