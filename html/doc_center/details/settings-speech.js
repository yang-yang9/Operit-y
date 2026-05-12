registerDetail('settings-speech', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1758</span><span class="stat-label">源码行数</span></div>
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">TTS 引擎类型</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">STT 引擎类型</span></div>
      <div class="stat-item"><span class="stat-num">500ms</span><span class="stat-label">防抖自动保存</span></div>
      <div class="stat-item"><span class="stat-num">17</span><span class="stat-label">局部状态变量</span></div>
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">DataStore Flow</span></div>
    </div>

    <!-- 总体架构 -->
    <div class="section-head blue">SpeechServicesSettingsScreen — 语音服务统一配置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">
      语音服务统一配置中心，覆盖 TTS（文字转语音）和 STT（语音转文字）两大功能域。TTS 支持 6 种引擎类型，STT 支持 3 种引擎类型。每种引擎有独立的配置面板，500ms 防抖自动保存，无显式保存按钮。
    </p>

    <!-- 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">SpeechServicesSettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column (verticalScroll)</div>
        <div class="tree-children">

          <div class="tree-node" style="color:var(--blue);">TTS Card</div>
          <div class="tree-children">
            <div class="tree-node">Row: VolumeUp 图标 + "Text-to-Speech" 标题</div>
            <div class="tree-node">Text: 功能描述</div>
            <div class="tree-node">ExposedDropdownMenuBox: TTS 引擎选择器（6 种）</div>
            <div class="tree-node">Slider: 语速（0.5x ~ 2.0x，6 档）</div>
            <div class="tree-node">Slider: 音调（0.5x ~ 2.0x，6 档）</div>
            <div class="tree-node" style="color:var(--accent);">TTS Cleaner 正则列表</div>
            <div class="tree-children">
              <div class="tree-node">ForEach: Row（OutlinedTextField + Delete）</div>
              <div class="tree-node">Row: Add Regex + Templates 下拉</div>
            </div>
            <div class="tree-node" style="color:var(--accent);">引擎配置面板（AnimatedVisibility，按类型切换）</div>
            <div class="tree-children">
              <div class="tree-node">[HTTP_TTS] URL / Key / Headers / Method / Body / Pipeline</div>
              <div class="tree-node">[SILICONFLOW_TTS] Key / Model / 预设声音（8 个）/ VoiceId</div>
              <div class="tree-node">[MINIMAX_TTS] URL / Key / Model / VoiceId</div>
              <div class="tree-node">[OPENAI_WS_TTS] WS URL / Key / Model / VoiceId + 选择器</div>
              <div class="tree-node">[OPENAI_TTS] URL / Key / Model + 刷新 + 选择器 / Voice + 刷新 + 选择器</div>
            </div>
          </div>

          <div class="tree-node" style="color:var(--green);margin-top:6px;">STT Card</div>
          <div class="tree-children">
            <div class="tree-node">Row: Mic 图标 + "Speech-to-Text" 标题</div>
            <div class="tree-node">ExposedDropdownMenuBox: STT 引擎选择器（3 种）</div>
            <div class="tree-node">引擎配置面板（AnimatedVisibility）</div>
            <div class="tree-children">
              <div class="tree-node">[OPENAI_STT] Endpoint / Key / Model</div>
              <div class="tree-node">[DEEPGRAM_STT] Endpoint / Key / Model</div>
            </div>
            <div class="tree-node">Row: 信息提示</div>
          </div>

          <div class="tree-node" style="color:var(--text-dim);margin-top:6px;">Info Card</div>
          <div class="tree-children">
            <div class="tree-node">SettingsInfoRow: TTS 说明</div>
            <div class="tree-node">SettingsInfoRow: STT 说明</div>
          </div>

          <div class="tree-node" style="color:var(--text-dim);margin-top:6px;">Action Card</div>
          <div class="tree-children">
            <div class="tree-node">OutlinedButton: "Test Text-to-Speech" → onNavigateToTextToSpeech()</div>
          </div>

        </div>
      </div>
    </div>

    <!-- TTS 引擎类型 -->
    <div class="section-head blue" style="margin-top:24px;">TTS 引擎类型 (VoiceServiceType)</div>
    <table class="act-table">
      <tr><th>类型</th><th>配置字段</th><th>说明</th></tr>
      <tr><td><code>SIMPLE_TTS</code></td><td>仅语速 + 音调 + Cleaner</td><td>系统 TTS 引擎</td></tr>
      <tr><td><code>HTTP_TTS</code></td><td>urlTemplate, apiKey, headers(JSON), httpMethod(GET/POST), contentType, requestBody, responsePipeline(JSON)</td><td>通用 HTTP 接口</td></tr>
      <tr><td><code>SILICONFLOW_TTS</code></td><td>apiKey, modelName, 预设声音（8 个）, voiceId</td><td>SiliconFlow 专用</td></tr>
      <tr><td><code>MINIMAX_TTS</code></td><td>urlTemplate, apiKey, modelName, voiceId</td><td>MiniMax 专用</td></tr>
      <tr><td><code>OPENAI_WS_TTS</code></td><td>urlTemplate(WebSocket), apiKey, modelName, voiceId</td><td>OpenAI 实时 WebSocket</td></tr>
      <tr><td><code>OPENAI_TTS</code></td><td>urlTemplate, apiKey, modelName, voiceId</td><td>OpenAI REST API</td></tr>
    </table>

    <!-- 预置声音列表 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">预置声音列表</div>
    <table class="act-table">
      <tr><th>引擎</th><th>声音数</th><th>声音</th></tr>
      <tr><td>SiliconFlow</td><td>8</td><td>alex, benjamin, charles, david（男）；anna, bella, claire, diana（女）</td></tr>
      <tr><td>OpenAI Realtime</td><td>10</td><td>alloy, ash, ballad, cedar, coral, echo, marin, sage, shimmer, verse</td></tr>
      <tr><td>OpenAI TTS（兜底）</td><td>6</td><td>alloy, echo, fable, onyx, nova, shimmer</td></tr>
    </table>

    <!-- HTTP TTS Response Pipeline -->
    <div class="section-head green" style="margin-top:24px;">HTTP TTS Response Pipeline</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">
      <code>responsePipeline</code> 字段为 JSON 数组，定义响应处理链。支持以下 Step 类型：
    </p>
    <table class="act-table">
      <tr><th>type</th><th>说明</th></tr>
      <tr><td><code>parse_json</code></td><td>解析 JSON 响应</td></tr>
      <tr><td><code>pick</code></td><td>按 path 提取字段</td></tr>
      <tr><td><code>parse_json_string</code></td><td>解析字符串值为 JSON</td></tr>
      <tr><td><code>http_get</code></td><td>发起 GET 请求</td></tr>
      <tr><td><code>http_request_from_object</code></td><td>从对象构建请求</td></tr>
      <tr><td><code>base64_decode</code></td><td>Base64 解码</td></tr>
    </table>

    <!-- TTS Cleaner 正则模板 -->
    <div class="section-head orange" style="margin-top:24px;">TTS Cleaner 正则模板</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">用于在 TTS 前清理文本。预置模板：</p>
    <table class="act-table">
      <tr><th>模板名</th><th>正则</th></tr>
      <tr><td>Single Asterisk</td><td><code>\\*[^*]+\\*</code></td></tr>
      <tr><td>Double Asterisk</td><td><code>\\*\\*[^*]+\\*\\*</code></td></tr>
      <tr><td>Parenthesis</td><td><code>\\([^)]+\\)</code></td></tr>
      <tr><td>Chinese Paren</td><td><code>（[^）]+）</code></td></tr>
      <tr><td>XML Tag</td><td><code>&lt;[^&gt;]+&gt;</code></td></tr>
    </table>

    <!-- STT 引擎类型 -->
    <div class="section-head blue" style="margin-top:24px;">STT 引擎类型 (SpeechServiceType)</div>
    <table class="act-table">
      <tr><th>类型</th><th>配置字段</th><th>说明</th></tr>
      <tr><td><code>SHERPA_NCNN</code></td><td>无额外字段</td><td>本地端侧模型</td></tr>
      <tr><td><code>OPENAI_STT</code></td><td>endpointUrl, apiKey, modelName</td><td>OpenAI Whisper API</td></tr>
      <tr><td><code>DEEPGRAM_STT</code></td><td>endpointUrl, apiKey, modelName</td><td>Deepgram API</td></tr>
    </table>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">DataStore Flow（SpeechServicesPreferences）</div>
    <table class="act-table">
      <tr><th>Flow</th><th>默认值</th></tr>
      <tr><td>ttsServiceTypeFlow</td><td>SIMPLE_TTS</td></tr>
      <tr><td>ttsHttpConfigFlow</td><td>DEFAULT_HTTP_TTS_PRESET</td></tr>
      <tr><td>ttsCleanerRegexsFlow</td><td>emptyList()</td></tr>
      <tr><td>ttsSpeechRateFlow</td><td>1.0f</td></tr>
      <tr><td>ttsPitchFlow</td><td>1.0f</td></tr>
      <tr><td>sttServiceTypeFlow</td><td>SHERPA_NCNN</td></tr>
      <tr><td>sttHttpConfigFlow</td><td>DEFAULT_STT_HTTP_PRESET</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">局部状态变量（~17 个 *Input）</div>
    <table class="act-table">
      <tr><th>分组</th><th>变量</th></tr>
      <tr><td>TTS 通用</td><td>ttsServiceTypeInput, ttsSpeechRateInput, ttsPitchInput</td></tr>
      <tr><td>HTTP TTS</td><td>ttsUrlTemplateInput, ttsApiKeyInput, ttsHeadersInput, ttsHttpMethodInput, ttsRequestBodyInput, ttsContentTypeInput, ttsVoiceIdInput, ttsModelNameInput, ttsResponsePipelineInput</td></tr>
      <tr><td>STT</td><td>sttServiceTypeInput, sttEndpointUrlInput, sttApiKeyInput, sttModelNameInput</td></tr>
      <tr><td>JSON 校验</td><td>ttsHeadersJsonError, ttsResponsePipelineJsonError</td></tr>
      <tr><td>派生</td><td>hasPendingChanges（比较全部 Input 与持久化值）</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">OPENAI_TTS 面板额外状态</div>
    <table class="act-table">
      <tr><th>状态</th><th>说明</th></tr>
      <tr><td>openAiModels</td><td>远程获取的模型列表</td></tr>
      <tr><td>openAiModelsFetchError</td><td>模型获取错误信息</td></tr>
      <tr><td>openAiModelsRefreshing</td><td>刷新中标志</td></tr>
      <tr><td>openAiShowModelsDialog</td><td>模型选择对话框开关</td></tr>
      <tr><td>openAiModelSearchQuery</td><td>模型搜索关键词</td></tr>
      <tr><td>openAiVoices</td><td>远程获取的声音列表</td></tr>
      <tr><td>openAiVoicesFetchError</td><td>声音获取错误信息</td></tr>
      <tr><td>openAiVoicesRefreshing</td><td>刷新中标志</td></tr>
      <tr><td>openAiShowVoicesDialog</td><td>声音选择对话框开关</td></tr>
      <tr><td>openAiVoiceSearchQuery</td><td>声音搜索关键词</td></tr>
    </table>

    <!-- 自动保存机制 -->
    <div class="section-head green" style="margin-top:24px;">自动保存机制（500ms 防抖）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">无显式保存按钮，通过 <code>LaunchedEffect</code> 监听全部 17 个 Input 状态变量：</p>
    <div class="kn-code" style="margin:8px 0;">任意 Input 变化
  → delay(500ms) 防抖
  → 检查 hasPendingChanges
  → 解析 headers JSON + responsePipeline JSON（失败则跳过）
  → prefs.saveTtsSettings(...)
  → prefs.saveSttSettings(...)
  → VoiceServiceFactory.resetInstance()     // TTS 单例重建
  → SpeechServiceFactory.resetInstance()    // STT 单例重建</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">工厂单例重置确保下次使用时从新偏好重建服务实例。</p>

    <!-- 对话框清单 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">对话框清单</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发</th><th>内容</th></tr>
      <tr><td>OpenAI 实时声音选择</td><td>OPENAI_WS_TTS 面板 VoiceId 列表图标</td><td>搜索 + LazyColumn（10 个内置声音）</td></tr>
      <tr><td>OpenAI TTS 模型选择</td><td>OPENAI_TTS 面板 Model 列表图标</td><td>搜索 + LazyColumn（远程获取的模型）</td></tr>
      <tr><td>OpenAI TTS 声音选择</td><td>OPENAI_TTS 面板 VoiceId 列表图标</td><td>搜索 + LazyColumn（远程获取或 6 个兜底声音）</td></tr>
    </table>

    <!-- 远程获取逻辑 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">模型 / 声音远程获取</div>
    <p style="margin:0 0 4px 4px;font-size:13px;color:var(--text-dim);">模型获取（<code>refreshOpenAiModels</code>）：</p>
    <div class="kn-code" style="margin:4px 0 12px;">ModelListFetcher.getModelsList(apiKey, urlTemplate, OPENAI_GENERIC)
  → openAiModels = result
  → 失败 → openAiModelsFetchError = 错误信息</div>
    <p style="margin:0 0 4px 4px;font-size:13px;color:var(--text-dim);">声音获取（<code>refreshOpenAiVoices</code>）：</p>
    <div class="kn-code" style="margin:4px 0;">VoiceListFetcher.getVoicesList(apiKey, urlTemplate)
  → 尝试 3 个候选 URL: .../v1/audio/voices, .../v1/voices, .../voices
  → 成功 → openAiVoices = result
  → 全部失败 → 回退到 OpenAIVoiceProvider.AVAILABLE_VOICES（6 个内置）</div>

    <!-- JSON 行内校验 -->
    <div class="section-head orange" style="margin-top:24px;">JSON 行内校验</div>
    <table class="act-table">
      <tr><th>字段</th><th>校验方式</th><th>错误显示</th></tr>
      <tr><td>Headers</td><td><code>Json.decodeFromString&lt;Map&lt;String,String&gt;&gt;</code></td><td>字段下方红色错误文本</td></tr>
      <tr><td>ResponsePipeline</td><td><code>HttpTtsResponsePipelineStep.parseList()</code></td><td>字段下方红色错误文本</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">JSON 校验失败时自动保存会跳过，避免持久化无效配置。</p>

    <!-- 数据模型 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">数据模型</div>
    <div class="kn-code" style="margin:8px 0;">@Serializable
data class TtsHttpConfig(
    val urlTemplate: String,
    val apiKey: String,
    val headers: Map&lt;String, String&gt;,
    val httpMethod: String,         // "GET" / "POST"
    val requestBody: String,
    val contentType: String,
    val voiceId: String,
    val modelName: String,
    val responsePipeline: List&lt;HttpTtsResponsePipelineStep&gt;
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
    val headers: Map&lt;String, String&gt;
)

data class Voice(
    val id: String,
    val name: String,
    val locale: String?,
    val gender: String?
)</div>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:24px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">⚡</div>
        <div class="kn-title blue">无 ViewModel</div>
        <div class="kn-body">所有业务逻辑内联在 Composable 中。Manager 通过 <code>SpeechServicesPreferences(context)</code> 获取，17 个 Input 变量全部通过 <code>remember { mutableStateOf() }</code> 管理。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title green">500ms 防抖保存</div>
        <div class="kn-body"><code>LaunchedEffect</code> 监听 17 个 key，任意变化后延迟 500ms 统一保存 TTS + STT 配置，避免高频写 DataStore。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title orange">工厂单例重置</div>
        <div class="kn-body">保存后调用 <code>VoiceServiceFactory.resetInstance()</code> + <code>SpeechServiceFactory.resetInstance()</code>，强制下次使用时从新偏好重建服务实例。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🛡️</div>
        <div class="kn-title blue">JSON 校验守护</div>
        <div class="kn-body">Headers 和 Pipeline 的 JSON 解析错误会阻止自动保存触发，确保不持久化无效配置。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🌐</div>
        <div class="kn-title green">声音多候选获取</div>
        <div class="kn-body"><code>VoiceListFetcher</code> 依次尝试 3 个不同 URL 路径，全部失败后回退到 6 个内置声音列表，保证功能可用性。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔧</div>
        <div class="kn-title orange">迁移兼容</div>
        <div class="kn-body"><code>parseSttServiceType</code> 处理历史遗留值 <code>"SHERPA_MNN"</code> → <code>SHERPA_NCNN</code>，升级时无需用户重新配置。</div>
      </div>
    </div>

    <!-- 交叉导航 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">交叉导航</div>
    <table class="act-table">
      <tr><th>方向</th><th>说明</th></tr>
      <tr><td>SpeechServices → TextToSpeech</td><td>底部 "Test Text-to-Speech" 按钮，跨到 Toolbox 导航树</td></tr>
      <tr><td>Settings → SpeechServices</td><td>入口页 "Speech Services" 项</td></tr>
    </table>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>行数</th><th>职责</th></tr>
      <tr><td><strong>SpeechServicesSettingsScreen</strong></td><td>ui/features/settings/screens/SpeechServicesSettingsScreen.kt</td><td>1758</td><td>TTS + STT 统一配置</td></tr>
      <tr><td>SpeechServicesPreferences</td><td>data/preferences/SpeechServicesPreferences.kt</td><td>~200</td><td>DataStore 封装</td></tr>
      <tr><td>VoiceServiceFactory</td><td>api/voice/VoiceServiceFactory.kt</td><td>~150</td><td>TTS 工厂（6 种类型）</td></tr>
      <tr><td>SpeechServiceFactory</td><td>api/speech/SpeechServiceFactory.kt</td><td>~100</td><td>STT 工厂（3 种类型）</td></tr>
      <tr><td>HttpTtsResponsePipelineStep</td><td>api/voice/HttpTtsResponsePipelineStep.kt</td><td>~80</td><td>Pipeline Step 模型</td></tr>
      <tr><td>VoiceListFetcher</td><td>api/voice/VoiceListFetcher.kt</td><td>~100</td><td>声音列表远程获取</td></tr>
      <tr><td>SiliconFlowVoiceProvider</td><td>api/voice/SiliconFlowVoiceProvider.kt</td><td>~50</td><td>8 个预置声音</td></tr>
      <tr><td>OpenAIRealtimeVoiceProvider</td><td>api/voice/OpenAIRealtimeVoiceProvider.kt</td><td>~50</td><td>10 个预置声音</td></tr>
      <tr><td>OpenAIVoiceProvider</td><td>api/voice/OpenAIVoiceProvider.kt</td><td>~50</td><td>6 个预置声音</td></tr>
    </table>
`);
