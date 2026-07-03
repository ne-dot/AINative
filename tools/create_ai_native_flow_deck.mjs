import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const outDir = "/Users/zj/Documents/深度/AI Native/outputs";
const previewDir = "/private/tmp/codex-presentations/ai-native-flow/tmp/preview";
const finalPptx = path.join(outDir, "ai-native-traditional-flow-animation-keynote.pptx");

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

const W = 1280;
const H = 720;
const nodes = [
  { title: "人", sub: "提出需求", x: 238, kind: "person" },
  { title: "学习软件", sub: "理解规则", x: 506, kind: "book" },
  { title: "操作软件", sub: "点击按钮", x: 774, kind: "cursor" },
  { title: "得到结果", sub: "等待反馈", x: 1042, kind: "screen" },
];
const y = 315;
const r = 58;
const blue = "#22a7ff";
const pale = "#dcecff";
const dimBlue = "#164f80";
const dimText = "#6f86a2";

const deck = Presentation.create({ slideSize: { width: W, height: H } });

function addText(slide, text, pos, style) {
  const t = slide.shapes.add({
    geometry: "textbox",
    position: pos,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  t.text = text;
  t.text.style = style;
  return t;
}

function addGlow(slide, cx, cy, radius, active) {
  if (!active) return;
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: cx - radius, top: cy - radius, width: radius * 2, height: radius * 2 },
    fill: "#073b66",
    line: { style: "solid", fill: "none", width: 0 },
  });
}

function addIcon(slide, cx, cy, kind, active) {
  const color = active ? pale : dimText;
  if (kind === "person") {
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: cx - 15, top: cy - 31, width: 30, height: 30 },
      fill: color,
      line: { style: "solid", fill: "none", width: 0 },
    });
    slide.shapes.add({
      geometry: "arc",
      position: { left: cx - 30, top: cy - 1, width: 60, height: 44 },
      fill: color,
      line: { style: "solid", fill: color, width: 2 },
    });
  }
  if (kind === "book") {
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: cx - 35, top: cy - 28, width: 31, height: 56 },
      fill: "#0b2440",
      line: { style: "solid", fill: color, width: 3 },
      borderRadius: 6,
    });
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: cx + 4, top: cy - 28, width: 31, height: 56 },
      fill: "#0b2440",
      line: { style: "solid", fill: color, width: 3 },
      borderRadius: 6,
    });
    slide.shapes.add({
      geometry: "line",
      position: { left: cx, top: cy - 30, width: 0, height: 60 },
      fill: "none",
      line: { style: "solid", fill: color, width: 2 },
    });
  }
  if (kind === "cursor") {
    slide.shapes.add({
      geometry: "custom",
      position: { left: cx - 28, top: cy - 36, width: 64, height: 76, rotation: -10 },
      fill: color,
      line: { style: "solid", fill: color, width: 2 },
      customPaths: [{
        width: 64,
        height: 76,
        commands: [
          { moveTo: { x: 8, y: 6 } },
          { lineTo: { x: 8, y: 60 } },
          { lineTo: { x: 24, y: 45 } },
          { lineTo: { x: 36, y: 70 } },
          { lineTo: { x: 50, y: 64 } },
          { lineTo: { x: 38, y: 40 } },
          { lineTo: { x: 60, y: 40 } },
          { close: {} },
        ],
      }],
    });
    if (active) {
      for (const [dx, dy, rot] of [[28, -28, 20], [38, -8, 75], [12, -42, -20]]) {
        slide.shapes.add({
          geometry: "line",
          position: { left: cx + dx, top: cy + dy, width: 18, height: 0, rotation: rot },
          fill: "none",
          line: { style: "solid", fill: blue, width: 2 },
        });
      }
    }
  }
  if (kind === "screen") {
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: cx - 38, top: cy - 32, width: 76, height: 52 },
      fill: "#0b2440",
      line: { style: "solid", fill: color, width: 3 },
      borderRadius: 5,
    });
    slide.shapes.add({
      geometry: "line",
      position: { left: cx, top: cy + 20, width: 0, height: 20 },
      fill: "none",
      line: { style: "solid", fill: color, width: 3 },
    });
    slide.shapes.add({
      geometry: "line",
      position: { left: cx - 24, top: cy + 41, width: 48, height: 0 },
      fill: "none",
      line: { style: "solid", fill: color, width: 3 },
    });
    if (active) {
      addText(slide, "✓", { left: cx - 21, top: cy - 28, width: 42, height: 42 }, {
        fontSize: 36,
        bold: true,
        color: blue,
        alignment: "center",
      });
    }
  }
}

function addNode(slide, node, active) {
  addGlow(slide, node.x, y, 84, active);
  slide.shapes.add({
    geometry: "ellipse",
    position: { left: node.x - r, top: y - r, width: r * 2, height: r * 2 },
    fill: active ? "#092746" : "#061827",
    line: { style: "solid", fill: active ? blue : dimBlue, width: active ? 3 : 2 },
  });
  addIcon(slide, node.x, y, node.kind, active);
  addText(slide, node.title, { left: node.x - 72, top: y + 86, width: 144, height: 30 }, {
    fontSize: 25,
    bold: true,
    color: active ? "#ffffff" : dimText,
    alignment: "center",
  });
  addText(slide, node.sub, { left: node.x - 80, top: y + 124, width: 160, height: 28 }, {
    fontSize: 20,
    color: active ? "#d8e8f6" : dimText,
    alignment: "center",
  });
}

function addArrow(slide, fromX, toX, active) {
  const start = fromX + 80;
  const width = toX - fromX - 160;
  slide.shapes.add({
    geometry: "line",
    position: { left: start, top: y, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: active ? blue : dimBlue, width: active ? 3 : 2 },
  });
  slide.shapes.add({
    geometry: "triangle",
    position: { left: start + width - 5, top: y - 9, width: 18, height: 18, rotation: 90 },
    fill: active ? blue : dimBlue,
    line: { style: "solid", fill: "none", width: 0 },
  });
}

function addSlide(step) {
  const slide = deck.slides.add();
  slide.background.fill = "#030914";
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: W, height: H },
    fill: "#030914",
    line: { style: "solid", fill: "none", width: 0 },
  });
  for (let i = 0; i < 22; i++) {
    const x = (i * 137) % W;
    const top = 40 + ((i * 83) % 560);
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: x, top, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2 },
      fill: i % 4 === 0 ? "#1d8dd8" : "#0b3557",
      line: { style: "solid", fill: "none", width: 0 },
    });
  }
  addText(slide, "传统软件的使用链路", { left: 0, top: 96, width: W, height: 54 }, {
    fontSize: 38,
    bold: true,
    color: "#f5fbff",
    alignment: "center",
  });
  addText(slide, "人必须先理解软件规则，再一步步操作功能", { left: 0, top: 156, width: W, height: 34 }, {
    fontSize: 22,
    color: "#9db5cc",
    alignment: "center",
  });

  const activeNodes = Math.min(4, Math.floor((step + 1) / 2));
  const activeArrows = Math.min(3, Math.floor(step / 2));

  for (let i = 0; i < 3; i++) addArrow(slide, nodes[i].x, nodes[i + 1].x, i < activeArrows);
  for (let i = 0; i < nodes.length; i++) addNode(slide, nodes[i], i < activeNodes);

  if (step >= 7) {
    slide.shapes.add({
      geometry: "roundRect",
      position: { left: 366, top: 560, width: 548, height: 68 },
      fill: "#051d31",
      line: { style: "solid", fill: blue, width: 2 },
      borderRadius: 6,
    });
    addText(slide, "核心逻辑：人适应软件的规则和流程", { left: 380, top: 578, width: 520, height: 34 }, {
      fontSize: 25,
      bold: true,
      color: "#eaf7ff",
      alignment: "center",
    });
  }

  return slide;
}

for (let step = 0; step < 8; step++) addSlide(step);

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(previewDir, `${stem}.png`), png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(previewDir, `${stem}.layout.json`), await layout.text());
}

const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
await writeBlob(path.join(previewDir, "montage.webp"), montage);

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(finalPptx);

console.log(finalPptx);
console.log(path.join(previewDir, "montage.webp"));
