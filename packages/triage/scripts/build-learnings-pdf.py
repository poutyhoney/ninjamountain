#!/usr/bin/env python3
"""Render LEARNINGS.md to a polished PDF.

Supports the Markdown subset used in LEARNINGS.md: # / ## / ### headings,
paragraphs, - and 1. lists (with wrapped continuation lines), | pipe | tables,
--- horizontal rules, **bold**, and `inline code`.

Usage: python build-learnings-pdf.py INPUT.md OUTPUT.pdf
"""
import re
import sys

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    ListFlowable, ListItem, HRFlowable,
)

INK    = colors.HexColor("#18181b")
MUT    = colors.HexColor("#52525b")
ACCENT = colors.HexColor("#4f46e5")
RULE   = colors.HexColor("#e4e4e7")
HEADBG = colors.HexColor("#eef2ff")
ZEBRA  = colors.HexColor("#fafafa")

body  = ParagraphStyle("body",  fontName="Helvetica", fontSize=10, leading=15, textColor=INK, spaceAfter=7)
h1    = ParagraphStyle("h1",    fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=INK, spaceAfter=6)
h2    = ParagraphStyle("h2",    fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=ACCENT, spaceBefore=18, spaceAfter=6)
h3    = ParagraphStyle("h3",    fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=INK, spaceBefore=10, spaceAfter=3)
li    = ParagraphStyle("li",    fontName="Helvetica", fontSize=10, leading=14, textColor=INK, spaceAfter=4)
cell  = ParagraphStyle("cell",  fontName="Helvetica", fontSize=8.5, leading=11.5, textColor=INK)
cellh = ParagraphStyle("cellh", fontName="Helvetica-Bold", fontSize=8.5, leading=11.5, textColor=INK)


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font face="Courier" size="9" color="#b3005f">\1</font>', text)
    return text


def is_table(line):       return line.lstrip().startswith("|")
def is_hr(line):          return re.match(r"^-{3,}\s*$", line.strip()) is not None
def is_bullet(line):      return line.lstrip().startswith("- ")
def is_numbered(line):    return re.match(r"^\s*\d+\.\s", line) is not None
def is_heading(line):     return line.startswith("#")
def is_special(line):     return is_heading(line) or is_table(line) or is_hr(line) or is_bullet(line) or is_numbered(line)


def build_table(rows, avail):
    cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
    cells = [r for r in cells if not all(re.match(r"^:?-+:?$", c or "-") for c in r)]  # drop --- sep
    header, data = cells[0], cells[1:]
    ncols = len(header)
    widths = [avail * 0.34, avail * 0.66] if ncols == 2 else [avail / ncols] * ncols
    table_data = [[Paragraph(inline(c), cellh) for c in header]]
    for row in data:
        table_data.append([Paragraph(inline(c), cell) for c in row])
    t = Table(table_data, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADBG),
        ("LINEBELOW", (0, 0), (-1, 0), 0.75, ACCENT),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(2, len(table_data), 2):
        style.append(("BACKGROUND", (0, i), (-1, i), ZEBRA))
    t.setStyle(TableStyle(style))
    return t


def parse(md, avail):
    lines = md.splitlines()
    flow, i, n = [], 0, len(lines)
    while i < n:
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if is_heading(line):
            if line.startswith("### "):
                flow.append(Paragraph(inline(line[4:]), h3))
            elif line.startswith("## "):
                flow.append(Paragraph(inline(line[3:]), h2))
            elif line.startswith("# "):
                flow.append(Paragraph(inline(line[2:]), h1))
                flow.append(HRFlowable(width="100%", thickness=1, color=RULE, spaceBefore=4, spaceAfter=10))
            i += 1
        elif is_hr(line):
            flow.append(Spacer(1, 2))
            flow.append(HRFlowable(width="100%", thickness=0.6, color=RULE, spaceBefore=2, spaceAfter=8))
            i += 1
        elif is_table(line):
            rows = []
            while i < n and is_table(lines[i]):
                rows.append(lines[i]); i += 1
            flow.append(build_table(rows, avail))
            flow.append(Spacer(1, 8))
        elif is_bullet(line) or is_numbered(line):
            numbered = is_numbered(line)
            items = []
            while i < n and lines[i].strip():
                cur = lines[i]
                if (is_numbered(cur) if numbered else is_bullet(cur)):
                    text = re.sub(r"^\s*\d+\.\s", "", cur) if numbered else cur.lstrip()[2:]
                    items.append(text.strip())
                elif not is_special(cur):  # continuation of previous item
                    items[-1] += " " + cur.strip()
                else:
                    break
                i += 1
            list_items = [ListItem(Paragraph(inline(t), li), leftIndent=14) for t in items]
            flow.append(ListFlowable(
                list_items, bulletType=("1" if numbered else "bullet"),
                bulletColor=ACCENT, start=("1" if numbered else None), leftIndent=14,
            ))
            flow.append(Spacer(1, 4))
        else:  # paragraph
            para = [line.strip()]
            i += 1
            while i < n and lines[i].strip() and not is_special(lines[i]):
                para.append(lines[i].strip()); i += 1
            flow.append(Paragraph(inline(" ".join(para)), body))
    return flow


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUT)
    canvas.drawString(doc.leftMargin, 0.55 * inch, "Support Triage Assistant — Collected Learnings")
    canvas.drawRightString(LETTER[0] - doc.rightMargin, 0.55 * inch, f"{doc.page}")
    canvas.restoreState()


def main():
    src, out = sys.argv[1], sys.argv[2]
    with open(src, encoding="utf-8") as f:
        md = f.read()
    margin = 0.85 * inch
    doc = SimpleDocTemplate(
        out, pagesize=LETTER, leftMargin=margin, rightMargin=margin,
        topMargin=0.8 * inch, bottomMargin=0.85 * inch,
        title="Support Triage Assistant — Collected Learnings", author="ninjamountain",
    )
    avail = LETTER[0] - 2 * margin
    doc.build(parse(md, avail), onFirstPage=footer, onLaterPages=footer)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
