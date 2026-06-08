# shenghuo2/tool-pages

`tool-pages` 收集 shenghuo2 日常使用的小工具。它们主要是用 AI 快速构建出来，用来满足自己的具体需求；如果网上没有找到合适、轻量、顺手的项目，就在这里单独做一个页面。

## 分支与工具

这个仓库按分支管理小工具：`main` 分支只放项目说明和索引，每个工具放在自己的分支里。

| 分支 | 工具 | 说明 |
| --- | --- | --- |
| `shenghuo2-nienie-emotes` | 捏捏表情包 | 表情包预览、搜索与使用页面。 |
| `prompt-trans-and-edit` | Prompt 翻译与编辑 | 面向 prompt 文本的翻译、改写和编辑辅助页面。 |
| `img-compare` | 图片对比 | 用于对比两张图片差异的小工具。 |

## 本地结构

为了在本地同时维护多个分支，可以把每个分支 checkout 到独立目录：

```text
tool-pages/
  main/
  shenghuo2-nienie-emotes/
  prompt-trans-and-edit/
  img-compare/
```

`main/` 下直接放了指向这些本地工作目录的软链接，方便从主目录跳转，也方便在 GitHub 上看到各工具入口：

- `shenghuo2-nienie-emotes` -> `../shenghuo2-nienie-emotes`
- `prompt-trans-and-edit` -> `../prompt-trans-and-edit`
- `img-compare` -> `../img-compare`

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
