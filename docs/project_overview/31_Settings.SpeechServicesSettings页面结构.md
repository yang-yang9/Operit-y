# Settings 子页面：语音服务（SpeechServicesSettings）

本文档描述 Settings 中语音服务配置页面 **SpeechServicesSettingsScreen** 的完整 UI 组件树、状态管理和交互流程。

**源码规模：** `SpeechServicesSettingsScreen.kt` 1758 行。

## 一、总体架构

语音服务统一配置中心，覆盖 TTS（文字转语音）和 STT（语音转文字）两大功能域。TTS 支持 6 种引擎类型，STT 支持 3 种引擎类型。每种引擎有独立的配置面板，500ms 防抖自动保存。

---

## 二、组件树

```
SpeechServicesSettingsScreen (CustomScaffold)
└── Column (verticalScroll)
    ├── TTS Card ────────────────────────────────────
    │   ├── Row: VolumeUp图标 + "Text-to-Speech" 标题
    │   ├── Text: 功能描述
    │   ├── ExposedDropdownMenuBox: TTS 引擎选择器 (6种)
    │   ├── Slider: 语速 (0.5x~2.0x, 6档)
    │   ├── Slider: 音调 (0.5x~2.0x, 6档)
    │   ├── TTS Cleaner 正则列表 ──────────
    │   │   ├── ForEach: Row(OutlinedTextField + Delete)
    │   │   └── Row: Add Regex + Templates下拉
    │   └── 引擎配置面板 (AnimatedVisibility, 按类型切换)
    │       ├── [HTTP_TTS] URL/Key/Headers/Method/Body/Pipeline
    │       ├── [SILICONFLOW_TTS] Key/Model/Voice预设/VoiceId
    │       ├── [MINIMAX_TTS] URL/Key/Model/VoiceId
    │       ├── [OPENAI_WS_TTS] WS URL/Key/Model/VoiceId+选择器
    │       └── [OPENAI_TTS] URL/Key/Model+刷新+选择器/Voice+刷新+选择器
    │
    ├── STT Card ────────────────────────────────────
    │   ├── Row: Mic图标 + "Speech-to-Text" 标题
    │   ├── ExposedDropdownMenuBox: STT 引擎选择器 (3种)
    │   ├── 引擎配置面板 (AnimatedVisibility)
    │   │   ├── [OPENAI_STT] Endpoint/Key/Model
    │   │   └── [DEEPGRAM_STT] Endpoint/Key/Model
    │   └── Row: 信息提示
    │
    ├── Info Card ───────────────────────────────────
    │   ├── SettingsInfoRow: TTS 说明
    │   └── SettingsInfoRow: STT 说明
    │
    └── Action Card ─────────────────────────────────
        └── OutlinedButton: "Test Text-to-Speech"
            → onNavigateToTextToSpeech()
```

---

## 三、TTS 引擎类型 (VoiceServiceType)

| 类型 | 配置字段 | 说明 |
|------|---------|------|
| `SIMPLE_TTS` | 仅语速+音调+Cleaner | 系统 TTS 引擎 |
| `HTTP_TTS` | urlTemplate, apiKey, headers(JSON), httpMethod(GET/POST), contentType, requestBody, responsePipeline(JSON) | 通用 HTTP 接口 |
| `SILICONFLOW_TTS` | apiKey, modelName, 预设声音(8个), voiceId | SiliconFlow 专用 |
| `MINIMAX_TTS` | urlTemplate, apiKey, modelName, voiceId | MiniMax 专用 |
| `OPENAI_WS_TTS` | urlTemplate(WebSocket), apiKey, modelName, voiceId | OpenAI 实时 WebSocket |
| `OPENAI_TTS` | urlTemplate, apiKey, modelName, voiceId | OpenAI REST API |

### 3.1 预置声音列表

| 引擎 | 声音数 | 声音 |
|------|--------|------|
| SiliconFlow | 8 | alex, benjamin, charles, david (男); anna, bella, claire, diana (女) |
| OpenAI Realtime | 10 | alloy, ash, ballad, cedar, coral, echo, marin, sage, shimmer, verse |
| OpenAI TTS | 6 (兜底) | alloy, echo, fable, onyx, nova, shimmer |

### 3.2 HTTP TTS Response Pipeline

`responsePipeline` 字段为 JSON 数组，定义响应处理链。支持的 Step 类型：

| type | 说明 |
|------|------|
| `parse_json` | 解析 JSON 响应 |
| `pick` | 按 path 提取字段 |
| `parse_json_string` | 解析字符串值为 JSON |
| `http_get` | 发起 GET 请求 |
| `http_request_from_object` | 从对象构建请求 |
| `base64_decode` | Base64 解码 |

### 3.3 TTS Cleaner 正则

用于在 TTS 前清理文本。预置模板：

| 模板名 | 正则 |
|--------|------|
| Single Asterisk | `\*[^*]+\*` |
| Double Asterisk | `\*\*[^*]+\*\*` |
| Parenthesis | `\([^)]+\)` |
| Chinese Paren | `（[^）]+）` |
| XML Tag | `<[^>]+>` |

---

## 四、STT 引擎类型 (SpeechServiceType)

| 类型 | 配置字段 | 说明 |
|------|---------|------|
| `SHERPA_NCNN` | 无额外字段 | 本地端侧模型 |
| `OPENAI_STT` | endpointUrl, apiKey, modelName | OpenAI Whisper API |
| `DEEPGRAM_STT` | endpointUrl, apiKey, modelName | Deepgram API |

---

## 五、状态管理

### 5.1 无 ViewModel

所有状态直接在 Composable 中通过 `remember { mutableStateOf() }` 管理。

### 5.2 DataStore Flow

通过 `SpeechServicesPreferences` (DataStore) 收集 7 个 Flow：

| Flow | 默认值 |
|------|--------|
| `ttsServiceTypeFlow` | `SIMPLE_TTS` |
| `ttsHttpConfigFlow` | `DEFAULT_HTTP_TTS_PRESET` |
| `ttsCleanerRegexsFlow` | `emptyList()` |
| `ttsSpeechRateFlow` | `1.0f` |
| `ttsPitchFlow` | `1.0f` |
| `sttServiceTypeFlow` | `SHERPA_NCNN` |
| `sttHttpConfigFlow` | `DEFAULT_STT_HTTP_PRESET` |

### 5.3 局部状态变量

~17 个 `*Input` 局部变量镜像 DataStore 值，分为：

- **TTS 通用**：ttsServiceTypeInput, ttsSpeechRateInput, ttsPitchInput
- **HTTP TTS**：ttsUrlTemplateInput, ttsApiKeyInput, ttsHeadersInput, ttsHttpMethodInput, ttsRequestBodyInput, ttsContentTypeInput, ttsVoiceIdInput, ttsModelNameInput, ttsResponsePipelineInput
- **STT**：sttServiceTypeInput, sttEndpointUrlInput, sttApiKeyInput, sttModelNameInput
- **JSON 校验**：ttsHeadersJsonError, ttsResponsePipelineJsonError
- **派生**：hasPendingChanges (比较全部 Input 与持久化值)

### 5.4 OPENAI_TTS 面板额外状态

| 状态 | 说明 |
|------|------|
| `openAiModels` | 远程获取的模型列表 |
| `openAiModelsFetchError` | 模型获取错误信息 |
| `openAiModelsRefreshing` | 刷新中标志 |
| `openAiShowModelsDialog` | 模型选择对话框开关 |
| `openAiModelSearchQuery` | 模型搜索关键词 |
| `openAiVoices` | 远程获取的声音列表 |
| `openAiVoicesFetchError` | 声音获取错误信息 |
| `openAiVoicesRefreshing` | 刷新中标志 |
| `openAiShowVoicesDialog` | 声音选择对话框开关 |
| `openAiVoiceSearchQuery` | 声音搜索关键词 |

---

## 六、自动保存机制

无显式保存按钮。通过 `LaunchedEffect` 监听全部 17 个 Input 状态变量：

```
任意 Input 变化
  → delay(500ms) 防抖
  → 检查 hasPendingChanges
  → 解析 headers JSON + responsePipeline JSON（失败则跳过）
  → prefs.saveTtsSettings(...)
  → prefs.saveSttSettings(...)
  → VoiceServiceFactory.resetInstance()     // TTS 单例重建
  → SpeechServiceFactory.resetInstance()    // STT 单例重建
```

工厂单例重置确保下次使用时从新偏好重建服务实例。

---

## 七、对话框清单

| 对话框 | 触发 | 内容 |
|--------|------|------|
| OpenAI 实时声音选择 | OPENAI_WS_TTS 面板 VoiceId 列表图标 | 搜索 + LazyColumn (10个内置声音) |
| OpenAI TTS 模型选择 | OPENAI_TTS 面板 Model 列表图标 | 搜索 + LazyColumn (远程获取的模型) |
| OpenAI TTS 声音选择 | OPENAI_TTS 面板 VoiceId 列表图标 | 搜索 + LazyColumn (远程获取或6个兜底声音) |

### 7.1 模型/声音远程获取

**模型获取** (`refreshOpenAiModels`)：
```
ModelListFetcher.getModelsList(apiKey, urlTemplate, OPENAI_GENERIC)
  → openAiModels = result
  → 失败 → openAiModelsFetchError = 错误信息
```

**声音获取** (`refreshOpenAiVoices`)：
```
VoiceListFetcher.getVoicesList(apiKey, urlTemplate)
  → 尝试3个候选URL: .../v1/audio/voices, .../v1/voices, .../voices
  → 成功 → openAiVoices = result
  → 全部失败 → 回退到 OpenAIVoiceProvider.AVAILABLE_VOICES (6个内置)
```

---

## 八、JSON 行内校验

Headers 和 ResponsePipeline 字段在 `onValueChange` 中实时校验：

| 字段 | 校验方式 | 错误显示 |
|------|---------|---------|
| Headers | `Json.decodeFromString<Map<String,String>>` | 字段下方红色错误文本 |
| ResponsePipeline | `HttpTtsResponsePipelineStep.parseList()` | 字段下方红色错误文本 |

JSON 校验失败时自动保存会跳过，避免持久化无效配置。

---

## 九、交叉导航

| 方向 | 说明 |
|------|------|
| SpeechServices → TextToSpeech | 底部 "Test Text-to-Speech" 按钮，跨到 Toolbox 导航树 |
| Settings → SpeechServices | 入口页 "Speech Services" 项 |

---

## 十、数据模型

```kotlin
@Serializable
data class TtsHttpConfig(
    val urlTemplate: String,
    val apiKey: String,
    val headers: Map<String, String>,
    val httpMethod: String,         // "GET" / "POST"
    val requestBody: String,
    val contentType: String,
    val voiceId: String,
    val modelName: String,
    val responsePipeline: List<HttpTtsResponsePipelineStep>
)

@Serializable
data class SttHttpConfig(
    val endpointUrl: String,
    val apiKey: String,
    val modelName: String
)

@Serializable
data class HttpTtsResponsePipelineStep(
    val type: String,       // parse_json / pick / http_get / base64_decode / ...
    val path: String,
    val headers: Map<String, String>
)

data class Voice(
    val id: String,
    val name: String,
    val locale: String?,
    val gender: String?
)
```

---

## 十一、架构要点

1. **无 ViewModel**：全部业务逻辑内联在 Composable 中。Manager 通过 `SpeechServicesPreferences(context)` 获取。

2. **500ms 防抖自动保存**：`LaunchedEffect` 监听 17 个 key，延迟后统一保存 TTS + STT 配置。

3. **工厂单例重置**：保存后调用 `VoiceServiceFactory.resetInstance()` + `SpeechServiceFactory.resetInstance()`，强制下次使用时从新偏好重建。

4. **迁移兼容**：`parseSttServiceType` 处理历史遗留值 `"SHERPA_MNN"` → `SHERPA_NCNN`。

5. **JSON 校验守护**：Headers 和 Pipeline 的 JSON 解析错误会阻止自动保存触发，确保不持久化无效配置。

6. **声音获取多候选**：`VoiceListFetcher` 尝试 3 个不同的 URL 路径，全部失败后回退内置列表。

---

## 十二、核心文件清单

| 文件 | 路径 | 行数 | 职责 |
|------|------|------|------|
| **SpeechServicesSettingsScreen** | `ui/features/settings/screens/SpeechServicesSettingsScreen.kt` | 1758 | TTS+STT 统一配置 |
| SpeechServicesPreferences | `data/preferences/SpeechServicesPreferences.kt` | ~200 | DataStore 封装 |
| VoiceServiceFactory | `api/voice/VoiceServiceFactory.kt` | ~150 | TTS 工厂 (6种类型) |
| SpeechServiceFactory | `api/speech/SpeechServiceFactory.kt` | ~100 | STT 工厂 (3种类型) |
| HttpTtsResponsePipelineStep | `api/voice/HttpTtsResponsePipelineStep.kt` | ~80 | Pipeline Step 模型 |
| VoiceListFetcher | `api/voice/VoiceListFetcher.kt` | ~100 | 声音列表远程获取 |
| SiliconFlowVoiceProvider | `api/voice/SiliconFlowVoiceProvider.kt` | ~50 | 8个预置声音 |
| OpenAIRealtimeVoiceProvider | `api/voice/OpenAIRealtimeVoiceProvider.kt` | ~50 | 10个预置声音 |
| OpenAIVoiceProvider | `api/voice/OpenAIVoiceProvider.kt` | ~50 | 6个预置声音 |
