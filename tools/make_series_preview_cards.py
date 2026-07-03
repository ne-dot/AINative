from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math


OUT_DIR = Path("images/series-cards")
FONT_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"

W, H = 900, 330
SCALE = 2
BG = (4, 20, 38, 210)
CYAN = (26, 179, 255, 255)
CYAN_SOFT = (26, 179, 255, 95)
WHITE = (245, 251, 255, 255)
MUTED = (141, 195, 230, 255)


cards = [
    ("01-function-vs-paradigm", ["功能升级", "vs 软件范式"], "chart"),
    ("02-real-ai-native-product", ["真正的", "AI Native 产品"], "cube"),
    ("03-ai-next-software-entry", ["AI 成为", "下一代软件入口"], "head"),
    ("04-people-pm-dev-change", ["普通人、产品经理、", "开发者的变化"], "people"),
]


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def rounded_rect(draw, xy, radius, outline, width, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_glow_line(base, xy, radius):
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle(xy, radius=radius, outline=CYAN_SOFT, width=8)
    glow = glow.filter(ImageFilter.GaussianBlur(7))
    base.alpha_composite(glow)


def center_text(draw, lines):
    title_font = font(52 * SCALE)
    line_gap = 18 * SCALE
    total_h = sum(draw.textbbox((0, 0), line, font=title_font)[3] for line in lines) + line_gap * (len(lines) - 1)
    y = (H * SCALE - total_h) // 2 - 2 * SCALE
    x0 = 330 * SCALE
    x1 = 820 * SCALE
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text(((x0 + x1 - tw) / 2, y), line, font=title_font, fill=WHITE)
        y += th + line_gap


def icon_chart(draw, cx, cy):
    for i, h in enumerate([54, 86, 124]):
        x = cx - 62 * SCALE + i * 48 * SCALE
        draw.rounded_rectangle((x, cy + 48 * SCALE - h, x + 28 * SCALE, cy + 48 * SCALE), radius=5 * SCALE, fill=(36, 165, 255, 235), outline=CYAN, width=2 * SCALE)
    points = [(cx - 76 * SCALE, cy - 18 * SCALE), (cx - 34 * SCALE, cy - 50 * SCALE), (cx + 10 * SCALE, cy - 70 * SCALE), (cx + 74 * SCALE, cy - 118 * SCALE)]
    draw.line(points, fill=CYAN, width=8 * SCALE, joint="curve")
    draw.polygon([(cx + 74 * SCALE, cy - 118 * SCALE), (cx + 42 * SCALE, cy - 112 * SCALE), (cx + 66 * SCALE, cy - 86 * SCALE)], fill=CYAN)


def icon_cube(draw, cx, cy):
    pts_top = [(cx, cy - 84 * SCALE), (cx + 82 * SCALE, cy - 38 * SCALE), (cx, cy + 8 * SCALE), (cx - 82 * SCALE, cy - 38 * SCALE)]
    pts_left = [(cx - 82 * SCALE, cy - 38 * SCALE), (cx, cy + 8 * SCALE), (cx, cy + 104 * SCALE), (cx - 82 * SCALE, cy + 56 * SCALE)]
    pts_right = [(cx + 82 * SCALE, cy - 38 * SCALE), (cx, cy + 8 * SCALE), (cx, cy + 104 * SCALE), (cx + 82 * SCALE, cy + 56 * SCALE)]
    draw.polygon(pts_left, fill=(11, 85, 150, 210), outline=CYAN)
    draw.polygon(pts_right, fill=(19, 126, 210, 210), outline=CYAN)
    draw.polygon(pts_top, fill=(34, 169, 255, 205), outline=CYAN)
    draw.line([(cx, cy + 8 * SCALE), (cx, cy + 104 * SCALE)], fill=CYAN, width=3 * SCALE)


def icon_head(draw, cx, cy):
    draw.ellipse((cx - 84 * SCALE, cy - 98 * SCALE, cx + 70 * SCALE, cy + 74 * SCALE), outline=CYAN, width=5 * SCALE, fill=(8, 68, 118, 160))
    for angle in [210, 250, 290, 330]:
        r = 48 * SCALE
        x = cx - 8 * SCALE + math.cos(math.radians(angle)) * r
        y = cy - 16 * SCALE + math.sin(math.radians(angle)) * r
        draw.line((cx - 8 * SCALE, cy - 16 * SCALE, x, y), fill=CYAN, width=4 * SCALE)
        draw.ellipse((x - 6 * SCALE, y - 6 * SCALE, x + 6 * SCALE, y + 6 * SCALE), fill=CYAN)
    draw.rounded_rectangle((cx - 20 * SCALE, cy + 4 * SCALE, cx + 28 * SCALE, cy + 92 * SCALE), radius=10 * SCALE, fill=(26, 179, 255, 180))


def icon_people(draw, cx, cy):
    positions = [(cx, cy - 12 * SCALE, 42 * SCALE), (cx - 70 * SCALE, cy + 16 * SCALE, 30 * SCALE), (cx + 70 * SCALE, cy + 16 * SCALE, 30 * SCALE)]
    for x, y, r in positions:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(77, 183, 255, 235), outline=CYAN, width=3 * SCALE)
        draw.rounded_rectangle((x - r * 0.8, y + r * 0.9, x + r * 0.8, y + r * 3.1), radius=int(14 * SCALE), fill=(31, 133, 220, 220), outline=CYAN, width=2 * SCALE)


def write_svg(path, lines):
    escaped = [line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for line in lines]
    text_spans = "\n".join(
        f'<text x="575" y="{138 + i * 74}" text-anchor="middle" font-family="STHeiti, PingFang SC, sans-serif" font-size="52" font-weight="700" fill="#f5fbff">{line}</text>'
        for i, line in enumerate(escaped)
    )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="{W}" height="{H}" fill="none"/>
  <rect x="18" y="18" width="{W-36}" height="{H-36}" rx="26" fill="rgba(4,20,38,.82)" stroke="#1ab3ff" stroke-width="3" filter="url(#glow)"/>
  <line x1="300" y1="72" x2="300" y2="258" stroke="#1ab3ff" stroke-width="2" opacity=".75"/>
  <circle cx="160" cy="165" r="76" fill="rgba(26,179,255,.08)" stroke="#1ab3ff" stroke-width="3"/>
  {text_spans}
</svg>
'''
    path.write_text(svg, encoding="utf-8")


def make_card(slug, lines, icon):
    img = Image.new("RGBA", (W * SCALE, H * SCALE), (0, 0, 0, 0))
    draw_glow_line(img, (18 * SCALE, 18 * SCALE, (W - 18) * SCALE, (H - 18) * SCALE), 26 * SCALE)
    d = ImageDraw.Draw(img)
    rounded_rect(d, (18 * SCALE, 18 * SCALE, (W - 18) * SCALE, (H - 18) * SCALE), 26 * SCALE, CYAN, 3 * SCALE, BG)
    d.line((300 * SCALE, 72 * SCALE, 300 * SCALE, 258 * SCALE), fill=(26, 179, 255, 180), width=2 * SCALE)
    cx, cy = 160 * SCALE, 165 * SCALE
    d.ellipse((cx - 78 * SCALE, cy - 78 * SCALE, cx + 78 * SCALE, cy + 78 * SCALE), fill=(8, 48, 88, 155), outline=CYAN, width=3 * SCALE)
    if icon == "chart":
        icon_chart(d, cx, cy)
    elif icon == "cube":
        icon_cube(d, cx, cy)
    elif icon == "head":
        icon_head(d, cx, cy)
    else:
        icon_people(d, cx, cy)
    center_text(d, lines)
    out = OUT_DIR / f"{slug}.png"
    img.resize((W, H), Image.Resampling.LANCZOS).save(out)
    write_svg(OUT_DIR / f"{slug}.svg", lines)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, lines, icon in cards:
        make_card(slug, lines, icon)


if __name__ == "__main__":
    main()
