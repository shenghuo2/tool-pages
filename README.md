# shenghuo2/tool-pages

`tool-pages` 收集 shenghuo2 日常使用的小工具。它们主要是用 AI 快速构建出来，用来满足自己的具体需求；如果网上没有找到合适、轻量、顺手的项目，就在这里单独做一个页面。

`main` 分支是 shenghuo2 的实验室导航页，用相对路径跳转到各个工具页面。

## 分支与工具

这个仓库按分支管理小工具：`main` 分支只放项目说明和导航页，每个工具放在自己的分支里。

| 分支 | 导航路径 | 工具 | 说明 |
| --- | --- | --- | --- |
| `prompt-trans-and-edit` | `./sd-trans/` | `sd-trans` | 对于 SD 格式的 Prompt 接入大模型快速翻译、方便调整。 |
| `img-compare` | `./img-compare/` | `img-compare` | 以叠加形式比较两张图片，对于分辨率不同的两张图片会进行缩放处理。 |
| `shenghuo2-nienie-emotes` | `./emotes/` | `shenghuo2-nienie-emotes` | 使用 EmoteLab 生成的 OC 表情包合集。 |

## 本地结构

为了在本地同时维护多个分支，可以把每个分支 checkout 到独立目录：

```text
tool-pages/
  main/
  sd-trans/
  img-compare/
  emotes/
```

`main` 分支顶层使用 Git submodule/gitlink 指向各工具分支，因此 GitHub 会显示成 `目录名 @ commit`，可以直接跳到对应分支提交。导航页中的工具入口使用相对路径，例如 `./img-compare/`。

## 开发

进入对应工具目录后安装依赖并启动：

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```
