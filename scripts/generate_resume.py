"""Generate editable resumes, matching PDFs and actual PDF page previews.

Run with the Codex bundled Python resolved by load_workspace_dependencies:
    <bundled-python> scripts/generate_resume.py

Dependencies: python-docx, reportlab, pypdf; Poppler pdftoppm for PNG previews.
PDF engine: ReportLab (explicit fallback when bundled LibreOffice is unavailable).
The PDF and DOCX share every text block; PDF layout is not a DOCX render.
The DOCX is editable. The PDF has selectable text and no editing restrictions.
All formats share the same reviewed content model in content/resume-draft.json.
PNG previews are rasterised from the generated PDF itself at 1200px width.
Use --previews-only to refresh PNGs without rewriting existing PDF/DOCX files.
Poppler is resolved from the bundled Python runtime; --poppler-bin can specify
another Poppler executable directory when it is not available in that runtime.

Font defaults use the standard Windows Arial files. On another host,
provide --font-dir with arial.ttf and arialbd.ttf, or override each
font path with --body-font, --bold-font and --title-font. Font files are embedded
in PDFs and referenced by family name in DOCX; no external uploads are involved.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import struct
import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZipFile

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.shared import Mm, Pt, RGBColor
from pypdf import PdfReader
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate


ROOT = Path(__file__).resolve().parents[1]
BLACK = "000000"
LINK_RE = re.compile(r"https?://[^\s|]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")
# Sizes and spacing are in points; all text flows in a single reading column.
LAYOUT = {
    "status": {"size": 9, "leading": 12, "before": 0, "after": 6, "bold": True},
    "note": {"size": 9.3, "leading": 12.5, "before": 0, "after": 5},
    "name": {"size": 24, "leading": 29, "before": 0, "after": 5, "bold": True},
    "role": {"size": 12, "leading": 15, "before": 0, "after": 5},
    "contacts": {"size": 9.4, "leading": 12, "before": 0, "after": 3},
    "heading": {"size": 11, "leading": 14, "before": 13, "after": 5, "bold": True},
    "label": {"size": 10.5, "leading": 14, "before": 0, "after": 4, "bold": True},
    "body": {"size": 10.2, "leading": 13.6, "before": 0, "after": 4},
    "bullet": {"size": 10.2, "leading": 13.6, "before": 0, "after": 5},
}


def normalized(text: str) -> str:
    text = re.sub(r"(?m)^\s*\u2022\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()


def prefix_split(block: dict) -> tuple[str, str]:
    """Emphasise short skill labels while preserving a single text model."""
    text = block["text"]
    if block["kind"] in {"body", "bullet"} and ":" in text:
        prefix, rest = text.split(":", 1)
        if len(prefix) <= 32:
            return prefix + ":", rest
    return "", text


def add_bullet_numbering(doc) -> str:
    """Use true Word list items with a stable font and hanging indent."""
    root = doc.part.numbering_part.element
    abstract_id = max((int(e.get(qn("w:abstractNumId"))) for e in root.findall(qn("w:abstractNum"))), default=-1) + 1
    num_id = max((int(e.get(qn("w:numId"))) for e in root.findall(qn("w:num"))), default=0) + 1
    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    level = OxmlElement("w:lvl")
    level.set(qn("w:ilvl"), "0")
    for tag, value in (("start", "1"), ("numFmt", "bullet"), ("lvlText", "\u2022"), ("lvlJc", "left")):
        element = OxmlElement("w:" + tag)
        element.set(qn("w:val"), value)
        level.append(element)
    props = OxmlElement("w:rPr")
    fonts = OxmlElement("w:rFonts")
    for script in ("ascii", "hAnsi"):
        fonts.set(qn("w:" + script), "Arial")
    props.append(fonts)
    level.append(props)
    abstract.append(level)
    root.append(abstract)
    number = OxmlElement("w:num")
    number.set(qn("w:numId"), str(num_id))
    reference = OxmlElement("w:abstractNumId")
    reference.set(qn("w:val"), str(abstract_id))
    number.append(reference)
    root.append(number)
    return str(num_id)


def font_family(font_path: Path) -> str:
    """Read a font's family so DOCX and PDF reference the same face."""
    face = TTFont("family_probe", str(font_path)).face
    family = face.familyName
    return family.decode("utf-8") if isinstance(family, bytes) else str(family)


def set_style_font(style, family: str, size: float, bold: bool = False) -> None:
    style.font.name = family
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.color.rgb = RGBColor.from_string(BLACK)
    rpr = style.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is not None:
        for attribute in list(rfonts.attrib):
            if "Theme" in attribute:
                del rfonts.attrib[attribute]
        for script in ("ascii", "hAnsi", "eastAsia", "cs"):
            rfonts.set(qn("w:" + script), family)


def add_docx_link(paragraph, label: str, family: str, size: float, language: str) -> None:
    """Keep contact and repository links usable in Word and exported PDFs."""
    href = label if label.startswith("http") else "mailto:" + label
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), paragraph.part.relate_to(href, RT.HYPERLINK, is_external=True))
    run = OxmlElement("w:r")
    props = OxmlElement("w:rPr")
    fonts = OxmlElement("w:rFonts")
    fonts.set(qn("w:ascii"), family)
    fonts.set(qn("w:hAnsi"), family)
    props.append(fonts)
    color = OxmlElement("w:color")
    color.set(qn("w:val"), BLACK)
    props.append(color)
    size_element = OxmlElement("w:sz")
    size_element.set(qn("w:val"), str(round(size * 2)))
    props.append(size_element)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    props.append(underline)
    lang = OxmlElement("w:lang")
    lang.set(qn("w:val"), language)
    props.append(lang)
    run.append(props)
    text = OxmlElement("w:t")
    text.text = label
    run.append(text)
    link.append(run)
    paragraph._p.append(link)


def pdf_text(block: dict) -> str:
    text = block["text"]
    if block["kind"] != "contacts":
        prefix, rest = prefix_split(block)
        return (f"<b>{escape(prefix)}</b>" if prefix else "") + escape(rest)
    result, previous = [], 0
    for match in LINK_RE.finditer(text):
        result.append(escape(text[previous:match.start()]))
        label = match.group()
        href = label if label.startswith("http") else "mailto:" + label
        result.append(f'<link href="{escape(href)}"><u>{escape(label)}</u></link>')
        previous = match.end()
    result.append(escape(text[previous:]))
    return "".join(result)


def build_docx(path: Path, language: dict, accent: str, families: dict) -> None:
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Mm(210), Mm(297)
    section.top_margin = section.bottom_margin = Mm(18)
    section.left_margin = section.right_margin = Mm(20)
    set_style_font(doc.styles["Normal"], families["body"], 10.2)
    set_style_font(doc.styles["Title"], families["title"], 24, True)
    set_style_font(doc.styles["Heading 1"], families["body"], 11, True)
    for style_name in ("Title", "Heading 1", "Normal"):
        ppr = doc.styles[style_name].element.find(qn("w:pPr"))
        if ppr is not None:
            borders = ppr.find(qn("w:pBdr"))
            if borders is not None:
                ppr.remove(borders)
    core = doc.core_properties
    core.title = language["document_title"]
    core.subject = "Backend developer resume"
    core.author = ""
    core.last_modified_by = ""
    core.comments = ""
    core.language = language["language_tag"]
    bullet_id = add_bullet_numbering(doc)

    for block in language["blocks"]:
        kind, text = block["kind"], block["text"]
        layout = LAYOUT[kind]
        style_name = "Title" if kind == "name" else "Heading 1" if kind == "heading" else "Normal"
        paragraph = doc.add_paragraph(style=style_name)
        fmt = paragraph.paragraph_format
        fmt.space_before = Pt(layout["before"])
        fmt.space_after = Pt(layout["after"])
        fmt.line_spacing = Pt(layout["leading"])
        fmt.keep_together = True
        fmt.keep_with_next = kind in {"status", "name", "role", "heading", "label"}
        fmt.widow_control = True
        if kind == "bullet":
            fmt.left_indent = Pt(12)
            fmt.first_line_indent = Pt(-10)
            fmt.tab_stops.add_tab_stop(Pt(12))
            props = paragraph._p.get_or_add_pPr()
            numbering = OxmlElement("w:numPr")
            for tag, value in (("ilvl", "0"), ("numId", bullet_id)):
                element = OxmlElement("w:" + tag)
                element.set(qn("w:val"), value)
                numbering.append(element)
            props.append(numbering)
        def add_text(value: str, bold: bool = False) -> None:
            run = paragraph.add_run(value)
            run.font.name = families["title"] if kind == "name" else families["body"]
            run.font.size = Pt(layout["size"])
            run.font.bold = bold or layout.get("bold", False)
            run.font.color.rgb = RGBColor.from_string(accent if kind == "status" else BLACK)
            rpr = run._element.get_or_add_rPr()
            lang = OxmlElement("w:lang")
            lang.set(qn("w:val"), language["language_tag"])
            rpr.append(lang)
        if kind == "contacts":
            previous = 0
            for match in LINK_RE.finditer(text):
                add_text(text[previous:match.start()])
                add_docx_link(paragraph, match.group(), families["body"], layout["size"], language["language_tag"])
                previous = match.end()
            add_text(text[previous:])
        else:
            prefix, rest = prefix_split(block)
            if prefix:
                add_text(prefix, bold=True)
            add_text(rest)
    doc.save(path)


def build_pdf(path: Path, language: dict, accent: str) -> None:
    styles = {}
    for kind, layout in LAYOUT.items():
        font = "ResumeTitle" if kind == "name" else "ResumeBold" if layout.get("bold") else "ResumeBody"
        styles[kind] = ParagraphStyle(
            name=kind,
            fontName=font,
            fontSize=layout["size"],
            leading=layout["leading"],
            spaceBefore=layout["before"],
            spaceAfter=layout["after"],
            textColor=HexColor("#" + (accent if kind == "status" else BLACK)),
            alignment=TA_LEFT,
            keepWithNext=kind in {"status", "name", "role", "heading", "label"},
            allowWidows=0,
            allowOrphans=0,
            splitLongWords=False,
            leftIndent=12 if kind == "bullet" else 0,
            bulletIndent=2,
            bulletFontName="ResumeBody",
            bulletFontSize=8,
        )
    # Use the same page margins; the PDF is laid out independently from Word.
    document = SimpleDocTemplate(
        str(path), pagesize=A4,
        leftMargin=20 / 25.4 * 72, rightMargin=20 / 25.4 * 72,
        topMargin=18 / 25.4 * 72, bottomMargin=18 / 25.4 * 72,
        title=language["document_title"], author="", subject="Backend developer resume",
        pageCompression=1,
    )
    story = [Paragraph(pdf_text(block), styles[block["kind"]], bulletText="\u2022" if block["kind"] == "bullet" else None) for block in language["blocks"]]
    document.build(story)


def validate_pair(docx_path: Path, pdf_path: Path, language: dict) -> dict:
    expected = [block["text"] for block in language["blocks"]]
    actual = [p.text for p in Document(docx_path).paragraphs]
    if actual != expected:
        raise ValueError(f"DOCX content differs from the model: {docx_path}")
    with ZipFile(docx_path) as package:
        xml = package.read("word/document.xml").decode("utf-8")
        settings = package.read("word/settings.xml").decode("utf-8")
        if "w:documentProtection" in settings or "<w:ins " in xml or "<w:del " in xml:
            raise ValueError("Resume must be editable and free of tracked changes")
        if "word/comments.xml" in package.namelist():
            raise ValueError("Unexpected comments in resume")
    reader = PdfReader(pdf_path)
    if len(reader.pages) != 1:
        raise ValueError(f"Expected a one-page resume, got {len(reader.pages)}: {pdf_path}")
    extracted = "\n".join(page.extract_text() or "" for page in reader.pages)
    if normalized(extracted) != normalized("\n".join(expected)):
        raise ValueError(f"PDF text differs from the shared model: {pdf_path}")
    if "\ufffd" in extracted:
        raise ValueError("Replacement glyph found in PDF text")
    return {
        "language": language["language_tag"],
        "pdf_pages": len(reader.pages),
        "text_matches_shared_model": True,
        "docx_editable": True,
        "pdf_engine": "reportlab",
        "docx_native_render": "not performed by this generator",
        "docx_bytes": docx_path.stat().st_size,
        "pdf_bytes": pdf_path.stat().st_size,
    }


def resolve_pdftoppm(directory: Path | None) -> Path:
    executable = "pdftoppm.exe" if sys.platform == "win32" else "pdftoppm"
    if directory is not None:
        candidate = directory / executable
        if not candidate.is_file():
            raise FileNotFoundError(f"Poppler renderer not found: {candidate}")
        return candidate.resolve()
    dependencies = Path(sys.executable).resolve().parent.parent
    for relative in ("native/poppler/Library/bin", "native/poppler/bin", "bin/override"):
        candidate = dependencies / relative / executable
        if candidate.is_file():
            return candidate
    found = shutil.which(executable)
    if found:
        return Path(found)
    raise FileNotFoundError("Poppler pdftoppm is required; provide --poppler-bin")


def build_preview(pdf_path: Path, png_path: Path, width: int, renderer: Path) -> dict:
    """Rasterise the actual single-page PDF; do not rebuild its layout as HTML."""
    reader = PdfReader(pdf_path)
    if len(reader.pages) != 1:
        raise ValueError(f"A single preview requires a one-page PDF: {pdf_path}")
    subprocess.run(
        [str(renderer), "-f", "1", "-l", "1", "-singlefile", "-png",
         "-scale-to-x", str(width), "-scale-to-y", "-1", str(pdf_path),
         str(png_path.with_suffix(""))],
        check=True, capture_output=True, text=True,
    )
    header = png_path.read_bytes()[:24]
    if header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"Invalid PNG preview: {png_path}")
    actual_width, actual_height = struct.unpack(">II", header[16:24])
    page = reader.pages[0]
    expected_height = round(width * float(page.mediabox.height) / float(page.mediabox.width))
    if actual_width != width or abs(actual_height - expected_height) > 1:
        raise ValueError(f"Unexpected preview dimensions: {actual_width}x{actual_height}")
    return {
        "preview_file": png_path.name,
        "preview_width": actual_width,
        "preview_height": actual_height,
        "preview_bytes": png_path.stat().st_size,
        "preview_source": pdf_path.name,
        "preview_engine": "poppler pdftoppm",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=ROOT / "content/resume-draft.json")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "public/downloads")
    parser.add_argument("--font-dir", type=Path, default=Path("C:/Windows/Fonts"))
    parser.add_argument("--body-font", type=Path)
    parser.add_argument("--bold-font", type=Path)
    parser.add_argument("--title-font", type=Path)
    parser.add_argument("--poppler-bin", type=Path)
    parser.add_argument("--preview-width", type=int, default=1200)
    parser.add_argument("--previews-only", action="store_true")
    args = parser.parse_args()
    if args.preview_width < 1:
        raise ValueError("Preview width must be positive")
    renderer = resolve_pdftoppm(args.poppler_bin)
    families = {}
    if not args.previews_only:
        font_paths = {
            "body": args.body_font or args.font_dir / "arial.ttf",
            "bold": args.bold_font or args.font_dir / "arialbd.ttf",
            "title": args.title_font or args.font_dir / "arialbd.ttf",
        }
        for path in font_paths.values():
            if not path.is_file():
                raise FileNotFoundError(f"Font not found: {path}; supply --font-dir or individual font paths")
        for key, name in (("body", "ResumeBody"), ("bold", "ResumeBold"), ("title", "ResumeTitle")):
            pdfmetrics.registerFont(TTFont(name, str(font_paths[key])))
        pdfmetrics.registerFontFamily("ResumeBody", normal="ResumeBody", bold="ResumeBold", italic="ResumeBody", boldItalic="ResumeBold")
        families = {key: font_family(path) for key, path in font_paths.items()}
    data = json.loads(args.data.read_text(encoding="utf-8-sig"))
    if data.get("status") not in {"draft", "review", "ready"}:
        raise ValueError("Unexpected resume content status")
    accent = data.get("accent", "#b74b34").lstrip("#")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for code, language in data["languages"].items():
        if code not in {"ru", "en"}:
            raise ValueError(f"Unexpected language code: {code}")
        if not language["blocks"] or not any(block["kind"] == "name" for block in language["blocks"]):
            raise ValueError("Resume must include the candidate name")
        docx_path = args.output_dir / f"resume-{code}.docx"
        pdf_path = args.output_dir / f"resume-{code}.pdf"
        preview_path = args.output_dir / f"resume-{code}-preview.png"
        if not args.previews_only:
            build_docx(docx_path, language, accent, families)
            build_pdf(pdf_path, language, accent)
        result = validate_pair(docx_path, pdf_path, language)
        result.update(build_preview(pdf_path, preview_path, args.preview_width, renderer))
        results.append(result)
    print(json.dumps({"outputs": results}, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
