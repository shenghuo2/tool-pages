# shenghuo2-nienie-emotes

使用 EmoteLab 生成的 OC 表情包合集。

## 内容

- `public/emotes/`: 英文 snake_case 文件名的 GIF 表情包。
- `src/data/emotes.js`: 网站使用的内部搜索索引数据源。
- `src/data/emoteSearchIndex.js`: 由脚本生成的中文、英文、拼音搜索索引。

## 功能

- 表情包预览和分页浏览。
- 支持中文、英文、拼音搜索。
- 支持复制表情包链接和下载使用。

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
