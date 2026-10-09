# Frame Studio

本地网页控制台，用于选择 OpenRouter 视频模型、填写提示词，可选上传参考图片，然后生成/下载 MP4。留空参考图时会按纯提示词提交文生视频请求。

## 启动

需要 Node.js 18 或更新版本。打开 PowerShell，进入本目录并运行：

```powershell
node server.mjs
```

然后访问 <http://127.0.0.1:8765>。结束使用时，在 PowerShell 按 `Ctrl+C`。

若页面显示“Failed to fetch”或无法连接本机视频服务，请确认服务进程仍在运行，并检查浏览器地址是否以 `http://127.0.0.1:8765` 开头；不要直接双击打开 `index.html`。若页面能访问但显示 OpenRouter 错误，请检查本机网络是否能访问 OpenRouter，以及密钥和账户额度。

## 使用

在页面填写 OpenRouter API 密钥，选择模型并填写提示词；参考图可留空，也可上传 PNG、JPG 或 WebP 图片。补充视频设置后点击“生成视频”。生成任务会异步运行，完成后页面会显示预览和下载按钮。纯提示词模式是否可用取决于所选模型。

密钥仅保留在当前页面内存中，不会写入浏览器存储或服务端文件。浏览器把请求发给仅监听本机的轻量代理，再由代理转发给 OpenRouter；图片和提示词会交由 OpenRouter 及其模型提供方处理。每次提交都会产生费用。

若系统配置了 `HTTPS_PROXY` / `HTTP_PROXY`，服务会自动使用该代理访问 OpenRouter；启动时会说明是否已启用。

接口细节与当前模型能力见 [docs/API.md](docs/API.md)。

