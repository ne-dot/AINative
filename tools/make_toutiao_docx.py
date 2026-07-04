import os
import re
import zipfile
from html import escape
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SEASON1 = ROOT / "doc" / "season 1"
SOURCE = SEASON1 / "01 AI Native：软件时代，真的变了.md"
OUTPUT = SEASON1 / "exports" / "01 AI Native：软件时代，真的变了.docx"

EMU_PER_INCH = 914400
MAX_IMAGE_WIDTH_IN = 5.9


def xml_text(value):
    return escape(value, quote=False)


def paragraph_style(style_id=None, align=None, spacing_after=160, spacing_before=0):
    bits = []
    if style_id:
        bits.append(f'<w:pStyle w:val="{style_id}"/>')
    if align:
        bits.append(f'<w:jc w:val="{align}"/>')
    bits.append(f'<w:spacing w:before="{spacing_before}" w:after="{spacing_after}" w:line="360" w:lineRule="auto"/>')
    return "<w:pPr>" + "".join(bits) + "</w:pPr>"


def run(text, bold=False, italic=False, size=24, color="222222"):
    props = [
        '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="PingFang SC" w:cs="Arial"/>',
        f'<w:sz w:val="{size}"/>',
        f'<w:szCs w:val="{size}"/>',
        f'<w:color w:val="{color}"/>',
    ]
    if bold:
        props.append("<w:b/><w:bCs/>")
    if italic:
        props.append("<w:i/><w:iCs/>")
    space = ' xml:space="preserve"' if text[:1].isspace() or text[-1:].isspace() else ""
    return f"<w:r><w:rPr>{''.join(props)}</w:rPr><w:t{space}>{xml_text(text)}</w:t></w:r>"


def runs_from_inline(text, size=24, color="222222"):
    parts = re.split(r"(\*\*.*?\*\*)", text)
    out = []
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            out.append(run(part[2:-2], bold=True, size=size, color=color))
        else:
            out.append(run(part, size=size, color=color))
    return "".join(out)


def para(text="", style_id=None, align=None, size=24, bold=False, color="222222", before=0, after=160):
    content = run(text, bold=bold, size=size, color=color) if bold else runs_from_inline(text, size=size, color=color)
    return f"<w:p>{paragraph_style(style_id, align, after, before)}{content}</w:p>"


def horizontal_rule():
    return (
        "<w:p><w:pPr><w:pBdr><w:bottom w:val=\"single\" w:sz=\"6\" "
        "w:space=\"1\" w:color=\"D9DDE3\"/></w:pBdr>"
        "<w:spacing w:before=\"120\" w:after=\"180\"/></w:pPr></w:p>"
    )


def image_paragraph(rel_id, width_px, height_px, doc_pr_id):
    width_in = min(MAX_IMAGE_WIDTH_IN, width_px / 180)
    height_in = width_in * height_px / width_px
    cx = int(width_in * EMU_PER_INCH)
    cy = int(height_in * EMU_PER_INCH)
    return f"""
<w:p>
  {paragraph_style(align="center", spacing_after=220, spacing_before=120)}
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="{doc_pr_id}" name="Picture {doc_pr_id}"/>
        <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr><pic:cNvPr id="{doc_pr_id}" name="image"/><pic:cNvPicPr/></pic:nvPicPr>
              <pic:blipFill><a:blip r:embed="{rel_id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
              <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
"""


def parse_markdown():
    body = []
    images = []
    rel_num = 1
    doc_pr_id = 1

    for raw in SOURCE.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if not line:
            body.append(para("", after=80))
            continue
        if line == "---":
            body.append(horizontal_rule())
            continue

        image_match = re.match(r"!\[(.*?)\]\((.*?)\)", line)
        if image_match:
            alt, src = image_match.groups()
            path = (SOURCE.parent / src).resolve()
            if path.exists():
                rel_id = f"rId{rel_num}"
                rel_num += 1
                with Image.open(path) as img:
                    width_px, height_px = img.size
                images.append((rel_id, path, f"image{len(images) + 1}{path.suffix.lower()}"))
                body.append(image_paragraph(rel_id, width_px, height_px, doc_pr_id))
                doc_pr_id += 1
                if alt:
                    body.append(para(alt, align="center", size=18, color="666666", after=180))
            continue

        if line.startswith("# "):
            body.append(para(line[2:], style_id="Title", align="center", size=40, bold=True, color="111111", before=0, after=260))
        elif line.startswith("## "):
            body.append(para(line[3:], style_id="Heading1", size=30, bold=True, color="111111", before=360, after=160))
        elif line.startswith(">"):
            quote = line[1:].lstrip()
            if quote:
                body.append(para(quote, style_id="Quote", size=24, color="333333", before=40, after=120))
            else:
                body.append(para("", style_id="Quote", before=0, after=40))
        elif line.startswith("- "):
            body.append(f"<w:p>{paragraph_style(spacing_after=80)}<w:r><w:t>• </w:t></w:r>{runs_from_inline(line[2:], size=24)}</w:p>")
        else:
            body.append(para(line, size=24, after=160))

    return "\n".join(body), images


def content_types(images):
    image_defaults = {}
    for _, _, name in images:
        ext = Path(name).suffix.lower().lstrip(".")
        image_defaults[ext] = "image/png" if ext == "png" else f"image/{ext}"
    defaults = "\n".join(f'<Default Extension="{ext}" ContentType="{ctype}"/>' for ext, ctype in image_defaults.items())
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  {defaults}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""


def document_xml(body):
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""


def styles_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="360" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="PingFang SC"/><w:sz w:val="24"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="420" w:right="240"/></w:pPr></w:style>
</w:styles>"""


def rels_xml(images):
    rels = [
        '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    ]
    for rel_id, _, media_name in images:
        rels.append(
            f'<Relationship Id="{rel_id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{media_name}"/>'
        )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {''.join(rels)}
</Relationships>"""


def root_rels_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""


def main():
    body, images = parse_markdown()
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types(images))
        docx.writestr("_rels/.rels", root_rels_xml())
        docx.writestr("word/document.xml", document_xml(body))
        docx.writestr("word/styles.xml", styles_xml())
        docx.writestr("word/_rels/document.xml.rels", rels_xml(images))
        for _, source, media_name in images:
            docx.write(source, f"word/media/{media_name}")
    print(OUTPUT)


if __name__ == "__main__":
    main()
