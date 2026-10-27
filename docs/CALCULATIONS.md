# Calculation model

Reviewed: **26 October 2026**. Implementation: `src/calculators/`; tests: `src/tests/roof.test.ts`.

## One geometry, two consumers

`buildRoof(config)` returns real 3D vertices, orthonormal local coordinates for each plane, plane polygons, pitches, areas, openings and classified edges. Both Three.js and `calculateEstimate()` consume this output. Price changes never change geometry. Wall height changes the building elevation, not roof area.

`L`, `W` = building dimensions; `e` = horizontal overhang; `α` = pitch; `X = L + 2e`; `Z = W + 2e`. Inputs use meters; trigonometry uses radians internally.

- **Gable:** two rectangular planes, each `X × (Z/2)/cos α`. Gross area `X × Z / cos α`; ridge `X`; eaves `2X`; four measured sloping verges.
- **Mono-pitch:** one full-span rectangle, `X × Z / cos α`. A high edge is distinct from the low gutter edge; it is not counted as a horizontal ridge.
- **Hip:** two trapezoids and two triangles. Automatic ridge follows the difference between the long and short roof dimensions. A square produces a pyramid with no zero-length ridge item. A custom ridge changes the end-plane pitches and actual areas; they are checked against the selected product's pitch range.
- **Multi-pitch:** a precisely defined T-shaped intersecting-gable roof with one perpendicular wing. Five clipped polygons partition the roof; two intersection valleys are measured in 3D. The projected extension is `(wingWidth + 2e) × wingLength`; no overlapping main-roof rectangle is counted twice. It is not an arbitrary polygon/dormer generator.

Plane area is the local polygon area, equivalent to the sum of its 3D triangle areas. Shared edges are classified once as ridge, hip, valley, eave, verge or high edge. The same vertices form rendered surfaces and measured quantities.

## Openings

Windows create actual `0.78 × 1.18 m` holes measured on the slope. A vertical `0.7 × 0.7 m` chimney creates a plane opening with area `0.49 / cos(planePitch)`. Positioning maintains plane-boundary clearance and avoids overlapping openings; a configuration that cannot place every requested opening is invalid.

`netArea = grossArea − sum(openingAreas)`. The display distinguishes building footprint, roof projection, gross sloping area and net sloping area. Whole sheets are not shortened merely because a window cuts through them. Membrane/decking retain gross area for turn-ups and cutting.

## Materials and purchase quantities

### Covering

- **T18 and standing seam:** intersect effective-width strips with each actual plane. The longest required span within each strip drives its cutting length. Long spans split according to the configured product handling length and end lap; lengths round up to centimeters. Count an additional reserve of complete panels at the longest panel length. T18 is billed on physical width; Classic Design uses the manufacturer's effective-area rate. End laps are added once, not as a second percentage. Standing-seam end joints below 14° are rejected.
- **Venecja:** intersect the actual planes with `1.15 × 0.70 m` module cells; order a whole sheet for every nonempty cell, then add the selected sheet reserve.
- **Clay/concrete tiles:** `netArea / (effectiveWidth × selectedGauge)`, rounded up to the product's purchase pack, then reserve and pack rounding. This is an area-based tile allowance, not a full manufacturer setting-out plan or pallet-only order. Special verge/vent tiles are not fully enumerated.
- **Shingles:** current 2.0 generation uses `2 m²/bundle`, rounded to full bundles plus reserve. Starter strips and ridge tabs are separate additional bundles. The budget assumes 14 starter meters and approximately 6 ridge meters per bundle, to be checked against the supplied generation and application instructions.

Reported physical purchase area reconciles with **net area + geometric cutting waste + selected reserve + overlaps**. Effective coverage already includes standard side laps. The selected reserve is not silently applied twice.

### Battens and counter-battens

Product gauge determines horizontal row positions. Each row is clipped to its plane and any openings; an additional top support row is included. Counter-battens follow actual slope runs at the selected rafter spacing. Triangles and trapezoids do not use a full rectangular-width shortcut.

`purchasePieces = ceil(sum(runLengths) × (1 + timberWaste) / stockLength)`

`billedMeters = purchasePieces × stockLength`

This pools offcuts for a budget. It is not support-aware stock cutting optimization; splice positions, double members and trimmers need a roofer's plan. Timber rates are per linear meter; alternative stock lengths retain the same reference linear rate.

### Underlay and decking

Membrane uses actual clipped strips: `1.5 × 50 m` rolls with user-selected laps. Each strip consumes its full-width bounding length, retaining gross area around openings. Rolls are `ceil(linearUsed × (1 + membraneWaste) / rollLength)`. Laps, clipping loss and whole-roll rounding are distinct. Joint tape includes membrane seams and opening perimeters; nail-penetration tape follows counter-batten runs.

Shingles replace tile battens/counter-battens with **mandatory OSB decking and bituminous underlay**. Bituminous rolls are `1 × 30 m`; below 21° the model uses 550 mm overlapping strips for double coverage. OSB is `ceil(grossArea × 1.08 / 3.125)` boards. Thickness is a pricing parameter, not an engineering determination. Optional 150 mm wool uses net area plus 5%, rounded to 4.56 m² packs; vapor control and interior lining are excluded.

### Edges, drainage and extras

- Ridge/hip/valley/verge flashings round each separate edge to whole components using effective lengths. Ceramic ridge-end and three-way junction allowances follow the ridge-edge graph. A pyramid cap/four-way junction needs a project-specific detail.
- Gutters follow measured eave segments and round each segment to 4 m pieces. Endpoints determine corners and end caps. Bracket planning uses maximum 0.6 m spacing; outlets use one per maximum 10 m segment. Downpipe pieces round independently per run to 3 m lengths, using eave elevation plus an offset allowance. Includes bends/shoes, clamps and connectors.
- This 125/90 mm drainage allowance is **not hydraulic sizing**; rainfall, outlet capacity, site discharge and actual brackets must be designed.
- Window/collar quantities equal modeled openings. Chimney flashing uses perimeter plus allowance, rounded to rolls; chimney construction is not included.
- Metal screws, seam screws, tile clips or shingle nails use material-specific budget rates. Final wind-zone fixing patterns, exact clip/nail compatibility and ancillary fasteners require approval.
- Snow stops are restricted to the budgeted Budmat system. Optional structural timber is only a simplified rafter/beam volume; sections and connections are not designed.

## Cost, VAT and ranges

Every line has a purchasing unit, theoretical quantity in that unit, actual quantity, net unit price, rounded line cost, formula and source. `lineNet = round(quantity × normalizedNetPrice, 2)`. Totals sum rounded lines.

- Gross 23% source prices normalize by `÷1.23`; gross 8% labor prices normalize by `÷1.08`. Sources without a VAT declaration are explicitly treated as **net planning assumptions**.
- User overrides are **net PLN per displayed purchase unit** and replace that line's source-price range as well as its central price.
- Itemized installation separates covering, underlay/counter-battens, battens, decking, flashings, ridges/hips, drainage, windows and selected extras. A user-entered **bundled labor rate replaces all installation task lines**. Demolition remains separate.
- Standard VAT is 23%. Reduced residential VAT requires installation and explicit eligibility confirmation. For usable floor area above 300 m² (house) or 150 m² (apartment), `eligibleShare = min(1, limit / usableFloorArea)` and `rate = .08 × eligibleShare + .23 × (1 − eligibleShare)`. The roof area is never used as usable floor area. Eligibility remains the contractor's legal/tax responsibility.
- The displayed low/high range sums the documented low/high source rates using the same quantities and VAT. There is no arbitrary ± percentage, regional coefficient or invented complexity multiplier. Fixed-price lines have identical endpoints; this is not a statistical confidence interval.

## Reproducible default example

12 × 8 m gable; 35°; 0.45 m overhang; Classic Design; no openings; gutters and itemized labor; default waste; 23% VAT:

| Result | Value |
| --- | ---: |
| Roof area | 140.1571305 m² |
| Panels | 56 base + 2 reserve, 5.44 m each |
| Billable effective panel area | 149.872 m² |
| Battens | 593.4 m theoretical; 161 × 4 m purchased |
| Counter-battens | 195.5681 m theoretical; 53 × 4 m purchased |
| Membrane | 3 × 75 m² rolls |
| Materials net | PLN 25,466.23 |
| Installation net | PLN 22,707.29 |
| Total net | PLN 48,173.52 |
| VAT | PLN 11,079.91 |
| Total gross | **PLN 59,253.43** |
| Source-price range, gross | PLN 52,959.85–65,547.01 |

## Limitations and required professional checks

This engine is a planning tool, not a construction specification or binding quote. It excludes arbitrary plans, unequal-pitch T intersections, dormers, certified structural and thermal design, complete roof-frame joints, scaffolding/cranes, transport/pallet deposits, asbestos handling, site drainage, full interior finishing and unforeseen repairs. Gutter sizing, low-pitch waterproofing, tile verge/ventilation details, shingle ridge ventilation, flashing profiles, accessory compatibility, fastener patterns and opening trimmers require confirmation. The public UI and exported PDF disclose general exclusions and relevant case warnings rather than hiding incomplete scope behind a precise total.
