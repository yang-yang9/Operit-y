# Settings 子页面：AI 运行时配置（ContextSummary + ToolPermission + ExternalHttpChat）

本文档描述 Settings 中 AI 运行时行为相关的三个子页面：**上下文截断设置**（ContextSummarySettingsScreen）、**工具权限管理**（ToolPermissionSettingsScreen）与**外部 HTTP 聊天接口**（ExternalHttpChatSettingsScreen）。

## 一、ContextSummarySettingsScreen（上下文截断设置）

**源码规模：** `ContextSummarySettingsScreen.kt` 419 行。

### 1.1 组件树

```
ContextSummarySettingsScreen (CustomScaffold)
└── Column (verticalScroll)
    ├── Text: 说明文字
    ├── SectionTitle: "Truncation Settings" (ContentCut图标)
    ├── SettingsInputField: Max File Size (KB)
    ├── SettingsInputField: Part Size (行)
    ├── SettingsInputField: Max Text Result Length (KB)
    ├── SettingsInputField: Max Image History User Turns (轮)
    ├── SettingsInputField: Max Media History User Turns (轮)
    ├── Button: Reset All (RestartAlt图标)
    └── Button: Save (Save图标)

├── AlertDialog: 校验错误提示
└── Snackbar: 保存成功 (1.5秒自动消失)
```

### 1.2 5 个配置参数

| 参数 | 显示单位 | 存储单位 | 默认值 | 约束 |
|------|---------|---------|--------|------|
| Max File Size | KB | bytes (×1000) | 32KB | > 0 |
| Part Size | 行 | lines | 200 | > 0 |
| Max Text Result Length | KB | bytes (×1000) | 5KB | > 0 |
| Max Image History User Turns | 轮 | int | 2 | ≥ 0 |
| Max Media History User Turns | 轮 | int | 1 | ≥ 0 |

### 1.3 SettingsInputField 组件

```
Card (带背景色)
├── Row
│   ├── Column: 标题 + 副标题
│   └── BasicTextField (50dp宽, 纯数字+点过滤) + 单位标签
```

IME Done 键清除焦点。输入字符实时过滤为 `digits + '.'`。

### 1.4 状态管理

无 ViewModel。通过 `ApiPreferences` (DataStore) 管理。`LaunchedEffect(Unit)` 一次性加载初始值 (`flow.first()`)。Save 按钮校验全部 5 个字段后统一持久化。Reset 按钮调用 `resetTruncationSettings()` 后重新加载。

---

## 二、ToolPermissionSettingsScreen（工具权限管理）

**源码规模：** `ToolPermissionSettingsScreen.kt` 388 行。

### 2.1 组件树

```
ToolPermissionSettingsScreen
└── LazyColumn (surfaceVariant背景)
    ├── Header: 标题 + 描述
    ├── Card: 全局权限开关
    │   └── CompactPermissionLevelSelector [ALLOW | ASK | FORBID]
    ├── Card: 说明/图例
    ├── PermissionGroup (ALLOW)
    │   ├── 彩色圆点 + 标题 + Add按钮
    │   └── FlowRow: ToolChip (名称 + Close)
    └── PermissionGroup (FORBID)
        └── (同上结构)

ToolSelectorDialog (Dialog)
├── Text: 标题
├── OutlinedTextField: 搜索
├── LazyColumn: Checkbox + 工具名
└── Button: Done
```

### 2.2 权限模型

```kotlin
enum class PermissionLevel {
    ALLOW,   // 自动执行, 不询问
    ASK,     // 运行时询问 (默认)
    FORBID   // 始终禁止
}
```

**三层优先级：**
1. 工具级覆盖 (ALLOW/FORBID) — 最高优先级
2. 全局主开关 (ALLOW/ASK/FORBID) — 无覆盖时生效
3. ASK 为隐式默认 — DataStore 无记录时

### 2.3 状态管理

| 数据源 | 说明 |
|--------|------|
| `AIToolHandler.getAllToolNames()` | 所有注册工具名 (排除 `package_proxy`) |
| `ToolPermissionSystem.masterSwitchFlow` | 全局开关 Flow |
| `ToolPermissionSystem.getToolPermissionOverride()` | 逐工具查询覆盖 |
| `toolPermissions: MutableStateMap` | 本地缓存，有覆盖的工具映射 |

**切换逻辑 (`handlePermissionChange`)：** 点击已在目标级别的工具 → 移除覆盖（回到 ASK）；点击不在目标级别的工具 → 设置覆盖。即每个 Chip 是 toggle 行为。

### 2.4 ToolSelectorDialog

搜索实时过滤（不区分大小写）。Checkbox 列表中勾选/取消工具触发 `handlePermissionChange`。Done 关闭对话框。

---

## 三、ExternalHttpChatSettingsScreen（外部 HTTP 聊天接口）

**源码规模：** `ExternalHttpChatSettingsScreen.kt` 493 行。

### 3.1 组件树

```
ExternalHttpChatSettingsScreen (CustomScaffold)
└── Column (verticalScroll)
    ├── SettingsCard "Enable Service": 状态文本 + Switch
    ├── SettingsCard "Port": OutlinedTextField + Save/Restart按钮
    ├── SettingsCard "Token": 只读显示 + Copy/Reset按钮
    ├── SettingsCard "Service Status": 动态状态文本
    ├── SettingsCard "Access URLs": LAN IP列表 (可选中复制)
    ├── SettingsCard "Sync Example": curl命令 + Copy
    ├── SettingsCard "Async Example": curl命令
    ├── SettingsCard "Health Check Example": curl命令
    └── SettingsCard "Android Intent Integration": Intent说明 + ADB示例
```

### 3.2 配置项

| 设置 | 默认值 | 说明 |
|------|--------|------|
| 服务开关 | false | 启动/停止 HTTP 服务器 |
| 端口 | 8094 | 1~65535，纯数字，最多5字符 |
| Bearer Token | 自动生成 | UUID (去连字符)，只读显示，可复制/重置 |

### 3.3 HTTP API 接口

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/external-chat` | POST | 同步/异步聊天请求 |
| `/api/health` | GET | 健康检查 |

**请求参数：**
- `message` — 用户消息
- `response_mode` — `"sync"` 或 `"async_callback"`
- `show_floating` — 是否显示浮动窗口
- `initial_mode` — 初始模式
- `return_tool_status` — 是否返回工具状态
- `callback_url` — 异步回调 URL

**Android Intent API：**
- Action: `com.ai.assistance.operit.EXTERNAL_CHAT`
- Result: `com.ai.assistance.operit.EXTERNAL_CHAT_RESULT`

### 3.4 服务控制流程

```
启用:
  ensureBearerToken() → setEnabled(true)
  → AIForegroundService.ensureRunningForExternalHttp()
  → Toast

禁用:
  setEnabled(false)
  → AIForegroundService.stopExternalHttp()
  → Toast

保存端口:
  校验 1~65535 → setPort()
  → [已启用] ensureRunningForExternalHttp() 重启
  → Toast

重置 Token:
  resetBearerToken() (新 UUID)
  → 复制到剪贴板 → Toast
```

### 3.5 状态管理

无 ViewModel。通过 `ExternalHttpApiPreferences` (DataStore) 管理 3 个 Flow (enabled, port, token)。服务状态通过 `AIForegroundService.externalHttpState` (StateFlow) 实时监听。

LAN IP 通过 `ExternalChatHttpNetworkInfo.getLocalIpv4Addresses()` 获取（查询 `NetworkInterface`），curl 示例按 `remember(key)` 缓存。

---

## 四、架构要点

1. **三个轻量页面**：419 + 388 + 493 行，是 Settings 子页面中最小的一组。

2. **ContextSummary 显式保存**：唯一使用 Save 按钮的 Settings 页面（其他页面多为即时保存或防抖自动保存）。

3. **ToolPermission Toggle 模式**：点击已在目标级别的工具会移除覆盖（回到 ASK），而非无操作。

4. **ExternalHttp 前台服务耦合**：开关直接操作 `AIForegroundService` 的静态方法，服务状态通过全局 `StateFlow` 回报。

5. **均无 ViewModel**：三个页面都通过 Manager 单例 + 局部状态管理。

---

## 五、核心文件清单

| 文件 | 路径 (相对于 `ui/features/settings/screens/`) | 行数 | 职责 |
|------|------|------|------|
| **ContextSummarySettingsScreen** | `ContextSummarySettingsScreen.kt` | 419 | 5 个截断参数 |
| **ToolPermissionSettingsScreen** | `ToolPermissionSettingsScreen.kt` | 388 | 全局/工具级权限 |
| **ExternalHttpChatSettingsScreen** | `ExternalHttpChatSettingsScreen.kt` | 493 | HTTP/Intent 聊天接口 |
