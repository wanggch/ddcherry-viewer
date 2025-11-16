# Mermaid 图表保存相关接口设计

本文档用于指导后端同学实现前端依赖的登录与图表保存接口，确保 Mermaid 在线可视化工具的保存功能可以顺利落地。

## 通用说明

- 所有接口统一使用 `/api` 作为前缀。
- 建议使用基于 Session/Cookie 的身份校验方式，前端会在请求中自动携带 `credentials: include`。
- 所有响应使用 `application/json`，并包含 `code`（业务状态码，可选）、`message`（人类可读描述）、`data`（业务数据）字段。
- 出现错误时返回相应的 HTTP 状态码，并在 JSON 中写明错误信息，方便前端展示。

## 1. 登录接口

### 请求

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

### 响应

- **200 OK**

```json
{
  "message": "登录成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "displayName": "string"
    }
  }
}
```

后端需在成功登录后下发会话 Cookie，供后续保存接口校验登录状态。

### 失败示例

- **401 Unauthorized**（账号或密码错误）

```json
{
  "message": "用户名或密码错误"
}
```

- **429 Too Many Requests**（登录尝试频率限制）

```json
{
  "message": "尝试次数过多，请稍后再试"
}
```

## 2. 会话状态检查接口

前端在页面初始化时会调用该接口，判断用户是否已登录。

### 请求

- **Method**: `GET`
- **URL**: `/api/auth/session`
- **Headers**: 自动携带 Cookie

### 响应

- **200 OK**（已登录）

```json
{
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "displayName": "string"
    }
  }
}
```

- **204 No Content** 或 **401 Unauthorized**（未登录）

在未登录的情况下，允许返回空响应或 401 状态码，前端会忽略错误并维持未登录态。

## 3. 保存图表接口

保存用户当前编辑的 Mermaid 图表数据。

### 请求

- **Method**: `POST`
- **URL**: `/api/diagrams`
- **Headers**: `Content-Type: application/json`
- **认证**: 需验证用户会话，未登录返回 401。
- **Body**:

```json
{
  "code": "Mermaid 源代码字符串",
  "theme": "mermaid 主题，如 default、dark 等",
  "svg": "渲染后的 SVG 文本，可选",
  "lastRenderedAt": "ISO 8601 时间戳"
}
```

> 说明：前端会在保存前校验 Mermaid 代码语法。`svg` 字段可用于后端直接存储渲染结果，避免再次渲染。

### 响应

- **201 Created**

```json
{
  "message": "保存成功",
  "data": {
    "diagramId": "string",
    "updatedAt": "ISO 8601 时间戳"
  }
}
```

### 失败示例

- **401 Unauthorized**（未登录）

```json
{
  "message": "请先登录后再保存"
}
```

- **422 Unprocessable Entity**（业务校验失败，例如内容过长）

```json
{
  "message": "图表内容过长",
  "details": {
    "maxLength": 20000
  }
}
```

## 4. 其他建议

- 对保存接口建议添加速率限制（Rate Limit），防止短时间内重复提交。
- 如需支持更新与历史版本，可扩展 `PUT /api/diagrams/{id}`、`GET /api/diagrams/{id}/revisions` 等接口。
- 建议所有接口在 `message` 字段中返回适合直接展示给用户的中文文案。

以上即为当前前端所需的接口约定，感谢配合。
