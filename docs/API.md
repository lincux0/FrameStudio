# OpenRouter 视频接口

控制台通过仅监听 `127.0.0.1` 的本地代理调用 OpenRouter 异步 Video API：

1. `POST /api/v1/videos` 提交模型、提示词和视频设置；参考图片可选，无图时不发送 `frame_images` 或 `input_references` 字段。
2. 用响应中的任务 ID 每 5 秒轮询一次 `GET /api/v1/videos/{id}`，直到任务完成或失败；页面会同步展示准备、提交、等待和下载进度。
3. 完成后以同一个 API 密钥请求 `GET /api/v1/videos/{id}/content?index=0`，在浏览器中预览并下载结果。

图片会按模型能力映射到对应字段：Grok Imagine Video 1.5 Lite 使用 `frame_images` 设置一张 `first_frame`；Seedance 2.0 Mini 和 HeyGen 使用 `input_references` 传入多张参考图。无图时请求仅包含提示词和视频设置；纯提示词生成能力以所选模型支持情况为准。Grok 选择多张图片时，界面会要求先移除多余图片或切换模型。API 密钥只存在页面内存、请求和本机代理的转发流程中；代理不记录请求内容或密钥，也不写入文件、`localStorage`、`sessionStorage` 或 URL。

原始图片合计超过 18 MiB 时，浏览器会先将图片缩放并压缩，再提交给代理；普通模型使用 WebP，HeyGen 会将每张图片压到 3.6 MB 以内并转为 JPEG，避免超过单张 Base64 图片 5 MB 的上限。原图只用于本地处理和预览；压缩后仍超限时会提示减少图片数量。

排查连接问题时，`GET /health` 只检查本机服务。若它返回 200 但任务轮询或视频下载失败，请查看运行服务的终端；代理会记录转发路径及不含密钥的网络错误。

服务会在支持的 Node.js 版本中读取 `HTTPS_PROXY`、`HTTP_PROXY` 和 `NO_PROXY` 配置，避免绕过本机已设置的网络代理。

模型可用参数会变化；界面按模型提供时长、清晰度和画幅选项。HeyGen 多参考图模式将上传图片放入 `input_references`。若 OpenRouter 返回参数校验错误，以错误信息和 [视频生成官方文档](https://openrouter.ai/docs/guides/overview/multimodal/video-generation) 为准。

## 模型

- `x-ai/grok-imagine-video-1.5-lite`：1–15 秒，支持 480p、720p、1080p。
- `bytedance/seedance-2.0-mini`：4–15 秒，支持 480p、720p。
- `heygen/heygen-video-1`：5–15 秒，支持 480p、768p、2K；可使用多张图片作为参考素材。

模型能力和价格可能调整，提交时以 OpenRouter 的实际可用情况为准。视频生成不支持零数据保留；生成过程需要服务商短暂保存输出以供下载。

