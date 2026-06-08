# Prompt 翻译与编辑

一个用于处理 prompt 标签文本的小工具。输入逗号分隔的标签后，可以调用兼容 OpenAI Chat Completions 的接口翻译到指定语言，并保留标签列表的编辑、删除和复制流程。

## 功能

- 按逗号解析 prompt/tag 列表。
- 支持 OpenAI 默认接口或自定义兼容接口。
- 支持配置 API Key、模型和目标语言。
- 支持浅色、深色和跟随系统主题。
- 支持复制处理后的标签结果。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

