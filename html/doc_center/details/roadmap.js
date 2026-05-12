registerTabContent('roadmap', `
  <!-- Hero Intro -->
  <p style="font-size:14px;color:var(--text-dim);margin:0 0 20px 4px;padding:12px 16px;background:var(--bg-card);border-left:3px solid var(--green);border-radius:4px;line-height:1.7;">
    适用对象：从零开始接触本项目的开发者。按 Level 递进，每个 Level 有明确的学习目标、阅读材料、动手验证和检查点。
  </p>

  <!-- 路线全景 -->
  <div class="section-head green">路线全景</div>
  <div class="mermaid">
graph TD
    L0["Level 0: 全局认知<br/>（30 分钟）<br/>知道这个项目是什么、代码在哪"]
    L1["Level 1: 跑起来<br/>（1~2 小时）<br/>编译运行、操作一遍主要功能"]
    L2["Level 2: 启动链路<br/>（2 小时）<br/>App 从冷启动到主界面的完整过程"]
    L3["Level 3: 核心业务<br/>（3~4 小时）<br/>一次对话的完整生命周期"]
    L4["Level 4: UI 层<br/>（2~3 小时）<br/>页面导航、组件结构、主题系统"]
    L5["Level 5: 工具系统<br/>（3~4 小时）<br/>AI 如何调用设备能力"]
    L6["Level 6: 数据层<br/>（2 小时）<br/>数据模型、持久化、偏好设置"]
    L7["Level 7: 进阶模块<br/>（按需）<br/>插件/MCP/语音/工作流/桌宠"]

    L0 --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
    L3 --> L6
    L4 --> L7
    L5 --> L7
    L6 --> L7

    style L0 fill:#e8f5e9,color:#000
    style L1 fill:#e8f5e9,color:#000
    style L2 fill:#e3f2fd,color:#000
    style L3 fill:#fff3e0,color:#000
    style L4 fill:#f3e5f5,color:#000
    style L5 fill:#fce4ec,color:#000
    style L6 fill:#e0f2f1,color:#000
    style L7 fill:#f5f5f5,color:#000
  </div>

  <!-- 路径说明 -->
  <div style="margin:12px 0 24px 0;padding:10px 16px;background:var(--bg-card);border-left:3px solid var(--blue);border-radius:4px;font-size:13px;color:var(--text-dim);line-height:1.6;">
    Level 0-3 是<strong style="color:var(--text);">必修路径</strong>（从上到下串行）。Level 4/5/6 是<strong style="color:var(--text);">并行选修</strong>（根据你要改哪部分代码决定先学哪个）。Level 7 按需深入。
  </div>

  <!-- ===== Level 0 ===== -->
  <div class="section-head green" style="margin-top:28px;">Level 0: 全局认知（30 分钟）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>知道 Operit 是什么、解决什么问题；了解代码目录结构和分层架构；建立"包名 → 职责"的心理映射。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>00_全景梳理.md</code> §一~§三</td><td>项目定位、目录总览、6 层架构</td></tr>
    <tr><td>2</td><td><code>00_全景梳理.md</code> §五</td><td>核心数据流（一次 AI 对话链路概览）</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>动手验证：</strong>打开项目根目录，对照文档看一遍 <code>app/src/main/java/com/ai/assistance/operit/</code> 下的包结构：</p>
  <div class="kn-code">api/     → AI 接入层（66 文件）
core/    → 核心业务（201 文件，最重要）
data/    → 数据层（122 文件）
ui/      → 界面层（439 文件，最大）
services/ → 后台服务（21 文件）</div>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能说出 <code>api/</code>、<code>core/</code>、<code>data/</code>、<code>ui/</code>、<code>services/</code> 各自的职责</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 AI 对话的数据流方向：用户输入 → InputProcessor → ConversationService → AIService → ToolExecution → StreamRenderer → Compose UI</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道项目支持 18+ AI 提供商 + 本地推理（MNN/llama.cpp）</div>

  <!-- ===== Level 1 ===== -->
  <div class="section-head green" style="margin-top:32px;">Level 1: 跑起来（1~2 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>成功编译并运行 App；动手操作一遍核心功能，建立感性认识；了解 Gradle 多模块结构。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>步骤：</strong></p>

  <p style="font-size:13px;color:var(--text-dim);margin:6px 0 4px 4px;">① <strong>环境准备</strong></p>
  <div class="tree" style="margin:4px 0 10px 4px;">
    <div class="tree-node">Android Studio Hedgehog+ / IntelliJ + Android Plugin</div>
    <div class="tree-node">JDK 17+</div>
    <div class="tree-node">NDK（项目用到 llama/mnn/quickjs 原生库）</div>
    <div class="tree-node">连接实机或启动 Android 模拟器（API 26+）</div>
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:6px 0 4px 4px;">② <strong>编译运行</strong></p>
  <div class="kn-code"># 项目根目录
./gradlew assembleDebug
# 或在 Android Studio 中直接 Run</div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 6px 4px;">③ <strong>核心功能体验清单</strong>（按顺序操作）</p>
  <table class="act-table">
    <tr><th>步骤</th><th>功能</th><th>要观察什么</th></tr>
    <tr><td>①</td><td>首次启动</td><td>协议页 → 权限引导（6 页）→ 插件加载 → 主界面</td></tr>
    <tr><td>②</td><td>发一条消息</td><td>打字机效果、流式渲染、消息气泡</td></tr>
    <tr><td>③</td><td>让 AI 调用工具</td><td>对 AI 说"帮我列出 /sdcard 下的文件"，观察工具调用卡片</td></tr>
    <tr><td>④</td><td>打开设置页</td><td>看看有多少子页面（22 个），感受配置复杂度</td></tr>
    <tr><td>⑤</td><td>切换 AI 模型</td><td>Settings → Model Config，配一个 API Key</td></tr>
    <tr><td>⑥</td><td>打开工具箱</td><td>Toolbox 页面，看有哪些内置工具</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ App 能在设备上运行</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 成功发送一条消息并收到 AI 回复</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 看到 AI 调用工具的完整过程（请求 → 执行 → 返回结果 → AI 继续）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道项目有哪些 Gradle 子模块（llama/mnn/quickjs/terminal/dragonbones/mmd/fbx/showerclient）</div>

  <!-- ===== Level 2 ===== -->
  <div class="section-head blue" style="margin-top:32px;">Level 2: 启动链路（2 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>理解 App 从进程创建到用户可交互的完整链路；知道 Application.onCreate 做了什么、为什么要做；理解 4 道启动门控的作用和顺序。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>37_Runtime.冷启动全链路.md</code> Phase 0-1</td><td>Application.onCreate 34 步初始化</td></tr>
    <tr><td>2</td><td><code>37_Runtime.冷启动全链路.md</code> Phase 2-3</td><td>MainActivity + 4 道门控</td></tr>
    <tr><td>3</td><td><code>02_屏幕装配流程图.md</code></td><td>Activity → OperitApp → Layout → Screen 的 5 层装配</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>源码对照（按顺序读）：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文件</th><th>看什么</th></tr>
    <tr><td>1</td><td><code>core/application/OperitApplication.kt</code> L116-369</td><td><code>onCreate</code> 34 步，特别关注 3 次 <code>runBlocking</code></td></tr>
    <tr><td>2</td><td><code>ui/main/MainActivity.kt</code> L256-302</td><td><code>onCreate</code> 流程</td></tr>
    <tr><td>3</td><td><code>ui/main/MainActivity.kt</code> L428-461</td><td><code>performInitialChecks</code> 门控序列</td></tr>
    <tr><td>4</td><td><code>ui/main/MainActivity.kt</code> L690+</td><td><code>setAppContent</code> 渲染决策树</td></tr>
    <tr><td>5</td><td><code>ui/main/OperitApp.kt</code> L56-62</td><td>根 Composable 入口</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>动手验证：</strong>在 <code>OperitApplication.onCreate</code> 的第 118 行加一个日志断点：</p>
  <div class="kn-code">Log.d("ColdStart", "Step 1: instance = this")</div>
  <p style="font-size:13px;color:var(--text-dim);margin:6px 0 12px 4px;">然后在几个关键步骤（步骤 12 前台服务判断、步骤 15 语言设置）加断点，运行后观察执行顺序。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能画出 <code>attachBaseContext → onCreate → MainActivity → performInitialChecks → setAppContent</code> 的流程</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 3 次 <code>runBlocking</code> 分别读什么、为什么不能异步</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能说出 4 道门控的检查顺序：协议 → 迁移 → 权限 → 插件加载</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 <code>AIForegroundService</code> 在什么条件下会在 Application 阶段启动（alwaysListening || externalHttp）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道插件加载覆盖层的 zIndex 是 10（浮在所有门控之上）</div>

  <!-- ===== Level 3 ===== -->
  <div class="section-head orange" style="margin-top:32px;">Level 3: 核心业务 — 一次对话的完整生命周期（3~4 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>理解从用户点击发送到 AI 回复渲染完毕的 11 个阶段；掌握 ChatViewModel 的委托架构；理解 ReAct 工具循环的工作原理；理解流式渲染和 SAVEPOINT/ROLLBACK 机制。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>01_请求调用链时序图.md</code></td><td>先看高层 9 参与者时序图（鸟瞰）</td></tr>
    <tr><td>2</td><td><code>38_Runtime.一次对话完整生命周期.md</code> 阶段 1-4</td><td>入口 → 协调 → Prompt 构建 → 用户消息持久化</td></tr>
    <tr><td>3</td><td><code>38_Runtime.一次对话完整生命周期.md</code> 阶段 5-8</td><td>Provider 路由 → System Prompt → 流式请求 → 渲染</td></tr>
    <tr><td>4</td><td><code>38_Runtime.一次对话完整生命周期.md</code> 阶段 9-11</td><td>ReAct 循环 → 持久化 → 收尾</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>源码对照（按数据流方向读）：</strong></p>
  <div class="mermaid">
graph LR
    A["ChatViewModel<br/>L1208"] --> B["MessageCoordination<br/>Delegate L244"]
    B --> C["MessageProcessing<br/>Delegate L388"]
    C --> D["AIMessageManager<br/>L117"]
    D --> E["EnhancedAIService<br/>L918"]
    E --> F["ToolExecutionManager<br/>L156"]
    F --> G["回到 E<br/>(ReAct 循环)"]
  </div>

  <table class="act-table" style="margin-top:10px;">
    <tr><th>顺序</th><th>文件</th><th>关注方法</th></tr>
    <tr><td>1</td><td><code>ui/features/chat/viewmodel/ChatViewModel.kt</code> L1208</td><td><code>sendUserMessage</code> — 薄壳转发</td></tr>
    <tr><td>2</td><td><code>services/core/MessageCoordinationDelegate.kt</code> L244</td><td><code>sendUserMessage</code> → <code>sendMessageInternal</code></td></tr>
    <tr><td>3</td><td><code>services/core/MessageCoordinationDelegate.kt</code> L340</td><td>群组编排判断</td></tr>
    <tr><td>4</td><td><code>services/core/MessageProcessingDelegate.kt</code> L388</td><td><code>sendUserMessage</code> — 实际发送</td></tr>
    <tr><td>5</td><td><code>core/chat/AIMessageManager.kt</code> L117</td><td><code>buildUserMessageContent</code> — Prompt 拼接</td></tr>
    <tr><td>6</td><td><code>core/chat/AIMessageManager.kt</code> L301</td><td><code>sendMessage</code> — 插件检查 + 发送</td></tr>
    <tr><td>7</td><td><code>api/chat/EnhancedAIService.kt</code> L795</td><td><code>prepareConversationHistory</code> — System Prompt</td></tr>
    <tr><td>8</td><td><code>api/chat/EnhancedAIService.kt</code> L918</td><td><code>sendMessage</code> — 流式请求</td></tr>
    <tr><td>9</td><td><code>api/chat/EnhancedAIService.kt</code> L1491</td><td><code>processStreamCompletion</code> — ReAct 入口</td></tr>
    <tr><td>10</td><td><code>api/chat/enhance/ToolExecutionManager.kt</code> L156</td><td><code>extractToolInvocations</code> — 工具解析</td></tr>
    <tr><td>11</td><td><code>api/chat/enhance/ToolExecutionManager.kt</code> L331</td><td><code>executeInvocations</code> — 执行</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能说出 ChatViewModel 的 7 个委托分别是什么</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 Prompt 构建的 6 个组成部分（InputProcessor、proxySenderTag、replyTag、workspaceTag、attachmentTags、最终拼接）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 System Prompt 注入了什么（工具 Schema + 角色设定 + 记忆 + 工作区 + 思考引导）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能解释 ReAct 循环：<code>processStreamCompletion → extractToolInvocations → executeInvocations → processToolResults → 再次 sendMessage</code></div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道工具执行的并行/串行分组策略（只读工具并行，写入工具串行）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道流式消息每 1000ms 持久化一次快照，最终 <code>finalizeMessageAndNotify</code> 覆盖</div>

  <!-- ===== Level 4 ===== -->
  <div class="section-head purple" style="margin-top:32px;">Level 4: UI 层（2~3 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>理解单 Activity + 多 Screen 的导航架构；了解主要页面的组件结构；知道主题系统的工作方式。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>02_屏幕装配流程图.md</code></td><td>5 层装配：Activity → OperitApp → Layout → AppContent → Screen</td></tr>
    <tr><td>2</td><td><code>03_Screen.AiChat页面结构.md</code></td><td>最核心页面的组件树</td></tr>
    <tr><td>3</td><td><code>10_Screen.Settings页面结构.md</code></td><td>22 个子页面的路由方式</td></tr>
    <tr><td>4</td><td><code>29_Settings.ThemeSettings页面结构.md</code></td><td>主题系统（如果你要改 UI 样式）</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>自定义导航栈（非 Jetpack Navigation）：</strong></p>
  <div class="kn-code">Screen (sealed class)
├── AiChat, Settings, Packages, Toolbox...（一级页面）
└── TokenConfig, ModelConfig, ThemeSettings...（二级页面，isSecondaryScreen=true）

导航：backStack: SnapshotStateList&lt;Screen&gt;
navigateTo(screen) → 压栈
goBack() → 弹栈，兜底到 AiChat</div>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>手机/平板布局分叉：</strong></p>
  <div class="kn-code">screenWidthDp >= 600 → TabletLayout（永久侧边栏）
screenWidthDp &lt;  600 → PhoneLayout（手势抽屉）</div>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>源码对照：</strong></p>
  <table class="act-table">
    <tr><th>文件</th><th>看什么</th></tr>
    <tr><td><code>ui/main/screens/OperitScreens.kt</code></td><td>所有 Screen 子类定义</td></tr>
    <tr><td><code>ui/main/OperitApp.kt</code></td><td>导航状态 + 布局选择</td></tr>
    <tr><td><code>ui/main/layout/PhoneLayout.kt</code></td><td>手机布局</td></tr>
    <tr><td><code>ui/main/layout/TabletLayout.kt</code></td><td>平板布局</td></tr>
    <tr><td><code>ui/main/components/AppContent.kt</code></td><td>Scaffold + TopAppBar + 屏幕渲染</td></tr>
    <tr><td><code>ui/features/chat/</code></td><td>聊天界面（154 文件，最复杂的 feature）</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道导航用的是自定义 backStack 而非 Jetpack Navigation</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能说出手机和平板布局的分叉条件</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道一级页面和二级页面的区别（<code>isSecondaryScreen</code>）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 TopAppBar 的 actions 是由子页面通过 <code>LocalTopBarActions</code> 注入的</div>

  <!-- ===== Level 5 ===== -->
  <div class="section-head red" style="margin-top:32px;">Level 5: 工具系统（3~4 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>理解工具从注册到执行的完整链路；了解权限分级架构；知道如何新增一个工具。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>00_全景梳理.md</code> §三 层 2（工具系统）</td><td>工具架构概览</td></tr>
    <tr><td>2</td><td><code>38_Runtime.一次对话完整生命周期.md</code> 阶段 9</td><td>ReAct 循环中的工具执行细节</td></tr>
    <tr><td>3</td><td><code>00_全景梳理.md</code> §四</td><td>脚本包系统（QuickJS 工具包）</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>核心架构：</strong></p>
  <div class="mermaid">
graph TD
    LLM["LLM 输出<br/>&lt;tool_call name='shell_command'&gt;"]
    PARSE["ToolExecutionManager<br/>.extractToolInvocations()"]
    PERM["ToolPermissionSystem<br/>.checkToolPermission()"]
    REG["ToolRegistration<br/>名称 → 执行器映射"]
    GETTER["ToolGetter<br/>按权限级别选择实现"]

    LLM --> PARSE
    PARSE --> PERM
    PERM --> REG
    REG --> GETTER

    GETTER --> STD["standard/<br/>沙盒内执行"]
    GETTER --> ADM["admin/<br/>Shizuku ADB 级"]
    GETTER --> A11Y["accessibility/<br/>无障碍服务"]
    GETTER --> ROOT["root/<br/>Root 权限"]
    GETTER --> DBG["debugger/<br/>ADB 调试"]
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 6px 4px;"><strong>源码对照：</strong></p>
  <table class="act-table">
    <tr><th>文件</th><th>看什么</th></tr>
    <tr><td><code>core/config/SystemToolPrompts.kt</code></td><td>工具 Schema（给 LLM 看的"说明书"）</td></tr>
    <tr><td><code>core/tools/defaultTool/ToolRegistration.kt</code></td><td>工具名 → 执行器的映射表</td></tr>
    <tr><td><code>core/tools/defaultTool/ToolGetter.kt</code></td><td>按权限级别选择实现</td></tr>
    <tr><td><code>core/tools/defaultTool/standard/</code></td><td>标准权限工具实现</td></tr>
    <tr><td><code>core/tools/javascript/JsEngine.kt</code></td><td>QuickJS 引擎封装</td></tr>
    <tr><td><code>core/tools/mcp/MCPToolExecutor.kt</code></td><td>MCP 协议工具执行</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 能说出工具执行的 5 步：LLM 输出 → XML 解析 → 权限检查 → 路由 → 执行</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 5 个权限级别（standard/admin/accessibility/debugger/root）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道新增工具需要同步 5 处（Schema/注册表/Kotlin 实现/JS Wrapper/TS 类型）</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 了解 MCP 工具和内置工具的区别</div>

  <!-- ===== Level 6 ===== -->
  <div class="section-head cyan" style="margin-top:32px;">Level 6: 数据层（2 小时）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:0 0 10px 4px;"><strong>学习目标：</strong>了解数据模型和持久化方式；理解 DataStore 偏好设置的使用模式；知道 Room 和 ObjectBox 各管什么。</p>

  <p style="font-size:13px;color:var(--text-dim);margin:0 0 6px 4px;"><strong>阅读材料：</strong></p>
  <table class="act-table">
    <tr><th>顺序</th><th>文档</th><th>重点关注</th></tr>
    <tr><td>1</td><td><code>00_全景梳理.md</code> §三 层 3（数据层）</td><td>数据层总览</td></tr>
    <tr><td>2</td><td>任意 Settings 文档的"状态管理"段</td><td>DataStore 偏好设置模式</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 6px 4px;"><strong>核心数据模型：</strong></p>
  <div class="mermaid">
graph LR
    subgraph Room SQLite
        MSG["MessageEntity<br/>聊天消息"]
        CHAT["ChatHistory<br/>对话会话"]
        PROB["Problem<br/>问题库"]
    end

    subgraph ObjectBox NoSQL
        MEM["Memory<br/>记忆条目"]
    end

    subgraph DataStore Preferences
        PREF["28 个偏好文件<br/>各类配置项"]
    end

    subgraph Kotlinx Serialization
        CARD["CharacterCard<br/>角色卡"]
        PROFILE["PreferenceProfile<br/>用户偏好档案"]
        CONFIG["ModelConfigData<br/>模型配置"]
    end
  </div>

  <p style="font-size:13px;color:var(--text-dim);margin:10px 0 6px 4px;"><strong>源码对照：</strong></p>
  <table class="act-table">
    <tr><th>文件</th><th>看什么</th></tr>
    <tr><td><code>data/model/ChatMessage.kt</code></td><td>消息模型</td></tr>
    <tr><td><code>data/model/CharacterCard.kt</code></td><td>角色卡模型</td></tr>
    <tr><td><code>data/dao/MessageDao.kt</code></td><td>Room DAO</td></tr>
    <tr><td><code>data/db/AppDatabase.kt</code></td><td>Room Database 定义</td></tr>
    <tr><td><code>data/preferences/</code> 目录</td><td>28 个偏好设置文件</td></tr>
    <tr><td><code>data/repository/ChatHistoryManager.kt</code></td><td>消息持久化核心</td></tr>
  </table>

  <p style="font-size:13px;color:var(--text-dim);margin:12px 0 4px 4px;"><strong>检查点：</strong></p>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 Room 管聊天消息，ObjectBox 管记忆</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道 DataStore 有 28 个偏好文件，多数 Settings 页面直接操作 DataStore 而不经过 ViewModel</div>
  <div style="margin:4px 0;padding:4px 0 4px 8px;border-left:2px solid var(--border);font-size:13px;color:var(--text-dim);">☐ 知道角色卡用 Kotlinx Serialization JSON 存储在 DataStore 中</div>

  <!-- ===== Level 7 ===== -->
  <div class="section-head" style="margin-top:32px;background:var(--bg-card);border-left:3px solid var(--border);padding:8px 14px;font-size:14px;font-weight:600;color:var(--text-dim);">Level 7: 进阶模块（按需深入）</div>
  <p style="font-size:13px;color:var(--text-dim);margin:8px 0 12px 4px;">根据你的开发任务选择性深入：</p>

  <!-- 7A -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7A: 插件与 MCP 生态</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>15_Screen.MCPMarket_MCPPluginDetail.md</code></td><td>MCP 市场 UI</td></tr>
    <tr><td><code>18_Screen.MCPManage_MCPPublish_MCPConfig.md</code></td><td>MCP 管理/发布/配置</td></tr>
    <tr><td><code>06_Screen.Packages.md</code></td><td>工具包管理</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>plugins/</code>、<code>core/tools/mcp/</code>、<code>data/mcp/</code></p>

  <!-- 7B -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7B: 语音交互</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>31_Settings.SpeechServicesSettings.md</code></td><td>6 TTS + 3 STT 提供商配置</td></tr>
    <tr><td><code>22_Screen.SpeechToText_TextToSpeech.md</code></td><td>语音页面</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>api/speech/</code>、<code>api/voice/</code></p>

  <!-- 7C -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7C: 角色系统</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>32_Settings.ModelPrompts_TagMarket.md</code></td><td>角色卡/标签/角色组管理</td></tr>
    <tr><td><code>33_Settings.PersonaCard_WaifuMode_CustomEmoji.md</code></td><td>AI 生成角色卡 + Waifu 模式</td></tr>
    <tr><td><code>27_Settings.UserPreferences_Guide.md</code></td><td>用户偏好档案</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>data/model/CharacterCard.kt</code>、角色卡相关 Manager</p>

  <!-- 7D -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7D: 工作流与自动化</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>08_Screen.Workflow.md</code></td><td>工作流编辑/管理</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>core/workflow/</code>、<code>integrations/tasker/</code></p>

  <!-- 7E -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7E: 记忆系统</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>05_Screen.MemoryBase.md</code></td><td>记忆管理 UI</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>data/model/Memory.kt</code>、ObjectBox 相关</p>

  <!-- 7F -->
  <p style="font-size:13px;font-weight:600;color:var(--text);margin:12px 0 4px 4px;">7F: UI 高级定制</p>
  <table class="act-table">
    <tr><th>文档</th><th>内容</th></tr>
    <tr><td><code>29_Settings.ThemeSettings.md</code></td><td>主题系统（2132+ 行，60 个偏好 Flow）</td></tr>
    <tr><td><code>28_Settings.Language_GlobalDisplay_Layout.md</code></td><td>布局设置</td></tr>
  </table>
  <p style="font-size:12px;color:var(--text-dimmer);margin:4px 0 12px 4px;"><strong>关键源码：</strong> <code>ui/theme/</code>、<code>ui/common/markdown/</code>（自研流式 Markdown 渲染引擎）</p>

  <!-- ===== 学习节奏建议 ===== -->
  <div class="section-head blue" style="margin-top:32px;">学习节奏建议</div>
  <div class="mermaid">
gantt
    title 建议学习时间线
    dateFormat X
    axisFormat %s小时

    section 必修路径
    Level 0 全局认知      :l0, 0, 0.5
    Level 1 跑起来        :l1, after l0, 2
    Level 2 启动链路      :l2, after l1, 2
    Level 3 核心业务      :l3, after l2, 4

    section 选修路径（并行）
    Level 4 UI 层         :l4, after l3, 3
    Level 5 工具系统      :l5, after l3, 4
    Level 6 数据层        :l6, after l3, 2

    section 进阶（按需）
    Level 7 进阶模块      :l7, after l4, 4
  </div>

  <div class="tree" style="margin:12px 0 8px 4px;">
    <div class="tree-node"><strong style="color:var(--text);">Day 1</strong>（~5 小时）：Level 0 + 1 + 2 — 从跑起来到理解启动过程</div>
    <div class="tree-node"><strong style="color:var(--text);">Day 2</strong>（~4 小时）：Level 3 — 核心业务，这是最重要的一天</div>
    <div class="tree-node"><strong style="color:var(--text);">Day 3+</strong>（按需）：Level 4-7 — 根据你的任务选择性深入</div>
  </div>

  <!-- ===== 全部文档索引 ===== -->
  <div class="section-head green" style="margin-top:32px;">全部文档索引</div>

  <p style="font-size:13px;font-weight:600;color:var(--text);margin:10px 0 4px 4px;">入门文档</p>
  <table class="act-table">
    <tr><th>编号</th><th>文档</th><th>内容</th></tr>
    <tr><td>00</td><td><code>00_全景梳理.md</code></td><td>项目总览（从 0 到 1 的入口）</td></tr>
    <tr><td>01</td><td><code>01_请求调用链时序图.md</code></td><td>一次请求的高层时序图</td></tr>
    <tr><td>02</td><td><code>02_屏幕装配流程图.md</code></td><td>Activity → Screen 的 5 层装配</td></tr>
  </table>

  <p style="font-size:13px;font-weight:600;color:var(--text);margin:14px 0 4px 4px;">运行时流程（A 系列）</p>
  <table class="act-table">
    <tr><th>编号</th><th>文档</th><th>内容</th></tr>
    <tr><td>37</td><td><code>37_Runtime.冷启动全链路.md</code></td><td>冷启动 34 步 + 4 道门控</td></tr>
    <tr><td>38</td><td><code>38_Runtime.一次对话完整生命周期.md</code></td><td>对话 11 阶段 + ReAct + 持久化</td></tr>
  </table>

  <p style="font-size:13px;font-weight:600;color:var(--text);margin:14px 0 4px 4px;">页面结构（03-26）</p>
  <table class="act-table">
    <tr><th>编号范围</th><th>内容</th></tr>
    <tr><td>03-09</td><td>核心页面：AiChat、AssistantConfig、MemoryBase、Packages、Toolbox、Workflow、ShizukuCommands</td></tr>
    <tr><td>10-13</td><td>系统页面：Settings、Help/About/UpdateHistory、FileManager、Terminal</td></tr>
    <tr><td>14-19</td><td>功能页面：SkillMarket、MCPMarket、ShellExecutor、UIDebugger、MCPManage、FFmpegToolbox/Logcat</td></tr>
    <tr><td>20-26</td><td>辅助页面：AppPermissions、ProcessLimitRemover、ToolTester、SpeechToText、SqlViewer、AutoGlmOneClick、Agreement/TokenConfig/ToolPkgPluginConfig</td></tr>
  </table>

  <p style="font-size:13px;font-weight:600;color:var(--text);margin:14px 0 4px 4px;">Settings 子页面（27-36）</p>
  <table class="act-table">
    <tr><th>编号范围</th><th>内容</th></tr>
    <tr><td>27-29</td><td>个人化：UserPreferences、Language/GlobalDisplay/Layout、ThemeSettings</td></tr>
    <tr><td>30-32</td><td>AI 配置：ModelConfig/FunctionalConfig、SpeechServices、ModelPrompts/TagMarket</td></tr>
    <tr><td>33-34</td><td>角色扮演：PersonaCard/WaifuMode/CustomEmoji、ContextSummary/ToolPermission/ExternalHttpChat</td></tr>
    <tr><td>35-36</td><td>系统：ChatBackup/ChatHistory、TokenUsage/MnnModel/GitHubAccount</td></tr>
  </table>
`);
