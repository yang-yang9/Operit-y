# Operit 项目架构图 (Mermaid)

> 生成日期：2026-05-07
> 项目：Operit AI 助手 (com.ai.assistance.operit)
> 格式：Mermaid

---

## 目录

1. [整体系统架构图](#1-整体系统架构图)
2. [核心模块内部架构图](#2-核心模块内部架构图)
3. [组件运行时架构图](#3-组件运行时架构图)
4. [数据流存储架构图](#4-数据流存储架构图)
5. [AI 模型推理管线图](#5-ai-模型推理管线图)

---

## 1. 整体系统架构图

```mermaid
graph TB
    subgraph External["外部服务层"]
        OpenAI["OpenAI API"]
        Claude["Anthropic Claude"]
        Gemini["Google Gemini"]
        LocalVendors["Minimax / SiliconFlow / ..."]
    end

    subgraph App["App 主模块 (:app)"]
        direction TB
        subgraph UI["UI Layer"]
            MainActivity["MainActivity"]
            OperitApp["OperitApp (Compose)"]
            FloatingUI["FloatingWindow UI"]
            WidgetGlance["Widget (Glance)"]
        end
        subgraph Core["Core Layer"]
            ChatEngine["Chat Engine (AIMessageManager)"]
            ToolSystem["Tool System (ToolRegistration)"]
            Workflow["Workflow Engine"]
            Avatar["Avatar System"]
            Config["Config / SystemPrompts"]
            Subpack["Subpack (APK/EXE Editor)"]
        end
        subgraph Data["Data Layer"]
            Repository["Repositories"]
            Preferences["Preferences (28 类)"]
            ObjectBox["ObjectBox DB"]
            Room["Room DB"]
            Backup["Backup System"]
        end
        subgraph Api["API Layer"]
            EnhancedAI["EnhancedAIService"]
            TTS["Voice Service (TTS)"]
            STT["Speech Service (STT)"]
        end
        subgraph Service["Service Layer"]
            ChatSvc["ChatServiceCore"]
            FloatingSvc["FloatingChatService"]
            VoiceSvc["VoiceInteractionService"]
            NotifSvc["NotificationListener"]
        end
        subgraph Provider["Provider Layer"]
            MemoryProvider["MemoryDocumentsProvider"]
            WorkspaceProvider["WorkspaceDocumentsProvider"]
        end
    end

    subgraph SubModules["子模块层"]
        DragonBones["dragonbones (2D动画)"]
        Terminal["terminal (终端)"]
        MNN["mnn (本地LLM推理)"]
        Llama["llama (llama.cpp)"]
        MMD["mmd (MMD 3D)"]
        FBX["fbx (FBX 3D)"]
        ShowerClient["showerclient (投屏)"]
        QuickJS["quickjs (JS引擎)"]
    end

    subgraph SDK["平台 & SDK 层"]
        Android["Android SDK 26+"]
        Compose["Jetpack Compose"]
        Shizuku["Shizuku API"]
        Libsu["libsu (Root)"]
        MLKit["ML Kit"]
        Filament["Filament (3D)"]
        FFmpeg["FFmpeg Kit"]
        MCP["MCP SDK (1.1.0)"]
        Tasker["Tasker Plugin"]
        Glance["Glance AppWidget"]
        WorkManager["WorkManager"]
    end

    %% 外部服务 -> API
    OpenAI --> EnhancedAI
    Claude --> EnhancedAI
    Gemini --> EnhancedAI
    LocalVendors --> EnhancedAI
    LocalVendors --> TTS
    OpenAI --> STT

    %% UI -> Core
    MainActivity --> ChatEngine
    FloatingUI --> ChatEngine
    OperitApp --> ChatEngine

    %% Core 内部
    ChatEngine --> ToolSystem
    ChatEngine --> Workflow
    ChatEngine --> Avatar
    ChatEngine --> Config
    ToolSystem --> Subpack

    %% Core -> Data
    ChatEngine --> Repository
    ToolSystem --> Repository
    Workflow --> Repository
    Avatar --> Preferences

    %% Data 内部
    Repository --> ObjectBox
    Repository --> Preferences
    Repository --> Room
    Preferences --> Backup

    %% API -> Core
    EnhancedAI --> ChatEngine
    EnhancedAI --> ToolSystem
    TTS --> ChatEngine
    STT --> ChatEngine

    %% Service -> Core
    ChatSvc --> ChatEngine
    FloatingSvc --> ChatEngine
    VoiceSvc --> ChatEngine
    NotifSvc --> ChatEngine

    %% Provider -> Data
    MemoryProvider --> Repository
    WorkspaceProvider --> Repository

    %% App -> SubModules
    ChatEngine --> DragonBones
    ChatEngine --> Terminal
    ChatEngine --> MNN
    ChatEngine --> Llama
    ChatEngine --> MMD
    ChatEngine --> FBX
    ChatEngine --> ShowerClient
    ToolSystem --> QuickJS

    %% App -> SDK
    UI --> Android
    UI --> Compose
    Core --> Shizuku
    Core --> Libsu
    Data --> MLKit
    App --> Filament
    Provider --> FFmpeg
    ToolSystem --> MCP
    Workflow --> Tasker
    WidgetGlance --> Glance
    Workflow --> WorkManager
```

### 分层说明

| 层级 | 描述 |
|------|------|
| **UI Layer** | Jetpack Compose 构建的用户界面，包含主界面、浮动窗口、Widget |
| **Core Layer** | 核心业务逻辑：聊天引擎、工具系统、工作流、Avatar、配置、子包编辑 |
| **Data Layer** | 数据访问与持久化：ObjectBox/Room 数据库、Repository、Preferences、备份 |
| **API Layer** | 外部服务抽象：LLM 调用、TTS 语音合成、STT 语音识别 |
| **Service Layer** | Android 后台服务：聊天、浮动窗口、语音交互、通知监听 |
| **Provider Layer** | ContentProvider：记忆文档、工作区文档 |
| **子模块层** | 独立的 Android Library 模块：2D/3D 动画、终端、AI 推理、JS 引擎、投屏 |
| **平台&SDK层** | Android 平台和第三方 SDK 依赖 |

---

## 2. 核心模块内部架构图

### 2.1 Core 层内部架构

```mermaid
graph TB
    subgraph CoreLayer["Core Layer"]
        AIMessageManager["AIMessageManager\n(聊天引擎核心)"]
        
        subgraph ChatHooks["chat/hooks"]
            Hook1["HistoryHook"]
            Hook2["MemoryHook"]
            Hook3["AvatarHook"]
        end
        
        subgraph ChatPlugins["chat/plugins"]
            Plugin1["ToolCallPlugin"]
            Plugin2["WorkflowPlugin"]
            Plugin3["CtxManagerPlugin"]
        end
        
        subgraph ToolModules["tools/ (工具系统)"]
            ToolReg["ToolRegistration\n(84KB - 工具注册中心)"]
            ToolHandler["AIToolHandler\n(工具执行调度)"]
            ToolResult["ToolResultDataClasses\n(71KB - 结果模型)"]
            
            subgraph ToolCats["工具分类"]
                DefaultTools["defaultTool\n(40+ 内置工具)"]
                MCPTools["mcp\n(MCPToolExecutor)"]
                AgentTools["agent\n(PhoneAgent 自动点击)"]
                SkillTools["skill\n(Skill 市场)"]
                SystemTools["system\n(Shell/Shizuku/Root)"]
                PackTools["packTool\n(工具包引擎)"]
                JSTools["javascript\n(QuickJS 脚本)"]
                CalcTools["calculator\n(计算器)"]
                CondTools["condition\n(条件判断)"]
            end
        end
        
        subgraph ConfigMod["config/ (提示词 & 配置)"]
            FuncPrompts["FunctionalPrompts\n(65KB)"]
            SysToolPrompts["SystemToolPrompts\n(57KB)"]
            SysPromptConfig["SystemPromptConfig\n(43KB)"]
            SysToolInternal["SystemToolPromptsInternal\n(309KB)"]
        end
        
        subgraph AvatarMod["avatar/ (人设系统)"]
            AvatarImpl["impl/\n(实现层)"]
            AvatarCommon["common/\n(公共模型)"]
        end
        
        subgraph WorkflowMod["workflow/ (工作流引擎)"]
            WFInitializer["WorkflowSchedulerInitializer"]
            WFScheduler["WorkflowScheduler\n(16KB)"]
            WFExecutor["WorkflowExecutor\n(50KB)"]
            WFWorker["WorkflowWorker"]
        end
        
        subgraph SubpackMod["subpack/ (APK/EXE 编辑器)"]
            ApkEditor["ApkEditor"]
            ExeEditor["ExeEditor"]
            ExeIcon["ExeIconChanger"]
            ApkReverse["ApkReverseEngineer"]
            KeyStore["KeyStoreHelper"]
        end
    end

    AIMessageManager --> ChatHooks
    AIMessageManager --> ChatPlugins
    AIMessageManager --> ToolModules
    AIMessageManager --> ConfigMod
    AIMessageManager --> AvatarMod
    AIMessageManager --> WorkflowMod
    AIMessageManager --> SubpackMod

    ToolReg --> ToolCats
    ToolHandler --> ToolReg
```

### 2.2 Data 层内部架构

```mermaid
graph TB
    subgraph DataLayer["Data Layer"]
        subgraph DB["数据库"]
            ObjectBoxDB["ObjectBox\n(核心实体存储)"]
            RoomDB["Room DB\n(辅助存储)"]
            HNSW["HNSW Vector Index\n(向量搜索)"]
        end
        
        subgraph Repos["Repository 仓库层"]
            MemoryRepo["MemoryRepository\n(110KB - 记忆管理)"]
            ChatHistory["ChatHistoryManager\n(62KB - 对话历史)"]
            AvatarRepo["AvatarRepository\n(44KB)"]
            WorkflowRepo["WorkflowRepository\n(27KB)"]
            UIHierarchy["UIHierarchyManager\n(19KB)"]
            EmojiRepo["CustomEmojiRepository\n(15KB)"]
        end
        
        subgraph PrefsGroup["Preferences 偏好设置 (28 类)"]
            UserPrefs["UserPreferencesManager\n(83KB)"]
            ApiPrefs["ApiPreferences\n(36KB)"]
            CharCard["CharacterCardManager\n(59KB)"]
            WaifuPrefs["WaifuPreferences"]
            WakeWord["WakeWordPreferences"]
            OtherPrefs["其他 23 个配置类 ..."]
        end
        
        subgraph MCPMod["MCP 模块"]
            MCPRepo["MCPRepository\n(48KB)"]
            MCPLocal["MCPLocalServer\n(38KB)"]
            MCPSkillRepo["SkillRepository"]
        end
        
        subgraph BackupMod["Backup 备份系统"]
            RawBackup["RawSnapshotBackupManager"]
            RoomBackup["RoomDatabaseBackupManager"]
            RoomRestore["RoomDatabaseRestoreManager"]
            BackupDirs["OperitBackupDirs"]
        end
        
        subgraph ExportConvert["导出 & 转换"]
            HtmlExp["HtmlExporter"]
            TextExp["TextExporter"]
            MarkdownExp["MarkdownExporter"]
            ChatFmt["ChatFormat"]
            ChatGPTConv["ChatGPTConverter"]
            ChatBoxConv["ChatBoxConverter"]
        end
        
        subgraph Updates["更新管理"]
            UpdateMgr["UpdateManager"]
            FullInstaller["FullUpdateInstaller"]
            PatchInstaller["PatchUpdateInstaller\n(39KB)"]
        end
    end
    
    Repos --> DB
    Repos --> PrefsGroup
    MCPMod --> Repos
    PrefsGroup --> BackupMod
    ExportConvert --> Repos
```

### 2.3 UI 层内部架构

```mermaid
graph TB
    subgraph UILayer["UI Layer"]
        MainActivity["MainActivity\n(38KB - 主入口)"]
        OperitApp["OperitApp\n(Compose 根组件)"]
        
        subgraph Screens["features/ (18 个功能页面)"]
            ChatScreen["chat/ (聊天界面)"]
            SettingsScreen["settings/ (设置)"]
            MemoryScreen["memory/ (记忆管理)"]
            WorkflowScreen["workflow/ (工作流编辑)"]
            ToolboxScreen["toolbox/ (工具箱)"]
            PackagesScreen["packages/ (包管理)"]
            TokenScreen["token/ (Token 统计)"]
            UpdateScreen["update/ (更新)"]
            StartupScreen["startup/ (启动引导)"]
            DemoPage["demo/ (示例)"]
            HelpPage["help/ (帮助)"]
            AboutPage["about/ (关于)"]
            AssistantPage["assistant/ (语音助手)"]
            MigrationPage["migration/ (数据迁移)"]
            PermissionPage["permission/ (权限管理)"]
            WebSession["websession/ (网页会话)"]
            Announcement["announcement/ (公告)"]
            Agreement["agreement/ (协议)"]
        end
        
        subgraph FloatingMod["floating/ (浮动窗口)"]
            FloatContext["FloatContext"]
            FloatingMode["FloatingMode"]
            FloatChat["FloatingChatWindow"]
            FloatTheme["FloatingWindowTheme"]
            FloatVoice["voice/ (语音浮动)"]
            FloatUI["ui/ (浮动UI组件)"]
        end
        
        subgraph ThemeMod["theme/ (主题系统)"]
            ThemeMain["Theme.kt (29KB)"]
            ThemeColor["Color.kt"]
            ThemeType["Type.kt"]
            ThemeUtils["ThemeUtils"]
            WaterGlass["WaterGlass 效果"]
            LiquidGlass["LiquidGlass 效果"]
            TextLayout["TextLayoutSettings"]
        end
        
        subgraph CommonMod["common/ (通用组件)"]
            MarkdownView["markdown/ (渲染)"]
            Animations["animations/ (动画)"]
            Displays["displays/ (展示组件)"]
            Composed["composedsl/ (DSL组件)"]
        end
        
        subgraph PermissionMod["permissions/ (权限)"]
            PermDialog["ToolPermissionDialog"]
            PermSystem["ToolPermissionSystem"]
            PermOverlay["PermissionRequestOverlay"]
        end
    end
    
    MainActivity --> OperitApp
    OperitApp --> Screens
    OperitApp --> FloatingMod
    Screens --> ThemeMod
    Screens --> CommonMod
    FloatingMod --> ThemeMod
    Screens --> PermissionMod
```

## 3. 组件运行时架构图

### 3.1 Android 组件与进程架构

```mermaid
graph TB
    subgraph MainProcess["主进程 (:app)"]
        direction TB
        
        Activity["MainActivity\n(主界面)"]
        
        subgraph Fragments["功能页面"]
            ChatFrag["ChatScreen"]
            SettingsFrag["SettingsScreen"]
            OtherFrags["其他 16 个页面 ..."]
        end
        
        subgraph Providers["ContentProvider"]
            MemoryProvider["MemoryDocumentsProvider"]
            WorkspaceProvider["WorkspaceDocumentsProvider"]
        end
        
        subgraph Receivers["BroadcastReceiver"]
            ExtChatReceiver["ExternalChatReceiver"]
            WorkflowReceiver["WorkflowTaskerReceiver"]
            WidgetReceiver["VoiceAssistantWidgetReceiver"]
        end
        
        Widget["Glance AppWidget\n(VoiceAssistantGlanceWidget)"]
    end
    
    subgraph ForegroundService["前台服务进程"]
        ChatServiceCore["ChatServiceCore\n(17KB - 聊天核心)"]
        
        subgraph CoreDelegates["core/ (服务代理)"]
            ApiDelegate["ApiConfigDelegate"]
            AttachmentDelegate["AttachmentDelegate"]
            ChatHistoryDel["ChatHistoryDelegate"]
            TokenStats["TokenStatisticsDelegate"]
            MsgProcessing["MessageProcessingDelegate\n(63KB)"]
            MsgCoordination["MessageCoordinationDelegate\n(68KB)"]
            ChatSelection["ChatSelectionMode"]
        end
        
        FloatingChatSvc["FloatingChatService\n(31KB - 浮动窗口服务)"]
    end
    
    subgraph FloatingProcess["浮动窗口进程"]
        FloatWindowMgr["FloatingWindowManager\n(49KB)"]
        FloatWindowState["FloatingWindowState"]
        UIDebugger["UIDebuggerWindowManager"]
    end
    
    subgraph VoiceProcess["语音交互进程"]
        VoiceInteractionSvc["OperitVoiceInteractionService"]
        VoiceSessionSvc["OperitVoiceInteractionSessionService"]
        OperitAssist["OperitAssistActivity"]
    end
    
    subgraph OtherServices["其他服务"]
        NotifListener["OperitNotificationListenerService\n(通知监听)"]
        CloudEmbedding["CloudEmbeddingService\n(云端向量嵌入)"]
        TermuxCommand["TermuxCommandResultService\n(终端命令结果)"]
        UIDebuggerSvc["UIDebuggerService"]
    end
    
    subgraph External["外部集成"]
        TaskerPlugin["Tasker Plugin\n(AIAgentTasker)"]
        HTTPChat["ExternalChatHttpServer\n(22KB)"]
        IntentChat["ExternalChatReceiver"]
    end

    %% 进程间通信
    Activity -.->|"Intent"| ChatServiceCore
    Widget -.->|"PendingIntent"| Activity
    
    ChatServiceCore --> CoreDelegates
    ChatServiceCore -.->|"Binder/AIDL"| FloatingChatSvc
    FloatingChatSvc -.->|"Binder/AIDL"| FloatWindowMgr
    
    VoiceInteractionSvc -.->|"VoiceSession"| VoiceSessionSvc
    
    ChatServiceCore -.->|"Notification"| NotifListener
    
    TaskerPlugin -.->|"Intent"| ChatServiceCore
    HTTPChat -.->|"HTTP"| ChatServiceCore
    IntentChat -.->|"Intent"| ChatServiceCore
    
    Providers -.->|"Content URI"| Activity
```

### 3.2 组件间通信机制

```mermaid
graph LR
    subgraph UI["UI 组件"]
        MainAct["MainActivity"]
        FloatingWin["FloatingWindow"]
        Widget["AppWidget"]
    end
    
    subgraph Service["服务组件"]
        ChatSvc["ChatServiceCore"]
        FloatSvc["FloatingChatService"]
        VoiceSvc["VoiceInteractionService"]
    end
    
    subgraph Provider["ContentProvider"]
        MemoryProvider["MemoryDocumentsProvider"]
        WorkspaceProvider["WorkspaceDocumentsProvider"]
    end
    
    subgraph Data["数据层"]
        Repos["Repositories"]
        DB["ObjectBox/Room"]
    end
    
    UI <-->|"Compose State / Flow"| Service
    Service <-->|"Repository"| Data
    Provider <-->|"SQL / DAO"| Data
    
    FloatingWin <-->|"AIDL (IChatServiceBridge)"| FloatSvc
    VoiceSvc <-->|"VoiceInteractionSession"| UI
    
    Widget -.->|"PendingIntent / RemoteViews"| UI
```

---

## 4. 数据流存储架构图

### 4.1 数据持久化全景

```mermaid
graph TB
    subgraph ViewModel["ViewModel / State 层"]
        ChatVM["ChatViewModel"]
        MemoryVM["MemoryViewModel"]
        SettingsVM["SettingsViewModel"]
        WorkflowVM["WorkflowViewModel"]
    end

    subgraph RepoLayer["Repository 层"]
        MemoryRepo["MemoryRepository\n(110KB)"]
        ChatHistory["ChatHistoryManager\n(62KB)"]
        AvatarRepo["AvatarRepository\n(44KB)"]
        WorkflowRepo["WorkflowRepository\n(27KB)"]
        EmojiRepo["CustomEmojiRepository"]
        UIHierarchy["UIHierarchyManager"]
    end

    subgraph DB["Database 层"]
        direction TB
        ObjectBoxDB["ObjectBox\n核心实体: ChatEntity, Message,\nCharacterCard, Memory, Workflow, ..."]
        RoomDB["Room DB\n辅助: ProblemDao, AppDatabase"]
        HNSW["HNSW Vector Index\n向量搜索 (hnswlib)"]
    end

    subgraph Prefs["Preferences 层"]
        UserPrefs["UserPreferencesManager (83KB)"]
        ApiPrefs["ApiPreferences (36KB)"]
        CharCard["CharacterCardManager (59KB)"]
        OtherPrefs["其他 25 个配置类 ..."]
    end

    subgraph FileSystem["文件系统"]
        Workspace["Android Workspace"]
        SAFDoc["SAF Documents"]
        SFTPMount["SFTP/SSH 挂载"]
        CacheDir["Cache & Temp"]
    end

    subgraph BackupRestore["备份与恢复"]
        OperitBackup["OperitBackupDirs"]
        RawBackup["RawSnapshotBackupManager"]
        RoomBackup["RoomDatabaseBackupManager"]
        RoomRestore["RoomDatabaseRestoreManager"]
        Migration["ChatHistoryMigrationManager"]
    end

    ViewModel -->|"Flow / Coroutine"| RepoLayer
    RepoLayer -->|"DAO"| DB
    RepoLayer -->|"DataStore"| Prefs
    RepoLayer -->|"File I/O"| FileSystem
    Prefs -->|"导出/备份"| BackupRestore
    DB -->|"备份/恢复"| BackupRestore
```

### 4.2 数据读写数据流

```mermaid
sequenceDiagram
    participant UI as Composable UI
    participant VM as ViewModel
    participant Repo as Repository
    participant DB as ObjectBox/Room
    participant Pref as Preferences
    participant FS as FileSystem

    UI->>VM: 用户操作 / State 变更
    VM->>Repo: suspend fun / Flow collect
    Repo->>DB: query / put / remove
    DB-->>Repo: 结果 / Flow 通知
    Repo-->>VM: 数据模型
    VM-->>UI: Compose State 重组

    Note over VM,FS: 文件操作路径
    VM->>Repo: writeFile / readFile
    Repo->>FS: SAF / Workspace I/O
    FS-->>Repo: bytes / stream
    Repo-->>VM: FileResult

    Note over VM,Pref: 偏好设置路径
    VM->>Pref: get / set
    Pref-->>VM: Preference value
```

---

## 5. AI 模型推理管线图

### 5.1 LLM 对话推理全链路

```mermaid
graph TB
    User["用户输入<br/>文字/语音/图片"]

    subgraph InputProcess["输入预处理"]
        STTConv["STT 语音转文字<br/>SpeechServiceFactory"]
        OCRProc["OCR 图片识别<br/>ML Kit"]
        CtxBuilder["上下文构建<br/>ChatRuntimeHolder"]
    end

    subgraph PromptAssembly["Prompt 组装"]
        SysPrompt["系统提示词<br/>309KB SystemToolPromptsInternal"]
        MemoryInject["记忆注入<br/>MemoryRepository"]
        AvatarInject["人设注入<br/>AvatarRepository"]
        FuncPrompt["功能性提示词<br/>65KB FunctionalPrompts"]
        HistoryInject["对话历史注入"]
    end

    subgraph LLMProvider["LLM Provider 路由"]
        Enhancer["EnhancedAIService<br/>122KB"]

        subgraph CloudModels["云端模型"]
            OpenAI["OpenAI API"]
            Claude["Anthropic Claude"]
            Gemini["Google Gemini"]
            OtherCloud["Minimax / SiliconFlow / OpenRouter..."]
        end

        subgraph LocalModels["本地模型"]
            MNNEngine["MNN 推理引擎<br/>(:mnn 模块)"]
            LlamaCpp["llama.cpp 引擎<br/>(:llama 模块)"]
        end
    end

    subgraph ResponseProcess["响应后处理"]
        StreamDecode["流式解码"]
        ToolCallParse["工具调用解析<br/>ToolRegistration"]
        MarkdownRender["Markdown 渲染"]
        TTSGen["TTS 语音合成<br/>VoiceServiceFactory"]
    end

    subgraph ToolExecution["工具执行 - 当 LLM 返回 tool_call"]
        ToolDispatch["AIToolHandler<br/>工具调度"]
        ToolExec["执行工具<br/>defaultTool / MCP / Agent / ..."]
        ToolResult["工具结果序列化<br/>ToolResultDataClasses"]
    end

    User --> InputProcess
    InputProcess --> PromptAssembly
    PromptAssembly --> LLMProvider
    Enhancer --> CloudModels
    Enhancer --> LocalModels
    LLMProvider --> ResponseProcess

    ToolCallParse --> ToolExecution
    ToolExec --> ToolResult
    ToolResult -->|"注入到下一轮"| PromptAssembly

    ResponseProcess -->|"最终响应"| User
```

### 5.2 TTS / STT 语音管线

```mermaid
graph TB
    subgraph TTS["TTS 语音合成管线"]
        TTSRequest["文本输入"]
        TTSFactory["VoiceServiceFactory<br/>工厂模式"]
        
        subgraph TTSProviders["TTS Provider"]
            HTTPTTS["HttpVoiceProvider<br/>40KB - 通用HTTP"]
            OpenAITTS["OpenAIVoiceProvider"]
            MiniMaxTTS["MiniMaxVoiceProvider"]
            SiliconTTS["SiliconFlowVoiceProvider"]
            AccessTTS["AccessibilityVoiceProvider"]
            RealtimeTTS["OpenAIRealtimeVoiceProvider"]
        end
        
        TTSPlay["AudioTrack 播放"]
    end

    subgraph STT["STT 语音识别管线"]
        MicInput["麦克风输入"]
        VAD["OnnxSileroVad<br/>语音活动检测"]
        STTFactory["SpeechServiceFactory<br/>工厂模式"]
        
        subgraph STTProviders["STT Provider"]
            SherpaSTT["SherpaSpeechProvider<br/>本地"]
            SherpaMNN["SherpaMnnSpeechProvider<br/>MNN 本地"]
            OpenAIWhisper["OpenAISttProvider<br/>云端 Whisper"]
            DeepgramSTT["DeepgramSttProvider<br/>云端"]
        end
        
        STTResult["识别文本输出"]
    end

    subgraph WakeWord["语音唤醒管线"]
        WakeFeature["PersonalWakeFeatureExtractor<br/>特征提取"]
        WakeEnroll["PersonalWakeEnrollment<br/>唤醒词注册"]
        WakeListen["PersonalWakeListener<br/>持续监听"]
        WakeTrigger["触发唤醒 -> 启动语音对话"]
    end

    TTSRequest --> TTSFactory
    TTSFactory --> TTSProviders
    TTSProviders --> TTSPlay

    MicInput --> VAD
    VAD --> STTFactory
    STTFactory --> STTProviders
    STTProviders --> STTResult

    MicInput --> WakeFeature
    WakeFeature --> WakeEnroll --> WakeListen --> WakeTrigger
```

### 5.3 Tool Calling 循环

```mermaid
sequenceDiagram
    participant User as 用户
    participant AI as EnhancedAIService
    participant LLM as LLM Provider
    participant ToolReg as ToolRegistration
    participant Executor as AIToolHandler

    User->>AI: 发送消息
    AI->>LLM: 组装 Prompt + Tools 定义
    LLM-->>AI: 响应 (含 tool_call)

    alt LLM 返回 tool_call
        AI->>ToolReg: 解析 tool_call
        ToolReg->>Executor: 调度执行 (含权限检查)
        Executor-->>ToolReg: 工具执行结果
        ToolReg-->>AI: ToolResultDataClasses
        AI->>LLM: 注入 tool_result 继续
        LLM-->>AI: 继续响应 (可能再次 tool_call)
    else 直接文本响应
        AI-->>User: 流式输出文本
    end

    Note over AI,Executor: 循环直到 LLM 不再返回 tool_call
```