# Beszel-Weight

## 介绍
一个用于监控 [Beszel-Hub](https://beszel.dev/zh/) 服务器的 iOS 小组件。

## 安装

1. 将 `widget.tsx` 或 `widget1.tsx` 文件复制到 Scripting App 中。
2. 按需修改文件名或内容。

## 配置参数

长按小组件，编辑小组件，在 Parameter 中传入 JSON 配置，格式如下：

```json
{
  "beszelURL": "https://your-beszel-url",
  "apiToken": "your-pocketbase-api-token",
  "serverName": "your-server-name（Beszel 中的名称）"
}
```

- `beszelURL`：PocketBase 服务地址，例如 `https://pb.example.com`。
- `apiToken`：PocketBase 的 API Token（见下文获取方法）。
- `serverName`：你要监控的服务器名称。

## 如何获取 PocketBase API Token

1. 登录 Beszel 的管理面板。
2. 点击右上角的头像 -》 `系统` 进入 PocketBase 后台。
3. 点击 System -》 `_superusers` 表，找到你的账户。
4. 点击右上角 `Impersonate` 按钮
5. 输入 Token 有效期，生成 Token。
6. 将其填入上方配置。

## 运行

- 支持参数化配置，便于多服务器监控。

## 其他

- `widget.tsx` 和 `widget1.tsx` 展示样式略有不同，可根据需求选择。
- 如需自定义 UI，可修改对应 tsx 文件。