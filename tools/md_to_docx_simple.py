from __future__ import annotations

import html
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image


EMU_PER_INCH = 914400
DXA_PER_INCH = 1440
PAGE_WIDTH_DXA = 12240
PAGE_HEIGHT_DXA = 15840
MARGIN_DXA = 1440
TEXT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2
TEXT_WIDTH_IN = TEXT_WIDTH_DXA / DXA_PER_INCH


@dataclass
class ImageRel:
    rid: str
    source: Path
    target: str


class DocxBuilder:
    def __init__(self, source_md: Path, output_docx: Path):
        self.source_md = source_md
        self.output_docx = output_docx
        self.image_rels: list[ImageRel] = []
        self.body: list[str] = []
        self.next_rid = 1

    def rid(self) -> str:
        value = f"rId{self.next_rid}"
        self.next_rid += 1
        return value

    def add_paragraph(
        self,
        text: str = "",
        style: str | None = None,
        *,
        bold: bool = False,
        italic: bool = False,
        quote: bool = False,
        num_id: int | None = None,
        spacing_after: int | None = None,
    ) -> None:
        ppr: list[str] = []
        if style:
            ppr.append(f'<w:pStyle w:val="{style}"/>')
        if num_id is not None:
            ppr.append(f'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="{num_id}"/></w:numPr>')
        if quote:
            ppr.append('<w:ind w:left="360"/>')
            ppr.append('<w:shd w:fill="F3F8FC"/>')
        if spacing_after is not None:
            ppr.append(f'<w:spacing w:after="{spacing_after}"/>')
        runs = self.inline_runs(text, bold=bold, italic=italic)
        if not runs:
            runs = "<w:r><w:t></w:t></w:r>"
        ppr_xml = f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else ""
        self.body.append(f"<w:p>{ppr_xml}{runs}</w:p>")

    def inline_runs(self, text: str, *, bold: bool = False, italic: bool = False) -> str:
        if not text:
            return ""
        parts: list[str] = []
        pos = 0
        pattern = re.compile(r"\*\*(.+?)\*\*")
        for match in pattern.finditer(text):
            if match.start() > pos:
                parts.append(self.run(text[pos : match.start()], bold=bold, italic=italic))
            parts.append(self.run(match.group(1), bold=True, italic=italic))
            pos = match.end()
        if pos < len(text):
            parts.append(self.run(text[pos:], bold=bold, italic=italic))
        return "".join(parts)

    def run(self, text: str, *, bold: bool = False, italic: bool = False) -> str:
        props = [
            '<w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/>',
        ]
        if bold:
            props.append("<w:b/>")
        if italic:
            props.append("<w:i/>")
        safe = html.escape(text)
        preserve = ' xml:space="preserve"' if text.startswith(" ") or text.endswith(" ") else ""
        return f"<w:r><w:rPr>{''.join(props)}</w:rPr><w:t{preserve}>{safe}</w:t></w:r>"

    def add_image(self, rel_path: str, alt: str) -> None:
        image_path = (self.source_md.parent / rel_path).resolve()
        if not image_path.exists():
            image_path = (self.source_md.parent / "images" / Path(rel_path).name).resolve()
        if not image_path.exists():
            self.add_paragraph(f"[图片缺失：{rel_path}]", italic=True)
            return

        rid = self.rid()
        target = f"media/image{len(self.image_rels) + 1}{image_path.suffix.lower()}"
        self.image_rels.append(ImageRel(rid=rid, source=image_path, target=target))

        with Image.open(image_path) as im:
            px_w, px_h = im.size
        display_w_in = min(TEXT_WIDTH_IN, 6.4)
        display_h_in = display_w_in * px_h / px_w
        cx = int(display_w_in * EMU_PER_INCH)
        cy = int(display_h_in * EMU_PER_INCH)

        self.body.append(
            f"""
<w:p>
  <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:docPr id="{len(self.image_rels)}" name="{html.escape(alt or image_path.name)}"/>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr><pic:cNvPr id="0" name="{html.escape(image_path.name)}"/><pic:cNvPicPr/></pic:nvPicPr>
              <pic:blipFill><a:blip r:embed="{rid}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
              <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
""".strip()
        )
        if alt:
            self.add_paragraph(alt, style="Caption", italic=True)

    def add_table(self, rows: list[list[str]]) -> None:
        if not rows:
            return
        cols = max(len(row) for row in rows)
        col_width = TEXT_WIDTH_DXA // cols
        grid = "".join(f'<w:gridCol w:w="{col_width}"/>' for _ in range(cols))
        tr_xml: list[str] = []
        for idx, row in enumerate(rows):
            cells = []
            for cell in row + [""] * (cols - len(row)):
                fill = "EAF5FF" if idx == 0 else "FFFFFF"
                bold = idx == 0
                cells.append(
                    f"""
<w:tc>
  <w:tcPr><w:tcW w:w="{col_width}" w:type="dxa"/><w:shd w:fill="{fill}"/></w:tcPr>
  <w:p><w:pPr><w:spacing w:after="60"/></w:pPr>{self.inline_runs(cell.strip(), bold=bold)}</w:p>
</w:tc>
""".strip()
                )
            tr_xml.append(f"<w:tr>{''.join(cells)}</w:tr>")
        self.body.append(
            f"""
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="{TEXT_WIDTH_DXA}" w:type="dxa"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:color="B8D7EA"/>
      <w:left w:val="single" w:sz="6" w:color="B8D7EA"/>
      <w:bottom w:val="single" w:sz="6" w:color="B8D7EA"/>
      <w:right w:val="single" w:sz="6" w:color="B8D7EA"/>
      <w:insideH w:val="single" w:sz="4" w:color="DCEAF3"/>
      <w:insideV w:val="single" w:sz="4" w:color="DCEAF3"/>
    </w:tblBorders>
    <w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar>
  </w:tblPr>
  <w:tblGrid>{grid}</w:tblGrid>
  {''.join(tr_xml)}
</w:tbl>
<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>
""".strip()
        )

    def parse(self) -> None:
        lines = self.source_md.read_text(encoding="utf-8").splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            if not line or line == "---":
                i += 1
                continue
            if line.startswith("# "):
                self.add_paragraph(line[2:].strip(), style="Title")
            elif line.startswith("## "):
                self.add_paragraph(line[3:].strip(), style="Heading1")
            elif line.startswith("### "):
                self.add_paragraph(line[4:].strip(), style="Heading2")
            elif line.startswith("!["):
                m = re.match(r"!\[(.*?)\]\((.*?)\)", line)
                if m:
                    self.add_image(m.group(2), m.group(1))
            elif line.startswith(">"):
                quote_lines = []
                while i < len(lines) and lines[i].startswith(">"):
                    q = lines[i].lstrip("> ").strip()
                    if q:
                        quote_lines.append(q)
                    i += 1
                self.add_paragraph(" ".join(quote_lines), quote=True, bold=True)
                continue
            elif line.startswith("- "):
                while i < len(lines) and lines[i].startswith("- "):
                    self.add_paragraph(lines[i][2:].strip(), num_id=1)
                    i += 1
                continue
            elif line.startswith("|"):
                table_lines = []
                while i < len(lines) and lines[i].startswith("|"):
                    if not re.match(r"^\|\s*-+", lines[i]):
                        table_lines.append(lines[i])
                    i += 1
                rows = [[cell.strip() for cell in row.strip("|").split("|")] for row in table_lines]
                self.add_table(rows)
                continue
            else:
                self.add_paragraph(line)
            i += 1

    def document_xml(self) -> str:
        section = f"""
<w:sectPr>
  <w:pgSz w:w="{PAGE_WIDTH_DXA}" w:h="{PAGE_HEIGHT_DXA}"/>
  <w:pgMar w:top="{MARGIN_DXA}" w:right="{MARGIN_DXA}" w:bottom="{MARGIN_DXA}" w:left="{MARGIN_DXA}" w:header="720" w:footer="720" w:gutter="0"/>
</w:sectPr>
""".strip()
        return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    {''.join(self.body)}
    {section}
  </w:body>
</w:document>
"""

    def styles_xml(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:after="240"/><w:jc w:val="left"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:b/><w:sz w:val="40"/><w:color w:val="111827"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="260" w:after="140"/><w:keepNext/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:b/><w:sz w:val="30"/><w:color w:val="0B5CAD"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="220" w:after="120"/><w:keepNext/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:b/><w:sz w:val="26"/><w:color w:val="111827"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="Caption"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="140"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="Microsoft YaHei" w:hAnsi="Arial"/><w:i/><w:sz w:val="18"/><w:color w:val="667085"/></w:rPr>
  </w:style>
</w:styles>
"""

    def numbering_xml(self) -> str:
        return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1">
    <w:multiLevelType w:val="singleLevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>
"""

    def write(self) -> None:
        self.parse()
        rels = [
            '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
            '<Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>',
        ]
        for rel in self.image_rels:
            rels.append(
                f'<Relationship Id="{rel.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{rel.target}"/>'
            )
        rels_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {''.join(rels)}
</Relationships>
"""
        content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>
"""
        root_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""
        with zipfile.ZipFile(self.output_docx, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("[Content_Types].xml", content_types)
            zf.writestr("_rels/.rels", root_rels)
            zf.writestr("word/document.xml", self.document_xml())
            zf.writestr("word/styles.xml", self.styles_xml())
            zf.writestr("word/numbering.xml", self.numbering_xml())
            zf.writestr("word/_rels/document.xml.rels", rels_xml)
            for rel in self.image_rels:
                zf.write(rel.source, f"word/{rel.target}")


def main(argv: Iterable[str]) -> int:
    args = list(argv)
    if len(args) != 2:
        print("usage: md_to_docx_simple.py input.md output.docx", file=sys.stderr)
        return 2
    builder = DocxBuilder(Path(args[0]).resolve(), Path(args[1]).resolve())
    builder.write()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
