# AI Native Motion

Season 1 科普视频的说明动画工程，基于 [Remotion](https://www.remotion.dev/)（React + TypeScript）。

## 快速开始

```bash
cd motion
npm install
npm run dev
```

浏览器打开 Remotion Studio，预览 `FlowTraditional` 与 `FlowAiNative`。

## 渲染

```bash
npm run render:flow-traditional
npm run render:flow-ai-native
```

输出到 `motion/out/`。

## 目录

```text
motion/
├── src/
│   ├── compositions/   # 动画母版（FlowDiagram、HubDiagram…）
│   └── theme/          # 颜色、字体等视觉规范
├── stories/            # 每期 JSON 配置（改这里即可重导出）
└── out/                # 渲染产物
```

## 修改动画内容

编辑 `stories/*.json` 中的 `steps`、`title`、`footer`，保存后在 Studio 刷新或重新 render。

后续计划新增：
- `HubDiagram`：AI 中心调度 tools / database
- `Timeline`：软件演进时间轴
- 竖版 9:16 composition（抖音）
