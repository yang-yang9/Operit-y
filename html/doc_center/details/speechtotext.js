registerDetail('speechtotext', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">580</span><span class="stat-label">STT 源码行数</span></div>
      <div class="stat-item"><span class="stat-num">501</span><span class="stat-label">TTS 源码行数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">识别引擎</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">TTS 错误层级</span></div>
    </div>

    <!-- STT Section -->
    <div class="section-head blue">SpeechToTextScreen — 三引擎语音识别</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">需要 RECORD_AUDIO 权限；未授权时整屏替换为权限申请 UI（early return，主 UI 不渲染）。</p>

    <table class="act-table" style="margin-bottom:12px;">
      <tr><th>引擎</th><th>类型</th><th>识别模式</th></tr>
      <tr><td>Sherpa-NCNN</td><td>本地推理</td><td>连续识别 + 部分结果（partial results）</td></tr>
      <tr><td>OpenAI STT</td><td>云端</td><td>单次识别</td></tr>
      <tr><td>Deepgram STT</td><td>云端</td><td>单次识别</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树（已授权路径）</div>
    <div class="mermaid">
graph TD
    ROOT["Column (fillMaxSize, verticalScroll, padding 16dp)"]
    ROOT --> RESULT_CARD["Card — 识别结果&lt;br/&gt;Row: 标题 + IconButton ContentCopy&lt;br/&gt;Surface min 120dp — 识别文本"]
    ROOT --> SETTINGS_CARD["Card — 识别设置&lt;br/&gt;Row: 引擎名(bold,primary) + Button '切换引擎'&lt;br/&gt;ExposedDropdownMenuBox — 语言选择"]
    ROOT --> ACT_ROW["Row 操作按钮"]
    ACT_ROW --> START["Button '开始识别' (primary)"]
    ACT_ROW --> STOP["Button '停止识别' (error 红色)"]
    ROOT --> STATUS_CARD["Card (secondaryContainer)&lt;br/&gt;Row: CheckCircle/Error + 初始化状态&lt;br/&gt;Row: Mic/MicOff + 监听状态"]
    ROOT --> ERR_SURFACE["[error!=null] Surface(errorContainer)&lt;br/&gt;Icon.Error + 错误信息"]
    ROOT --> HINT_CARD["Card (surfaceVariant 50%) — 使用说明"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">引擎生命周期（LaunchedEffect）</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">LaunchedEffect(recognitionMode)</div>
      <div class="tree-children">
        <div class="tree-node">shutdown() 旧服务 → createSpeechService(ctx, mode) 新服务</div>
      </div>
      <div class="tree-node">LaunchedEffect(speechService) [初始化]</div>
      <div class="tree-children">
        <div class="tree-node">initialize() → getSupportedLanguages() → availableLanguages</div>
      </div>
      <div class="tree-node">LaunchedEffect(speechService) [结果收集]</div>
      <div class="tree-children">
        <div class="tree-node">collect recognitionResultFlow → 追加 recognizedText</div>
        <div class="tree-node">collect recognitionErrorFlow → 更新 error</div>
      </div>
      <div class="tree-node">DisposableEffect(Unit) onDispose → shutdown()</div>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>hasAudioPermission</td><td>Boolean</td><td>RECORD_AUDIO 权限状态，决定是否渲染主 UI</td></tr>
      <tr><td>recognizedText</td><td>String</td><td>累积识别文本</td></tr>
      <tr><td>recognitionMode</td><td>SpeechServiceType</td><td>当前引擎（驱动 LaunchedEffect 重建服务）</td></tr>
      <tr><td>selectedLanguage</td><td>String</td><td>语言代码（默认 "zh-CN"）</td></tr>
      <tr><td>availableLanguages</td><td>List&lt;String&gt;</td><td>当前引擎支持的语言列表</td></tr>
      <tr><td>isInitialized</td><td>Boolean (collectAsState)</td><td>服务已初始化</td></tr>
      <tr><td>recognitionState</td><td>RecognitionState (collectAsState)</td><td>识别状态流</td></tr>
      <tr><td>isListening</td><td>Boolean (derived)</td><td>RECOGNIZING 或 PROCESSING 中</td></tr>
      <tr><td>error</td><td>String?</td><td>错误信息</td></tr>
    </table>

    <!-- TTS Section -->
    <div class="section-head orange" style="margin-top:24px;">TextToSpeechScreen — 文字转语音</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">通过 VoiceService 单例（VoiceServiceFactory.getInstance）播放语音，支持语速与音调调节。无权限门控，无需系统权限。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT2["Column (fillMaxSize, verticalScroll, padding 16dp)"]
    ROOT2 --> INPUT_CARD["Card — 输入文本&lt;br/&gt;OutlinedTextField (multiline, maxLines=5, minHeight=120dp)"]
    ROOT2 --> SETTINGS_CARD2["Card — 语音设置&lt;br/&gt;Slider 语速 (0.5–2.0, steps=5)&lt;br/&gt;Slider 音调 (0.5–2.0, steps=5)"]
    ROOT2 --> BTN_COL["Column (spacedBy 12dp)"]
    BTN_COL --> PLAY_BTN["Button '播放语音' (primary, fullWidth)&lt;br/&gt;需: isInitialized &amp;&amp; !isSpeaking &amp;&amp; text非空"]
    BTN_COL --> STOP_BTN["Button '停止播放' (error 红色, fullWidth)&lt;br/&gt;需: isSpeaking"]
    ROOT2 --> STATUS_CARD2["Card (secondaryContainer)&lt;br/&gt;Row: CheckCircle/Error + 初始化状态&lt;br/&gt;Row: VolumeUp/VolumeOff + 播放状态"]
    ROOT2 --> ERROR_CARD["[error!=null] Card(errorContainer) — 三层错误"]
    ERROR_CARD --> ERR1["Text error (主错误)"]
    ERROR_CARD --> ERR2["[errorDetails!=null] Text errorDetails"]
    ERROR_CARD --> ERR3["[debugInfo!=null] Text debugInfo (类名+参数)"]
    ERROR_CARD --> CLEAR["OutlinedButton '清除' → 三项全清空"]
    ROOT2 --> HINT_CARD2["Card (surfaceVariant 50%) — 使用说明"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">三层错误展示（特色功能）</div>
    <table class="act-table">
      <tr><th>层级</th><th>变量</th><th>内容来源</th></tr>
      <tr><td>主错误</td><td>error</td><td>人类可读描述（handleTtsError 按异常类型分派）</td></tr>
      <tr><td>详情</td><td>errorDetails</td><td>HTTP 状态码、响应体等诊断信息</td></tr>
      <tr><td>调试</td><td>debugInfo</td><td>服务类名 + 调用参数（rate, pitch 等）</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">handleTtsError() 按 TtsException / UnknownHostException / SocketTimeoutException / ConnectException / IOException 分派，生成不同级别错误文本；三项由同一个"清除"按钮统一清空。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>voiceService</td><td>VoiceService</td><td>VoiceServiceFactory 单例（remember，不随重组重建）</td></tr>
      <tr><td>inputText</td><td>String</td><td>待合成文本</td></tr>
      <tr><td>speechRate</td><td>Float (1.0f)</td><td>语速，范围 0.5–2.0</td></tr>
      <tr><td>speechPitch</td><td>Float (1.0f)</td><td>音调，范围 0.5–2.0</td></tr>
      <tr><td>isInitialized</td><td>Boolean</td><td>服务初始化成功</td></tr>
      <tr><td>isSpeaking</td><td>Boolean</td><td>播放中（由 speakingStateFlow 收集）</td></tr>
      <tr><td>error / errorDetails / debugInfo</td><td>String?</td><td>三层错误信息</td></tr>
    </table>
`);
