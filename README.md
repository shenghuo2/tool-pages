# sd-trans

对于 SD 格式的 Prompt 接入大模型快速翻译、方便调整。

## 功能

- 按逗号解析 SD prompt/tag 列表。
- 支持 OpenAI 默认接口或自定义兼容接口。
- 支持配置 API Key、模型和目标语言。
- 支持翻译后继续编辑、删除和复制结果。
- 支持浅色、深色和跟随系统主题。

## API 地址与 CORS

“OpenAI 兼容”模式会自动补全 `/v1/chat/completions`，基础 URL 可填写
`https://api.example.com` 或 `https://api.example.com/v1`。输入末尾的 `/` 会被自动移除，避免部分服务在重定向后的预检请求中遗漏 CORS 响应头。

本工具发布为纯静态网页，浏览器会直接请求你配置的 API。若自定义服务不允许该网页来源的 `Authorization` 和 `Content-Type` 请求，必须在该服务端开启 CORS，或通过你自己部署的受控代理转发请求；不要把 API Key 发送给公共 CORS 代理。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```
