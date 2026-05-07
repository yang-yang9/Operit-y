# Operit 项目架构图 (PlantUML)

> 生成日期：2026-05-07
> 项目：Operit AI 助手 (com.ai.assistance.operit)
> 格式：PlantUML

---

## 目录

1. [整体系统架构图](#1-整体系统架构图)
2. [核心模块内部架构图](#2-核心模块内部架构图)
3. [组件运行时架构图](#3-组件运行时架构图)
4. [数据流存储架构图](#4-数据流存储架构图)
5. [AI 模型推理管线图](#5-ai-模型推理管线图)

---


## 1. 整体系统架构图

```plantuml
@startuml
skinparam packageStyle rectangle
skinparam componentStyle rectangle

package "外部服务层" as External {
    [OpenAI API] as OpenAICloud
    [Anthropic Claude] as Claude
    [Google Gemini] as Gemini
    [Minimax / SiliconFlow / ...] as LocalVendors
}

package "App 主模块 (:app)" as AppMain {
    
    package "UI Layer" as UILayer {
        [MainActivity] as MainActivity
        [OperitApp (Compose)] as OperitApp
        [FloatingWindow UI] as FloatingUI
        [Widget (Glance)] as WidgetGlance
    }
    
    package "Core Layer" as CoreLayer {
        [Chat Engine\n(AIMessageManager)] as ChatEngine
        [Tool System\n(ToolRegistration)] as ToolSystem
        [Workflow Engine] as Workflow
        [Avatar System] as Avatar
        [Config / SystemPrompts] as Config
        [Subpack\n(APK/EXE Editor)] as Subpack
    }
    
    package "Data Layer" as DataLayer {
        [Repositories] as Repository
        [Preferences (28类)] as Preferences
        [ObjectBox DB] as ObjectBox
        [Room DB] as Room
        [Backup System] as Backup
    }
    
    package "API Layer" as ApiLayer {
        [EnhancedAIService] as EnhancedAI
        [Voice Service (TTS)] as TTS
        [Speech Service (STT)] as STT
    }
    
    package "Service Layer" as ServiceLayer {
        [ChatServiceCore] as ChatSvc
        [FloatingChatService] as FloatingSvc
        [VoiceInteractionService] as VoiceSvc
        [NotificationListener] as NotifSvc
    }
    
    package "Provider Layer" as ProviderLayer {
        [MemoryDocumentsProvider] as MemoryProvider
        [WorkspaceDocumentsProvider] as WorkspaceProvider
    }
}

package "子模块层" as SubModules {
    [dragonbones\n(2D动画)] as DragonBones
    [terminal\n(终端)] as Terminal
    [mnn\n(本地LLM)] as MNN
    [llama\n(llama.cpp)] as Llama
    [mmd\n(MMD 3D)] as MMD
    [fbx\n(FBX 3D)] as FBX
    [showerclient\n(投屏)] as ShowerClient
    [quickjs\n(JS引擎)] as QuickJS
}

package "平台 & SDK 层" as SDKLayer {
    [Android SDK 26+] as Android
    [Jetpack Compose] as Compose
    [Shizuku API] as Shizuku
    [libsu (Root)] as Libsu
    [ML Kit] as MLKit
    [Filament (3D)] as Filament
    [FFmpeg Kit] as FFmpeg
    [MCP SDK (1.1.0)] as MCP
    [Tasker Plugin] as Tasker
    [Glance AppWidget] as Glance
    [WorkManager] as WorkManager
}

' 外部服务 -> API
OpenAICloud --> EnhancedAI
Claude --> EnhancedAI
Gemini --> EnhancedAI
LocalVendors --> EnhancedAI
LocalVendors --> TTS
OpenAICloud --> STT

' UI -> Core
MainActivity --> ChatEngine
FloatingUI --> ChatEngine
OperitApp --> ChatEngine

' Core 内部
ChatEngine --> ToolSystem
ChatEngine --> Workflow
ChatEngine --> Avatar
ChatEngine --> Config
ToolSystem --> Subpack

' Core -> Data
ChatEngine --> Repository
ToolSystem --> Repository
Workflow --> Repository
Avatar --> Preferences

' Data 内部
Repository --> ObjectBox
Repository --> Preferences
Repository --> Room
Preferences --> Backup

' API -> Core
EnhancedAI --> ChatEngine
EnhancedAI --> ToolSystem
TTS --> ChatEngine
STT --> ChatEngine

' Service -> Core
ChatSvc --> ChatEngine
FloatingSvc --> ChatEngine
VoiceSvc --> ChatEngine
NotifSvc --> ChatEngine

' Provider -> Data
MemoryProvider --> Repository
WorkspaceProvider --> Repository

' App -> SubModules
ChatEngine --> DragonBones
ChatEngine --> Terminal
ChatEngine --> MNN
ChatEngine --> Llama
ChatEngine --> MMD
ChatEngine --> FBX
ChatEngine --> ShowerClient
ToolSystem --> QuickJS

' App -> SDK
UILayer ..> Android
UILayer ..> Compose
CoreLayer ..> Shizuku
CoreLayer ..> Libsu
DataLayer ..> MLKit
AppMain ..> Filament
ProviderLayer ..> FFmpeg
ToolSystem ..> MCP
Workflow ..> Tasker
WidgetGlance ..> Glance
Workflow ..> WorkManager

@enduml
```

---

## 2. 核心模块内部架构图

### 2.1 Core 层内部架构

```plantuml
@startuml
skinparam componentStyle rectangle

package "Core Layer" as Core {
    [AIMessageManager\n(聊天引擎核心)] as AIMsgMgr

    package "chat/hooks" as Hooks {
        [HistoryHook] as HistHook
        [MemoryHook] as MemHook
        [AvatarHook] as AvaHook
    }

    package "chat/plugins" as Plugs {
        [ToolCallPlugin] as ToolPlug
        [WorkflowPlugin] as WFPlug
        [CtxManagerPlugin] as CtxPlug
    }

    package "tools/" as ToolsPkg {
        [ToolRegistration\n(84KB)] as ToolReg
        [AIToolHandler\n(调度)] as ToolHandler
        [ToolResultDataClasses\n(71KB)] as ToolResult

        package "工具分类" as ToolCats {
            [defaultTool] as DefaultTools
            [mcp] as MCPTools
            [agent] as AgentTools
            [skill] as SkillTools
            [system] as SystemTools
            [packTool] as PackTools
            [javascript] as JSTools
            [calculator] as CalcTools
            [condition] as CondTools
        }
    }

    package "config/" as ConfigMod {
        [FunctionalPrompts (65KB)]
        [SystemToolPrompts (57KB)]
        [SystemPromptConfig (43KB)]
        [SystemToolPromptsInternal (309KB)]
    }

    package "avatar/" as AvatarMod {
        [impl/] as AvatarImpl
        [common/] as AvatarCommon
    }

    package "workflow/" as WFPkg {
        [WorkflowSchedulerInitializer]
        [WorkflowScheduler]
        [WorkflowExecutor (50KB)]
        [WorkflowWorker]
    }

    package "subpack/" as SubPkg {
        [ApkEditor]
        [ExeEditor]
        [ApkReverseEngineer]
        [KeyStoreHelper]
    }
}

AIMsgMgr --> Hooks
AIMsgMgr --> Plugs
AIMsgMgr --> ToolsPkg
AIMsgMgr --> ConfigMod
AIMsgMgr --> AvatarMod
AIMsgMgr --> WFPkg
AIMsgMgr --> SubPkg
ToolReg --> ToolCats
ToolHandler --> ToolReg
@enduml
```

### 2.2 Data 层内部架构

```plantuml
@startuml
skinparam componentStyle rectangle

package "Data Layer" as Data {
    package "Database" as DB {
        database "ObjectBox" as ObjBox
        database "Room DB" as RoomDB
        database "HNSW Vector Index" as HNSW
    }

    package "Repository 仓库层" as Repos {
        [MemoryRepository\n(110KB)]
        [ChatHistoryManager\n(62KB)]
        [AvatarRepository\n(44KB)]
        [WorkflowRepository\n(27KB)]
        [UIHierarchyManager]
        [CustomEmojiRepository]
    }

    package "Preferences (28类)" as Prefs {
        [UserPreferencesManager\n(83KB)]
        [ApiPreferences\n(36KB)]
        [CharacterCardManager\n(59KB)]
        [WaifuPreferences]
        [WakeWordPreferences]
        [其他 23 个配置类...]
    }

    package "MCP 模块" as MCPMod {
        [MCPRepository (48KB)]
        [MCPLocalServer (38KB)]
    }

    package "Backup 备份" as Backup {
        [OperitBackupDirs]
        [RawSnapshotBackupManager]
        [RoomDatabaseBackupManager]
        [RoomDatabaseRestoreManager]
    }

    package "导出 & 转换" as Export {
        [HtmlExporter]
        [TextExporter]
        [ChatFormat]
        [ChatGPTConverter]
        [ChatBoxConverter]
    }

    package "更新管理" as Update {
        [UpdateManager]
        [FullUpdateInstaller]
        [PatchUpdateInstaller (39KB)]
    }
}

Repos --> DB
Repos --> Prefs
MCPMod --> Repos
Prefs --> Backup
Export --> Repos
@enduml
```

### 2.3 UI 层内部架构

```plantuml
@startuml
skinparam componentStyle rectangle

package "UI Layer" as UI {
    [MainActivity\n(38KB)] as MainAct
    [OperitApp\n(Compose根)] as OApp

    package "features/ (18个页面)" as Screens {
        [chat/]
        [settings/]
        [memory/]
        [workflow/]
        [toolbox/]
        [packages/]
        [token/]
        [update/]
        [startup/]
        [其他 9 个...]
    }

    package "floating/" as Float {
        [FloatContext]
        [FloatingMode]
        [FloatingChatWindow]
        [FloatingWindowTheme]
    }

    package "theme/" as Theme {
        [Theme.kt (29KB)]
        [Color.kt]
        [Type.kt]
        [WaterGlass / LiquidGlass]
    }

    package "common/" as Common {
        [markdown/]
        [animations/]
        [displays/]
    }

    package "permissions/" as Perm {
        [ToolPermissionDialog]
        [ToolPermissionSystem]
        [PermissionRequestOverlay]
    }
}

MainAct --> OApp
OApp --> Screens
OApp --> Float
Screens --> Theme
Screens --> Common
Float --> Theme
Screens --> Perm
@enduml
```

---

## 3. 组件运行时架构图

### 3.1 Android 组件与进程架构

```plantuml
@startuml
skinparam componentStyle rectangle

node "主进程" as MainProc {
    [MainActivity] as Act
    [ContentProvider:\nMemoryDocumentsProvider\nWorkspaceDocumentsProvider] as Providers
    [BroadcastReceiver:\nExternalChatReceiver] as Receivers
    [Glance AppWidget] as Widget
}

node "前台服务进程" as FgSvcProc {
    [ChatServiceCore\n(17KB)] as ChatSvcCore
    package "core/ (服务代理)" as Delegates {
        [ApiConfigDelegate]
        [AttachmentDelegate]
        [ChatHistoryDelegate]
        [MessageProcessingDelegate\n(63KB)]
        [MessageCoordinationDelegate\n(68KB)]
    }
    [FloatingChatService\n(31KB)] as FloatSvc
}

node "浮动窗口进程" as FloatProc {
    [FloatingWindowManager\n(49KB)] as FloatMgr
    [FloatingWindowState]
}

node "语音交互进程" as VoiceProc {
    [OperitVoiceInteractionService]
    [OperitVoiceInteractionSessionService]
}

node "其他服务" as OtherProc {
    [NotificationListenerService]
    [CloudEmbeddingService]
    [TermuxCommandResultService]
    [UIDebuggerService]
}

package "外部集成" as External {
    [Tasker Plugin\n(AIAgentTasker)]
    [ExternalChatHttpServer\n(22KB)]
}

Act -[#blue]-> ChatSvcCore : Intent
Widget -[#blue]-> Act : PendingIntent
ChatSvcCore --> Delegates
ChatSvcCore -[#red]-> FloatSvc : Binder/AIDL
FloatSvc -[#red]-> FloatMgr : Binder/AIDL
External -[#blue]-> ChatSvcCore : Intent/HTTP
@enduml
```

### 3.2 组件间通信机制

```plantuml
@startuml
skinparam componentStyle rectangle

left to right direction

rectangle "UI 组件" as UI {
    [MainActivity]
    [FloatingWindow]
    [AppWidget]
}

rectangle "服务组件" as Service {
    [ChatServiceCore]
    [FloatingChatService]
    [VoiceInteractionService]
}

rectangle "ContentProvider" as Provider {
    [MemoryDocumentsProvider]
    [WorkspaceDocumentsProvider]
}

rectangle "数据层" as Data {
    [Repositories]
    [ObjectBox / Room]
}

UI <-> Service : Compose State / Flow
Service <-> Data : Repository
Provider <-> Data : SQL / DAO
note on link : ContentProvider\n对外暴露数据

FloatingWindow <-> FloatingChatService : AIDL
VoiceInteractionService <-> UI : VoiceSession
@enduml
```

---

## 4. 数据流存储架构图

### 4.1 数据持久化全景

```plantuml
@startuml
skinparam componentStyle rectangle

package "ViewModel / State 层" as VM {
    [ChatViewModel]
    [MemoryViewModel]
    [SettingsViewModel]
    [WorkflowViewModel]
}

package "Repository 层" as Repo {
    [MemoryRepository\n(110KB)]
    [ChatHistoryManager\n(62KB)]
    [AvatarRepository\n(44KB)]
    [WorkflowRepository\n(27KB)]
    [CustomEmojiRepository]
    [UIHierarchyManager]
}

package "Database 层" as DB {
    database "ObjectBox\nChatEntity, Message,\nCharacterCard, Memory,\nWorkflow ..." as ObjBox
    database "Room DB\n(辅助)" as Room
    database "HNSW Vector Index\n(hnswlib 向量搜索)" as HNSW
}

package "Preferences 层" as Pref {
    [UserPreferencesManager\n(83KB)]
    [ApiPreferences\n(36KB)]
    [CharacterCardManager\n(59KB)]
    [其他 25 个配置类...]
}

package "文件系统" as FS {
    [Android Workspace]
    [SAF Documents]
    [SFTP/SSH 挂载]
    [Cache & Temp]
}

package "备份与恢复" as Backup {
    [OperitBackupDirs]
    [RawSnapshotBackupManager]
    [RoomDatabaseBackupManager]
    [RoomDatabaseRestoreManager]
    [ChatHistoryMigrationManager]
}

VM -[#green]-> Repo : Flow / Coroutine
Repo -[#blue]-> DB : DAO
Repo -[#blue]-> Pref : DataStore
Repo -[#orange]-> FS : File I/O
Pref --> Backup : 导出/备份
DB --> Backup : 备份/恢复
@enduml
```

### 4.2 数据读写数据流

```plantuml
@startuml
participant "Composable UI" as UI
participant "ViewModel" as VM
participant "Repository" as Repo
participant "ObjectBox/Room" as DB
participant "Preferences" as Pref
participant "FileSystem" as FS

UI -> VM: 用户操作
VM -> Repo: suspend fun / Flow
Repo -> DB: query / put
DB --> Repo: 结果 / Flow
Repo --> VM: 数据模型
VM --> UI: Compose State 重组

note over VM, FS: 文件操作路径
VM -> Repo: writeFile / readFile
Repo -> FS: SAF / Workspace I/O
FS --> Repo: bytes / stream
Repo --> VM: FileResult

note over VM, Pref: 偏好设置路径
VM -> Pref: get / set
Pref --> VM: Preference value
@enduml
```

---

## 5. AI 模型推理管线图

### 5.1 LLM 对话推理全链路

```plantuml
@startuml
skinparam componentStyle rectangle

actor 用户 as User

package "输入预处理" as Input {
    [STT 语音转文字\n(SpeechServiceFactory)] as STTConv
    [OCR 图片识别\n(ML Kit)] as OCR
    [上下文构建\n(ChatRuntimeHolder)] as Ctx
}

package "Prompt 组装" as Prompt {
    [系统提示词\n(309KB)]
    [记忆注入\n(MemoryRepository)]
    [人设注入\n(AvatarRepository)]
    [功能性提示词\n(65KB)]
    [对话历史注入]
}

package "LLM Provider 路由" as LLM {
    [EnhancedAIService\n(122KB)] as Enhancer
    package "云端模型" as Cloud {
        [OpenAI]
        [Claude]
        [Gemini]
        [Minimax/SiliconFlow/...]
    }
    package "本地模型" as Local {
        [MNN 推理引擎\n(:mnn)]
        [llama.cpp 引擎\n(:llama)]
    }
}

package "响应后处理" as Post {
    [流式解码]
    [工具调用解析\nToolRegistration]
    [Markdown 渲染]
    [TTS 语音合成\n(VoiceServiceFactory)]
}

package "工具执行" as ToolExec {
    [AIToolHandler\n(调度)]
    [工具执行\n(defaultTool/MCP/Agent/...)]
    [结果序列化\n(ToolResultDataClasses)]
}

User --> Input
Input --> Prompt
Prompt --> LLM
Enhancer --> Cloud
Enhancer --> Local
LLM --> Post

Post --> ToolExec : tool_call
ToolExec --> Prompt : 下一轮注入

Post --> User : 最终响应
@enduml
```

### 5.2 TTS / STT 语音管线

```plantuml
@startuml
skinparam componentStyle rectangle

package "TTS 语音合成管线" as TTS {
    [文本输入] as TTSIn
    [VoiceServiceFactory] as TTSFactory
    package "Provider" as TTSPro {
        [HttpVoiceProvider (40KB)]
        [OpenAIVoiceProvider]
        [MiniMaxVoiceProvider]
        [SiliconFlowVoiceProvider]
        [AccessibilityVoiceProvider]
        [OpenAIRealtimeVoiceProvider]
    }
    [AudioTrack 播放] as TTSOut
    TTSIn --> TTSFactory
    TTSFactory --> TTSPro
    TTSPro --> TTSOut
}

package "STT 语音识别管线" as STT {
    [麦克风输入] as Mic
    [OnnxSileroVad\n(语音活动检测)] as VAD
    [SpeechServiceFactory] as STTFactory
    package "Provider" as STTPro {
        [SherpaSpeech (本地)]
        [SherpaMnnSpeech\n(MNN 本地)]
        [OpenAIStt (云端)]
        [DeepgramStt (云端)]
    }
    [识别文本输出] as STTOut
    Mic --> VAD
    VAD --> STTFactory
    STTFactory --> STTPro
    STTPro --> STTOut
}

package "语音唤醒管线" as Wake {
    [PersonalWakeFeatureExtractor]
    [PersonalWakeEnrollment]
    [PersonalWakeListener]
    [触发唤醒 -> 语音对话]
}

Mic --> Wake
@enduml
```

### 5.3 Tool Calling 循环

```plantuml
@startuml
participant 用户 as User
participant "EnhancedAIService" as AI
participant "LLM Provider" as LLM
participant "ToolRegistration" as ToolReg
participant "AIToolHandler" as Executor

User -> AI: 发送消息
AI -> LLM: 组装 Prompt + Tools 定义
LLM --> AI: 响应 (含 tool_call)

alt LLM 返回 tool_call
    AI -> ToolReg: 解析 tool_call
    ToolReg -> Executor: 调度执行 (含权限检查)
    Executor --> ToolReg: 工具执行结果
    ToolReg --> AI: ToolResultDataClasses
    AI -> LLM: 注入 tool_result 继续
    LLM --> AI: 继续响应 (可能再次 tool_call)
else 直接文本响应
    AI --> User: 流式输出文本
end

note over AI, Executor: 循环直到 LLM 不再返回 tool_call
@enduml
```