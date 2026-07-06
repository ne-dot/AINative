# AI Native Motion

Season 1 科普视频的说明动画，基于 [Remotion](https://www.remotion.dev/)。

## 预览

```bash
cd motion
npm install
npm run dev
```

浏览器打开 Remotion Studio，预览：

- `MilkTeaHeatmapDemo` — 各省奶茶店数量色阶地图（省界填色，示意数据）
- `MapDemo` — MapLibre 地图 + 北京→上海航线动画（[Maps 文档](https://www.remotion.dev/docs/maps)）
- `TransitionDemo` — TransitionSeries slide 转场（传统软件 → AI Native）
- `AiBrainOrbitDemo` — icon 围绕 AI 核心 3D 旋转（`public/` + `staticFile()`）
- `TransformsDemo` — 五种 CSS 变换（opacity / scale / skew / translate / rotate）
- `SequenceDemo` — Sequence 分段：Hello → World
- `SpringHelloDemo` — spring + useCurrentFrame 入门
- `AbsoluteFillDemo` — AbsoluteFill 图层叠加
- `FlowTraditional` / `FlowAiNative` — Season 1 Flow 动画
- `Ep02AiFeaturesAdded` — 第 02 集：四个不同软件，各自加一项 AI 能力
- `Ep02WorkflowStillOnUser` — 第 02 集：传统软件 + 用户流程链（纯视觉，无旁白文字）
- `Ep02FeatureUpgrade` — 第 02 集：旧 App 加 AI + 升级特效（3D）
- `Ep02GoalCentricOrbit` — 第 02 集：功能环绕 AI 大脑，触达目标（3D）
- `Ep02FunctionVsGoalPath` — 第 02 集：功能路径 vs 目标路径
- `Ep02ResponsibilityShift` — 第 02 集：责任从用户侧转移到系统侧
- `Ep02JudgmentStandard` — 第 02 集：判断真假 AI Native 的流程标准

## 渲染

```bash
npm run render:flow-traditional
npm run render:flow-ai-native
npm run render:ep02-ai-features-added
npm run render:ep02-workflow-still-on-user
npm run render:ep02-feature-upgrade
npm run render:ep02-goal-centric-orbit
npm run render:ep02-function-vs-goal-path
npm run render:ep02-responsibility-shift
npm run render:ep02-judgment-standard
npm run render:map-demo   # WebGL 地图需 --gl=angle --concurrency=1
```

输出到 `motion/out/`。

## 改动画内容

编辑 `stories/*.json` 里的 `steps`、`title`、`footer` 或第 02 集的责任/流程文案，保存后在 Studio 刷新即可。

## 目录

```text
motion/
├── public/geo/         # 中国省界 GeoJSON
├── public/icons/       # 静态资源（用 staticFile() 引用）
├── src/compositions/   # 动画组件
├── src/components/     # 节点、背景等
├── stories/            # 每期 JSON 配置
└── out/                # 渲染 MP4
```
