# Pricing and evidence

**Review date: 26 October 2026. Currency: PLN.**

The central price book is `src/data/prices.ts`; product dimensions and compatibility are in `src/data/materials.ts`. Each price record includes source URL/date, VAT treatment, purchase unit, specifications, effective coverage and low/high values. The public cost table exposes sources, formulas and editable net prices. PDF export includes used sources and their qualifications.

## Coverings

| Product / basis | Reference price as published | Source and publication date |
| --- | --- | --- |
| Budmat Venecja D-MATT PLUS, 0.805 m² effective/sheet | 44.06 gross/sheet; list comparator 52.68 net/sheet (64.80 gross) | [DoDachu retail](https://dodachu.pl/pokrycia-dachowe/373-budmat-blachodach%C3%B3wka-modu%C5%82owa-venecja-d-matt.html), undated; [Budmat list no. 17](https://icmarket.sk/__files/_cenniki/cennik-budmat-2026-07-31-dachy.pdf), **2026-07-31** |
| Pruszyński T18 PS, 0.5 mm | 42.99 gross/physical m²; 1173 mm overall / 1128 mm effective | [Pruszyński](https://pruszynski.com.pl/warto-wiedziec/cena-blachy-trapezowej-za-m2/), **2026-08-20** |
| Ruukki Classic Design C, 475 mm effective | 83.11 net/effective m² | [Ruukki price list](https://www.ruukki.com/docs/default-source/roofing-documents/poland-ruukki/cennik-ruukki.pdf?sfvrsn=103639129534143130000), **2026-08-28**, p. 7 |
| swissporTON TITANIA, black glaze | 9.07 net/tile; retail comparator 12.40 gross/tile | [Manufacturer list](https://www.swissporton.pl/media/11334/download/cennik-swissporTON-2026-pl.pdf?v=5), **2026-07-01**, pp. 24–25; [Realbud](https://realbud.com/pl/p/CREATON-TITANIA-czarna-glazura-dachowka-podstawowa/67971026), undated |
| Braas Celtycka Lumino, graphite | 3.92 gross/tile; comparator 5.87 gross/tile | [Lubar](https://sklep-lubar.pl/dachowka-betonowa/dachowka-betonowa-braas-celtycka-podstawowa-lumino-grafitowa), [NaszeDachy](https://naszedachy.pl/dachowka-betonowa-braas-celtycka-lumino-kolor-grafitowy-p-1065.html), undated |
| IKO Superglass 2.0 | 49.90 gross/m² reference; modeled as 99.80 gross/2 m² bundle | [Gonty-24](https://gonty-24.pl/pl/c/Gont-bitumiczny/18), undated; verify delivered generation against [IKO specifications](https://www.iko.eu/en/products/shingles/superglass) |

The Venecja fetched page showed 44.06, not the older search-result price. Current TITANIA dimensions take precedence over older retail descriptions. We do not compare different steel thicknesses as if they were price variations of the same T18 product. Colors/finishes are visual choices, **not a guarantee of the selected SKU's availability or price**.

## Underlays, timber and accessories

| Reference | Published price / basis | Source |
| --- | --- | --- |
| Treated batten 40 × 60 / counter-batten 25 × 50 | 4.50 / 2.70 gross per m; 4 m stock | [Drewkan batten](https://drewkan.pl/szorstkie/170-azalia.html), [counter-batten](https://drewkan.pl/szorstkie/171-azalia.html) |
| Corotop Red Strong 180 | 475 gross/75 m² roll, without adhesive strips | [Dachowe-Okna](https://dachowe-okna.pl/akcesoria-dachowe/mambrana-dachowa/corotop/membrana-dachowa-corotop-red-strong/) |
| Corotop PURE 205 | 627.67 gross/75 m² roll | [MegaBlach indexed offer](https://megablach.pl/membrany-dachowe-c-454_518.html) |
| IKO Armourbase Pro Plus | 17.41–18.91 net/m², 30 m² roll | [ICMarket indexed offer](https://pokrycia-dachowe-sklep.pl/iko-armourbase-pro-undercoating-felt-en.html); live page uses price on request |
| OSB 3, 18 mm, 1250 × 2500 mm | 104 gross/3.125 m² board | [Castorama](https://www.castorama.pl/plyta-osb-3-kronobuild-18-x-1250-x-2500-mm/5902115300158_CAPL.prd) |
| URSA Home 37, 150 mm | 104.79 gross/4.56 m² pack | [Leroy Merlin](https://www.leroymerlin.pl/produkty/welna-mineralna-szklana-home-37-150-mm-ursa-45428005.html) |
| Etanco EPDM screws | 39 gross/250 pieces | [i-Śruby](https://www.i-sruby.pl/p/238/628/wkrety-farmerskie-4-8x35-op-250szt-ral-7016-4-8x35-farmerskie-do-drewna-wkrety.html) |
| Tile clips | 27.90 gross/100 pieces | [Folnet](https://folnet.pl/pl/products/akcesoria-dachowe/mocowanie-elementow-pokrycia/spinki-do-dachowek/spinka-uniwersalna-do-dachowek-typ-r-3832.html) |
| Roof nails, 3 × 30 mm | 55 gross/5 kg pack | [Armet](https://e-armet.pl/pl/c/Gwozdzie-papowe/215) |
| Optilight B 78 × 118 / TZ/TS collar | 830 / 215.81 gross per piece | [Bricoman](https://www.bricoman.pl/okno-dachowe-optilight-b-78x118-cm-167083.html), [OknaDachowe](https://oknadachowe.info.pl/okno-dachowe-optilight-b-78x118) |
| C24 structural timber reference | 2350 gross/m³ for listed sections | [Drew-Cal](https://drewcal.pl/drewno-konstrukcyjne/); simplified budget only |

These retail references are undated and recorded against the review date, **not falsely assigned a publication date**. Some were available through indexed listings rather than a stable live checkout; availability and tax status must be reconfirmed. Detailed tape/flashing/ridge/snow-stop references and all exact Siba Round component rates are recorded in the central book. Ruukki accessories use pp. 17–27, Siba drainage pp. 42–44 of the dated list. Budmat and swissporTON ridge components use their corresponding dated lists.

Accessory entries are **budget allowances**, not approval of cross-brand component compatibility. Sheet-metal verges, concrete ridge clips/terminations, shingle ventilation and manufacturer-specific fasteners need final detailing. No delivery, pallet deposit, scaffolding, disposal quantity inferred from roof area or arbitrary regional surcharge is hidden in material prices.

## Labor and tax

- [KB.pl roofing labor](https://kb.pl/cenniki/uslugi/pokrycia-dachowe/), **2026-01-07**: gable roof without dormers. Includes 8% VAT and is normalized by `÷1.08`. Covering ranges in gross PLN/m²: metal 75–145; standing seam 70–110; clay 85–160; concrete 80–150; shingles 50–90. Underlay 20–40 is separate.
- [Dekarz & Cieśla](https://fachowydekarz.pl/cennik-uslug-dekarskich/), **April 2026**: separate battens, flashings, gutters, windows and other tasks. The source does not specify VAT. The application explicitly treats these as **net planning assumptions**, not verified net offers. Exact scopes and rates need contractor confirmation.
- [KB.pl Kraków demolition reference](https://kb.pl/cenniki/miejskie/dachy/krakow/), **2026-04-29**: metal removal 22.10 net/m², without waste disposal. This is a reference point, not a regional coefficient.
- [VAT explanation, art. 41(12–12c)](https://poradnikprzedsiebiorcy.pl/-kiedy-mozna-zastosowac-stawke-8-dla-uslug-budowlanych), **2026-02-11**: standard 23%; eligible comprehensive residential installation may use 8%, proportionately limited by usable floor area. It is not automatic tax advice.

The midpoint is used for a ranged task's central estimate. A user-entered bundled installation rate replaces **all** task installation lines, avoiding double labor. The source-price range is the sum of source endpoints with unchanged quantities, not a fabricated uncertainty envelope. Do not present it as a guaranteed supplier quotation.

## Updating the price book

1. Verify the exact product, thickness/coating, package coverage and physical/effective billing basis.
2. Update the existing record's price, endpoints, `vatTreatment`, source and publication date; keep undated sources `null`.
3. Update `PRICE_REVIEW` only after reviewing the prices; update associated source notes and this document.
4. Check product dimensions/gauges in `src/data/materials.ts`, especially bundle generations.
5. Run `npm test`, `npm run typecheck`, `npm run build`, then browser/PDF checks against the new production export.
