registerTabContent('runtime-chat', `
  <!-- Hero Stats -->
  <div class="stats" style="margin-bottom:24px;">
    <div class="stat-item"><span class="stat-num">11</span><span class="stat-label">生命周期阶段</span></div>
    <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">委托对象</span></div>
    <div class="stat-item"><span class="stat-num">10+</span><span class="stat-label">时序/流程图</span></div>
    <div class="stat-item"><span class="stat-num">~2200</span><span class="stat-label">EnhancedAIService 行数</span></div>
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 16px 4px;">
    本文档描述从用户点击发送按钮到 AI 回复渲染完毕、消息写入数据库的全部 11 个阶段。每一步标注源文件路径和行号，可直接跳到源码对照。
    <br><strong style="color:var(--text-dimmer);">与 01_请求调用链时序图.md 的关系：</strong>01 是 9 个参与者的高层时序图；本文档展开每个参与者内部的方法调用、分支判断和状态变迁。
  </p>

  <!-- 总览 -->
  <div class="section-head blue">总览 — 11 个生命周期阶段</div>
  <table class="act-table">
    <tr><th>阶段</th><th>核心类</th><th>做什么</th></tr>
    <tr><td><strong>1. 入口</strong></td><td><code>ChatViewModel</code></td><td>薄壳转发</td></tr>
    <tr><td><strong>2. 协调</strong></td><td><code>MessageCoordinationDelegate</code></td><td>对话创建、角色卡解析、群组编排判断</td></tr>
    <tr><td><strong>3. 构建 Prompt</strong></td><td><code>AIMessageManager</code></td><td>拼接附件/工作区/引用/代理标签</td></tr>
    <tr><td><strong>4. 用户消息持久化</strong></td><td><code>ChatHistoryDelegate</code></td><td>写入 Room</td></tr>
    <tr><td><strong>5. Provider 路由</strong></td><td><code>EnhancedAIService</code></td><td>按 FunctionType 选择 AI 提供商</td></tr>
    <tr><td><strong>6. System Prompt 注入</strong></td><td><code>EnhancedAIService</code></td><td>工具 Schema + 角色设定 + 记忆 + 工作区</td></tr>
    <tr><td><strong>7. 流式请求</strong></td><td><code>AIService (Provider)</code></td><td>调用 LLM API，逐 chunk 返回</td></tr>
    <tr><td><strong>8. 流式渲染</strong></td><td><code>RevisableTextStream + UI</code></td><td>SAVEPOINT/ROLLBACK + 逐字渲染</td></tr>
    <tr><td><strong>9. ReAct 循环</strong></td><td><code>ToolExecutionManager</code></td><td>解析工具调用 → 执行 → 结果回注 → 再次请求</td></tr>
    <tr><td><strong>10. 消息持久化</strong></td><td><code>MessageProcessingDelegate</code></td><td>每秒快照 + 最终写入</td></tr>
    <tr><td><strong>11. 收尾</strong></td><td><code>MessageProcessingDelegate</code></td><td>Token 统计、Waifu 处理、状态重置</td></tr>
  </table>

  <!-- 委托架构 -->
  <div class="section-head green" style="margin-top:28px;">委托架构 — ChatViewModel 的 7 个委托</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 8px 4px;">
    <code>ChatViewModel</code> 本身不持有业务逻辑，通过 <code>ChatServiceCore</code> 获取 7 个委托。
    初始化在 <code>initializeDelegates()</code>（ChatViewModel.kt:443-483）中从 <code>ChatServiceCore</code> 逐个获取。
  </p>
  <div class="mermaid">
graph LR
    VM["ChatViewModel&lt;br/&gt;ui/features/chat/viewmodel/&lt;br/&gt;ChatViewModel.kt:92"]
    VM --> CORE["ChatServiceCore&lt;br/&gt;(chatRuntimeHolder.getCore)"]
    CORE --> D1["UiStateDelegate&lt;br/&gt;错误/Toast/弹窗"]
    CORE --> D2["TokenStatisticsDelegate&lt;br/&gt;Token 计数"]
    CORE --> D3["ApiConfigDelegate&lt;br/&gt;API 配置/功能开关"]
    CORE --> D4["AttachmentDelegate&lt;br/&gt;附件管理"]
    CORE --> D5["ChatHistoryDelegate&lt;br/&gt;聊天历史 CRUD"]
    CORE --> D6["MessageProcessingDelegate&lt;br/&gt;消息发送/流收集"]
    CORE --> D7["MessageCoordinationDelegate&lt;br/&gt;发送协调/总结/群组"]
    CORE --> D8["EnhancedAIService&lt;br/&gt;AI 服务实例"]
  </div>

  <!-- 阶段 1 -->
  <div class="section-head blue" style="margin-top:28px;">阶段 1: 入口 — ChatViewModel</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 8px 4px;">
    薄壳转发层，零业务逻辑，直接调用 <code>messageCoordinationDelegate.sendUserMessage(promptFunctionType)</code>。
  </p>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant U as 用户 (UI)
    participant VM as ChatViewModel&lt;br/&gt;L1208-1228

    U->>VM: 点击发送按钮
    VM->>VM: sendUserMessage(promptFunctionType)

    Note over VM: 薄壳转发，零业务逻辑&lt;br/&gt;直接调用 messageCoordinationDelegate&lt;br/&gt;.sendUserMessage(promptFunctionType)
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;">其他入口方法：</p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node"><code>cancelCurrentMessage()</code> (L1219) — 先取消总结再取消消息</div>
    <div class="tree-node"><code>rewindAndResendMessage(index, editedContent)</code> (L983) — 回档 + 重发</div>
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 0 4px;"><strong>关键文件：</strong> <code>ui/features/chat/viewmodel/ChatViewModel.kt:1208</code></p>

  <!-- 阶段 2 -->
  <div class="section-head orange" style="margin-top:28px;">阶段 2: 协调 — MessageCoordinationDelegate</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant VM as ChatViewModel
    participant MC as MessageCoordination&lt;br/&gt;Delegate L244
    participant MP as MessageProcessing&lt;br/&gt;Delegate

    VM->>MC: sendUserMessage(promptFunctionType)

    MC->>MC: 检查是否有活跃对话
    alt 无活跃对话
        MC->>MC: 创建新对话 (ChatHistory)
    end

    MC->>MC: sendMessageInternal() (L308)

    Note over MC: ① 解析角色卡绑定&lt;br/&gt;(ActivePromptManager)
    Note over MC: ② 检查模型配置绑定&lt;br/&gt;(chatModelConfigIdOverride)
    Note over MC: ③ 检查 Token 用量是否超限

    MC->>MC: shouldRunGroupOrchestration? (L340-379)

    alt 群组编排模式
        MC->>MC: orchestrateGroupConversation() (L534)
        Note over MC: 1. planResponseOrder() (L771)&lt;br/&gt;   调用规划模型排列成员发言顺序&lt;br/&gt;2. 按序对每个成员调用&lt;br/&gt;   sendMessageInternal()
    else 普通单轮
        MC->>MC: shouldGenerateSummary()? (L432)
        alt 需要总结
            MC->>MC: launchAsyncSummaryForSend() (L1314)
            Note over MC: 异步启动历史总结&lt;br/&gt;不阻塞当前发送
        end

        MC->>MP: sendUserMessage(attachments, chatId, ...) (L476)
    end
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><strong>关键分支：</strong></p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node"><strong>群组编排</strong>：当前活跃 Prompt 是角色组 (CharacterGroup) 时触发，调用规划模型排列成员发言顺序</div>
    <div class="tree-node"><strong>自动总结</strong>：<code>shouldGenerateSummary()</code> 检查 Token 总量是否接近上限</div>
    <div class="tree-node"><strong>Token 超限</strong>：<code>handleTokenLimitExceeded()</code> 触发 <code>summarizeHistory(autoContinue=true)</code> (L1190)</div>
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 0 4px;"><strong>关键文件：</strong> <code>services/core/MessageCoordinationDelegate.kt:244-534</code></p>

  <!-- 阶段 3 -->
  <div class="section-head purple" style="margin-top:28px;">阶段 3: 构建 Prompt — AIMessageManager</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MP as MessageProcessing&lt;br/&gt;Delegate
    participant AIM as AIMessageManager&lt;br/&gt;(object 单例) L117

    MP->>AIM: buildUserMessageContent(messageText, chatId, attachments, ...)

    AIM->>AIM: 1. InputProcessor.processUserInput() (L133)
    Note over AIM: 预处理用户输入文本

    AIM->>AIM: 2. 构建 proxySenderTag (L139)
    Note over AIM: &lt;proxy_sender name="..."/&gt;

    AIM->>AIM: 3. 构建 replyTag (L151)
    Note over AIM: &lt;reply_to sender="..." timestamp="..."&gt;&lt;br/&gt;引用内容（最多 100 字符）

    AIM->>AIM: 4. WorkspaceAttachmentProcessor (L169)
    Note over AIM: generateWorkspaceAttachment()&lt;br/&gt;→ &lt;workspace_attachment&gt; XML

    AIM->>AIM: 5. 处理附件 (L190)
    Note over AIM: 按 mimeType 分路：&lt;br/&gt;• 图片 → ImagePoolManager.addImage()&lt;br/&gt;  + MediaLinkBuilder.image()&lt;br/&gt;• 音频/视频 → MediaPoolManager.addMedia()&lt;br/&gt;• 其他 → &lt;attachment id="..." filename="..."&gt;

    AIM->>AIM: 6. 最终拼接 (L269)
    Note over AIM: [proxySenderTag,&lt;br/&gt; processedMessageText,&lt;br/&gt; attachmentTags,&lt;br/&gt; workspaceTag,&lt;br/&gt; replyTag]&lt;br/&gt;.joinToString(" ")

    AIM-->>MP: 组装完成的 prompt 文本
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:8px 0 0 4px;"><strong>关键文件：</strong> <code>core/chat/AIMessageManager.kt:117-277</code></p>

  <!-- 阶段 4 -->
  <div class="section-head cyan" style="margin-top:28px;">阶段 4: 用户消息持久化</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MP as MessageProcessing&lt;br/&gt;Delegate L388
    participant HD as ChatHistoryDelegate&lt;br/&gt;L60
    participant CHM as ChatHistoryManager&lt;br/&gt;L268
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
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><strong>关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node"><code>services/core/ChatHistoryDelegate.kt:60</code> — <code>_chatHistory</code></div>
    <div class="tree-node"><code>data/repository/ChatHistoryManager.kt:268</code> — <code>addMessage()</code></div>
    <div class="tree-node"><code>data/dao/MessageDao.kt:31</code> — <code>insertMessage()</code></div>
  </div>

  <!-- 阶段 5 -->
  <div class="section-head blue" style="margin-top:28px;">阶段 5: Provider 路由 — EnhancedAIService</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MP as MessageProcessing&lt;br/&gt;Delegate
    participant AIM as AIMessageManager&lt;br/&gt;L301
    participant EAS as EnhancedAIService&lt;br/&gt;L454-468
    participant MSM as MultiServiceManager

    MP->>AIM: sendMessage(chatHistory, enhancedAiService, ...)

    AIM->>AIM: 检查插件接管 (L383)
    Note over AIM: MessageProcessingPluginRegistry&lt;br/&gt;.createExecutionIfMatched()

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

    MSM-->>EAS: AIService 实例&lt;br/&gt;(OpenAI/Claude/Gemini/Deepseek/Ollama/...)
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><strong>Provider 实例管理：</strong></p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node">全局默认：<code>INSTANCE</code>（单例）</div>
    <div class="tree-node">按 chatId 独立：<code>CHAT_INSTANCES: ConcurrentHashMap&lt;String, EnhancedAIService&gt;</code> (L94)</div>
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 0 4px;"><strong>关键文件：</strong> <code>api/chat/EnhancedAIService.kt:454-468</code></p>

  <!-- 阶段 6 -->
  <div class="section-head green" style="margin-top:28px;">阶段 6: System Prompt 注入</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService&lt;br/&gt;L795
    participant MEM as MemorySystem
    participant TOOL as SystemToolPrompts

    EAS->>EAS: prepareConversationHistory() (L795)

    EAS->>TOOL: 1. 生成工具 Schema
    Note over TOOL: 所有可用工具的参数描述&lt;br/&gt;按权限级别过滤

    EAS->>EAS: 2. 角色设定注入
    Note over EAS: CharacterCard / ActivePromptManager&lt;br/&gt;→ system prompt 开头

    EAS->>MEM: 3. memorySystem.queryRelevantMemories()
    Note over MEM: 向量搜索相关记忆&lt;br/&gt;注入 system prompt

    EAS->>EAS: 4. 工作区文件列表
    Note over EAS: 当前绑定的工作区目录&lt;br/&gt;文件名列表

    EAS->>EAS: 5. 思考引导 (可选)
    Note over EAS: enableThinkingGuidance 开关

    EAS->>EAS: 6. 应用 PromptHookRegistry 钩子
    Note over EAS: 前置钩子 (L861)&lt;br/&gt;后置钩子 (L885)

    Note over EAS: 最终 conversationHistory:&lt;br/&gt;[SystemMessage, ...历史消息, UserMessage]
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:8px 0 0 4px;"><strong>关键文件：</strong> <code>api/chat/EnhancedAIService.kt:795-885</code></p>

  <!-- 阶段 7 -->
  <div class="section-head orange" style="margin-top:28px;">阶段 7: 流式请求 — 调用 LLM</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService&lt;br/&gt;L918
    participant SVC as AIService&lt;br/&gt;(Provider)
    participant NET as HTTP/WebSocket

    EAS->>EAS: 创建 MessageExecutionContext (L769)
    Note over EAS: streamBuffer + roundManager&lt;br/&gt;+ eventChannel

    EAS->>EAS: getAvailableToolsForFunction()
    EAS->>EAS: getModelParametersForFunction()

    EAS->>SVC: sendMessage(chatHistory, modelParams, tools) (L918)

    SVC->>NET: HTTP POST / WebSocket
    Note over NET: Provider-specific 格式&lt;br/&gt;OpenAI: POST /v1/chat/completions&lt;br/&gt;Claude: POST /v1/messages&lt;br/&gt;Gemini: POST /v1beta/streamGenerateContent&lt;br/&gt;Ollama: POST /api/chat&lt;br/&gt;本地: MNN/llama.cpp direct

    loop 流式接收
        NET-->>SVC: chunk
        SVC-->>EAS: Flow&lt;String&gt; emit(chunk)
    end
  </div>

  <!-- 阶段 8 -->
  <div class="section-head purple" style="margin-top:28px;">阶段 8: 流式渲染 — SAVEPOINT/ROLLBACK 机制</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService&lt;br/&gt;L945
    participant SC as StreamCollector&lt;br/&gt;(双协程)
    participant SH as SharedStream&lt;br/&gt;(replay=MAX)
    participant UI as rememberRevisable&lt;br/&gt;TextStream (L21-77)
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
            Note over CMP: 回退到 SAVEPOINT 快照&lt;br/&gt;继续追加新内容
        end
    and 主收集 (UI 侧)
        loop 逐 chunk
            UI->>CMP: activeDisplayStream.emit(chunk)
            CMP->>CMP: 逐字渲染（打字机效果）
        end
    end
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;">
    <strong>SAVEPOINT/ROLLBACK 用途：</strong>某些 LLM Provider（如 Gemini 思考模式）在流式输出中可能修正已发出内容。ROLLBACK 让 UI 回退到快照点再续写，避免闪烁。
  </p>
  <p style="font-size:13px;color:var(--text-dim);margin:4px 0 4px 4px;"><strong>关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node"><code>util/stream/RevisableTextStream.kt:10</code> — 事件定义</div>
    <div class="tree-node"><code>util/stream/TextStreamRevisionTracker.kt</code> — 快照管理</div>
    <div class="tree-node"><code>ui/features/chat/components/RevisableTextStreamRemember.kt:21-77</code> — UI 侧流处理</div>
  </div>

  <!-- 阶段 9 -->
  <div class="section-head red" style="margin-top:28px;">阶段 9: ReAct 循环 — 工具调用</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 8px 4px;">ReAct 循环总流程图</p>
  <div class="mermaid">
flowchart TD
    COMPLETE["processStreamCompletion()&lt;br/&gt;EnhancedAIService.kt:1491"] --> DETECT["enhanceToolDetection()&lt;br/&gt;detectAndRepairTruncatedToolRound()&lt;br/&gt;L1589"]
    DETECT --> EXTRACT["ToolExecutionManager&lt;br/&gt;.extractToolInvocations(finalContent)&lt;br/&gt;L1610"]
    EXTRACT --> HAS_TOOL{发现工具调用?}

    HAS_TOOL -->|否| END_TASK["handleTaskCompletion()&lt;br/&gt;或 handleWaitForUserNeed()&lt;br/&gt;→ 结束循环"]

    HAS_TOOL -->|是| INVOKE["handleToolInvocation()&lt;br/&gt;L1868"]
    INVOKE --> FILTER["角色卡权限过滤&lt;br/&gt;ToolExecutionManager L362"]
    FILTER --> PERM["checkToolPermission()&lt;br/&gt;L278"]
    PERM --> PERM_CHK{权限检查}

    PERM_CHK -->|FORBID| SKIP["跳过该工具"]
    PERM_CHK -->|ASK| ASK_USER["运行时弹窗询问用户"]
    PERM_CHK -->|ALLOW| EXEC

    ASK_USER -->|允许| EXEC["executeToolSafely()&lt;br/&gt;L238"]
    ASK_USER -->|拒绝| SKIP

    EXEC --> GROUP{工具类型?}
    GROUP -->|只读工具| PARALLEL["并行执行&lt;br/&gt;list_files/read_file/&lt;br/&gt;visit_web 等"]
    GROUP -->|写入工具| SERIAL["串行执行&lt;br/&gt;L444"]

    PARALLEL --> RESULT["工具执行结果"]
    SERIAL --> RESULT

    RESULT --> PROCESS["processToolResults()&lt;br/&gt;L1971"]
    PROCESS --> INJECT["结果加入 conversationHistory&lt;br/&gt;L2025"]
    INJECT --> TOKEN_CHK{Token 超限?}

    TOKEN_CHK -->|是| LIMIT["onTokenLimitExceeded()&lt;br/&gt;L2091"]
    TOKEN_CHK -->|否| RESEND["再次 sendMessage()&lt;br/&gt;L2112"]

    RESEND --> COMPLETE
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:16px 0 8px 4px;"><strong>工具执行管线详细步骤：</strong></p>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant EAS as EnhancedAIService
    participant TEM as ToolExecutionManager&lt;br/&gt;L156
    participant TPS as ToolPermissionSystem
    participant TOOL as 工具执行器

    EAS->>TEM: extractToolInvocations(content) (L1610)
    Note over TEM: 解析 &lt;tool_call name="..."&gt; XML&lt;br/&gt;StreamXmlPlugin 分流

    TEM-->>EAS: List&lt;ToolInvocation&gt;

    EAS->>TEM: executeInvocations(invocations) (L331)

    loop 每个 ToolInvocation
        TEM->>TEM: 角色卡 deny_tool 过滤 (L362)

        TEM->>TPS: checkToolPermission(toolName) (L278)
        TPS-->>TEM: ALLOW / ASK / FORBID

        alt ALLOW
            TEM->>TOOL: executeToolSafely() (L238)
            Note over TOOL: 参数验证&lt;br/&gt;→ executor.invokeAndStream()&lt;br/&gt;→ 实时 emit 结果
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
  </div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><strong>关键文件：</strong></p>
  <div class="tree" style="margin:4px 0 8px 4px;">
    <div class="tree-node"><code>api/chat/EnhancedAIService.kt:1491-2112</code> — ReAct 循环</div>
    <div class="tree-node"><code>api/chat/enhance/ToolExecutionManager.kt:156-444</code> — 工具执行管线</div>
  </div>

  <!-- 阶段 10 -->
  <div class="section-head cyan" style="margin-top:28px;">阶段 10: 消息持久化 — 实时快照 + 最终写入</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MP as MessageProcessing&lt;br/&gt;Delegate L870
    participant HD as ChatHistoryDelegate
    participant DB as Room

    loop 每 1000ms (STREAM_PERSIST_INTERVAL_MS)
        MP->>MP: persistStreamingSnapshot(contentSnapshot) (L870-882)
        Note over MP: 将当前流内容快照&lt;br/&gt;作为 AI 消息写入

        MP->>HD: addMessageToChat(chatId, aiMessage.copy(content=snapshot))
        HD->>DB: insertMessage (REPLACE)
        Note over DB: 同一条消息反复 REPLACE&lt;br/&gt;保证崩溃后可恢复
    end

    Note over MP: 流结束信号

    MP->>MP: finalizeMessageAndNotify() (L1145)

    MP->>HD: addMessageToChat(chatId, finalMessage)
    Note over HD: contentStream = null&lt;br/&gt;最终版本覆盖所有快照

    HD->>DB: insertMessage (REPLACE)
    Note over DB: 最终持久化完成
  </div>
  <p style="font-size:12px;color:var(--text-dimmer);margin:8px 0 0 4px;"><strong>关键文件：</strong> <code>services/core/MessageProcessingDelegate.kt:870-882, 1145</code></p>

  <!-- 阶段 11 -->
  <div class="section-head blue" style="margin-top:28px;">阶段 11: 收尾</div>
  <div class="mermaid">
sequenceDiagram
    autonumber
    participant MP as MessageProcessing&lt;br/&gt;Delegate
    participant MC as MessageCoordination&lt;br/&gt;Delegate
    participant WAIFU as WaifuMessageProcessor

    MP->>MP: 更新 Token 统计
    Note over MP: inputTokens + outputTokens&lt;br/&gt;+ cachedTokens 计入统计

    MP->>MP: 卸载 workspace hook
    Note over MP: 清理本轮对话的工作区绑定

    alt Waifu 模式开启
        MP->>WAIFU: 逐句拆分 AI 回复
        Note over WAIFU: 按句号/感叹号/问号拆分&lt;br/&gt;每句间加 charDelay 延迟&lt;br/&gt;移除标点（如配置）
    end

    MP->>MP: inputProcessingState → Idle
    Note over MP: 解除发送锁定&lt;br/&gt;UI 发送按钮恢复可用

    MC->>MC: 检查是否需要后续总结
    Note over MC: shouldGenerateSummary() 再次检查&lt;br/&gt;如 Token 超限 → 异步总结

    Note over MP: ═══ 一次对话完成 ═══
  </div>

  <!-- 错误处理 -->
  <div class="section-head orange" style="margin-top:28px;">错误处理</div>
  <div class="mermaid">
flowchart TD
    ERR["异常发生"] --> TYPE{异常类型}

    TYPE -->|网络错误| NET["ConnectionException&lt;br/&gt;→ 显示网络错误 Toast&lt;br/&gt;→ 消息标记 ERROR 状态&lt;br/&gt;→ 解除发送锁定"]

    TYPE -->|API 错误| API["APIException&lt;br/&gt;→ 解析错误码&lt;br/&gt;→ 显示错误消息&lt;br/&gt;→ 保留部分流式内容"]

    TYPE -->|工具执行错误| TOOL["ToolExecutionException&lt;br/&gt;→ 错误注入 conversationHistory&lt;br/&gt;→ AI 看到错误并自行处理&lt;br/&gt;→ ReAct 循环继续"]

    TYPE -->|Token 超限| TOKEN["TokenLimitException&lt;br/&gt;→ summarizeHistory()&lt;br/&gt;→ autoContinue=true&lt;br/&gt;→ 自动续写"]

    TYPE -->|取消| CANCEL["CancellationException&lt;br/&gt;→ 保留已收到的内容&lt;br/&gt;→ 持久化部分消息&lt;br/&gt;→ 解除锁定"]

    TYPE -->|未知错误| UNKNOWN["→ GlobalExceptionHandler&lt;br/&gt;→ 崩溃报告 + 恢复"]
  </div>

  <!-- 完整生命周期流程图 -->
  <div class="section-head green" style="margin-top:28px;">完整生命周期流程图（ASCII）</div>
  <div class="kn-code">用户点击发送
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
└── [完成] 对话完成</div>

  <!-- 核心文件清单 -->
  <div class="section-head purple" style="margin-top:28px;">核心文件清单</div>
  <table class="act-table">
    <tr><th>文件</th><th>路径</th><th>行数</th><th>职责</th></tr>
    <tr><td><strong>ChatViewModel</strong></td><td><code>ui/features/chat/viewmodel/ChatViewModel.kt</code></td><td>~1300</td><td>薄壳委托层</td></tr>
    <tr><td><strong>ChatHistoryDelegate</strong></td><td><code>services/core/ChatHistoryDelegate.kt</code></td><td>~200</td><td>消息 CRUD + 并发控制</td></tr>
    <tr><td><strong>MessageCoordinationDelegate</strong></td><td><code>services/core/MessageCoordinationDelegate.kt</code></td><td>~1500</td><td>发送协调 + 群组编排 + 总结</td></tr>
    <tr><td><strong>MessageProcessingDelegate</strong></td><td><code>services/core/MessageProcessingDelegate.kt</code></td><td>~1200</td><td>消息发送 + 流收集 + 持久化</td></tr>
    <tr><td><strong>AIMessageManager</strong></td><td><code>core/chat/AIMessageManager.kt</code></td><td>~500</td><td>Prompt 构建 (无状态单例)</td></tr>
    <tr><td><strong>EnhancedAIService</strong></td><td><code>api/chat/EnhancedAIService.kt</code></td><td>~2200</td><td>Provider 路由 + System Prompt + ReAct</td></tr>
    <tr><td><strong>ToolExecutionManager</strong></td><td><code>api/chat/enhance/ToolExecutionManager.kt</code></td><td>~500</td><td>工具解析 + 权限 + 执行</td></tr>
    <tr><td><strong>ChatHistoryManager</strong></td><td><code>data/repository/ChatHistoryManager.kt</code></td><td>~500</td><td>Room 持久化层</td></tr>
    <tr><td><strong>MessageDao</strong></td><td><code>data/dao/MessageDao.kt</code></td><td>~70</td><td>Room DAO</td></tr>
    <tr><td><strong>RevisableTextStreamRemember</strong></td><td><code>ui/features/chat/components/RevisableTextStreamRemember.kt</code></td><td>~80</td><td>UI 侧流式渲染</td></tr>
    <tr><td><strong>TextStreamRevisionTracker</strong></td><td><code>util/stream/TextStreamRevisionTracker.kt</code></td><td>~60</td><td>SAVEPOINT/ROLLBACK 快照</td></tr>
  </table>
`);
