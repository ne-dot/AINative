# AI Native

> AI Native 时代的认知、产品、开发与创业思考。

这个仓库用于沉淀一组关于 **AI Native** 的长期内容。

它不是一个短期热点合集，也不是工具教程集合，而是希望持续回答一个更底层的问题：

> **AI 到底会如何重新定义软件？**

---

## 仓库结构

```text
.
├── README.md
├── doc/                    # 文档与内容原稿
│   ├── 00 AI Native: 内容大纲.md
│   ├── season 1/           # Season 1：基础认知（01–06）
│   │   ├── articles…       # Markdown 正文
│   │   ├── prompts/        # 配图提示词
│   │   ├── images/         # 配图
│   │   ├── video-scripts/  # 视频脚本
│   │   └── exports/        # Word 等导出文件
│   └── season 2/           # Season 2：产品设计（规划中）
├── tools/                  # 发布与生成工具
├── motion/                 # 科普视频说明动画（Remotion）
└── dist/                   # 构建输出（gitignore）
```

---

## Season 1：AI Native 基础认知

| 章节 | 标题 | 核心问题 |
|------|------|----------|
| 00 | [立项、愿景与目标](./doc/season%201/00%20AI%20Native%EF%BC%9A%E7%AB%8B%E9%A1%B9%E3%80%81%E6%84%BF%E6%99%AF%E4%B8%8E%E7%9B%AE%E6%A0%87.md) | 为什么要做这个长期内容项目 |
| 00 | [内容大纲](./doc/00%20AI%20Native:%20%E5%86%85%E5%AE%B9%E5%A4%A7%E7%BA%B2.md) | 整个系列如何规划 |
| 01 | [软件时代，真的变了](./doc/season%201/01%20AI%20Native%EF%BC%9A%E8%BD%AF%E4%BB%B6%E6%97%B6%E4%BB%A3%EF%BC%8C%E7%9C%9F%E7%9A%84%E5%8F%98%E4%BA%86.md) | 为什么软件开始理解人 |
| 02 | [新的软件范式](./doc/season%201/02%20AI%20Native%20%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E6%98%AF%E4%B8%80%E6%AC%A1%E5%8A%9F%E8%83%BD%E5%8D%87%E7%BA%A7%EF%BC%8C%E8%80%8C%E6%98%AF%E4%B8%80%E7%A7%8D%E6%96%B0%E7%9A%84%E8%BD%AF%E4%BB%B6%E8%8C%83%E5%BC%8F.md) | 从功能驱动到目标驱动 |
| 03 | [什么是真正的 AI Native](./doc/season%201/03%20AI%20Native%EF%BC%9A%E4%BB%80%E4%B9%88%E6%98%AF%E7%9C%9F%E6%AD%A3%E7%9A%84%20AI%20Native.md) | 理解、记忆、工具、执行 |
| 04 | [为什么 Prompt 不是未来](./doc/season%201/04%20AI%20Native%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20Prompt%20%E4%B8%8D%E6%98%AF%E6%9C%AA%E6%9D%A5.md) | Prompt 会退居幕后 |
| 05 | [AI 成为下一代软件入口](./doc/season%201/05%20AI%20Native%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20AI%20%E4%BC%9A%E6%88%90%E4%B8%BA%E4%B8%8B%E4%B8%80%E4%BB%A3%E8%BD%AF%E4%BB%B6%E5%85%A5%E5%8F%A3.md) | AI 调度工具与服务 |
| 06 | [独立开发者未来的方向](./doc/season%201/06%20AI%20Native%EF%BC%9A%E7%8B%AC%E7%AB%8B%E5%BC%80%E5%8F%91%E8%80%85%E6%9C%AA%E6%9D%A5%E7%9A%84%E5%8F%91%E5%B1%95%E6%96%B9%E5%90%91.md) | 从做 App 到做能力 |

---

## 核心观点

- **AI Native 不是 App + AI**：围绕 AI 重新设计软件，不是加一个聊天框。
- **软件从功能驱动走向目标驱动**：用户表达目标，而不是找功能。
- **四能力**：理解、记忆、工具、执行。
- **Prompt 会退居幕后**：Prompt 是中间语言，不是最终形态。
- **AI 可能成为下一代软件入口**。
- **独立开发者的机会在变化**：能力、工具、基础设施同样有价值。

---

## Medium 发布

```bash
python3 tools/medium_publish_helper.py \
  "doc/season 1/01 AI Native: The Software Era Has Really Changed.md" \
  --copy none
```

输出到 `dist/medium/`。使用 GitHub 仓库图床：

```bash
python3 tools/medium_publish_helper.py \
  "doc/season 1/01 AI Native: The Software Era Has Really Changed.md" \
  --uploader repo
```

---

## 视频说明动画

科普视频说明动画在 `motion/`（Remotion 工程）：

```bash
cd motion && npm install && npm run dev
```

详见 [motion/README.md](./motion/README.md)。

---

## 内容原则

- **长期主义**：少追热点，多讨论长期问题。
- **第一性原理**：不仅回答是什么，更回答为什么。
- **Markdown 优先**：Markdown 是正式原稿，也是唯一内容源。
- **一次创作，多次发布**：文章、视频脚本、动画、多平台发布基于同一份内容衍生。
