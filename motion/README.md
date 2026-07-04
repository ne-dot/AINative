# AI Native Motion

Season 1 科普视频的说明动画，基于 [Remotion](https://www.remotion.dev/)。

## 预览

```bash
cd motion
npm install
npm run dev
```

浏览器打开 Remotion Studio，预览：

- `AiBrainOrbitDemo` — icon 围绕 AI 核心 3D 旋转（`public/` + `staticFile()`）
- `TransformsDemo` — 五种 CSS 变换（opacity / scale / skew / translate / rotate）
- `SequenceDemo` — Sequence 分段：Hello → World
- `SpringHelloDemo` — spring + useCurrentFrame 入门
- `AbsoluteFillDemo` — AbsoluteFill 图层叠加
- `FlowTraditional` / `FlowAiNative` — Season 1 Flow 动画

## 渲染

```bash
npm run render:flow-traditional
npm run render:flow-ai-native
```

输出到 `motion/out/`。

## 改动画内容

编辑 `stories/*.json` 里的 `steps`、`title`、`footer`，保存后在 Studio 刷新即可。

## 目录

```text
motion/
├── public/icons/       # 静态资源（用 staticFile() 引用）
├── src/compositions/   # 动画组件
├── src/components/     # 节点、背景等
├── stories/            # 每期 JSON 配置
└── out/                # 渲染 MP4
```
