# 冷启动全链路（Application → 主界面可交互）

本文档描述 Operit 从进程创建到用户看到可交互主界面的完整初始化链路。每一步标注源文件路径和行号，可直接跳到源码对照。

## 总览

冷启动分 4 个阶段，耗时从上到下递增：

| 阶段 | 入口 | 产出 | 关键耗时点 |
|------|------|------|-----------|
| **Phase 0** | `attachBaseContext` | 语言配置注入 | 同步读取 SharedPreferences |
| **Phase 1** | `Application.onCreate` | 全局单例就位、异步预热启动 | 3 次 `runBlocking` DataStore 读取 |
| **Phase 2** | `MainActivity.onCreate` | 首帧渲染（空白占位） | `performInitialChecks()` 协程 |
| **Phase 3** | `setAppContent` 门控 | 用户看到可交互界面 | 协议/迁移/权限门 + 插件加载 |

## Phase 0: attachBaseContext（语言注入）

```mermaid
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
```

**关键文件：**
- `core/application/OperitApplication.kt:545-571` — `attachBaseContext` 实现

## Phase 1: Application.onCreate（34 步初始化）

```mermaid
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

    rect rgb(255, 235, 235)
        Note over APP,SVC: ⚠️ 阻塞主线程的 DataStore 读取

        APP->>APP: 12. startGlobalAIForegroundServiceIfNeeded() (L162)
        Note over APP: runBlocking 读取:<br/>① WakeWordPreferences.alwaysListeningEnabledFlow<br/>② ExternalHttpApiPreferences.enabledFlow<br/><br/>条件: (alwaysListening || externalHttp) && !isRunning<br/>→ startForegroundService(AIForegroundService)
    end

    APP->>APP: 13. Thread.setDefaultUncaughtExceptionHandler() (L169)
    Note over APP: GlobalExceptionHandler

    APP->>APP: 14. 初始化全局 Json 实例 (L173-179)
    Note over APP: SerializationSetup.module

    rect rgb(255, 235, 235)
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
```

**关键文件：**
- `core/application/OperitApplication.kt:116-369` — `onCreate` 主体
- `core/application/OperitApplication.kt:471-493` — `startGlobalAIForegroundServiceIfNeeded`
- `data/preferences/WakeWordPreferences.kt` — 唤醒词偏好
- `data/preferences/ExternalHttpApiPreferences.kt` — 外部 HTTP 偏好

### ⚠️ 主线程阻塞点

Application.onCreate 中有 **3 次 `runBlocking`** 同步读取 DataStore：

| 位置 | 读取内容 | 用途 |
|------|---------|------|
| L162 `startGlobalAIForegroundServiceIfNeeded` | `alwaysListeningEnabledFlow.first()` | 判断是否启动前台服务 |
| L162 同上 | `ExternalHttpApiPreferences.enabledFlow.first()` | 同上 |
| L183 `initializeAppLanguage` | 语言配置 Flow | 应用界面语言 |

这些阻塞读取会增加冷启动耗时，但因为需要在主线程完成语言设置和服务启动判断，无法简单异步化。

## Phase 2: MainActivity.onCreate（首帧渲染 + 门控检查）

```mermaid
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
```

**关键文件：**
- `ui/main/MainActivity.kt:256-302` — `onCreate`
- `ui/main/MainActivity.kt:601-623` — `initializeComponents`
- `ui/main/MainActivity.kt:428-461` — `performInitialChecks`

## Phase 3: 门控序列 + 主界面渲染

### 3.1 门控检查流程

```mermaid
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
```

### 3.2 setAppContent 渲染决策树

`setAppContent`（`MainActivity.kt:690+`）根据状态变量选择渲染内容：

```mermaid
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

    style AGREE fill:#f8d7da,color:#000
    style MIGRATE fill:#fff3cd,color:#000
    style GUIDE fill:#d1ecf1,color:#000
    style MAIN fill:#d4edda,color:#000
```

### 3.3 门控详情

| 门 | 检测条件 | Screen | 完成后行为 |
|---|---------|--------|-----------|
| **协议门** | `agreement_accepted == false` (SharedPreferences) | `AgreementScreen` — 5 秒倒计时才可接受 | 回调 → `checkPermissionLevelSet()` → `setAppContent()` |
| **迁移门** | `migration_version` 版本号过旧 + 旧 DataStore 数据存在 | `MigrationScreen` — 自动迁移聊天历史到 Room | 完成 → `startPluginLoading()` |
| **权限门** | `getPreferredPermissionLevel() == null` | `PermissionGuideScreen` — 6 页引导 | 完成 → `showPermissionGuide = false` → `setAppContent()` |
| **插件加载** | 前三门通过后自动触发 | `PluginLoadingScreen` — **覆盖层** (zIndex=10) | 30 秒超时显示跳过按钮 |

**关键文件：**
- `data/preferences/AgreementPreferences.kt` — 31 行，`agreement_preferences` SharedPreferences
- `data/repository/ChatHistoryMigrationManager.kt:52-67` — `needsMigration()`
- `data/preferences/AndroidPermissionPreferences.kt` — 权限级别检测

### 3.4 插件加载流程

```mermaid
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
```

## AIForegroundService 生命周期

当 Phase 1 步骤 12 判定需要启动时：

```mermaid
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

    Note over SVC: 自停条件 (stopSelfIfIdle L867-886):<br/>AI 不忙 && alwaysListening 关<br/>&& externalHttp 关 && 应用不在前台
```

**关键文件：**
- `api/chat/AIForegroundService.kt:888-910` — `onCreate`
- `api/chat/AIForegroundService.kt:867-886` — `stopSelfIfIdle`
- `api/chat/AIForegroundService.kt:471-493` — 启动条件判断

## OperitApp 初始化（主界面就绪后）

进入 `OperitApp` 后，还有一组 `LaunchedEffect` 异步任务：

| LaunchedEffect | 触发条件 | 任务 | 文件位置 |
|---------------|---------|------|---------|
| `LaunchedEffect(Unit)` | 首次组合 | 网络状态轮询（每 10 秒） | OperitApp.kt:240-245 |
| `LaunchedEffect(isNetworkAvailable)` | 网络状态变化 | 拉取远程公告 | OperitApp.kt:249-256 |
| `LaunchedEffect(Unit)` | 首次组合 | `mcpRepository.syncInstalledStatus()` | OperitApp.kt:266-271 |
| `LaunchedEffect(shortcutNavRequest)` | 快捷方式 Intent | 导航到目标页面 | OperitApp.kt 内 |

默认初始屏幕：`AiChat`（通过 `OperitRouter.getScreenForNavItem(NavItem.AiChat)` 路由）。

**关键文件：**
- `ui/main/OperitApp.kt:56-62` — 函数签名
- `ui/main/OperitApp.kt:73-75` — 导航栈初始化

## 完整时间线总结

```
进程创建
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
            └── ⭐ 用户看到 AiChat 页面，可交互
```

## 核心文件清单

| 文件 | 路径 | 行数 | 职责 |
|------|------|------|------|
| **OperitApplication** | `core/application/OperitApplication.kt` | ~570 | Application.onCreate 34 步初始化 |
| **MainActivity** | `ui/main/MainActivity.kt` | ~800 | Activity 生命周期 + 门控序列 |
| **OperitApp** | `ui/main/OperitApp.kt` | ~280 | 根 Composable + 导航 + LaunchedEffect |
| **AIForegroundService** | `api/chat/AIForegroundService.kt` | ~1000 | 前台服务生命周期 |
| **AgreementScreen** | `ui/features/agreement/screens/AgreementScreen.kt` | ~100 | 协议门 |
| **MigrationScreen** | `ui/features/migration/screens/MigrationScreen.kt` | ~100 | 迁移门 |
| **PermissionGuideScreen** | `ui/features/permission/screens/PermissionGuideScreen.kt` | ~200 | 权限门（6 页引导） |
| **AgreementPreferences** | `data/preferences/AgreementPreferences.kt` | 31 | 协议接受状态 |
| **ChatHistoryMigrationManager** | `data/repository/ChatHistoryMigrationManager.kt` | ~100 | 迁移检测 + 执行 |
