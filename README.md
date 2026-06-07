# shenghuo2 的捏捏表情包

一个基于 Vite、React 和 MUI 的表情包预览与使用网站。

## 内容

- `public/emotes/`: 111 个英文 snake_case 文件名的 GIF 表情包。
- `src/data/emotes.js`: 网站使用的内部搜索索引数据源。
- `src/data/emoteSearchIndex.js`: 由脚本生成的中文、英文、拼音搜索索引。

## 开发

```bash
npm install
npm run build:search
npm run dev
```

## 构建

```bash
npm run build
```

## 静态部署

构建后部署整个 `dist` 文件夹，不能只上传 `dist/index.html`。

`dist` 中的 `assets/`、`emotes/`、`favicon.ico`、`favicon.png` 都需要和 `index.html` 放在同一级目录。
