import { defaultConfig, numericLimits, roofTypes, type RoofConfig } from '@/configurator/model';
import { colors, productById } from '@/data/materials';
import { bi, type Bilingual } from '@/i18n/types';

export type IssueCode = 'dimensions' | 'type' | 'product' | 'ridge' | 'wing' | 'pitch' | 'assembly' | 'gauge' | 'openings' | 'vat' | 'price' | 'bundle' | 'complex' | 'timber' | 'windowProfile' | 'sheetLap' | 'overlap' | 'shingle' | 'snow' | 'storage';
export interface Issue { code: IssueCode; severity: 'error' | 'warning'; field?: string }
export const issueMessages: Record<IssueCode, Bilingual> = {
  dimensions: bi('Wprowadź wymiary w podanym zakresie. Wszystkie wartości muszą być skończone, a liczby okien i kominów całkowite.', 'Enter dimensions within the stated range. All values must be finite; window and chimney counts must be whole numbers.'),
  type: bi('Wybierz obsługiwany typ dachu.', 'Choose a supported roof type.'),
  product: bi('Brakuje danych wybranego produktu. Wybierz system z biblioteki.', 'Selected product data is missing. Choose a system from the library.'),
  ridge: bi('Kalenica musi być krótsza od dłuższego boku dachu. Przywróć automatyczny wymiar lub skróć kalenicę.', 'The ridge must be shorter than the roof’s longer side. Restore the automatic dimension or shorten it.'),
  wing: bi('Skrzydło układu T musi być węższe od obu wymiarów głównej bryły (co najmniej 0,2 m różnicy).', 'The T-shaped wing must be narrower than both main building dimensions (at least 0.2 m difference).'),
  pitch: bi('Co najmniej jedna połać jest poniżej minimalnego spadku tego produktu lub przekracza zakres modelu. Zmień kąt albo system.', 'At least one plane is below this product’s minimum pitch or beyond the model range. Change the pitch or system.'),
  assembly: bi('Mały spadek wymaga dodatkowego, zaprojektowanego uszczelnienia podkładu. Ten dodatkowy system nie jest wyceniony; wynik jest częściowym budżetem.', 'Low pitch requires a specifically engineered waterproof underlay. That additional system is not priced; this is a partial budget.'),
  gauge: bi('Rozstaw łat jest niezgodny z parametrami produktu. Przywróć wartość systemową lub wybierz rozstaw z podanego zakresu.', 'The batten gauge is incompatible with the product. Restore its default or choose a value within its range.'),
  openings: bi('Nie wszystkie otwory mieszczą się na połaciach z wymaganym odstępem. Zmniejsz ich liczbę lub powiększ dach.', 'Not all openings fit within the planes with the required clearance. Reduce their number or enlarge the roof.'),
  vat: bi('Stawka mieszkaniowa wymaga potwierdzenia kwalifikacji i kompleksowej usługi z montażem. W innym przypadku wybierz 23%.', 'Residential VAT requires confirmed eligibility and a comprehensive installation service. Otherwise choose 23%.'),
  price: bi('Brakuje poprawnej ceny jednej z pozycji. Przywróć ceny źródłowe. Suma nie jest wyświetlana.', 'A line item price is missing or invalid. Restore source prices. The total is withheld.'),
  bundle: bi('Podaj własną stawkę netto za pakiet robocizny. Pakiet zastępuje wszystkie osobne czynności montażowe.', 'Enter your net bundled labor rate. The bundle replaces every separate installation task.'),
  complex: bi('Układ wielospadowy to dokładnie zdefiniowany dach T z jednym prostopadłym skrzydłem. Nie odwzorowuje dowolnego rzutu ani lukarn. Koszt montażu wymaga indywidualnej oferty.', 'The multi-pitch model is a defined T-roof with one perpendicular wing. It does not represent arbitrary plans or dormers. Installation requires an individual quote.'),
  timber: bi('Drewno: uproszczony przedmiar krokwi i belek, bez doboru nośności, łączników, płatwi i konstrukcji lukarn. Nie jest projektem konstrukcyjnym.', 'Timber: simplified rafter/beam takeoff, excluding structural sizing, connectors, purlins and dormer framing. Not a structural design.'),
  windowProfile: bi('Okna 78 × 118 cm: model uwzględnia otwory i budżet kołnierza. Dobór kołnierza do wysokości profilu/rąbka i wymiany krokwi wymagają potwierdzenia.', '78 × 118 cm windows: openings and a flashing allowance are included. Confirm the collar against profile/seam height and verify rafter trimmers.'),
  sheetLap: bi('Panele dłuższe od limitu transportowego wymagają połączeń poprzecznych. Dla rąbka ich spadek musi wynosić co najmniej 14°.', 'Panels beyond the handling limit need end joints. Standing-seam end joints require at least 14° pitch.'),
  overlap: bi('Przy nachyleniu poniżej 22° przyjmij zakład membrany co najmniej 200 mm i sprawdź instrukcję jej producenta.', 'Below 22°, use at least 200 mm membrane overlaps and check the manufacturer’s instructions.'),
  shingle: bi('Gont: pełne poszycie i podkład są wliczone. Wentylacja kalenicy nie jest wyceniona — wymaga indywidualnego rozwiązania. Potwierdź generację paczki 2.0 i detale przed zakupem.', 'Shingles: full decking and underlay are included. Ridge ventilation is not priced and needs a project-specific detail. Confirm generation 2.0 bundles and details before ordering.'),
  snow: bi('Śniegołapy w tym budżecie dotyczą blachodachówki Budmat. Wybierz ten system albo wyłącz śniegołapy.', 'These snow stops are budgeted for Budmat metal tiles. Select that system or disable snow stops.'),
  storage: bi('Zapisane lub udostępnione ustawienia były nieprawidłowe. Przywrócono bezpieczne wartości domyślne.', 'Saved or shared settings were invalid. Default values have been restored.'),
};

export function validateConfig(c: RoofConfig): Issue[] {
  const issues: Issue[] = [];
  for (const [key, [min, max]] of Object.entries(numericLimits)) {
    const value = c[key as keyof typeof numericLimits];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) issues.push({ code: 'dimensions', severity: 'error', field: key });
  }
  if (c.height - c.overhang * Math.tan(c.pitch * Math.PI / 180) < .5) issues.push({ code: 'dimensions', severity: 'error', field: 'overhang' });
  if (!Number.isInteger(c.windows) || !Number.isInteger(c.chimneys)) issues.push({ code: 'dimensions', severity: 'error' });
  if (!roofTypes.includes(c.type)) issues.push({ code: 'type', severity: 'error' });
  const product = productById(c.productId);
  if (!product) issues.push({ code: 'product', severity: 'error' });
  if (c.type === 'hip' && c.ridgeLength !== null && (!Number.isFinite(c.ridgeLength) || c.ridgeLength < 0 || c.ridgeLength >= Math.max(c.length, c.width) + 2 * c.overhang - .1)) issues.push({ code: 'ridge', severity: 'error' });
  if (c.type === 'multi') {
    if (c.wingWidth > Math.min(c.length, c.width) - .2) issues.push({ code: 'wing', severity: 'error' });
    issues.push({ code: 'complex', severity: 'warning' });
  }
  if (product && product.kind !== 'shingle' && c.battenSpacing !== null && (!Number.isFinite(c.battenSpacing) || c.battenSpacing < product.minBattenSpacing - 1e-8 || c.battenSpacing > product.maxBattenSpacing + 1e-8)) issues.push({ code: 'gauge', severity: 'error' });
  if (c.vatMode === 'residential' && (!c.vatEligible || !c.labor)) issues.push({ code: 'vat', severity: 'error' });
  if (c.labor && c.laborScope === 'bundled' && c.bundledLaborNet <= 0) issues.push({ code: 'bundle', severity: 'error' });
  if (c.snowGuards && product?.system !== 'metal') issues.push({ code: 'snow', severity: 'error' });
  if (c.structuralTimber) issues.push({ code: 'timber', severity: 'warning' });
  if (c.windows) issues.push({ code: 'windowProfile', severity: 'warning' });
  if (product?.kind === 'shingle') issues.push({ code: 'shingle', severity: 'warning' });
  if (product?.kind !== 'shingle' && c.pitch < 22 && c.membraneOverlap < .2) issues.push({ code: 'overlap', severity: 'error' });
  if (!c.priceOverrides || typeof c.priceOverrides !== 'object' || Array.isArray(c.priceOverrides) || Object.values(c.priceOverrides).some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1000000)) issues.push({ code: 'price', severity: 'error' });
  return issues;
}

/** Reject malformed persisted data rather than silently trusting arbitrary JSON. */
export function restoreConfig(raw: unknown): RoofConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1 || Object.keys(obj).some(k => !Object.prototype.hasOwnProperty.call(defaultConfig, k))) return null;
  const result = { ...defaultConfig };
  for (const key of Object.keys(defaultConfig) as (keyof RoofConfig)[]) {
    if (!(key in obj)) continue;
    const value = obj[key], original = defaultConfig[key];
    if (key === 'ridgeLength' || key === 'battenSpacing') { if (value !== null && typeof value !== 'number') return null; }
    else if (typeof value !== typeof original) return null;
    Object.assign(result, { [key]: value });
  }
  if (!colors.some(x => x.id === result.color) || !['matte', 'satin'].includes(result.finish)
    || !['membrane-red', 'membrane-pure'].includes(result.membraneId) || !['itemized', 'bundled'].includes(result.laborScope)
    || !['none', 'metal', 'felt'].includes(result.demolition) || !['standard', 'residential'].includes(result.vatMode)
    || !['house', 'apartment'].includes(result.residentialType)) return null;
  if (validateConfig(result).some(i => i.severity === 'error')) return null;
  return result;
}
