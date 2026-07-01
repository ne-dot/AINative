from pathlib import Path
from math import sin, cos, pi
import random

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images"


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    path = candidates[0 if bold else 1]
    return ImageFont.truetype(path, size)


def canvas(w, h, seed=1):
    random.seed(seed)
    img = Image.new("RGB", (w, h), "#06111f")
    px = img.load()
    for y in range(h):
        for x in range(w):
            dx = x / w
            dy = y / h
            blue = int(28 + 55 * dx + 24 * (1 - dy))
            purple = int(18 + 26 * sin(dx * pi))
            px[x, y] = (5 + int(8 * dx), 12 + purple // 3, blue)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for _ in range(130):
        x = random.randint(0, w)
        y = random.randint(0, h)
        r = random.choice([1, 1, 2])
        a = random.randint(70, 180)
        d.ellipse((x - r, y - r, x + r, y + r), fill=(120, 210, 255, a))
    for _ in range(34):
        x1, y1 = random.randint(0, w), random.randint(0, h)
        x2, y2 = x1 + random.randint(-260, 260), y1 + random.randint(-160, 160)
        d.line((x1, y1, x2, y2), fill=(46, 170, 255, random.randint(22, 60)), width=1)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def glow(draw, xy, radius, color=(0, 180, 255), rings=7):
    x, y = xy
    for i in range(rings, 0, -1):
        r = radius * i / rings
        a = int(18 * i)
        draw.ellipse((x - r, y - r, x + r, y + r), outline=color + (a,), width=3)


def text(draw, xy, value, size, fill="#ffffff", bold=False, anchor=None, spacing=8, align="left"):
    draw.multiline_text(xy, value, font=font(size, bold), fill=fill, anchor=anchor, spacing=spacing, align=align)


def pill(draw, box, label, icon=None, fill=(9, 31, 56, 210), outline=(35, 180, 255, 170)):
    draw.rounded_rectangle(box, radius=26, fill=fill, outline=outline, width=2)
    x1, y1, x2, y2 = box
    if icon:
        text(draw, (x1 + 32, (y1 + y2) // 2 - 15), icon, 30, "#42d8ff", bold=True)
        tx = x1 + 84
    else:
        tx = x1 + 26
    text(draw, (tx, y1 + 20), label, 24, "#eaf7ff", bold=True)


def card(draw, box, title, body=None, accent="#27b9ff"):
    draw.rounded_rectangle(box, radius=20, fill=(4, 20, 38, 205), outline=(50, 173, 255, 135), width=2)
    x1, y1, x2, y2 = box
    text(draw, (x1 + 24, y1 + 20), title, 25, accent, bold=True)
    if body:
        text(draw, (x1 + 24, y1 + 58), body, 19, "#d8ecff", spacing=6)


def arrow(draw, start, end, color=(48, 190, 255, 220), width=4):
    draw.line((start, end), fill=color, width=width)
    x1, y1 = start
    x2, y2 = end
    ang = pi + __import__("math").atan2(y2 - y1, x2 - x1)
    for delta in (-0.35, 0.35):
        draw.line((x2, y2, x2 + 18 * cos(ang + delta), y2 + 18 * sin(ang + delta)), fill=color, width=width)


def save(img, name):
    path = OUT / name
    img.convert("RGB").save(path, quality=96)
    print(path)


def adapt_machine():
    w, h = 1536, 1024
    img = canvas(w, h, 5)
    d = ImageDraw.Draw(img)
    text(d, (52, 48), "AI NATIVE / SEASON 1", 23, "#4bd6ff", bold=True)
    text(d, (52, 120), "02", 105, "#157eea", bold=True)
    text(d, (52, 260), "Past Software:\nPeople Adapted\nto Machines", 56, "#ffffff", bold=True, spacing=10)
    text(d, (56, 494), "For decades, software did not change its nature:\npeople had to learn software before they could use it.", 27, "#e2efff", spacing=10)
    steps = [("Person", "states need"), ("Learn", "software rules"), ("Operate", "buttons & menus"), ("Result", "wait for feedback")]
    for i, (a, b) in enumerate(steps):
        cx = 96 + i * 170
        d.ellipse((cx - 42, 644, cx + 42, 728), outline=(38, 190, 255, 210), width=3)
        text(d, (cx, 666), str(i + 1), 31, "#effaff", bold=True, anchor="ma")
        text(d, (cx, 756), a, 23, "#ffffff", bold=True, anchor="ma")
        text(d, (cx, 790), b, 18, "#c7dcef", anchor="ma")
        if i < 3:
            arrow(d, (cx + 58, 686), (cx + 112, 686), width=3)
    card(d, (56, 864, 580, 958), "Core logic:", "People adapt to software rules and workflows.")
    # abstract workstation
    for i in range(6):
        x = 710 + (i % 3) * 230
        y = 170 + (i // 3) * 190
        d.rounded_rectangle((x, y, x + 190, y + 120), radius=14, fill=(7, 28, 54, 190), outline=(61, 162, 231, 110), width=2)
        for k in range(5):
            d.line((x + 24, y + 28 + k * 16, x + 165, y + 28 + k * 16), fill=(63, 197, 255, 80), width=2)
    save(img, "en-01-02-human-adapt-machine.png")


def rule_based():
    w, h = 1536, 1024
    img = canvas(w, h, 8)
    d = ImageDraw.Draw(img)
    text(d, (52, 48), "AI NATIVE / SEASON 1", 23, "#4bd6ff", bold=True)
    text(d, (52, 120), "03", 105, "#dfe7ef", bold=True)
    text(d, (52, 260), "The Core of\nTraditional Software:\nRule-Driven", 56, "#ffffff", bold=True, spacing=10)
    text(d, (56, 494), "Programmers predefine logic.\nUsers follow the process.\nSoftware executes the rules.", 29, "#e2efff", spacing=10)
    flow = [("Write rules", "preset logic"), ("Fixed process", "clear steps"), ("Execute logic", "run by rules"), ("Get result", "predictable output")]
    for i, (a, b) in enumerate(flow):
        cx = 96 + i * 170
        d.ellipse((cx - 42, 644, cx + 42, 728), outline=(38, 190, 255, 210), width=3)
        text(d, (cx, 666), ["</>", "FLOW", "⚙", "✓"][i], 25, "#50d7ff", bold=True, anchor="ma")
        text(d, (cx, 756), a, 22, "#ffffff", bold=True, anchor="ma")
        text(d, (cx, 790), b, 18, "#c7dcef", anchor="ma")
        if i < 3:
            arrow(d, (cx + 58, 686), (cx + 112, 686), width=3)
    card(d, (56, 864, 600, 958), "Essence:", "Software = rules + process + data")
    # right flowchart
    boxes = [("Select product", 820, 170), ("Cart", 1010, 170), ("Address", 1200, 170), ("Pay", 1010, 330), ("Success", 1200, 330), ("Failure", 820, 330)]
    for label, x, y in boxes:
        d.rounded_rectangle((x, y, x + 145, y + 54), radius=10, fill=(8, 25, 44, 190), outline=(220, 230, 240, 120), width=2)
        text(d, (x + 72, y + 15), label, 19, "#ffffff", bold=True, anchor="ma")
    for a, b in [((965, 197), (1010, 197)), ((1155, 197), (1200, 197)), ((1080, 224), (1080, 330)), ((1155, 357), (1200, 357)), ((1010, 357), (965, 357))]:
        arrow(d, a, b, width=2)
    card(d, (930, 575, 1370, 760), "Business rules", "1. Inventory must be greater than zero\n2. Payment must be confirmed\n3. Each user has order limits")
    save(img, "en-01-03-rule-based-software.png")


def ai_understands():
    w, h = 1536, 1024
    img = canvas(w, h, 12)
    d = ImageDraw.Draw(img)
    text(d, (52, 48), "AI NATIVE / SEASON 1", 23, "#4bd6ff", bold=True)
    text(d, (52, 120), "04", 105, "#4b46e8", bold=True)
    text(d, (52, 260), "AI Changed\nOne Key Thing:\nSoftware Understands People", 50, "#ffffff", bold=True, spacing=10)
    text(d, (56, 514), "From operating software to expressing goals:\nAI understands intent, breaks down tasks,\ncalls tools, and produces results.", 27, "#e2efff", spacing=10)
    steps = [("Express goal", "natural language"), ("Understand intent", "AI reads needs"), ("Break tasks", "plan steps"), ("Call tools", "execute actions"), ("Deliver result", "create value")]
    for i, (a, b) in enumerate(steps):
        cx = 80 + i * 130
        d.rounded_rectangle((cx - 39, 650, cx + 39, 728), radius=16, fill=(7, 25, 54, 200), outline=(77, 190, 255, 170), width=2)
        text(d, (cx, 674), str(i + 1), 26, "#ffffff", bold=True, anchor="ma")
        text(d, (cx, 758), a, 19, "#ffffff", bold=True, anchor="ma")
        text(d, (cx, 790), b, 15, "#c7dcef", anchor="ma")
        if i < 4:
            arrow(d, (cx + 50, 690), (cx + 78, 690), width=2)
    card(d, (52, 860, 590, 958), "New premise:", "Software understands you, then helps you finish the work.")
    glow(d, (960, 462), 120, color=(104, 92, 255), rings=9)
    text(d, (960, 405), "AI", 86, "#ffffff", bold=True, anchor="ma")
    text(d, (960, 508), "INTENT ENGINE", 28, "#70e2ff", bold=True, anchor="ma")
    cards = [
        ("Search", "find information", 1190, 175),
        ("Analyze data", "process evidence", 1190, 310),
        ("Generate report", "write output", 1190, 445),
        ("Suggest actions", "recommend next steps", 1190, 580),
        ("Deliver", "send result", 1190, 715),
    ]
    for title, body, x, y in cards:
        card(d, (x, y, x + 285, y + 94), title, body)
        arrow(d, (1030, 462), (x, y + 47), width=2)
    save(img, "en-01-04-ai-understand-human.png")


def ai_core():
    w, h = 1536, 1024
    img = canvas(w, h, 15)
    d = ImageDraw.Draw(img)
    text(d, (768, 46), "AI NATIVE", 38, "#ffffff", bold=True, anchor="ma")
    text(d, (768, 96), "Redesign software around AI as the core", 24, "#cce7ff", anchor="ma")
    glow(d, (768, 505), 150, color=(108, 92, 255), rings=10)
    text(d, (768, 452), "AI", 92, "#ffffff", bold=True, anchor="ma")
    text(d, (768, 552), "CORE", 40, "#63dcff", bold=True, anchor="ma")
    nodes = [
        ("MEMORY", "long-term context", 768, 220),
        ("TOOLS", "call capabilities", 430, 300),
        ("BROWSER", "retrieve information", 1088, 300),
        ("CALENDAR", "manage time", 1220, 520),
        ("EMAIL", "communicate", 1120, 740),
        ("DATABASE", "structured data", 768, 820),
        ("CODE", "build systems", 430, 740),
        ("GITHUB", "version control", 285, 520),
    ]
    for title, body, x, y in nodes:
        arrow(d, (768, 505), (x, y), width=2)
        glow(d, (x, y), 58, rings=5)
        d.ellipse((x - 58, y - 58, x + 58, y + 58), fill=(5, 25, 48, 170), outline=(58, 205, 255, 180), width=2)
        text(d, (x, y - 14), title, 24, "#e9f9ff", bold=True, anchor="ma")
        text(d, (x, y + 21), body, 18, "#bcd8ef", anchor="ma")
    save(img, "en-01-05-ai-native-core.png")


def evolution():
    w, h = 1536, 1024
    img = canvas(w, h, 20)
    d = ImageDraw.Draw(img)
    text(d, (54, 56), "AI NATIVE", 24, "#bfdfff", bold=True)
    text(d, (54, 110), "The Evolution of Software,\nThe Liberation of People", 52, "#ffffff", bold=True, spacing=12)
    text(d, (58, 260), "From tools to partners. From commands to collaboration.\nFrom apps to agents.", 24, "#d5e8f9", spacing=8)
    yline = 760
    d.line((70, yline, 1435, 545), fill=(118, 206, 255, 220), width=4)
    periods = [
        ("1990s", "Desktop Software", "Tools in hand,\nefficiency improves.", 120, 695),
        ("2000s", "Internet Era", "Connecting the world,\ninformation explodes.", 350, 660),
        ("2010s", "Mobile App Era", "Rich apps,\nalways within reach.", 580, 625),
        ("2020s", "AI Copilot Era", "Conversation,\nAI assists completion.", 810, 590),
        ("2025+", "AI Native Era", "Understand intent,\nproactively execute.", 1040, 555),
        ("Future", "Agent Era", "Autonomous planning,\ncollaborative execution.", 1270, 510),
    ]
    for year, title, body, x, y in periods:
        d.line((x, y + 30, x, 880), fill=(95, 168, 230, 70), width=2)
        d.ellipse((x - 8, yline - (x - 70) * 215 / 1365 - 8, x + 8, yline - (x - 70) * 215 / 1365 + 8), fill=(255, 255, 255, 240))
        text(d, (x - 45, y - 100), year, 33, "#ffffff", bold=True)
        text(d, (x - 45, y - 55), title, 22, "#eaf5ff", bold=True)
        text(d, (x - 45, y + 8), body, 18, "#bfd6eb", spacing=7)
    arrow(d, (70, yline), (1435, 545), width=4)
    text(d, (768, 950), "The future is here. It is just not evenly distributed yet.", 26, "#d8ecff", anchor="ma")
    save(img, "en-01-07-software-evolution.png")


def main():
    OUT.mkdir(exist_ok=True)
    adapt_machine()
    rule_based()
    ai_understands()
    ai_core()
    evolution()


if __name__ == "__main__":
    main()
