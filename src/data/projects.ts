import { bi, type Bilingual } from '@/i18n/types';

export interface Project {
  id: string;
  number: string;
  instagramId: string;
  category: 'renovation' | 'rebuilding' | 'detail';
  title: Bilingual;
  subtitle: Bilingual;
  description: Bilingual;
  material: Bilingual;
  scope: Bilingual[];
  beforeAlt: Bilingual;
  afterAlt: Bilingual;
  position: string;
  aspect: number;
  presentation: 'aligned' | 'sequence' | 'views';
  /** Reviewed square-card crop; full evidence always keeps the original frame. */
  previewPosition: string;
  /** Optional tighter card crop only; evidence and lightboxes keep the full frame. */
  previewScale?: number;
  areaNote?: Bilingual;
}
export const projects: Project[] = [
  {
    id: 'nowy-rozdzial', number: '01', instagramId: 'CKNuB87BNcu', category: 'renovation', presentation: 'sequence',
    title: bi('Wymiana pokrycia na czerwone', 'Red roof-covering replacement'), subtitle: bi('Demontaż starego pokrycia i nowa czerwona połać', 'Old covering removed and a new red roof installed'), previewPosition: '50% 20%',
    description: bi('Na zdjęciu z prac widać demontaż starego falistego pokrycia i odsłonięte łaty. Gotowy dach ma jednolitą, czerwoną powierzchnię. Zachowana bryła domu zyskuje wyraźny, uporządkowany rysunek.', 'The work photograph shows removal of the old corrugated covering and exposed battens. The completed roof has a consistent red surface. The existing house gains a clear, ordered roofline.'),
    material: bi('Czerwone pokrycie dachówkowe', 'Red tile-profile covering'),
    scope: [bi('Demontaż starego pokrycia', 'Removal of existing covering'), bi('Nowa czerwona połać', 'New red roof surface'), bi('Wykończenie linii okapu', 'Finished eaves line')],
    beforeAlt: bi('Pracownicy zdejmują szare faliste pokrycie, widoczne łaty i komin', 'Workers removing grey corrugated roofing, with battens and chimney exposed'),
    afterAlt: bi('Ten sam niski dom z ukończonym czerwonym dachem', 'The same low house with its completed red roof'), position: '50% 35%', aspect: 1,
  },
  {
    id: 'antracytowa-linia', number: '02', instagramId: 'Dc6OWH2CHEW', category: 'renovation', presentation: 'sequence',
    title: bi('Renowacja dachu w antracycie', 'Anthracite roof renovation'), subtitle: bi('Wymiana pokrycia i obróbki przy otworach', 'Covering replacement and flashing around openings'), previewPosition: '50% 14%',
    description: bi('Długą, stromą połać starego domu zastępuje ciemne, regularne pokrycie. Fotografie pokazują zmianę zużytej powierzchni na jednolity antracyt oraz staranne wykończenia wokół okien i komina.', 'A long, steep roof is renewed with a dark, regular covering. The photographs show a weathered surface replaced with consistent anthracite and considered detailing around windows and the chimney.'),
    material: bi('Pokrycie dachówkowe · antracyt', 'Tile-profile covering · anthracite'),
    scope: [bi('Wymiana zużytego pokrycia', 'Replacement of the weathered covering'), bi('Obróbki wokół otworów', 'Flashing around openings'), bi('Jednolity układ połaci', 'Consistent roof layout')],
    beforeAlt: bi('Długi budynek przy ulicy ze starym szarym dachem i małym oknem dachowym', 'A long roadside building with an old grey roof and a small roof window'),
    afterAlt: bi('Ten sam budynek z ciemnym dachem oglądany od podwórza', 'The same building with a dark roof seen from the courtyard'), position: '50% 42%', aspect: .75,
    areaNote: bi('440 m² — wartość z dostarczonego opisu realizacji, nie pomiar ze zdjęć.', '440 m² — stated in the supplied project description, not measured from photographs.'),
  },
  {
    id: 'cieplo-brazu', number: '03', instagramId: 'DeUcgx7Dgs2', category: 'renovation', presentation: 'sequence',
    title: bi('Brązowy dach z oknami połaciowymi', 'Brown roof with roof windows'), subtitle: bi('Nowe profilowane pokrycie, okna i orynnowanie', 'New profiled covering, roof windows and gutters'), previewPosition: '50% 8%',
    description: bi('Stare ciemne płyty faliste ustępują brązowemu pokryciu o regularnym profilu. Na gotowej połaci widoczne są okna dachowe, komin i nowa linia rynny.', 'Old dark corrugated sheets give way to a brown, regularly profiled covering. Roof windows, a chimney and a new gutter line are visible on the completed slope.'),
    material: bi('Blachodachówka · brąz', 'Metal roof tiles · brown'),
    scope: [bi('Zmiana rodzaju pokrycia', 'Change of covering type'), bi('Detale okien dachowych', 'Roof-window detailing'), bi('Wykończenie okapu', 'Eaves finishing')],
    beforeAlt: bi('Żółtawy dom ze starymi ciemnymi płytami dachowymi', 'A pale-yellow house with old dark roofing sheets'),
    afterAlt: bi('Brązowe profilowane pokrycie, komin i dwa okna na dachu domu', 'Brown profiled roofing, a chimney and two roof windows'), position: '50% 38%', aspect: .75,
  },
  {
    id: 'przywrocona-forma', number: '04', instagramId: 'Cz1XIYgICsE', category: 'rebuilding', presentation: 'sequence',
    title: bi('Odbudowa dachu budynku gospodarczego', 'Outbuilding roof reconstruction'), subtitle: bi('Odbudowa uszkodzonych połaci i pokrycie z blachy', 'Damaged slopes rebuilt and covered with profiled metal'), previewPosition: '50% 0%',
    description: bi('Uszkodzone połacie nad zabudową gospodarczą wymagały odbudowy. Zdjęcie po pracach pokazuje proste płaszczyzny profilowanej blachy oraz odtworzoną linię zadaszenia.', 'Damaged slopes over an outbuilding needed rebuilding. The later photograph shows clear planes of profiled metal and a restored roofline.'),
    material: bi('Blacha profilowana', 'Profiled metal'),
    scope: [bi('Odbudowa uszkodzonego dachu', 'Rebuilding the damaged roof'), bi('Montaż profilowanego pokrycia', 'Installation of profiled covering'), bi('Odtworzenie spadków', 'Restoration of roof slopes')],
    beforeAlt: bi('Częściowo zawalony dach nad starym budynkiem gospodarczym', 'A partially collapsed roof above an old outbuilding'),
    afterAlt: bi('Odbudowany dach z ciemnej profilowanej blachy w zimowym otoczeniu', 'A rebuilt dark profiled-metal roof in a winter setting'), position: '50% 36%', aspect: .8,
  },
  {
    id: 'mala-bryla-duza-zmiana', number: '05', instagramId: 'CaQIxEOISB5', category: 'rebuilding', presentation: 'sequence',
    title: bi('Nowy dach małego budynku', 'New roof on a small building'), subtitle: bi('Odtworzona bryła dachu i drewniany szczyt', 'Rebuilt roof form and timber gable'), previewPosition: '50% 30%', previewScale: 1.4,
    description: bi('Niewielki budynek z uszkodzonym zadaszeniem otrzymuje nowy, wyraźnie ukształtowany dach. Na drugim zdjęciu widoczne są także prace przy drewnianej części elewacji.', 'A small building with damaged roofing receives a clearly defined new roof. The later photograph also shows work to the timber-clad part of the facade.'),
    material: bi('Ciemne pokrycie · drewniany detal', 'Dark covering · timber detail'),
    scope: [bi('Odtworzenie bryły dachu', 'Roof form rebuilt'), bi('Nowe pokrycie', 'New covering'), bi('Połączenie z drewnianą zabudową', 'Junction with timber construction')],
    beforeAlt: bi('Mały dom w ogrodzie z uszkodzonym pokryciem i odsłoniętym szkieletem', 'A small garden house with damaged covering and exposed framing'),
    afterAlt: bi('Odnowiony mały budynek z ciemnym dachem i drewnianym szczytem', 'A renewed small building with a dark roof and timber gable'), position: '50% 40%', aspect: 1,
  },
  {
    id: 'swiatlo-pod-dachem', number: '06', instagramId: 'CZmAevDo54c', category: 'renovation', presentation: 'sequence',
    title: bi('Grafitowy dach z dwoma oknami', 'Graphite roof with two roof windows'), subtitle: bi('Od odsłoniętych krokwi do nowego pokrycia', 'From exposed rafters to a new roof covering'), previewPosition: '50% 25%',
    description: bi('Odsłonięta konstrukcja pokazuje etap przygotowania dachu do nowego pokrycia. Gotowa grafitowa połać z dwoma oknami dachowymi nadaje prostej bryle spokojny, uporządkowany charakter.', 'The exposed structure documents preparation for a new roof covering. A completed graphite slope with two roof windows gives the simple building a quiet, ordered character.'),
    material: bi('Grafitowe pokrycie · okna dachowe', 'Graphite covering · roof windows'),
    scope: [bi('Demontaż starej dachówki', 'Removal of the old tiles'), bi('Nowa grafitowa połać', 'New graphite roof'), bi('Dwa okna połaciowe', 'Two roof windows')],
    beforeAlt: bi('Dom z odsłoniętymi krokwiami i pozostałościami dachówki przy krawędzi', 'A house with exposed rafters and remaining tiles at the edge'),
    afterAlt: bi('Ukończony grafitowy dach dwuspadowy z dwoma jasnymi oknami dachowymi', 'A completed graphite gable roof with two bright roof windows'), position: '50% 36%', aspect: 1,
  },
  {
    id: 'miejski-rytm', number: '07', instagramId: 'DLGB6E0IBEh', category: 'detail', presentation: 'sequence',
    title: bi('Wymiana pokrycia w zabudowie szeregowej', 'Roof replacement on a terraced building'), subtitle: bi('Prace przy ciemnym pokryciu i lukarnach', 'Work on the dark covering and dormer junctions'), previewPosition: '50% 10%',
    description: bi('Dokumentacja ulicznej zabudowy pokazuje demontaż z użyciem zsypu i etap nowego, ciemnego pokrycia. Zachowany układ lukarn i sąsiednich dachów wymagał uważnego prowadzenia połączeń.', 'Street-level photographs show removal using a debris chute and the stage with a new dark covering. Existing dormers and neighboring roofs call for careful junction detailing.'),
    material: bi('Ciemne pokrycie · lukarny', 'Dark roofing · dormers'),
    scope: [bi('Demontaż w zabudowie miejskiej', 'Removal in an urban setting'), bi('Wymiana pokrycia', 'Roof-covering replacement'), bi('Detale przy lukarnach', 'Dormer junction details')],
    beforeAlt: bi('Budynek miejski z rusztowaniem i żółtym zsypem podczas prac na dachu', 'An urban building with scaffolding and a yellow debris chute during roof work'),
    afterAlt: bi('Ten sam budynek z nowym ciemnym dachem i zachowanymi lukarnami', 'The same building with a new dark roof and retained dormers'), position: '50% 33%', aspect: .75,
  },
  {
    id: 'czekoladowy-horyzont', number: '08', instagramId: 'DaNSxsqjtMk', category: 'renovation', presentation: 'sequence',
    title: bi('Brązowe pokrycie dachu z lukarnami', 'Brown roof covering with dormers'), subtitle: bi('Wymiana wyblakłego pokrycia i wykończenie lukarn', 'Faded covering replaced and dormer surrounds finished'), previewPosition: '50% 15%',
    description: bi('Wyblakłe pokrycie budynku z lukarnami zmienia się w ciepłą, brązową powierzchnię. Fotografie wykonano z różnych odległości; razem dokumentują nowy charakter całej bryły dachu.', 'The faded covering of a building with dormers becomes a warm brown surface. Photographs taken at different distances together document the roof’s new character.'),
    material: bi('Brązowe pokrycie dachówkowe', 'Brown tile-profile covering'),
    scope: [bi('Wymiana wyblakłego pokrycia', 'Replacement of faded covering'), bi('Wykończenie stref lukarn', 'Dormer surrounds'), bi('Jednolita kolorystyka', 'Consistent roof colour')],
    beforeAlt: bi('Budynek mieszkalny z wyblakłym jasnym dachem i lukarnami', 'A residential building with a faded light roof and dormers'),
    afterAlt: bi('Odnowiony brązowy dach z lukarnami na tle błękitnego nieba', 'A renewed brown roof with dormers against a blue sky'), position: '50% 40%', aspect: .75,
  },
  {
    id: 'szacunek-do-detalu', number: '09', instagramId: 'DceObklDoLX', category: 'detail', presentation: 'sequence',
    title: bi('Renowacja czerwonego dachu z mansardą', 'Red mansard-roof renovation'), subtitle: bi('Od uszkodzonej dachówki do odnowionych połaci', 'From damaged tiles to renewed roof slopes'), previewPosition: '50% 35%',
    description: bi('Zbliżenie starej połaci pokazuje uszkodzone dachówki o zaokrąglonym zakończeniu. Widok po renowacji ujawnia czerwony dach, jasny budynek i uporządkowane otoczenie okien.', 'A close-up of the old slope reveals damaged round-ended tiles. The renovated view shows a red roof, light-colored building and neatly defined window surrounds.'),
    material: bi('Czerwone pokrycie · detal mansardy', 'Red covering · mansard detail'),
    scope: [bi('Renowacja zużytej połaci', 'Renewal of the worn slope'), bi('Detale przy oknach', 'Window junctions'), bi('Zachowanie charakteru budynku', 'Preserving the building’s character')],
    beforeAlt: bi('Zbliżenie uszkodzonej czerwonej dachówki z zaokrąglonym dolnym brzegiem', 'Close-up of damaged red tiles with rounded lower edges'),
    afterAlt: bi('Jasnozielony dom z odnowionym czerwonym dachem i oknami dachowymi', 'A pale-green house with a renewed red roof and roof windows'), position: '50% 42%', aspect: .75,
  },
  {
    id: 'wieksza-perspektywa', number: '10', instagramId: 'Daf8QHkCPx-', category: 'detail', presentation: 'views',
    title: bi('Czerwony dach budynku murowanego', 'Red roof on a masonry building'), subtitle: bi('Dwa ujęcia połaci, okien i wysuniętego szczytu', 'Two views of the roof slopes, windows and projecting gable'), previewPosition: '50% 0%',
    description: bi('Duży murowany budynek o dekoracyjnej elewacji i rozbudowanej bryle dachu. Dokumentacja obejmuje czerwone połacie, okna dachowe i połączenia wokół wysuniętego szczytu. Oba kadry pokazują obiekt z różnych perspektyw.', 'A substantial masonry building with a decorative facade and articulated roof. The photographs document red slopes, roof windows and junctions around the projecting gable, seen from different viewpoints.'),
    material: bi('Czerwone połacie · obróbki szczytów', 'Red roof slopes · gable flashings'),
    scope: [bi('Renowacja rozbudowanej połaci', 'Renewal of an articulated roof'), bi('Połączenia przy szczytach', 'Gable junctions'), bi('Detale okien połaciowych', 'Roof-window details')],
    beforeAlt: bi('Front dużego murowanego budynku z czerwonym dachem i dekoracyjnym szczytem', 'Front of a large masonry building with a red roof and decorative gable'),
    afterAlt: bi('Ukośny widok murowanego budynku z odnowionymi czerwonymi połaciami', 'Oblique view of the masonry building with renewed red roof planes'), position: '50% 37%', aspect: .75,
  },
];
export const instagramUrl = (project: Project) => `https://www.instagram.com/p/${project.instagramId}/`;
