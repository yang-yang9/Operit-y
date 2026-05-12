# Tutorial: 启动链路精讲

> **前置条件：** 你已经读过 `00_全景梳理.md`，知道项目的分层架构（api/core/data/ui/services），并且已经把 App 编译跑起来过至少一次。
>
> **本教程的目标：** 读完后你能回答"App 从点击图标到用户看到聊天界面，中间经过了哪些环节，为什么要经过这些环节"。
>
> **参考手册：** 如果你需要查 34 步初始化的每一步行号，请看 `37_Runtime.冷启动全链路.md`。本教程不会覆盖所有细节，而是聚焦 **5 个关键设计决策** 背后的 WHY。

---

## 冷启动全景：你看到的 vs 实际发生的

先建立直觉。用户点击 App 图标后看到的是：

```
[黑屏] → [空白] → [协议页 or 权限引导 or 聊天界面] → [插件加载动画] → [可交互]
```

实际发生的是：

```mermaid
graph LR
    subgraph 用户不可见
        A["进程创建"] --> B["attachBaseContext<br/>语言注入"]
        B --> C["Application.onCreate<br/>34 步初始化"]
        C --> D["MainActivity.onCreate<br/>组件初始化"]
    end

    subgraph 用户可见
        D --> E["首帧渲染<br/>（空白占位）"]
        E --> F["门控检查<br/>协议/迁移/权限"]
        F --> G["主界面 + 插件加载<br/>（覆盖层）"]
        G --> H["完全可交互"]
    end

    style A fill:#1a3a2a,color:#a3d9b1
    style B fill:#1a3a2a,color:#a3d9b1
    style C fill:#1a3a2a,color:#a3d9b1
    style D fill:#1a3a2a,color:#a3d9b1
    style E fill:#2a1a3a,color:#c9a3d9
    style F fill:#2a1a3a,color:#c9a3d9
    style G fill:#2a1a3a,color:#c9a3d9
    style H fill:#2a1a3a,color:#c9a3d9
```

关键认知：**用户看到界面之前，系统已经做了大量工作**。这些工作分散在 3 个类里：

| 类 | 文件 | 职责 |
|---|------|------|
| `OperitApplication` | `core/application/OperitApplication.kt` | 进程级初始化（全局单例、服务、预热） |
| `MainActivity` | `ui/main/MainActivity.kt` | Activity 级初始化（组件、门控、首帧） |
| `OperitApp` | `ui/main/OperitApp.kt` | Compose 级初始化（导航、网络轮询） |

---

## 第一课：Android 启动生命周期基础

如果你熟悉 Android 开发，可以跳过这一节。

Android App 启动时，系统按这个顺序调用：

```mermaid
sequenceDiagram
    autonumber
    participant SYS as Android 系统
    participant APP as Application 子类
    participant ACT as Activity 子类

    SYS->>APP: attachBaseContext(base)
    Note over APP: 最早的入口点<br/>此时还没有 Application 实例<br/>只能做极简的配置注入

    SYS->>APP: onCreate()
    Note over APP: Application 实例已创建<br/>适合做全局初始化<br/>⚠️ 此时还没有任何 Activity

    SYS->>ACT: onCreate(savedInstanceState)
    Note over ACT: 第一个 Activity 创建<br/>可以开始渲染 UI
```

**关键约束：**
- `attachBaseContext` 时几乎什么都不能做，因为 Application 还没初始化完
- `Application.onCreate` 在**主线程**执行，耗时操作会导致 ANR（Application Not Responding）
- `Activity.onCreate` 调用 `setContent {}` 后 Compose 才开始渲染第一帧

Operit 的挑战在于：它有 34 个初始化步骤要在 `Application.onCreate` 里完成，而主线程不能阻塞太久。接下来我们看它是怎么解决这个矛盾的。

---

## 第二课：语言注入 — 为什么必须在 attachBaseContext 做

### 问题

Operit 支持多语言。用户设置了日语界面，App 启动时所有 `getString(R.string.xxx)` 调用必须返回日语文本。但 Android 的资源系统在 `attachBaseContext` 阶段就绑定了 `Configuration`——如果你在 `onCreate` 里才改语言，那些在 `onCreate` 之前就被加载的资源字符串已经是默认语言了。

### 解决方案

```kotlin
// OperitApplication.kt:545
override fun attachBaseContext(base: Context) {
    // 1. 从 SharedPreferences 同步读取语言设置
    val code = LocaleUtils.getCurrentLanguage(base)

    // 2. 用读到的语言创建新的 Configuration
    val locale = Locale(code)
    val config = Configuration(base.resources.configuration).apply {
        setLocale(locale)
    }

    // 3. 用新 Configuration 创建 Context，传给 super
    val context = base.createConfigurationContext(config)
    super.attachBaseContext(context)
}
```

### 为什么这么设计

```mermaid
flowchart LR
    Q["为什么不在 onCreate 里设置语言?"]
    A["因为 onCreate 时 resources<br/>已经绑定了默认 Locale"]
    Q --> A

    Q2["为什么用 SharedPreferences<br/>而不是 DataStore?"]
    A2["DataStore 是异步的，<br/>attachBaseContext 不能等协程"]
    Q2 --> A2

    Q3["为什么 Activity 也有<br/>一次 attachBaseContext?"]
    A3["每个 Activity 有独立的<br/>Configuration，需要各自注入"]
    Q3 --> A3
```

> **动手验证：** 在 `attachBaseContext` 的 `val code = ...` 行加断点，启动 App，确认它比 `onCreate` 先执行。注意变量 `code` 的值——这就是用户上次选择的语言。

---

## 第三课：Application.onCreate — 34 步背后的 5 类任务

34 步初始化看起来很吓人，但它们归属于 **5 类任务**，每类有不同的执行策略：

```mermaid
graph TD
    subgraph 类型A["A. 必须同步 + 必须最先"]
        A1["全局单例挂载<br/>instance = this"]
        A2["崩溃恢复检测"]
        A3["全局异常处理器"]
        A4["JSON 序列化器"]
    end

    subgraph 类型B["B. 必须同步 + 有副作用"]
        B1["⚠️ 前台服务判断<br/>(runBlocking × 2)"]
        B2["⚠️ 语言设置<br/>(runBlocking × 1)"]
    end

    subgraph 类型C["C. 同步但轻量"]
        C1["各种 Manager.initialize()"]
        C2["图片/媒体加载器构建"]
        C3["Shell 环境配置"]
    end

    subgraph 类型D["D. 异步 + 可后台"]
        D1["角色卡初始化"]
        D2["Emoji 初始化"]
        D3["分词器预热"]
        D4["数据库预加载"]
    end

    subgraph 类型E["E. 延迟 + 异步"]
        E1["delay(800ms) 后<br/>工具注册 + 磁盘预加载"]
        E2["工作流调度器"]
        E3["无障碍服务绑定"]
    end

    style 类型A fill:#1a2a1a,color:#a3d9a3
    style 类型B fill:#3a1a1a,color:#d9a3a3
    style 类型C fill:#1a2a3a,color:#a3c9d9
    style 类型D fill:#2a2a1a,color:#d9d9a3
    style 类型E fill:#2a1a2a,color:#c9a3c9
```

### 重点解析：B 类 — 为什么要在主线程阻塞读取?

这是整个启动链路中最关键的设计决策。Operit 在 `Application.onCreate` 里做了 **3 次 `runBlocking`**（在主线程同步等待协程完成）：

```kotlin
// OperitApplication.kt:471-493
private fun startGlobalAIForegroundServiceIfNeeded() {
    // ⚠️ 阻塞读取 1: 唤醒词是否开启
    val alwaysListeningEnabled = runBlocking {
        WakeWordPreferences(applicationContext)
            .alwaysListeningEnabledFlow.first()
    }
    // ⚠️ 阻塞读取 2: 外部 HTTP API 是否开启
    val externalHttpEnabled = runBlocking {
        ExternalHttpApiPreferences.getInstance(applicationContext)
            .enabledFlow.first()
    }

    // 两个都关闭 → 不启动前台服务
    if ((!alwaysListeningEnabled && !externalHttpEnabled)
        || AIForegroundService.isRunning.get()) {
        return
    }

    // 需要启动前台服务
    startForegroundService(Intent(this, AIForegroundService::class.java))
}
```

### 为什么不能异步?

```mermaid
flowchart TD
    Q["能不能把 runBlocking<br/>改成 launch（异步）?"]
    Q --> CASE1["如果 alwaysListening = true<br/>但你异步读取还没完成..."]
    CASE1 --> RESULT1["用户说了唤醒词<br/>但 Service 还没启动<br/>→ 唤醒词无响应"]

    Q --> CASE2["如果异步读取完成后<br/>才发现需要启动 Service..."]
    CASE2 --> RESULT2["此时 Activity 可能已经<br/>进入前台，Service 启动<br/>时序不可控"]

    RESULT1 --> CONCLUSION["所以必须在 Application.onCreate<br/>同步判断并启动"]
    RESULT2 --> CONCLUSION

    style CONCLUSION fill:#2a2a1a,color:#d9d9a3
```

**同理，语言设置也必须同步读取** — 如果异步读取，`onCreate` 后面的 `getString()` 调用可能拿到错误语言的字符串。

> **常见疑问：runBlocking 会导致 ANR 吗？**
> 
> DataStore 的 `first()` 通常在几毫秒内完成（它从本地文件读取，不涉及网络）。ANR 阈值是 5 秒。实测这 3 次读取总共不到 50ms。但如果 DataStore 文件损坏或磁盘 I/O 异常慢，理论上有 ANR 风险。

### E 类 — delay(800ms) 的精妙设计

```kotlin
// OperitApplication.kt:317-333
lifecycleScope.launch(Dispatchers.IO) {
    delay(800)  // 等首帧渲染完成
    ImagePoolManager.preloadFromDisk()
    MediaPoolManager.preloadFromDisk()
    AIToolHandler.registerDefaultTools(applicationContext)
}
```

**为什么延迟 800ms？** 因为 `Application.onCreate` 结束后，系统要执行 `Activity.onCreate` → 第一次 `setContent` → Compose 首帧布局和渲染。这个过程大约需要 500-800ms。如果在此期间同时做磁盘 I/O 和工具注册，会抢占主线程的 CPU 时间，导致首帧掉帧（用户感知为启动卡顿）。

> **动手验证：** 把 `delay(800)` 改成 `delay(0)`，重新编译运行，观察启动动画是否变得更卡顿。改完记得恢复。

---

## 第四课：MainActivity — "先渲染再检查"策略

### 问题

MainActivity 需要做很多事：初始化组件、检查协议、检查权限、检查数据迁移。如果全部完成后才渲染第一帧，用户会看到一个很长的黑屏。

### 解决方案：先渲染空白占位，再异步检查

```mermaid
sequenceDiagram
    autonumber
    participant MA as MainActivity
    participant UI as Compose UI
    participant CHK as 门控检查协程

    MA->>MA: initializeComponents()
    Note over MA: 同步初始化必要组件

    MA->>UI: setAppContent() [第1次]
    Note over UI: initialChecksDone = false<br/>→ 渲染空白占位<br/>（黑色背景，极快）

    Note over MA: ⭐ 此时用户看到了"东西"<br/>虽然是空白，但比黑屏好

    MA->>CHK: performInitialChecks() [协程]
    Note over CHK: 异步执行，不阻塞 UI

    CHK->>CHK: ① 通知权限检查
    CHK->>CHK: ② 权限级别检查
    CHK->>CHK: ③ 协议 + 迁移检查

    CHK->>CHK: initialChecksDone = true

    CHK->>UI: setAppContent() [第2次]
    Note over UI: 根据检查结果<br/>渲染正确的 Screen
```

注意 `setAppContent()` 被调用了**两次**：
1. 第一次：立即渲染空白占位，让系统知道"Activity 已经有内容了"
2. 第二次：门控检查完成后，根据结果渲染正确的页面

**为什么不用 Splash Screen API？** Operit 的启动门控是动态的（取决于用户是否接受过协议、是否设置过权限、是否需要数据迁移），Splash Screen API 适合固定时长的品牌展示，不适合条件分支。

### 源码实录

```kotlin
// MainActivity.kt:724-770 (简化)
private fun setAppContent() {
    setContent {
        OperitTheme {
            Box {
                if (!initialChecksDone) {
                    // 空白占位 — 什么都不渲染
                } else if (!agreementPreferences.isAgreementAccepted()) {
                    // 门1: 用户协议
                    AgreementScreen(onAgreementAccepted = { /* ... */ })
                } else if (showMigrationScreen) {
                    // 门2: 数据迁移
                    MigrationScreen(onComplete = { /* ... */ })
                } else if (showPermissionGuide) {
                    // 门3: 权限引导
                    PermissionGuideScreen(onComplete = { /* ... */ })
                } else {
                    // 主界面
                    OperitApp(initialNavItem = NavItem.AiChat)
                    // + 插件加载覆盖层 (zIndex = 10)
                }
            }
        }
    }
}
```

> **关键设计模式：if-else 链 = 优先级队列**
>
> 这个 if-else 链就是门控的优先级：协议 > 迁移 > 权限 > 主界面。每道门通过后会调用 `setAppContent()` 刷新，进入下一道门或主界面。

---

## 第五课：4 道门控 — 渐进式解锁

### 为什么需要门控?

Operit 不是一个打开就能用的 App。它需要：
1. 用户明确接受隐私协议（法律要求）
2. 如果是老版本升级，聊天记录需要从 DataStore 迁移到 Room（数据安全）
3. 用户选择权限级别（Standard/Admin/Root），决定 AI 能做什么（安全边界）
4. 加载 MCP 插件（功能完整性）

### 门控顺序不能随意调换

```mermaid
flowchart TD
    AGREE["门1: 协议<br/>用户必须先同意条款<br/>否则不能使用任何功能"]
    AGREE -->|接受| MIGRATE["门2: 迁移<br/>老数据迁移到新格式<br/>必须在正常使用前完成"]
    MIGRATE -->|完成/不需要| PERM["门3: 权限<br/>用户选择 AI 的权限级别<br/>决定可用工具集"]
    PERM -->|完成/已设置| PLUGIN["门4: 插件加载<br/>非阻塞，覆盖层<br/>30 秒超时可跳过"]
    PLUGIN -->|完成/跳过| MAIN["主界面<br/>可交互"]

    style AGREE fill:#3a1a1a,color:#d9a3a3
    style MIGRATE fill:#3a2a1a,color:#d9c9a3
    style PERM fill:#1a2a3a,color:#a3c9d9
    style PLUGIN fill:#1a3a1a,color:#a3d9a3
    style MAIN fill:#2a2a2a,color:#d9d9d9
```

**如果调换顺序会怎样？**

| 错误顺序 | 后果 |
|---------|------|
| 权限 → 协议 | 用户还没同意条款就开始设置权限，法律风险 |
| 主界面 → 迁移 | 用户发消息时老数据还在迁移，可能看到不完整的聊天记录 |
| 插件 → 权限 | 插件可能需要知道权限级别才能正确初始化 |

### 门4 的特殊性：非阻塞覆盖层

前 3 道门是**阻塞式**的（必须完成才能进入下一步），但门 4（插件加载）是**非阻塞覆盖层**：

```mermaid
graph TD
    subgraph 底层
        MAIN["OperitApp (主界面)<br/>已经渲染完毕"]
    end
    subgraph 覆盖层["覆盖层 (zIndex = 10)"]
        PLUGIN["PluginLoadingScreen<br/>进度条 5% → 100%<br/><br/>30 秒后显示跳过按钮"]
    end

    PLUGIN -.->|覆盖在上方| MAIN

    style MAIN fill:#1a3a1a,color:#a3d9a3
    style PLUGIN fill:#1a1a3a,color:#a3a3d9
```

**为什么这么设计？** 因为 MCP 插件启动可能很慢（网络连接、进程启动），但主界面本身的核心功能（聊天、设置）不依赖插件。用 `zIndex = 10` 的覆盖层可以在后台同时初始化主界面，插件加载完毕后覆盖层消失，用户立刻可交互——感知上比"加载完才显示主界面"快很多。

> **动手验证：** 找到 `pluginLoadingState.show()` 调用，在其前后加日志。观察覆盖层显示时，底层的 `OperitApp` 是否已经完成了 LaunchedEffect（网络轮询、公告拉取等）。

---

## 第六课：AIForegroundService — 条件启动的前台服务

### 为什么存在这个服务?

Operit 有两个需要 App 被杀后仍然运行的功能：
1. **唤醒词监听**（"Hey Operit" 语音唤醒）— 需要持续录音
2. **外部 HTTP API**（其他 App 通过 HTTP 接口调用 AI）— 需要持续监听端口

Android 系统会在后台杀死空闲 App。前台服务（Foreground Service）通过显示一个持续通知来告诉系统"我正在做重要的事，别杀我"。

### 启动条件的决策逻辑

```mermaid
flowchart TD
    START["Application.onCreate 步骤 12"]
    START --> READ1["runBlocking 读取<br/>alwaysListeningEnabled"]
    READ1 --> READ2["runBlocking 读取<br/>externalHttpEnabled"]
    READ2 --> CHECK{两个都是 false?}

    CHECK -->|是| SKIP["不启动 Service<br/>（省电）"]
    CHECK -->|否| RUNNING{Service 已在运行?}

    RUNNING -->|是| SKIP2["不重复启动"]
    RUNNING -->|否| LAUNCH["startForegroundService()<br/>进入 IDLE 状态"]

    LAUNCH --> SVC_INIT["Service.onCreate()"]
    SVC_INIT --> N["创建通知渠道"]
    N --> FG["startForeground()"]
    FG --> WAKE["startWakeMonitoring()"]
    FG --> HTTP["startExternalHttpMonitoring()"]

    style SKIP fill:#1a3a1a,color:#a3d9a3
    style SKIP2 fill:#1a3a1a,color:#a3d9a3
    style LAUNCH fill:#3a1a1a,color:#d9a3a3
```

### Service 什么时候自停?

```kotlin
// AIForegroundService.kt:867-886 (简化)
private fun stopSelfIfIdle() {
    if (AI 正在工作) return          // 有活跃对话
    if (alwaysListening 开启) return  // 需要持续监听唤醒词
    if (externalHttp 运行中) return   // 需要持续监听 HTTP 端口
    if (应用在前台) return             // 用户正在使用

    // 以上全都不满足 → 安全自停
    stopSelf()
}
```

> **设计哲学：最小化后台存在。** Service 只在确实需要时运行，一旦条件不满足就立即停止，对电池友好。

---

## 第七课：OperitApp — Compose 世界的入口

通过所有门控后，`OperitApp` composable 被首次组合（compose）。它在首次组合时启动一组异步任务：

```mermaid
sequenceDiagram
    autonumber
    participant COMPOSE as Compose Runtime
    participant APP as OperitApp
    participant NET as 网络
    participant MCP as MCP 仓库

    COMPOSE->>APP: 首次组合

    par 并行启动的 LaunchedEffect
        APP->>NET: 每 10 秒轮询网络状态
        Note over NET: isNetworkAvailable<br/>→ 驱动 UI 显示离线/在线
    and
        APP->>NET: 拉取远程公告
        Note over NET: 有公告 → 弹出<br/>RemoteAnnouncementDialog
    and
        APP->>MCP: syncInstalledStatus()
        Note over MCP: 同步已安装插件状态
    end

    APP->>APP: 导航到初始屏幕
    Note over APP: OperitRouter.getScreenForNavItem(AiChat)<br/>→ Screen.AiChat<br/>→ AIChatScreen()

    Note over APP: ⭐ 用户看到聊天界面，可以开始交互
```

**为什么网络轮询不用 ConnectivityManager 回调？** 因为 Operit 需要检测的不仅是系统级网络连通性，还包括 AI API 的可达性。系统回调只告诉你"有没有 WiFi/移动数据"，不告诉你"AI 服务器能不能连上"。

---

## 总结：启动链路的 5 个关键设计决策

| # | 设计决策 | WHY |
|---|---------|-----|
| 1 | 语言在 `attachBaseContext` 注入 | 必须在资源系统绑定 Configuration 之前完成 |
| 2 | 3 次 `runBlocking` 同步读取 | 前台服务和语言设置必须在 onCreate 结束前确定 |
| 3 | 首帧渲染用空白占位 | 避免长时间黑屏，先让系统知道"Activity 有内容" |
| 4 | 门控用 if-else 链而非导航 | 优先级固定、每道门通过后刷新整个内容树 |
| 5 | 插件加载是非阻塞覆盖层 | 主界面可以提前初始化，感知启动速度更快 |

```mermaid
graph TD
    subgraph 你现在理解了
        K1["Application 层<br/>做什么 + 为什么阻塞"]
        K2["Activity 层<br/>先渲染再检查"]
        K3["门控序列<br/>顺序 + 原因"]
        K4["前台服务<br/>条件启动/自停"]
        K5["Compose 层<br/>异步任务 + 导航"]
    end

    K1 --> K2 --> K3 --> K4 --> K5

    K5 --> NEXT["下一步：42_Tutorial.对话生命周期精讲.md<br/>了解聊天消息从发送到渲染的完整链路"]

    style NEXT fill:#1a2a3a,color:#a3c9d9
```

---

## 动手练习

### 练习 1: 追踪启动日志

Operit 在启动过程中打印了详细的计时日志（`【启动计时】` 前缀）。运行 App，过滤 logcat：

```bash
adb logcat | grep "启动计时"
```

你会看到类似：
```
启动计时】应用启动开始
【启动计时】实例初始化完成 - 3ms
【启动计时】cleanOnExit 清理任务已提交（异步IO） - 5ms
【启动计时】ActivityLifecycleManager初始化完成 - 6ms
【启动计时】AIMessageManager初始化完成 - 12ms
【启动计时】AIForegroundService 持久后台职责检查完成 - 48ms
...
```

**练习目标：** 找到耗时最长的步骤。它是同步还是异步的？为什么它耗时最长？

### 练习 2: 跳过门控

在 `performInitialChecks()` 的第一行加上 `initialChecksDone = true; setAppContent(); return`，让门控检查直接跳过。重新运行 App：

- 如果是全新安装，你会看到什么？（提示：协议页不会出现）
- 如果是升级安装且有旧数据，会发生什么？（提示：聊天记录可能不完整）

**练习目标：** 理解门控不是"烦人的欢迎页"，而是保障数据完整性和法律合规的必要步骤。

### 练习 3: 观察插件加载

找到 `PluginLoadingState.initializeMCPServer()` 方法，在每个插件启动前后加日志，记录每个插件的启动耗时。

**练习目标：** 理解为什么需要 30 秒超时——某些 MCP 插件可能因网络问题启动很慢。

---

## 关联文档

| 文档 | 关系 |
|------|------|
| `37_Runtime.冷启动全链路.md` | 参考手册 — 34 步完整行号索引 |
| `39_学习路线图.md` | 总索引 — 本教程对应 Level 2 |
| `42_Tutorial.对话生命周期精讲.md` | 下一篇 — 理解核心业务链路 |
