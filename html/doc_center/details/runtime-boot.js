registerTabContent('runtime-boot', `
<!-- ===== 冷启动全链路 ===== -->
<div style="max-width:1100px;margin:0 auto;padding:24px 20px 48px;">

  <!-- Hero / 总览 -->
  <div style="margin-bottom:28px;">
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:var(--text);">冷启动全链路</h2>
    <p style="margin:0;font-size:13px;color:var(--text-dim);">Application → 主界面可交互 · 每一步标注源文件路径与行号，可直接对照源码</p>
  </div>

  <!-- Phase overview table -->
  <div class="section-head blue">总览 — 四阶段启动链路</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">冷启动分 4 个阶段，耗时从上到下递增：</p>
  <table class="act-table">
    <thead>
      <tr><th>阶段</th><th>入口</th><th>产出</th><th>关键耗时点</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Phase 0</strong></td>
        <td><code>attachBaseContext</code></td>
        <td>语言配置注入</td>
        <td>同步读取 SharedPreferences</td>
      </tr>
      <tr>
        <td><strong>Phase 1</strong></td>
        <td><code>Application.onCreate</code></td>
        <td>全局单例就位、异步预热启动</td>
        <td>3 次 <code>runBlocking</code> DataStore 读取</td>
      </tr>
      <tr>
        <td><strong>Phase 2</strong></td>
        <td><code>MainActivity.onCreate</code></td>
        <td>首帧渲染（空白占位）</td>
        <td><code>performInitialChecks()</code> 协程</td>
      </tr>
      <tr>
        <td><strong>Phase 3</strong></td>
        <td><code>setAppContent</code> 门控</td>
        <td>用户看到可交互界面</td>
        <td>协议/迁移/权限门 + 插件加载</td>
      </tr>
    </tbody>
  </table>

  <!-- ===== Phase 0 ===== -->
  <div class="section-head green" style="margin-top:32px;">Phase 0 — attachBaseContext（语言注入）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">
    进程创建后，Android 系统首先调用 <code>attachBaseContext</code>，Operit 在此注入用户语言配置，
    确保后续所有 <code>getString()</code> 返回正确语言。
  </p>

  <div class="mermaid">
sequenceDiagram
    autonumber
    participant SYS as Android System
    participant APP as OperitApplication

    SYS->>APP: attachBaseContext(base)
    Note over APP: L545-571<br/>core/application/OperitApplication.kt

    APP->>APP: LocaleUtils.getCurrentLanguage(base)
    Note over APP: 同步读 SharedPreferences<br/>获取用户设置的语言 code

    APP->>APP: createConfigurationContext(config)
    Note over APP: 用 Locale 覆盖 Configuration<br/>确保后续 getString() 返回正确语言

    APP->>SYS: super.attachBaseContext(localeContext)
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 0;">
    <div class="tree-node"><code>core/application/OperitApplication.kt:545-571</code> — <code>attachBaseContext</code> 实现</div>
  </div>

  <!-- ===== Phase 1 ===== -->
  <div class="section-head orange" style="margin-top:32px;">Phase 1 — Application.onCreate（34 步初始化）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">
    <code>onCreate</code> 是冷启动耗时最长的阶段，共 34 步，涵盖同步初始化、
    DataStore 阻塞读取、异步预热以及延迟 800ms 的后台任务。
  </p>

  <div class="mermaid">
sequenceDiagram
    autonumber
    participant APP as OperitApplication<br/>onCreate L116-369
    participant MGR as 各 Manager/单例
    participant SVC as AIForegroundService
    participant IO as 异步协程 (IO)

    Note over APP: ═══ 同步初始化 ═══

    APP->>APP: 1. instance = this (L118-121)
    Note over APP: 全局单例挂载 + 启动时间戳

    APP->>MGR: 2. configureOpenMpEnvironment() (L122)
    Note over MGR: 设置 KMP_AFFINITY / OMP_PROC_BIND

    APP->>MGR: 3. AppIconManager.ensureComponentState() (L123)

    APP->>MGR: 4. CrashRecoveryState.consumePendingCrashReportLaunch() (L126)
    Note over MGR: 检测是否崩溃恢复启动

    APP->>MGR: 5. AppLogger.resetLogFile() (L127-129)
    Note over MGR: 非崩溃恢复时重置日志

    APP->>MGR: 6. ensureWorkManagerInitialized() (L131)

    APP->>IO: 7. launchCleanOnExitCleanup() (L140)
    Note over IO: 异步清理上次退出的临时文件

    APP->>MGR: 8. ActivityLifecycleManager.initialize() (L144)
    Note over MGR: 注册全局 Activity 生命周期追踪

    APP->>MGR: 9. AIMessageManager.initialize() (L148)

    APP->>MGR: 10. PluginRegistry.initializeBuiltins() (L149)

    APP->>IO: 11. AppLifecycleHookPluginRegistry.dispatchAsync() (L150-160)
    Note over IO: 分发 APPLICATION_CREATE 给插件

    rect rgb(60, 30, 10)
        Note over APP,SVC: ⚠️ 阻塞主线程的 DataStore 读取

        APP->>APP: 12. startGlobalAIForegroundServiceIfNeeded() (L162)
        Note over APP: runBlocking 读取:<br/>① WakeWordPreferences.alwaysListeningEnabledFlow<br/>② ExternalHttpApiPreferences.enabledFlow<br/><br/>条件: (alwaysListening || externalHttp) &amp;&amp; !isRunning<br/>→ startForegroundService(AIForegroundService)
    end

    APP->>APP: 13. Thread.setDefaultUncaughtExceptionHandler() (L169)
    Note over APP: GlobalExceptionHandler

    APP->>APP: 14. 初始化全局 Json 实例 (L173-179)
    Note over APP: SerializationSetup.module

    rect rgb(60, 30, 10)
        APP->>APP: 15. initializeAppLanguage() (L183)
        Note over APP: runBlocking 读取语言设置并应用<br/>(第3次 DataStore 阻塞读)
    end

    APP->>MGR: 16. initUserPreferencesManager() (L187-188)
    APP->>MGR: 17. initAndroidPermissionPreferences() (L192)

    APP->>IO: 18. CharacterCardManager.initializeIfNeeded() (L196-200)
    APP->>IO: 19. CustomEmojiRepository.initializeBuiltinEmojis() (L203-207)

    APP->>MGR: 20. AndroidShellExecutor.setContext() (L210)

    APP->>MGR: 21. ShowerEnvironment 配置 (L214-239)
    Note over MGR: shellRunner / logSink 虚拟屏 Shell 环境

    APP->>MGR: 22. PDFBoxResourceLoader.init() (L244)
    APP->>MGR: 23. LanguageFactory.init() (L248)

    APP->>IO: 24. TextSegmenter.initialize() (L252-256)
    Note over IO: Jieba 分词预热

    APP->>MGR: 25. WaifuMessageProcessor.initialize() (L259)

    APP->>IO: 26. Room 数据库预加载 (L263-268)
    Note over IO: database.problemDao().getProblemCount()

    APP->>APP: 27. Coil ImageLoader 构建 (L279-303)
    Note over APP: 30s连接/60s读取超时

    APP->>MGR: 28. ImagePoolManager.initialize() (L307)
    APP->>MGR: 29. MediaPoolManager.initialize() (L311)
    APP->>MGR: 30. SkillRepoZipPoolManager.initialize() (L314)

    Note over APP: ═══ 延迟异步初始化 ═══

    APP->>IO: 31. delay(800ms) → 磁盘预加载 + AIToolHandler.registerDefaultTools() (L317-333)
    Note over IO: 延迟 800ms 避免首屏掉帧

    APP->>IO: 32. WorkflowSchedulerInitializer.initialize() (L336-340)
    APP->>IO: 33. RoomDatabaseBackupPreferences → 备份调度 (L342-353)
    APP->>IO: 34. UIHierarchyManager.bindToService() (L356-365)
    Note over IO: 无障碍服务预绑定
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 16px;">
    <div class="tree-node"><code>core/application/OperitApplication.kt:116-369</code> — <code>onCreate</code> 主体</div>
    <div class="tree-node"><code>core/application/OperitApplication.kt:471-493</code> — <code>startGlobalAIForegroundServiceIfNeeded</code></div>
    <div class="tree-node"><code>data/preferences/WakeWordPreferences.kt</code> — 唤醒词偏好</div>
    <div class="tree-node"><code>data/preferences/ExternalHttpApiPreferences.kt</code> — 外部 HTTP 偏好</div>
  </div>

  <!-- Blocking points warning -->
  <div style="background:rgba(255,180,0,0.08);border-left:3px solid var(--orange);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:var(--orange);">⚠️ 主线程阻塞点</p>
    <p style="margin:0 0 10px;font-size:13px;color:var(--text-dim);">
      <code>Application.onCreate</code> 中有 <strong style="color:var(--text);">3 次 <code>runBlocking</code></strong> 同步读取 DataStore。
      这些阻塞读取会增加冷启动耗时，但因为需要在主线程完成语言设置和服务启动判断，无法简单异步化。
    </p>
    <table class="act-table" style="margin:0;">
      <thead>
        <tr><th>位置</th><th>读取内容</th><th>用途</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>L162</code> <code>startGlobalAIForegroundServiceIfNeeded</code></td>
          <td><code>alwaysListeningEnabledFlow.first()</code></td>
          <td>判断是否启动前台服务</td>
        </tr>
        <tr>
          <td><code>L162</code> 同上</td>
          <td><code>ExternalHttpApiPreferences.enabledFlow.first()</code></td>
          <td>同上</td>
        </tr>
        <tr>
          <td><code>L183</code> <code>initializeAppLanguage</code></td>
          <td>语言配置 Flow</td>
          <td>应用界面语言</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ===== Phase 2 ===== -->
  <div class="section-head purple" style="margin-top:32px;">Phase 2 — MainActivity.onCreate（首帧渲染 + 门控检查）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">
    Activity 创建后立即渲染黑色背景首帧（空白占位），并在 <code>lifecycleScope</code> 协程中
    异步执行门控检查序列。配置变更重建（如旋转屏幕）时跳过门控直接显示主界面。
  </p>

  <div class="mermaid">
sequenceDiagram
    autonumber
    participant SYS as Android System
    participant MA as MainActivity<br/>onCreate L256-302
    participant COMP as initializeComponents<br/>L601-623
    participant CHK as performInitialChecks<br/>L428-461 (协程)
    participant UI as setAppContent<br/>L690+

    SYS->>MA: onCreate(savedInstanceState)

    MA->>MA: 1. 记录 lastOrientation (L258)
    MA->>MA: 2. 设置窗口背景黑色 (L261)
    Note over MA: 防止系统主题色渗透

    MA->>MA: 3. handleIntent(intent) (L265)
    Note over MA: 处理分享文件/链接/<br/>OAuth 回调/快捷方式

    MA->>MA: 4. restoreRuntimeTaskViewVisibilityIfNeeded (L266)

    MA->>COMP: 5. initializeComponents() (L270)
    COMP->>COMP: AIToolHandler.getInstance(this)
    COMP->>COMP: MCPRepository(this)
    COMP->>COMP: AnrMonitor(this, lifecycleScope)
    COMP->>COMP: UserPreferencesManager.getInstance(this)
    Note over COMP: 检查 showPreferencesGuide
    COMP->>COMP: AgreementPreferences(this)
    COMP->>COMP: ChatHistoryMigrationManager(this)
    COMP-->>MA: 组件就绪

    MA->>MA: 6. anrMonitor.start() (L271)
    MA->>MA: 7. setupPreferencesListener() (L272)
    MA->>MA: 8. configureDisplaySettings() (L273)
    Note over MA: 高刷新率 / 持续高性能模式

    MA->>MA: 9. pluginLoadingState 绑定 (L276-283)

    MA->>UI: 10. setAppContent() (L286)
    Note over UI: 首帧渲染<br/>initialChecksDone=false<br/>→ 空白占位屏幕

    MA->>MA: 11. setupUpdateManager() (L289)
    Note over MA: 延迟 3 秒检查更新

    alt savedInstanceState == null (冷启动)
        MA->>CHK: 12. performInitialChecks() (L292)
        Note over CHK: 在 lifecycleScope 协程中执行
    else 配置变更重建
        MA->>MA: initialChecksDone = true (L298)
        Note over MA: 跳过门控，直接显示主界面
    end
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 0;">
    <div class="tree-node"><code>ui/main/MainActivity.kt:256-302</code> — <code>onCreate</code></div>
    <div class="tree-node"><code>ui/main/MainActivity.kt:601-623</code> — <code>initializeComponents</code></div>
    <div class="tree-node"><code>ui/main/MainActivity.kt:428-461</code> — <code>performInitialChecks</code></div>
  </div>

  <!-- ===== Phase 3 ===== -->
  <div class="section-head cyan" style="margin-top:32px;">Phase 3 — 门控序列 + 主界面渲染</div>

  <!-- 3.1 门控检查流程 -->
  <p style="font-size:14px;font-weight:600;color:var(--text);margin:16px 0 8px;">3.1 门控检查流程</p>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 12px;">
    <code>performInitialChecks()</code> 在协程中顺序检查四道门，任意一道门触发后设置
    <code>initialChecksDone = true</code>，驱动 <code>setAppContent()</code> 重新渲染对应屏幕。
  </p>

  <div class="mermaid">
flowchart TD
    START["performInitialChecks()<br/>MainActivity.kt:428"] --> NOTIF["① checkNotificationPermission()<br/>Android 13+ 请求 POST_NOTIFICATIONS"]
    NOTIF --> PERM["② checkPermissionLevelSet()<br/>读取 getPreferredPermissionLevel()"]
    PERM --> PERM_CHK{permissionLevel == null?}
    PERM_CHK -->|是| SHOW_PERM["showPermissionGuide = true<br/>→ 权限引导门"]
    PERM_CHK -->|否| AGREE_CHK{agreementPreferences<br/>.isAgreementAccepted()?}
    SHOW_PERM --> DONE["initialChecksDone = true<br/>→ setAppContent()"]
    AGREE_CHK -->|否| DONE
    AGREE_CHK -->|是| MIGRATE_CHK{"migrationManager<br/>.needsMigration()?"}
    MIGRATE_CHK -->|是| SHOW_MIG["showMigrationScreen = true<br/>→ 迁移门"]
    MIGRATE_CHK -->|否| PLUGIN["startPluginLoading()<br/>→ 插件加载"]
    SHOW_MIG --> DONE
    PLUGIN --> DONE
  </div>

  <!-- 3.2 setAppContent 渲染决策树 -->
  <p style="font-size:14px;font-weight:600;color:var(--text);margin:24px 0 8px;">3.2 setAppContent 渲染决策树</p>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 12px;">
    <code>setAppContent</code>（<code>MainActivity.kt:690+</code>）根据状态变量选择渲染内容：
  </p>

  <div class="mermaid">
flowchart TD
    ENTRY["setAppContent()"] --> INIT_CHK{initialChecksDone?}
    INIT_CHK -->|false| BLANK["空白占位<br/>(黑色背景)"]
    INIT_CHK -->|true| GATE1{agreementAccepted?}

    GATE1 -->|false| AGREE["AgreementScreen<br/>agreement/screens/<br/>AgreementScreen.kt:23<br/><br/>5秒倒计时 → 接受按钮可点击<br/>接受后 → checkPermissionLevelSet()<br/>→ setAppContent() 刷新"]

    GATE1 -->|true| GATE2{showMigrationScreen?}

    GATE2 -->|true| MIGRATE["MigrationScreen<br/>migration/screens/<br/>MigrationScreen.kt:72<br/><br/>迁移完成 → startPluginLoading()<br/>→ showMigrationScreen = false"]

    GATE2 -->|false| GATE3{showPermissionGuide?}

    GATE3 -->|true| GUIDE["PermissionGuideScreen<br/>permission/screens/<br/>PermissionGuideScreen.kt:91<br/><br/>6 页引导（3引导+Welcome<br/>+Basic Permissions<br/>+Permission Level 选择）<br/>完成 → setAppContent() 刷新"]

    GATE3 -->|false| MAIN["OperitApp(initialNavItem)<br/>ui/main/OperitApp.kt:56<br/><br/>+ PluginLoadingScreen<br/>(zIndex=10 覆盖层)"]
  </div>

  <!-- 3.3 门控详情 -->
  <p style="font-size:14px;font-weight:600;color:var(--text);margin:24px 0 8px;">3.3 门控详情</p>
  <table class="act-table">
    <thead>
      <tr><th>门</th><th>检测条件</th><th>Screen</th><th>完成后行为</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>协议门</strong></td>
        <td><code>agreement_accepted == false</code>（SharedPreferences）</td>
        <td><code>AgreementScreen</code> — 5 秒倒计时才可接受</td>
        <td>回调 → <code>checkPermissionLevelSet()</code> → <code>setAppContent()</code></td>
      </tr>
      <tr>
        <td><strong>迁移门</strong></td>
        <td><code>migration_version</code> 版本号过旧 + 旧 DataStore 数据存在</td>
        <td><code>MigrationScreen</code> — 自动迁移聊天历史到 Room</td>
        <td>完成 → <code>startPluginLoading()</code></td>
      </tr>
      <tr>
        <td><strong>权限门</strong></td>
        <td><code>getPreferredPermissionLevel() == null</code></td>
        <td><code>PermissionGuideScreen</code> — 6 页引导</td>
        <td>完成 → <code>showPermissionGuide = false</code> → <code>setAppContent()</code></td>
      </tr>
      <tr>
        <td><strong>插件加载</strong></td>
        <td>前三门通过后自动触发</td>
        <td><code>PluginLoadingScreen</code> — <strong>覆盖层</strong>（zIndex=10）</td>
        <td>30 秒超时显示跳过按钮</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 0;">
    <div class="tree-node"><code>data/preferences/AgreementPreferences.kt</code> — 31 行，<code>agreement_preferences</code> SharedPreferences</div>
    <div class="tree-node"><code>data/repository/ChatHistoryMigrationManager.kt:52-67</code> — <code>needsMigration()</code></div>
    <div class="tree-node"><code>data/preferences/AndroidPermissionPreferences.kt</code> — 权限级别检测</div>
  </div>

  <!-- 3.4 插件加载流程 -->
  <p style="font-size:14px;font-weight:600;color:var(--text);margin:24px 0 8px;">3.4 插件加载流程</p>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 12px;">
    三道门全部通过后，<code>startPluginLoading()</code> 以覆盖层形式显示进度，
    逐个启动已启用的 MCP 插件，30 秒超时后显示跳过按钮。
  </p>

  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MA as MainActivity
    participant PLS as PluginLoadingState
    participant MCP as MCPStarter

    MA->>PLS: startPluginLoading() (L487)
    PLS->>PLS: show() — 显示覆盖层

    PLS->>PLS: startTimeoutCheck(30000L)
    Note over PLS: 30 秒后显示跳过按钮

    PLS->>PLS: delay(500ms)

    PLS->>PLS: initializeMCPServer() (L500)
    Note over PLS: 1. 读取已安装插件列表<br/>2. 筛选已启用的插件<br/>3. 逐个通过 MCPStarter 启动<br/>4. 进度 5% → 100%

    loop 每个已启用插件
        PLS->>MCP: 启动插件
        MCP-->>PLS: 启动结果
        PLS->>PLS: 更新进度条
    end

    PLS->>PLS: hide() — 移除覆盖层
    Note over PLS: 主界面完全可交互
  </div>

  <!-- ===== AIForegroundService ===== -->
  <div class="section-head red" style="margin-top:32px;">AIForegroundService 生命周期</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">
    当 Phase 1 步骤 12 判定 <code>alwaysListening || externalHttp</code> 为 true 且服务未运行时，
    Application 启动前台服务。服务在空闲条件满足后可自停。
  </p>

  <div class="mermaid">
sequenceDiagram
    autonumber
    participant APP as Application
    participant SVC as AIForegroundService<br/>onCreate L888-910

    APP->>SVC: startForegroundService(Intent)

    SVC->>SVC: 1. isRunning.set(true)
    SVC->>SVC: 2. chatRuntimeHolder (lazy 初始化)
    SVC->>SVC: 3. createNotificationChannel()
    SVC->>SVC: 4. startForeground(dataSync + specialUse)
    SVC->>SVC: 5. observeRuntimeTaskViewPreference()
    SVC->>SVC: 6. observeChatRuntimeStats()
    SVC->>SVC: 7. startWakeMonitoring()
    Note over SVC: 唤醒词持续监听
    SVC->>SVC: 8. startExternalHttpMonitoring()
    Note over SVC: HTTP API 服务器

    Note over SVC: 自停条件 (stopSelfIfIdle L867-886):<br/>AI 不忙 &amp;&amp; alwaysListening 关<br/>&amp;&amp; externalHttp 关 &amp;&amp; 应用不在前台
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 0;">
    <div class="tree-node"><code>api/chat/AIForegroundService.kt:888-910</code> — <code>onCreate</code></div>
    <div class="tree-node"><code>api/chat/AIForegroundService.kt:867-886</code> — <code>stopSelfIfIdle</code></div>
    <div class="tree-node"><code>api/chat/AIForegroundService.kt:471-493</code> — 启动条件判断</div>
  </div>

  <!-- ===== OperitApp 初始化 ===== -->
  <div class="section-head green" style="margin-top:32px;">OperitApp 初始化（主界面就绪后）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">
    进入 <code>OperitApp</code> 后，还有一组 <code>LaunchedEffect</code> 异步任务在首次组合时触发。
    默认初始屏幕为 <code>AiChat</code>（通过 <code>OperitRouter.getScreenForNavItem(NavItem.AiChat)</code> 路由）。
  </p>

  <table class="act-table">
    <thead>
      <tr><th>LaunchedEffect</th><th>触发条件</th><th>任务</th><th>文件位置</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>LaunchedEffect(Unit)</code></td>
        <td>首次组合</td>
        <td>网络状态轮询（每 10 秒）</td>
        <td><code>OperitApp.kt:240-245</code></td>
      </tr>
      <tr>
        <td><code>LaunchedEffect(isNetworkAvailable)</code></td>
        <td>网络状态变化</td>
        <td>拉取远程公告</td>
        <td><code>OperitApp.kt:249-256</code></td>
      </tr>
      <tr>
        <td><code>LaunchedEffect(Unit)</code></td>
        <td>首次组合</td>
        <td><code>mcpRepository.syncInstalledStatus()</code></td>
        <td><code>OperitApp.kt:266-271</code></td>
      </tr>
      <tr>
        <td><code>LaunchedEffect(shortcutNavRequest)</code></td>
        <td>快捷方式 Intent</td>
        <td>导航到目标页面</td>
        <td><code>OperitApp.kt</code> 内</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px;"><strong style="color:var(--text);">关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 0;">
    <div class="tree-node"><code>ui/main/OperitApp.kt:56-62</code> — 函数签名</div>
    <div class="tree-node"><code>ui/main/OperitApp.kt:73-75</code> — 导航栈初始化</div>
  </div>

  <!-- ===== 完整时间线 ===== -->
  <div class="section-head blue" style="margin-top:32px;">完整时间线总结</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px;">从进程创建到用户可交互的完整调用链路：</p>

  <div class="kn-code">进程创建
  │
  ├─ attachBaseContext()          ← 语言配置注入（同步 SharedPreferences 读取）
  │
  ├─ Application.onCreate()      ← 34 步初始化
  │    ├── 步骤 1-11: 同步初始化（单例、Manager、插件注册）
  │    ├── 步骤 12: ⚠️ runBlocking 判断前台服务（2 次 DataStore 读取）
  │    ├── 步骤 13-17: 崩溃处理、JSON、语言（⚠️ 第 3 次阻塞读取）、偏好
  │    ├── 步骤 18-26: 混合异步初始化（角色卡、Emoji、分词、数据库）
  │    ├── 步骤 27-30: 同步构建图片/媒体加载器
  │    └── 步骤 31-34: 延迟 800ms 异步（工具注册、工作流、备份、无障碍）
  │
  ├─ MainActivity.onCreate()
  │    ├── handleIntent() → initializeComponents() → ANR 监控
  │    ├── setAppContent()  ← ⭐ 首帧渲染（空白占位）
  │    ├── setupUpdateManager()
  │    └── performInitialChecks() (协程)
  │         ├── 通知权限检查
  │         ├── 权限级别检查 → 权限引导门?
  │         ├── 协议检查 → 协议门?
  │         ├── 迁移检查 → 迁移门?
  │         └── initialChecksDone = true → setAppContent()
  │
  └─ setAppContent() 门控渲染
       ├── 协议门: AgreementScreen (5 秒倒计时)
       ├── 迁移门: MigrationScreen (自动迁移)
       ├── 权限门: PermissionGuideScreen (6 页引导)
       └── 主界面: OperitApp + PluginLoadingScreen (覆盖层)
            ├── 网络状态轮询
            ├── 远程公告拉取
            ├── MCP 插件同步
            └── ⭐ 用户看到 AiChat 页面，可交互</div>

  <!-- ===== 核心文件清单 ===== -->
  <div class="section-head purple" style="margin-top:32px;">核心文件清单</div>
  <table class="act-table">
    <thead>
      <tr><th>文件</th><th>路径</th><th>行数</th><th>职责</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>OperitApplication</strong></td>
        <td><code>core/application/OperitApplication.kt</code></td>
        <td>~570</td>
        <td>Application.onCreate 34 步初始化</td>
      </tr>
      <tr>
        <td><strong>MainActivity</strong></td>
        <td><code>ui/main/MainActivity.kt</code></td>
        <td>~800</td>
        <td>Activity 生命周期 + 门控序列</td>
      </tr>
      <tr>
        <td><strong>OperitApp</strong></td>
        <td><code>ui/main/OperitApp.kt</code></td>
        <td>~280</td>
        <td>根 Composable + 导航 + LaunchedEffect</td>
      </tr>
      <tr>
        <td><strong>AIForegroundService</strong></td>
        <td><code>api/chat/AIForegroundService.kt</code></td>
        <td>~1000</td>
        <td>前台服务生命周期</td>
      </tr>
      <tr>
        <td><strong>AgreementScreen</strong></td>
        <td><code>ui/features/agreement/screens/AgreementScreen.kt</code></td>
        <td>~100</td>
        <td>协议门</td>
      </tr>
      <tr>
        <td><strong>MigrationScreen</strong></td>
        <td><code>ui/features/migration/screens/MigrationScreen.kt</code></td>
        <td>~100</td>
        <td>迁移门</td>
      </tr>
      <tr>
        <td><strong>PermissionGuideScreen</strong></td>
        <td><code>ui/features/permission/screens/PermissionGuideScreen.kt</code></td>
        <td>~200</td>
        <td>权限门（6 页引导）</td>
      </tr>
      <tr>
        <td><strong>AgreementPreferences</strong></td>
        <td><code>data/preferences/AgreementPreferences.kt</code></td>
        <td>31</td>
        <td>协议接受状态</td>
      </tr>
      <tr>
        <td><strong>ChatHistoryMigrationManager</strong></td>
        <td><code>data/repository/ChatHistoryMigrationManager.kt</code></td>
        <td>~100</td>
        <td>迁移检测 + 执行</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid var(--border);">
    <p style="font-size:11px;color:var(--text-dimmer);margin:0;">
      基于 docs/project_overview/37_Runtime.冷启动全链路.md · Operit App 冷启动链路文档
    </p>
  </div>

</div>
`);
