registerDetail('settings-modelconfig', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1433</span><span class="stat-label">ModelConfig 行数</span></div>
      <div class="stat-item"><span class="stat-num">946</span><span class="stat-label">FunctionalConfig 行数</span></div>
      <div class="stat-item"><span class="stat-num">37</span><span class="stat-label">API 提供商类型</span></div>
      <div class="stat-item"><span class="stat-num">10</span><span class="stat-label">FunctionType 数</span></div>
      <div class="stat-item"><span class="stat-num">700ms</span><span class="stat-label">防抖保存延迟</span></div>
    </div>

    <!-- ModelConfigScreen -->
    <div class="section-head blue">ModelConfigScreen — 模型参数配置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">多配置档案管理系统，每个配置档包含 API 端点、密钥、模型名、采样参数、自定义头、上下文设置等完整的模型接入参数。支持 37 种 API 提供商类型，无 ViewModel，状态通过 Manager + 局部状态 + SaveCoordinator 管理。</p>

    <!-- Mermaid 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ModelConfigScreen&lt;br/&gt;(CustomScaffold → LazyColumn)"]

    ROOT --> SELECTOR["Config Selector Card"]
    SELECTOR --> SEL_HEADER["Row: 标题 + New按钮"]
    SELECTOR --> SEL_DROPDOWN["Surface: 当前配置名 + DropdownMenu"]
    SELECTOR --> SEL_ACTIONS["FlowRow: Rename / Delete / Test Connection"]
    SELECTOR --> SEL_RESULT["[testResults] AnimatedVisibility&lt;br/&gt;Card: 连接测试结果列表"]

    ROOT --> SEC_API["ModelApiSettingsSection&lt;br/&gt;(外部Section组件)"]
    ROOT --> SEC_CTX["ContextSummarySettingsSection&lt;br/&gt;(内联Section)"]
    SEC_CTX --> CTX_CONTEXT["Card: Context Length + Max Context Length"]
    SEC_CTX --> CTX_SUMMARY["Card: Summary 开关 + 阈值 + 消息数"]

    ROOT --> SEC_PARAMS["ModelParametersSection&lt;br/&gt;(外部Section组件)"]
    ROOT --> SEC_HEADERS["CustomHeadersSettingsSection&lt;br/&gt;(内联Section)"]
    SEC_HEADERS --> HDR_PRESETS["FlowRow: Load Preset + Add Header"]
    SEC_HEADERS --> HDR_LIST["ForEach: Key/Value OutlinedTextField + Delete"]

    ROOT --> SEC_ADV["AdvancedSettingsSection&lt;br/&gt;(外部Section组件)"]

    ROOT --> DLG_ADD["AlertDialog: New Model Config"]
    ROOT --> DLG_RENAME["AlertDialog: Rename Model Config"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head green" style="margin-top:16px;">状态管理 / Manager 类</div>
    <table class="act-table">
      <tr><th>Manager</th><th>职责</th></tr>
      <tr><td>ModelConfigManager(context)</td><td>配置档 CRUD、Flow</td></tr>
      <tr><td>FunctionalConfigManager(context)</td><td>读取 CHAT 功能绑定确定默认选中配置</td></tr>
      <tr><td>ModelConfigSaveCoordinator</td><td>各 Section 注册保存动作的协调器</td></tr>
    </table>

    <!-- SaveCoordinator 机制 -->
    <div class="section-head orange" style="margin-top:16px;">SaveCoordinator 保存机制</div>
    <div class="kn-code" style="margin:8px 0;">// 700ms 防抖自动保存
DebouncedModelConfigAutoSaveEffect(coordinator, delay = 700ms)

// Section 注册命名保存动作
RegisterModelConfigSaveAction(coordinator, key = "sectionName") { saveAction() }

// 生命周期触发
ON_STOP → coordinator.flushAllInBackground()

// 连接测试前同步刷新
testButton.onClick { coordinator.flushAll(); runConnectionTest() }</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">双路保存：每个 Section 同时注册响应式防抖保存（snapshotFlow）和命令式保存（RegisterModelConfigSaveAction），确保数据不丢失。</p>

    <!-- 配置档生命周期 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">配置档生命周期</div>
    <table class="act-table">
      <tr><th>操作</th><th>入口</th><th>流程</th></tr>
      <tr><td>创建</td><td>New 按钮 → AddConfigDialog</td><td>configManager.createConfig(name) → 自动切换</td></tr>
      <tr><td>切换</td><td>DropdownMenu 选择</td><td>selectedConfigId 更新 → LaunchedEffect 收集新配置 Flow</td></tr>
      <tr><td>重命名</td><td>Rename 按钮 → RenameDialog</td><td>configManager.updateConfigBase(id, newName)</td></tr>
      <tr><td>删除</td><td>Delete 按钮（非默认配置）</td><td>configManager.deleteConfig(id) → 回退到首个配置</td></tr>
      <tr><td>连接测试</td><td>Test Connection 按钮</td><td>flush → 获取配置 → ModelConfigConnectionTester.run() 多类型测试</td></tr>
    </table>

    <!-- 对话框清单 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">对话框清单</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发</th><th>说明</th></tr>
      <tr><td>New Config</td><td>"New" OutlinedButton</td><td>输入名称创建新配置</td></tr>
      <tr><td>Rename Config</td><td>"Rename" TextButton</td><td>修改配置名</td></tr>
      <tr><td>API Provider 选择</td><td>ModelApiSettingsSection 内</td><td>37 种 ApiProviderType 选择器</td></tr>
      <tr><td>Endpoint Options</td><td>ModelApiSettingsSection 内</td><td>预设端点选择</td></tr>
      <tr><td>Model List</td><td>ModelApiSettingsSection 内</td><td>ModelListFetcher 获取模型列表，多选</td></tr>
      <tr><td>MNN Forward Type</td><td>MnnSettingsBlock 内</td><td>MNN 推理前向类型选择</td></tr>
      <tr><td>Add/Edit Custom Parameter</td><td>ModelParametersSection 内</td><td>自定义采样参数编辑</td></tr>
      <tr><td>Delete Custom Parameter</td><td>ParameterItem 内</td><td>删除确认</td></tr>
      <tr><td>Add/Edit API Key</td><td>AdvancedSettingsSection 内</td><td>API Key Pool 密钥编辑</td></tr>
      <tr><td>Clear API Key Pool</td><td>AdvancedSettingsSection 内</td><td>清空确认</td></tr>
    </table>

    <!-- ModelApiSettingsSection -->
    <div class="section-head blue" style="margin-top:16px;">ModelApiSettingsSection 关键功能</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🔌</div>
        <div class="kn-title blue">API 提供商切换</div>
        <div class="kn-body">37 种类型（OPENAI / ANTHROPIC / GOOGLE / DEEPSEEK / OLLAMA / MNN / LLAMA_CPP 等），切换时重置端点和模型名到默认值。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🌍</div>
        <div class="kn-title orange">地区检测</div>
        <div class="kn-body">海外提供商触发 LocationUtils.isDeviceInMainlandChina 警告，提示用户网络环境。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📋</div>
        <div class="kn-title green">模型列表获取</div>
        <div class="kn-body">ModelListFetcher.getModelsList() / getMnnLocalModels() / getLlamaLocalModels()，支持云端与本地推理模型。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⚙️</div>
        <div class="kn-title">本地推理参数</div>
        <div class="kn-body">MNN/Llama 本地模型：线程数、上下文大小、GPU 层数等本地推理参数。功能开关：直接图像/音频/视频处理、Google 搜索、工具调用。</div>
      </div>
    </div>

    <!-- API 提供商列表 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">37 种 ApiProviderType</div>
    <p style="margin:6px 0 10px 4px;font-size:12px;color:var(--text-dim);">OPENAI, OPENAI_RESPONSES, OPENAI_GENERIC, ANTHROPIC, ANTHROPIC_GENERIC, GOOGLE, GEMINI_GENERIC, BAIDU, ALIYUN, XUNFEI, ZHIPU, BAICHUAN, MOONSHOT, DEEPSEEK, MISTRAL, SILICONFLOW, IFLOW, OPENROUTER, INFINIAI, ALIPAY_BAILING, DOUBAO, NVIDIA, LMSTUDIO, OLLAMA, MNN, LLAMA_CPP, PPINFRA, NOVITA, OTHER…</p>

    <!-- ModelParametersSection -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">ModelParametersSection — 4 个标签页</div>
    <table class="act-table">
      <tr><th>标签</th><th>参数</th></tr>
      <tr><td>Generation</td><td>maxTokens</td></tr>
      <tr><td>Creativity</td><td>temperature（推荐 1.3）、topP、topK</td></tr>
      <tr><td>Repetition</td><td>presencePenalty、frequencyPenalty、repetitionPenalty</td></tr>
      <tr><td>Custom</td><td>自定义参数（JSON 序列化）</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">每个参数有独立的启用开关和值编辑器。温度标签显示 "Recommended: 1.3" 提示。</p>

    <!-- AdvancedSettingsSection -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">AdvancedSettingsSection</div>
    <table class="act-table">
      <tr><th>功能</th><th>说明</th></tr>
      <tr><td>请求队列</td><td>requestLimitPerMinute、maxConcurrentRequests</td></tr>
      <tr><td>API Key Pool</td><td>多密钥轮换，最多显示 20 个单独条目，超出显示数量+批量操作</td></tr>
      <tr><td>批量导入/导出</td><td>文件选择器导入换行分隔密钥、导出到 api_keys.txt</td></tr>
      <tr><td>可用性测试</td><td>ApiKeyPoolAvailabilityTester，并发 5，支持暂停/恢复</td></tr>
    </table>

    <!-- FunctionalConfigScreen -->
    <div class="section-head orange" style="margin-top:32px;">FunctionalConfigScreen — 功能模型绑定</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">将 10 种功能类型绑定到不同的模型配置档。每种功能（聊天/摘要/翻译/UI 控制等）可独立选择使用哪个模型配置和具体哪个模型（多模型配置支持）。</p>

    <!-- FunctionalConfigScreen 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">FunctionalConfigScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">[isLoading] CircularProgressIndicator</div>
        <div class="tree-node">LazyColumn</div>
        <div class="tree-children">
          <div class="tree-node">Card (导航 + 描述)</div>
          <div class="tree-children">
            <div class="tree-node">Row: "Manage All Model Configs →" (→ onNavigateToModelConfig)</div>
          </div>
          <div class="tree-node">[每个 FunctionType] FunctionConfigCard</div>
          <div class="tree-children">
            <div class="tree-node">标题 + 描述</div>
            <div class="tree-node">Surface: 当前配置摘要 + Test 按钮</div>
            <div class="tree-children">
              <div class="tree-node">[mediaSupportWarning] Row: 媒体支持警告</div>
              <div class="tree-node">[testResult] Row: 测试结果</div>
            </div>
            <div class="tree-node">AnimatedVisibility: 配置选择列表</div>
            <div class="tree-children">
              <div class="tree-node">forEach(availableConfigs)</div>
              <div class="tree-children">
                <div class="tree-node">Surface: 配置名 (单模型直选)</div>
                <div class="tree-node">[多模型] AnimatedVisibility: 模型子列表</div>
              </div>
            </div>
          </div>
          <div class="tree-node">OutlinedButton "Reset All Functions to Default"</div>
        </div>
      </div>
    </div>

    <!-- 10 种功能类型 -->
    <div class="section-head green" style="margin-top:16px;">10 种功能类型 (FunctionType)</div>
    <table class="act-table">
      <tr><th>类型</th><th>说明</th></tr>
      <tr><td><code>CHAT</code></td><td>主聊天</td></tr>
      <tr><td><code>SUMMARY</code></td><td>上下文摘要</td></tr>
      <tr><td><code>PROBLEM_LIBRARY</code></td><td>知识图谱提取</td></tr>
      <tr><td><code>UI_CONTROLLER</code></td><td>UI 自动化</td></tr>
      <tr><td><code>TRANSLATION</code></td><td>翻译</td></tr>
      <tr><td><code>GREP</code></td><td>上下文选择</td></tr>
      <tr><td><code>ROLE_RESPONSE_PLANNER</code></td><td>角色回复规划</td></tr>
      <tr><td><code>IMAGE_RECOGNITION</code></td><td>图像识别</td></tr>
      <tr><td><code>AUDIO_RECOGNITION</code></td><td>音频识别</td></tr>
      <tr><td><code>VIDEO_RECOGNITION</code></td><td>视频识别</td></tr>
    </table>

    <!-- 多模型选择 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">多模型选择</div>
    <p style="margin:6px 0 8px 4px;font-size:13px;color:var(--text-dim);">ModelConfigData.modelName 为逗号分隔列表。当模型数 &gt; 1 时，配置选择器显示二级列表。绑定存储为 FunctionConfigMapping(configId, modelIndex)。</p>
    <div class="kn-code" style="margin:8px 0;">配置 A (3 models)
  ├── model-1  ← 可选
  ├── model-2
  └── model-3

配置 B (1 model)  ← 直接选择</div>

    <!-- 连接测试 -->
    <div class="section-head blue" style="margin-top:16px;">连接测试（10 种功能各异）</div>
    <table class="act-table">
      <tr><th>功能类型</th><th>测试方式</th></tr>
      <tr><td>CHAT</td><td>发送 "Hi" 消息</td></tr>
      <tr><td>SUMMARY</td><td>generateSummary(sampleMessages)</td></tr>
      <tr><td>TRANSLATION</td><td>translateText()</td></tr>
      <tr><td>IMAGE_RECOGNITION</td><td>从 assets 加载 test/1.jpg + 图像池</td></tr>
      <tr><td>AUDIO_RECOGNITION</td><td>从 assets 加载 test/1.mp3 + 媒体池</td></tr>
      <tr><td>VIDEO_RECOGNITION</td><td>从 assets 加载 test/1.mp4 + 媒体池</td></tr>
      <tr><td>GREP</td><td>构建 grepContextSelectPrompt</td></tr>
      <tr><td>UI_CONTROLLER</td><td>构建 uiControllerPrompt</td></tr>
      <tr><td>PROBLEM_LIBRARY</td><td>构建 knowledgeGraphExtractionPrompt</td></tr>
      <tr><td>ROLE_RESPONSE_PLANNER</td><td>JSON 格式请求</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">媒体测试使用 cleanup 注册模式（mutableListOf&lt;() -&gt; Unit&gt;），finally 块统一清理。FunctionConfigCard 通过 AIServiceFactory.createService() 创建临时服务实例，测试完丢弃。</p>

    <!-- AutoGLM 保护 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">AutoGLM 保护</div>
    <p style="margin:6px 0 8px 4px;font-size:13px;color:var(--text-dim);">UI 层硬编码限制：当 functionType == CHAT 且模型名包含 "autoglm" 时，显示 Toast 阻止选择。</p>

    <!-- 交叉导航 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">交叉导航</div>
    <table class="act-table">
      <tr><th>方向</th><th>说明</th></tr>
      <tr><td>Functional → ModelConfig</td><td>"Manage All Model Configs →" 链接</td></tr>
      <tr><td>ModelConfig → MnnModelDownload</td><td>MNN 设置块中 "Download MNN Model" 按钮</td></tr>
    </table>

    <!-- 数据模型 -->
    <div class="section-head orange" style="margin-top:32px;">数据模型 — ModelConfigData</div>
    <div class="kn-code" style="margin:8px 0;">@Serializable
data class ModelConfigData(
    // 基础
    val id: String, val name: String,
    val apiKey: String, val apiEndpoint: String,
    val modelName: String, val apiProviderType: ApiProviderType,
    // 多密钥
    val useMultipleApiKeys: Boolean, val apiKeyPool: List&lt;ApiKeyInfo&gt;,
    val currentKeyIndex: Int, val keyRotationMode: KeyRotationMode,
    // 采样参数（各有 enabled 标志 + 值）
    val maxTokens: Int, val temperature: Double, val topP: Double,
    val topK: Int, val presencePenalty: Double, val frequencyPenalty: Double,
    val repetitionPenalty: Double,
    // 自定义
    val customParameters: String,  // JSON 数组
    val customHeaders: String,     // JSON 对象
    // 上下文
    val contextLength: Double, val maxContextLength: Double,
    val enableSummary: Boolean, val summaryTokenThreshold: Double,
    // 功能开关
    val enableDirectImageProcessing: Boolean,
    val enableDirectAudioProcessing: Boolean,
    val enableDirectVideoProcessing: Boolean,
    val enableGoogleSearch: Boolean, val enableToolCall: Boolean,
    // 本地推理
    val mnnForwardType: Int, val mnnThreadCount: Int,
    val llamaThreadCount: Int, val llamaContextSize: Int, ...
    // 限流
    val requestLimitPerMinute: Int, val maxConcurrentRequests: Int
)</div>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:24px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🗂️</div>
        <div class="kn-title blue">SaveCoordinator 模式</div>
        <div class="kn-body">各 Section 注册命名保存动作，协调器提供单一 flushAll 入口。解决多 Section 独立防抖保存时的一致性问题。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title green">双路保存</div>
        <div class="kn-body">每个 Section 同时注册响应式防抖保存（700ms snapshotFlow）和命令式保存（RegisterModelConfigSaveAction），确保数据不丢失。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title orange">配置切换重置</div>
        <div class="kn-body">remember(config.id) 确保切换配置时所有 Section 状态干净重建，避免跨配置状态残留。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🛑</div>
        <div class="kn-title">连接测试取消</div>
        <div class="kn-body">持有 activeConnectionTestService 引用，Cancel 时调用 cancelStreaming() 中断活跃的 AI 服务调用。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🧪</div>
        <div class="kn-title blue">内联服务创建</div>
        <div class="kn-body">FunctionConfigCard 的连接测试直接通过 AIServiceFactory.createService() 创建临时服务实例，测试完丢弃。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🛡️</div>
        <div class="kn-title orange">AutoGLM 保护</div>
        <div class="kn-body">UI 层硬编码：CHAT 功能不允许绑定包含 "autoglm" 的模型，防止误用专用模型。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对于 ui/features/settings/）</th><th>行数</th><th>职责</th></tr>
      <tr><td><strong>ModelConfigScreen</strong></td><td>screens/ModelConfigScreen.kt</td><td>1433</td><td>配置档管理 + 选择器 + 连接测试</td></tr>
      <tr><td><strong>FunctionalConfigScreen</strong></td><td>screens/FunctionalConfigScreen.kt</td><td>946</td><td>功能→配置绑定 + 连接测试</td></tr>
      <tr><td>ModelApiSettingsSection</td><td>sections/ModelApiSettingsSection.kt</td><td>~400</td><td>API 端点/密钥/提供商</td></tr>
      <tr><td>ModelParametersSection</td><td>sections/ModelParametersSection.kt</td><td>~350</td><td>采样参数 4 标签</td></tr>
      <tr><td>AdvancedSettingsSection</td><td>sections/AdvancedSettingsSection.kt</td><td>~300</td><td>Key Pool + 限流</td></tr>
    </table>
`);
