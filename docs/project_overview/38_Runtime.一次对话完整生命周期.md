# 一次对话完整生命周期（用户发送 → AI 回复 → 持久化）

本文档描述从用户点击发送按钮到 AI 回复渲染完毕、消息写入数据库的 **全部 11 个阶段**。每一步标注源文件路径和行号，可直接跳到源码对照。

> **与 `01_请求调用链时序图.md` 的关系：** 01 是 9 个参与者的高层时序图；本文档展开每个参与者内部的方法调用、分支判断和状态变迁。

## 总览

一次对话生命周期分 11 个阶段：

| 阶段 | 核心类 | 做什么 |
|------|--------|--------|
| **1. 入口** | ChatViewModel | 薄壳转发 |
| **2. 协调** | MessageCoordinationDelegate | 对话创建、角色卡解析、群组编排判断 |
| **3. 构建 Prompt** | AIMessageManager | 拼接附件/工作区/引用/代理标签 |
| **4. 用户消息持久化** | ChatHistoryDelegate | 写入 Room |
| **5. Provider 路由** | EnhancedAIService | 按 FunctionType 选择 AI 提供商 |
| **6. System Prompt 注入** | EnhancedAIService | 工具 Schema + 角色设定 + 记忆 + 工作区 |
| **7. 流式请求** | AIService (Provider) | 调用 LLM API，逐 chunk 返回 |
| **8. 流式渲染** | RevisableTextStream + UI | SAVEPOINT/ROLLBACK + 逐字渲染 |
| **9. ReAct 循环** | ToolExecutionManager | 解析工具调用 → 执行 → 结果回注 → 再次请求 |
| **10. 消息持久化** | MessageProcessingDelegate | 每秒快照 + 最终写入 |
| **11. 收尾** | MessageProcessingDelegate | Token 统计、Waifu 处理、状态重置 |

## 委托架构

`ChatViewModel` 本身不持有业务逻辑，通过 `ChatServiceCore` 获取 7 个委托：

```mermaid
graph LR
    VM["ChatViewModel<br/>ui/features/chat/viewmodel/<br/>ChatViewModel.kt:92"]
    VM --> CORE["ChatServiceCore<br/>(chatRuntimeHolder.getCore)"]
    CORE --> D1["UiStateDelegate<br/>错误/Toast/弹窗"]
    CORE --> D2["TokenStatisticsDelegate<br/>Token 计数"]
    CORE --> D3["ApiConfigDelegate<br/>API 配置/功能开关"]
    CORE --> D4["AttachmentDelegate<br/>附件管理"]
    CORE --> D5["ChatHistoryDelegate<br/>聊天历史 CRUD"]
    CORE --> D6["MessageProcessingDelegate<br/>消息发送/流收集"]
    CORE --> D7["MessageCoordinationDelegate<br/>发送协调/总结/群组"]
    CORE --> D8["EnhancedAIService<br/>AI 服务实例"]
```

**初始化：** `initializeDelegates()`（ChatViewModel.kt:443-483）中从 `ChatServiceCore` 逐个获取。

## 阶段 1: 入口 — ChatViewModel

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户 (UI)
    participant VM as ChatViewModel<br/>L1208-1228

    U->>VM: 点击发送按钮
    VM->>VM: sendUserMessage(promptFunctionType)

    Note over VM: 薄壳转发，零业务逻辑<br/>直接调用 messageCoordinationDelegate<br/>.sendUserMessage(promptFunctionType)
```

其他入口方法：
- `cancelCurrentMessage()` (L1219) — 先取消总结再取消消息
- `rewindAndResendMessage(index, editedContent)` (L983) — 回档 + 重发

**关键文件：** `ui/features/chat/viewmodel/ChatViewModel.kt:1208`

## 阶段 2: 协调 — MessageCoordinationDelegate

```mermaid
sequenceDiagram
    autonumber
    participant VM as ChatViewModel
    participant MC as MessageCoordination<br/>Delegate L244
    participant MP as MessageProcessing<br/>Delegate

    VM->>MC: sendUserMessage(promptFunctionType)

    MC->>MC: 检查是否有活跃对话
    alt 无活跃对话
        MC->>MC: 创建新对话 (ChatHistory)
    end

    MC->>MC: sendMessageInternal() (L308)

    Note over MC: ① 解析角色卡绑定<br/>(ActivePromptManager)
    Note over MC: ② 检查模型配置绑定<br/>(chatModelConfigIdOverride)
    Note over MC: ③ 检查 Token 用量是否超限

    MC->>MC: shouldRunGroupOrchestration? (L340-379)

    alt 群组编排模式
        MC->>MC: orchestrateGroupConversation() (L534)
        Note over MC: 1. planResponseOrder() (L771)<br/>   调用规划模型排列成员发言顺序<br/>2. 按序对每个成员调用<br/>   sendMessageInternal()
    else 普通单轮
        MC->>MC: shouldGenerateSummary()? (L432)
        alt 需要总结
            MC->>MC: launchAsyncSummaryForSend() (L1314)
            Note over MC: 异步启动历史总结<br/>不阻塞当前发送
        end

        MC->>MP: sendUserMessage(attachments, chatId, ...) (L476)
    end
```

**关键分支：**
- **群组编排**：当前活跃 Prompt 是角色组 (CharacterGroup) 时触发，调用规划模型排列成员发言顺序
- **自动总结**：`shouldGenerateSummary()` 检查 Token 总量是否接近上限
- **Token 超限**：`handleTokenLimitExceeded()` 触发 `summarizeHistory(autoContinue=true)` (L1190)

**关键文件：** `services/core/MessageCoordinationDelegate.kt:244-534`

## 阶段 3: 构建 Prompt — AIMessageManager

```mermaid
sequenceDiagram
    autonumber
    participant MP as MessageProcessing<br/>Delegate
    participant AIM as AIMessageManager<br/>(object 单例) L117

    MP->>AIM: buildUserMessageContent(messageText, chatId, attachments, ...)

    AIM->>AIM: 1. InputProcessor.processUserInput() (L133)
    Note over AIM: 预处理用户输入文本

    AIM->>AIM: 2. 构建 proxySenderTag (L139)
    Note over AIM: <proxy_sender name="..."/>

    AIM->>AIM: 3. 构建 replyTag (L151)
    Note over AIM: <reply_to sender="..." timestamp="..."><br/>引用内容（最多 100 字符）

    AIM->>AIM: 4. WorkspaceAttachmentProcessor (L169)
    Note over AIM: generateWorkspaceAttachment()<br/>→ <workspace_attachment> XML

    AIM->>AIM: 5. 处理附件 (L190)
    Note over AIM: 按 mimeType 分路：<br/>• 图片 → ImagePoolManager.addImage()<br/>  + MediaLinkBuilder.image()<br/>• 音频/视频 → MediaPoolManager.addMedia()<br/>• 其他 → <attachment id="..." filename="...">

    AIM->>AIM: 6. 最终拼接 (L269)
    Note over AIM: [proxySenderTag,<br/> processedMessageText,<br/> attachmentTags,<br/> workspaceTag,<br/> replyTag]<br/>.joinToString(" ")

    AIM-->>MP: 组装完成的 prompt 文本
```

**关键文件：** `core/chat/AIMessageManager.kt:117-277`

## 阶段 4: 用户消息持久化

```mermaid
sequenceDiagram
    autonumber
    participant MP as MessageProcessing<br/>Delegate L388
    participant HD as ChatHistoryDelegate<br/>L60
    participant CHM as ChatHistoryManager<br/>L268
    participant DB as Room (MessageDao)

    MP->>MP: 构建 ChatMessage(role=USER, content=prompt)

    MP->>HD: addMessageToChat(chatId, userMessage)

    HD->>HD: historyUpdateMutex.withLock { }
    Note over HD: 并发安全

    HD->>CHM: addMessage(chatId, message, orderIndex)

    CHM->>CHM: chatMutex(chatId).withLock { }
    Note over CHM: 按 chatId 粒度加锁

    CHM->>DB: MessageEntity.fromChatMessage()
    CHM->>DB: messageDao.insertMessage(entity)
    Note over DB: @Insert(onConflict = REPLACE)
```

**关键文件：**
- `services/core/ChatHistoryDelegate.kt:60` — `_chatHistory`
- `data/repository/ChatHistoryManager.kt:268` — `addMessage()`
- `data/dao/MessageDao.kt:31` — `insertMessage()`

## 阶段 5: Provider 路由 — EnhancedAIService

```mermaid
sequenceDiagram
    autonumber
    participant MP as MessageProcessing<br/>Delegate
    participant AIM as AIMessageManager<br/>L301
    participant EAS as EnhancedAIService<br/>L454-468
    participant MSM as MultiServiceManager

    MP->>AIM: sendMessage(chatHistory, enhancedAiService, ...)

    AIM->>AIM: 检查插件接管 (L383)
    Note over AIM: MessageProcessingPluginRegistry<br/>.createExecutionIfMatched()

    alt 插件接管
        AIM->>AIM: 走插件处理管线
    else 无插件匹配
        AIM->>EAS: sendMessage(message, chatHistory, ...)
    end

    EAS->>EAS: getAIServiceForFunction(functionType) (L454)

    alt 有 chatModelConfigIdOverride
        EAS->>MSM: getServiceForConfig(configId, modelIndex)
    else 无 override
        EAS->>MSM: getServiceForFunction(functionType)
    end

    MSM-->>EAS: AIService 实例<br/>(OpenAI/Claude/Gemini/Deepseek/Ollama/...)
```

**Provider 实例管理：**
- 全局默认：`INSTANCE`（单例）
- 按 chatId 独立：`CHAT_INSTANCES: ConcurrentHashMap<String, EnhancedAIService>` (L94)

**关键文件：** `api/chat/EnhancedAIService.kt:454-468`

## 阶段 6: System Prompt 注入

```mermaid
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService<br/>L795
    participant MEM as MemorySystem
    participant TOOL as SystemToolPrompts

    EAS->>EAS: prepareConversationHistory() (L795)

    EAS->>TOOL: 1. 生成工具 Schema
    Note over TOOL: 所有可用工具的参数描述<br/>按权限级别过滤

    EAS->>EAS: 2. 角色设定注入
    Note over EAS: CharacterCard / ActivePromptManager<br/>→ system prompt 开头

    EAS->>MEM: 3. memorySystem.queryRelevantMemories()
    Note over MEM: 向量搜索相关记忆<br/>注入 system prompt

    EAS->>EAS: 4. 工作区文件列表
    Note over EAS: 当前绑定的工作区目录<br/>文件名列表

    EAS->>EAS: 5. 思考引导 (可选)
    Note over EAS: enableThinkingGuidance 开关

    EAS->>EAS: 6. 应用 PromptHookRegistry 钩子
    Note over EAS: 前置钩子 (L861)<br/>后置钩子 (L885)

    Note over EAS: 最终 conversationHistory:<br/>[SystemMessage, ...历史消息, UserMessage]
```

**关键文件：** `api/chat/EnhancedAIService.kt:795-885`

## 阶段 7: 流式请求 — 调用 LLM

```mermaid
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService<br/>L918
    participant SVC as AIService<br/>(Provider)
    participant NET as HTTP/WebSocket

    EAS->>EAS: 创建 MessageExecutionContext (L769)
    Note over EAS: streamBuffer + roundManager<br/>+ eventChannel

    EAS->>EAS: getAvailableToolsForFunction()
    EAS->>EAS: getModelParametersForFunction()

    EAS->>SVC: sendMessage(chatHistory, modelParams, tools) (L918)

    SVC->>NET: HTTP POST / WebSocket
    Note over NET: Provider-specific 格式<br/>OpenAI: POST /v1/chat/completions<br/>Claude: POST /v1/messages<br/>Gemini: POST /v1beta/streamGenerateContent<br/>Ollama: POST /api/chat<br/>本地: MNN/llama.cpp direct

    loop 流式接收
        NET-->>SVC: chunk
        SVC-->>EAS: Flow<String> emit(chunk)
    end
```

## 阶段 8: 流式渲染 — SAVEPOINT/ROLLBACK 机制

```mermaid
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService<br/>L945
    participant SC as StreamCollector<br/>(双协程)
    participant SH as SharedStream<br/>(replay=MAX)
    participant UI as rememberRevisable<br/>TextStream (L21-77)
    participant CMP as Compose UI

    EAS->>SC: 启动双协程收集 (L945)

    par revisionJob (事件协程)
        SC->>SC: 监听 carrier.eventChannel
        Note over SC: 接收 SAVEPOINT/ROLLBACK 事件
        SC->>SC: TextStreamRevisionTracker 记录/回撤
    and 主收集协程
        loop 逐 chunk
            SC->>SH: sharedCharStream.emit(chunk)
            SH->>UI: 订阅流推送
        end
    end

    UI->>UI: LaunchedEffect(sourceStream) (L30)

    par eventJob (UI 侧)
        UI->>UI: 监听 eventChannel
        alt ROLLBACK 事件
            UI->>UI: 创建新 MutableSharedStream
            UI->>CMP: displayStream 变化 → 重组
            Note over CMP: 回退到 SAVEPOINT 快照<br/>继续追加新内容
        end
    and 主收集 (UI 侧)
        loop 逐 chunk
            UI->>CMP: activeDisplayStream.emit(chunk)
            CMP->>CMP: 逐字渲染（打字机效果）
        end
    end
```

**SAVEPOINT/ROLLBACK 用途：**
某些 LLM Provider（如 Gemini 思考模式）在流式输出中可能修正已发出内容。ROLLBACK 让 UI 回退到快照点再续写，避免闪烁。

**关键文件：**
- `util/stream/RevisableTextStream.kt:10` — 事件定义
- `util/stream/TextStreamRevisionTracker.kt` — 快照管理
- `ui/features/chat/components/RevisableTextStreamRemember.kt:21-77` — UI 侧流处理

## 阶段 9: ReAct 循环 — 工具调用

```mermaid
flowchart TD
    COMPLETE["processStreamCompletion()<br/>EnhancedAIService.kt:1491"] --> DETECT["enhanceToolDetection()<br/>detectAndRepairTruncatedToolRound()<br/>L1589"]
    DETECT --> EXTRACT["ToolExecutionManager<br/>.extractToolInvocations(finalContent)<br/>L1610"]
    EXTRACT --> HAS_TOOL{发现工具调用?}

    HAS_TOOL -->|否| END_TASK["handleTaskCompletion()<br/>或 handleWaitForUserNeed()<br/>→ 结束循环"]

    HAS_TOOL -->|是| INVOKE["handleToolInvocation()<br/>L1868"]
    INVOKE --> FILTER["角色卡权限过滤<br/>ToolExecutionManager L362"]
    FILTER --> PERM["checkToolPermission()<br/>L278"]
    PERM --> PERM_CHK{权限检查}

    PERM_CHK -->|FORBID| SKIP["跳过该工具"]
    PERM_CHK -->|ASK| ASK_USER["运行时弹窗询问用户"]
    PERM_CHK -->|ALLOW| EXEC

    ASK_USER -->|允许| EXEC["executeToolSafely()<br/>L238"]
    ASK_USER -->|拒绝| SKIP

    EXEC --> GROUP{工具类型?}
    GROUP -->|只读工具| PARALLEL["并行执行<br/>list_files/read_file/<br/>visit_web 等"]
    GROUP -->|写入工具| SERIAL["串行执行<br/>L444"]

    PARALLEL --> RESULT["工具执行结果"]
    SERIAL --> RESULT

    RESULT --> PROCESS["processToolResults()<br/>L1971"]
    PROCESS --> INJECT["结果加入 conversationHistory<br/>L2025"]
    INJECT --> TOKEN_CHK{Token 超限?}

    TOKEN_CHK -->|是| LIMIT["onTokenLimitExceeded()<br/>L2091"]
    TOKEN_CHK -->|否| RESEND["再次 sendMessage()<br/>L2112"]

    RESEND --> COMPLETE

    style COMPLETE fill:#e3f2fd,color:#000
    style END_TASK fill:#e8f5e9,color:#000
    style RESEND fill:#fff3e0,color:#000
```

**工具执行管线详细步骤：**

```mermaid
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService
    participant TEM as ToolExecutionManager<br/>L156
    participant TPS as ToolPermissionSystem
    participant TOOL as 工具执行器

    EAS->>TEM: extractToolInvocations(content) (L1610)
    Note over TEM: 解析 <tool_call name="..."> XML<br/>StreamXmlPlugin 分流

    TEM-->>EAS: List<ToolInvocation>

    EAS->>TEM: executeInvocations(invocations) (L331)

    loop 每个 ToolInvocation
        TEM->>TEM: 角色卡 deny_tool 过滤 (L362)

        TEM->>TPS: checkToolPermission(toolName) (L278)
        TPS-->>TEM: ALLOW / ASK / FORBID

        alt ALLOW
            TEM->>TOOL: executeToolSafely() (L238)
            Note over TOOL: 参数验证<br/>→ executor.invokeAndStream()<br/>→ 实时 emit 结果
            TOOL-->>TEM: ToolResult
        else ASK
            TEM->>TEM: 弹窗询问用户
        else FORBID
            TEM->>TEM: 生成拒绝消息
        end
    end

    TEM-->>EAS: allToolResults（按原始顺序排序）

    EAS->>EAS: processToolResults() (L1971)
    EAS->>EAS: 结果追加到 conversationHistory (L2025)
    EAS->>EAS: 再次 sendMessage() → 循环 (L2112)
```

**关键文件：**
- `api/chat/EnhancedAIService.kt:1491-2112` — ReAct 循环
- `api/chat/enhance/ToolExecutionManager.kt:156-444` — 工具执行管线

## 阶段 10: 消息持久化 — 实时快照 + 最终写入

```mermaid
sequenceDiagram
    autonumber
    participant MP as MessageProcessing<br/>Delegate L870
    participant HD as ChatHistoryDelegate
    participant DB as Room

    loop 每 1000ms (STREAM_PERSIST_INTERVAL_MS)
        MP->>MP: persistStreamingSnapshot(contentSnapshot) (L870-882)
        Note over MP: 将当前流内容快照<br/>作为 AI 消息写入

        MP->>HD: addMessageToChat(chatId, aiMessage.copy(content=snapshot))
        HD->>DB: insertMessage (REPLACE)
        Note over DB: 同一条消息反复 REPLACE<br/>保证崩溃后可恢复
    end

    Note over MP: 流结束信号

    MP->>MP: finalizeMessageAndNotify() (L1145)

    MP->>HD: addMessageToChat(chatId, finalMessage)
    Note over HD: contentStream = null<br/>最终版本覆盖所有快照

    HD->>DB: insertMessage (REPLACE)
    Note over DB: 最终持久化完成
```

**关键文件：** `services/core/MessageProcessingDelegate.kt:870-882, 1145`

## 阶段 11: 收尾

```mermaid
sequenceDiagram
    autonumber
    participant MP as MessageProcessing<br/>Delegate
    participant MC as MessageCoordination<br/>Delegate
    participant WAIFU as WaifuMessageProcessor

    MP->>MP: 更新 Token 统计
    Note over MP: inputTokens + outputTokens<br/>+ cachedTokens 计入统计

    MP->>MP: 卸载 workspace hook
    Note over MP: 清理本轮对话的工作区绑定

    alt Waifu 模式开启
        MP->>WAIFU: 逐句拆分 AI 回复
        Note over WAIFU: 按句号/感叹号/问号拆分<br/>每句间加 charDelay 延迟<br/>移除标点（如配置）
    end

    MP->>MP: inputProcessingState → Idle
    Note over MP: 解除发送锁定<br/>UI 发送按钮恢复可用

    MC->>MC: 检查是否需要后续总结
    Note over MC: shouldGenerateSummary() 再次检查<br/>如 Token 超限 → 异步总结

    Note over MP: ═══ 一次对话完成 ═══
```

## 错误处理

```mermaid
flowchart TD
    ERR["异常发生"] --> TYPE{异常类型}

    TYPE -->|网络错误| NET["ConnectionException<br/>→ 显示网络错误 Toast<br/>→ 消息标记 ERROR 状态<br/>→ 解除发送锁定"]

    TYPE -->|API 错误| API["APIException<br/>→ 解析错误码<br/>→ 显示错误消息<br/>→ 保留部分流式内容"]

    TYPE -->|工具执行错误| TOOL["ToolExecutionException<br/>→ 错误注入 conversationHistory<br/>→ AI 看到错误并自行处理<br/>→ ReAct 循环继续"]

    TYPE -->|Token 超限| TOKEN["TokenLimitException<br/>→ summarizeHistory()<br/>→ autoContinue=true<br/>→ 自动续写"]

    TYPE -->|取消| CANCEL["CancellationException<br/>→ 保留已收到的内容<br/>→ 持久化部分消息<br/>→ 解除锁定"]

    TYPE -->|未知错误| UNKNOWN["→ GlobalExceptionHandler<br/>→ 崩溃报告 + 恢复"]
```

## 完整生命周期流程图

```
用户点击发送
│
├── ChatViewModel.sendUserMessage() ← 薄壳转发
│    └── MessageCoordinationDelegate.sendUserMessage()
│         ├── 对话创建（如需要）
│         ├── 角色卡/模型绑定解析
│         ├── Token 超限检查
│         ├── 群组编排判断
│         │    └── [群组] orchestrateGroupConversation()
│         │         └── 规划模型排列 → 逐成员 sendMessageInternal()
│         ├── 自动总结检查
│         └── MessageProcessingDelegate.sendUserMessage()
│
├── AIMessageManager.buildUserMessageContent() ← Prompt 构建
│    ├── InputProcessor 预处理
│    ├── proxySenderTag（代理发送者标签）
│    ├── replyTag（引用内容）
│    ├── workspaceTag（工作区附件）
│    ├── 附件处理（图片/音频/视频/其他）
│    └── 最终拼接
│
├── ChatHistoryDelegate.addMessageToChat() ← 用户消息写入 Room
│
├── AIMessageManager.sendMessage() ← 发送
│    ├── 插件接管检查
│    └── EnhancedAIService.sendMessage()
│         ├── prepareConversationHistory() ← System Prompt 注入
│         │    ├── 工具 Schema
│         │    ├── 角色设定
│         │    ├── 记忆查询
│         │    ├── 工作区文件列表
│         │    └── PromptHook 钩子
│         ├── getAIServiceForFunction() ← Provider 路由
│         └── serviceForFunction.sendMessage() ← 调用 LLM
│
├── 流式接收 + 双协程收集
│    ├── revisionJob: SAVEPOINT/ROLLBACK 事件处理
│    └── 主协程: SharedStream.emit(chunk) → UI 逐字渲染
│
├── processStreamCompletion() ← ReAct 循环
│    ├── extractToolInvocations()
│    ├── [无工具] → 结束
│    └── [有工具] → executeInvocations()
│         ├── 角色卡权限过滤
│         ├── checkToolPermission() (ALLOW/ASK/FORBID)
│         ├── 只读工具并行 / 写入工具串行
│         ├── processToolResults()
│         └── 再次 sendMessage() → 循环
│
├── persistStreamingSnapshot() ← 每 1000ms 快照写入 Room
│
├── finalizeMessageAndNotify() ← 最终持久化
│    ├── AI 消息写入 Room（覆盖快照）
│    ├── Token 统计更新
│    ├── workspace hook 卸载
│    ├── [Waifu] 逐句拆分 + 延迟渲染
│    └── inputProcessingState → Idle
│
└── ✅ 对话完成
```

## 核心文件清单

| 文件 | 路径 | 行数 | 职责 |
|------|------|------|------|
| **ChatViewModel** | `ui/features/chat/viewmodel/ChatViewModel.kt` | ~1300 | 薄壳委托层 |
| **ChatHistoryDelegate** | `services/core/ChatHistoryDelegate.kt` | ~200 | 消息 CRUD + 并发控制 |
| **MessageCoordinationDelegate** | `services/core/MessageCoordinationDelegate.kt` | ~1500 | 发送协调 + 群组编排 + 总结 |
| **MessageProcessingDelegate** | `services/core/MessageProcessingDelegate.kt` | ~1200 | 消息发送 + 流收集 + 持久化 |
| **AIMessageManager** | `core/chat/AIMessageManager.kt` | ~500 | Prompt 构建 (无状态单例) |
| **EnhancedAIService** | `api/chat/EnhancedAIService.kt` | ~2200 | Provider 路由 + System Prompt + ReAct |
| **ToolExecutionManager** | `api/chat/enhance/ToolExecutionManager.kt` | ~500 | 工具解析 + 权限 + 执行 |
| **ChatHistoryManager** | `data/repository/ChatHistoryManager.kt` | ~500 | Room 持久化层 |
| **MessageDao** | `data/dao/MessageDao.kt` | ~70 | Room DAO |
| **RevisableTextStreamRemember** | `ui/features/chat/components/RevisableTextStreamRemember.kt` | ~80 | UI 侧流式渲染 |
| **TextStreamRevisionTracker** | `util/stream/TextStreamRevisionTracker.kt` | ~60 | SAVEPOINT/ROLLBACK 快照 |
