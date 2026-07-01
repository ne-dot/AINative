# AI Native

> AI Native 时代的认知、产品、开发与创业思考。

这个仓库用于沉淀一组关于 **AI Native** 的长期内容。

它不是一个短期热点合集，也不是工具教程集合，而是希望持续回答一个更底层的问题：

> **AI 到底会如何重新定义软件？**

过去的软件围绕功能设计。

未来的软件可能会围绕目标设计。

过去，是人学习软件。

未来，是软件学习人。

这组文章试图从软件范式、产品形态、交互方式、开发者机会等角度，系统记录这次变化。

---

## 当前内容

### Season 1：AI Native 基础认知

Season 1 主要建立基础世界观，先回答“为什么 AI Native 重要”。

| 章节 | 标题 | 核心问题 |
|---|---|---|
| 00 | [AI Native：立项、愿景与目标](./00%20AI%20Native%EF%BC%9A%E7%AB%8B%E9%A1%B9%E3%80%81%E6%84%BF%E6%99%AF%E4%B8%8E%E7%9B%AE%E6%A0%87.md) | 为什么要做这个长期内容项目 |
| 00 | [AI Native：内容大纲](./00%20AI%20Native:%20%E5%86%85%E5%AE%B9%E5%A4%A7%E7%BA%B2.md) | 整个系列如何规划 |
| 01 | [AI Native：软件时代，真的变了](./01%20AI%20Native%EF%BC%9A%E8%BD%AF%E4%BB%B6%E6%97%B6%E4%BB%A3%EF%BC%8C%E7%9C%9F%E7%9A%84%E5%8F%98%E4%BA%86.md) | 为什么软件开始理解人 |
| 02 | [AI Native 为什么不是一次功能升级，而是一种新的软件范式](./02%20AI%20Native%20%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E6%98%AF%E4%B8%80%E6%AC%A1%E5%8A%9F%E8%83%BD%E5%8D%87%E7%BA%A7%EF%BC%8C%E8%80%8C%E6%98%AF%E4%B8%80%E7%A7%8D%E6%96%B0%E7%9A%84%E8%BD%AF%E4%BB%B6%E8%8C%83%E5%BC%8F.md) | 为什么软件从功能驱动走向目标驱动 |
| 03 | [AI Native：什么是真正的 AI Native](./03%20AI%20Native%EF%BC%9A%E4%BB%80%E4%B9%88%E6%98%AF%E7%9C%9F%E6%AD%A3%E7%9A%84%20AI%20Native.md) | 真正的 AI Native 需要哪些底层能力 |
| 04 | [AI Native：为什么 Prompt 不是未来](./04%20AI%20Native%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20Prompt%20%E4%B8%8D%E6%98%AF%E6%9C%AA%E6%9D%A5.md) | 为什么 Prompt 会退居幕后 |
| 05 | [AI Native：为什么 AI 会成为下一代软件入口](./05%20AI%20Native%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%20AI%20%E4%BC%9A%E6%88%90%E4%B8%BA%E4%B8%8B%E4%B8%80%E4%BB%A3%E8%BD%AF%E4%BB%B6%E5%85%A5%E5%8F%A3.md) | 为什么 AI 可能成为新的软件入口 |
| 06 | [AI Native：独立开发者未来的发展方向](./06%20AI%20Native%EF%BC%9A%E7%8B%AC%E7%AB%8B%E5%BC%80%E5%8F%91%E8%80%85%E6%9C%AA%E6%9D%A5%E7%9A%84%E5%8F%91%E5%B1%95%E6%96%B9%E5%90%91.md) | 独立开发者如何在 AI Native 生态中创造价值 |

---

## 核心观点

这个系列目前围绕几个判断展开：

- **AI Native 不是 App + AI**：不是给传统软件加一个聊天框，而是围绕 AI 重新设计软件。
- **软件正在从功能驱动走向目标驱动**：用户不再只是在寻找功能，而是在表达目标。
- **真正的 AI Native 需要四种能力**：理解、记忆、工具、执行。
- **Prompt 不是最终形态**：Prompt 会继续存在，但会越来越多地退到产品后台。
- **AI 可能成为下一代软件入口**：用户先表达目标，再由 AI 调度工具、服务和软件。
- **独立开发者的机会正在变化**：未来不只做 App，也可以做能力、工具、框架和基础设施。

---

## 仓库结构

```text
.
├── 00 AI Native：立项、愿景与目标.md
├── 00 AI Native: 内容大纲.md
├── 01-06 AI Native 系列文章
├── images/     # 文章配图
├── prompts/    # 配图生成提示词
└── tools/      # 发布与生成工具
```

## Medium 发布辅助

把 Markdown 转成 Medium 可粘贴的 HTML：

```bash
python3 tools/medium_publish_helper.py "01 AI Native: The Software Era Has Really Changed.md" --copy none
```

输出文件会生成到 `dist/medium/`。没有配置图床时，图片会先使用本地 `file://` 地址，适合预览，不适合直接发到 Medium。

使用当前 GitHub 仓库作为图床，不需要 token：

```bash
python3 tools/medium_publish_helper.py "01 AI Native: The Software Era Has Really Changed.md" --uploader repo
```

这个模式会根据 `origin` 自动生成 `raw.githubusercontent.com` 图片地址。使用前需要先把图片 commit 并 push 到公开仓库，否则 Medium 访问不到图片。

使用 GitHub API 上传到指定仓库，需要 token：

```bash
export GITHUB_TOKEN="你的 token"
export MEDIUM_IMAGE_GITHUB_REPO="owner/repo"
export MEDIUM_IMAGE_GITHUB_BRANCH="main"
export MEDIUM_IMAGE_GITHUB_DIR="ai-native/medium"

python3 tools/medium_publish_helper.py "01 AI Native: The Software Era Has Really Changed.md" --uploader github
```

脚本会上传本地图片、替换图片 URL、生成 HTML，并尝试把富文本 HTML 放进 macOS 剪贴板。然后打开 Medium 新文章页，`Cmd + A`、`Cmd + V` 即可。GitHub 仓库需要是公开仓库，否则 Medium 读不到图片。

---

## 内容原则

- **长期主义**：少追热点，多讨论长期问题。
- **第一性原理**：不仅回答是什么，更回答为什么。
- **Markdown 优先**：Markdown 是正式原稿，也是唯一内容源。
- **一次创作，多次发布**：文章、PPT、视频脚本、视频都基于同一份 Markdown 衍生。

---

## 后续计划

后续内容会继续扩展到：

- AI Native 产品设计
- AI Native 技术架构
- Memory、Tool Calling、Workflow、Agent、MCP
- Cursor、Perplexity、ChatGPT、Claude 等产品案例
- 独立开发者与 AI Native 创业机会

Season 1 只是起点。

这个仓库会随着 AI Native 时代的发展持续更新。
