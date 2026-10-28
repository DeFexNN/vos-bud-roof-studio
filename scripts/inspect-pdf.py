"""Optional PDF proof after browser QA: python -X utf8 scripts/inspect-pdf.py.

Requires PyMuPDF (python -m pip install pymupdf). Not needed by the website.
"""
import json
from pathlib import Path

import pymupdf


reports = []
for locale in ("pl", "en"):
    path = Path(f"qa/estimate-{locale}.pdf")
    assert path.read_bytes().startswith(b"%PDF-"), f"Invalid PDF: {path}"
    document = pymupdf.open(path)
    text = "\n".join(page.get_text() for page in document)
    required = ("Orientacyjny kosztorys dachu", "Połacie", "Długość", "Zakres według cen źródłowych", "Kąt") if locale == "pl" else ("Indicative roof estimate", "Gross plane area", "Building length", "Range based on source prices")
    for phrase in required:
        assert phrase in text, f"Missing or malformed text {phrase!r} in {path}"
    assert "\ufffd" not in text, f"Replacement characters in {path}"
    assert "ruukki.com" in text, f"Source URLs missing in {path}"
    assert len(document) >= 4, f"Missing estimate detail pages in {path}"
    fonts = {font[0]: font[3] for page in document for font in page.get_fonts() if "Noto" in font[3]}
    assert len(fonts) >= 2, f"Regular and bold Noto fonts missing in {path}"
    assert all(document.extract_font(xref)[3] for xref in fonts), f"Unembedded Unicode font in {path}"
    for page in document:
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line["spans"]:
                    x0, y0, x1, y1 = span["bbox"]
                    assert x0 >= -0.5 and y0 >= -0.5 and x1 <= page.rect.width + 0.5 and y1 <= page.rect.height + 0.5, f"Text outside page {page.number + 1}: {span['text']!r}"
    document[0].get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(str(path.with_name(path.stem + "-page1.png")))
    document[1].get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(str(path.with_name(path.stem + "-page2.png")))
    path.with_suffix(".txt").write_text(text, encoding="utf-8")
    reports.append({"file": str(path), "passed": True, "pages": len(document), "embedded_fonts": list(fonts.values()), "polish_characters": sorted(set(text) & set("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ")), "all_text_within_page": True})
    print(f"PASS {path}: {len(document)} pages, embedded Unicode fonts, extracted text and page bounds")

Path("qa/pdf-inspection.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding="utf-8")
