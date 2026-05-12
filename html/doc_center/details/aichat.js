registerDetail('aichat', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">💬 Screen.AiChat 页面结构</h1>
      <p class="sub">AIChatScreen · 应用默认首页 · 最复杂的 Screen</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">4</div><div class="label">主视图模式</div></div>
      <div class="stat-card"><div class="num">7</div><div class="label">视图状态开关</div></div>
      <div class="stat-card"><div class="num">2</div><div class="label">聊天风格</div></div>
      <div class="stat-card"><div class="num">2</div><div class="label">输入风格</div></div>
      <div class="stat-card"><div class="num">12+</div><div class="label">对话框</div></div>
      <div class="stat-card"><div class="num">16</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">从 Activity 到 AIChatScreen</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">initialNavItem = AiChat</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">OperitApp</div><div class="step-cond">导航状态管理</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">AppContent</div><div class="step-cond">TopAppBar + Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">AIChatScreen</div><div class="step-cond">Screen.AiChat.Content()</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">TopBar Actions 注入</div>
          <div class="kn-body">AIChatScreen 通过 <code style="color:var(--cyan)">LocalTopBarActions</code> 向 AppContent 的 TopAppBar 注入两个按钮：</div>
          <div class="kn-code">🖥  Terminal 图标 → 切换 AI 电脑终端 (ComputerScreen)
💻 Code 图标    → 切换 Web 工作区 (WorkspaceScreen)

准备中时显示 CircularProgressIndicator 替代图标</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">核心入口文件</div>
          <div class="kn-code">Screen 定义
  ui/main/screens/OperitScreens.kt:124

Screen 实现
  ui/features/chat/screens/AIChatScreen.kt:107

NavItem 路由
  ui/common/NavItem.kt:27 → "ai_chat"</div>
        </div>
      </div>
    </div>

    <!-- ===== 顶层组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 顶层组件树 <span class="count">AIChatScreen 内部结构</span></div>

      <div class="mermaid">
graph TD
    ROOT["AIChatScreen&lt;br/&gt;(Box fillMaxSize)"]

    ROOT --> SCAFFOLD["CustomScaffold"]
    ROOT --> WSF["WorkspaceFileSelectorOverlay&lt;br/&gt;(工作区文件选择浮层)"]
    ROOT --> WS_LAYOUT["Layout (Web工作区浮层)&lt;br/&gt;showWebView ? fullSize : 0dp"]
    ROOT --> AI_COMP["Box (AI电脑浮层)&lt;br/&gt;条件渲染: showAiComputer"]
    ROOT --> WS_LOADING["AnimatedVisibility&lt;br/&gt;(工作区准备中遮罩)"]
    ROOT --> EXPORT_DIALOGS["导出对话框系列&lt;br/&gt;平台选择/Android/Windows/进度/完成"]
    ROOT --> TOAST["ChatToastHost&lt;br/&gt;(顶部Toast通知)"]
    ROOT --> POPUP["AlertDialog (popupMessage)"]
    ROOT --> MEMORY_DLG["MemoryFolderSelectionDialog&lt;br/&gt;(记忆文件夹选择)"]

    SCAFFOLD --> CONFIG_BRANCH{showConfig?}
    CONFIG_BRANCH -->|是| CONFIG["ConfigurationScreen&lt;br/&gt;(API配置界面)"]
    CONFIG_BRANCH -->|否| CHAT_ROOT["Box (聊天主界面)&lt;br/&gt;clipToBounds"]

    CHAT_ROOT --> VIEWPORT["Box (视口层)&lt;br/&gt;graphicsLayer translationY&lt;br/&gt;处理IME偏移"]
    CHAT_ROOT --> INPUT_BAR["Box (BottomCenter)&lt;br/&gt;ChatInputBottomBar"]
    CHAT_ROOT --> CHAR_SEL["CharacterSelectorPanel&lt;br/&gt;(角色选择面板)"]
    CHAT_ROOT --> HIST_MASK["AnimatedVisibility&lt;br/&gt;(历史选择器遮罩)"]
    CHAT_ROOT --> HIST_PANEL["AnimatedVisibility&lt;br/&gt;(ChatHistorySelectorPanel)&lt;br/&gt;slideInHorizontally 从左"]

    VIEWPORT --> CONTENT["ChatScreenContent"]
    VIEWPORT --> SETTINGS_BAR["ClassicChatSettingsBar&lt;br/&gt;(仅Classic输入样式)"]

    WS_LAYOUT --> WORKSPACE["WorkspaceScreen"]
    AI_COMP --> COMPUTER["ComputerScreen"]
      </div>

      <details style="margin-top:12px;">
        <summary style="font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;">📝 文本版组件树</summary>
        <div class="comp-tree" style="margin-top:8px;">
<span class="ct-root">AIChatScreen (Box fillMaxSize)</span>
<div class="ct-indent">
├─ <span class="ct-branch">CustomScaffold</span>
│   ├─ <span class="ct-cond">showConfig == true ?</span>
│   │   └─ <span class="ct-overlay">ConfigurationScreen</span> <span class="ct-dim">(API配置界面)</span>
│   └─ <span class="ct-cond">showConfig == false ?</span>
│       └─ <span class="ct-branch">Box (聊天主界面 · clipToBounds)</span>
│           ├─ <span class="ct-branch">Box (视口层 · translationY 处理 IME)</span>
│           │   ├─ <span class="ct-branch">ChatScreenContent</span> <span class="ct-dim">(Header + 消息列表)</span>
│           │   └─ <span class="ct-dim">ClassicChatSettingsBar (仅 Classic 输入样式)</span>
│           ├─ <span class="ct-branch">Box (BottomCenter) → ChatInputBottomBar</span>
│           ├─ <span class="ct-overlay">CharacterSelectorPanel</span> <span class="ct-dim">(角色选择面板)</span>
│           ├─ <span class="ct-overlay">AnimatedVisibility → 历史选择器遮罩</span>
│           └─ <span class="ct-overlay">AnimatedVisibility → ChatHistorySelectorPanel</span> <span class="ct-dim">(从左滑入)</span>
├─ <span class="ct-overlay">WorkspaceFileSelectorOverlay</span> <span class="ct-dim">(工作区文件选择浮层)</span>
├─ <span class="ct-overlay">Layout (Web工作区浮层)</span> <span class="ct-dim">showWebView ? fullSize : 0dp</span>
│   └─ <span class="ct-branch">WorkspaceScreen</span>
├─ <span class="ct-overlay">Box (AI电脑浮层)</span> <span class="ct-dim">条件渲染: showAiComputer</span>
│   └─ <span class="ct-branch">ComputerScreen</span>
├─ <span class="ct-overlay">AnimatedVisibility</span> <span class="ct-dim">(工作区准备中遮罩)</span>
├─ <span class="ct-dialog">导出对话框系列</span> <span class="ct-dim">(平台选择 / Android / Windows / 进度 / 完成)</span>
├─ <span class="ct-dialog">ChatToastHost</span> <span class="ct-dim">(顶部 Toast 通知)</span>
└─ <span class="ct-dialog">AlertDialog × 2</span> <span class="ct-dim">(popupMessage / 模型建议)</span>
</div>
<span class="ct-dialog">MemoryFolderSelectionDialog</span> <span class="ct-dim">(记忆文件夹选择 · 根级别)</span>
      </div>
      </details>
    </div>

    <!-- ===== 视图状态矩阵 ===== -->
    <div class="section">
      <div class="section-head orange">🔀 视图状态矩阵 <span class="count">7 个布尔状态控制视图切换</span></div>
      <table class="act-table">
        <thead>
          <tr><th>状态</th><th>默认</th><th>控制的视图</th><th>切换方式</th></tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">showConfig</td>
            <td><span class="state-badge off">首次未配置时 true</span></td>
            <td>ConfigurationScreen ↔ 聊天主界面</td>
            <td>API 配置完成后切换</td>
          </tr>
          <tr>
            <td class="mono">showWebView</td>
            <td><span class="state-badge off">false</span></td>
            <td>WorkspaceScreen 浮层（覆盖聊天区）</td>
            <td>TopBar Code 按钮</td>
          </tr>
          <tr>
            <td class="mono">showAiComputer</td>
            <td><span class="state-badge off">false</span></td>
            <td>ComputerScreen 浮层（覆盖聊天区）</td>
            <td>TopBar Terminal 按钮</td>
          </tr>
          <tr>
            <td class="mono">isWorkspacePreparing</td>
            <td><span class="state-badge off">false</span></td>
            <td>准备中遮罩 (CircularProgressIndicator)</td>
            <td>打开工作区时自动</td>
          </tr>
          <tr>
            <td class="mono">showChatHistorySelector</td>
            <td><span class="state-badge off">false</span></td>
            <td>聊天历史侧边面板 + 遮罩</td>
            <td>Header 历史按钮</td>
          </tr>
          <tr>
            <td class="mono">showCharacterSelector</td>
            <td><span class="state-badge off">false</span></td>
            <td>角色切换面板</td>
            <td>Header 角色 Chip</td>
          </tr>
          <tr>
            <td class="mono">showWorkspaceFileSelector</td>
            <td><span class="state-badge off">false</span></td>
            <td>工作区文件选择浮层</td>
            <td>输入框 @ 触发</td>
          </tr>
        </tbody>
      </table>

      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🔄</div>
          <div class="kn-title orange">视图互斥关系</div>
          <div class="kn-code">正常聊天模式 (默认)
    ↕ onWorkspaceButtonClick()
Web 工作区模式 (showWebView = true)
    ↕ onAiComputerButtonClick()
AI 电脑模式 (showAiComputer = true)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title cyan">生命周期策略差异</div>
          <div class="kn-body">
            <strong style="color:var(--blue)">Web 工作区</strong> — <code style="color:var(--cyan);font-size:11px;">Layout</code> 包裹，不可见时跳过测量但保留在组合中维持状态<br><br>
            <strong style="color:var(--green)">AI 电脑</strong> — 条件渲染 (<code style="color:var(--cyan);font-size:11px;">if</code>)，关闭时完全移出组合释放 SurfaceView，避免画面残影
          </div>
        </div>
      </div>
    </div>

    <!-- ===== ChatScreenContent 布局 ===== -->
    <div class="section">
      <div class="section-head purple">📐 ChatScreenContent 布局模式 <span class="count">Header + 消息列表 + 覆盖层</span></div>

      <div class="mermaid">
graph LR
    subgraph 覆盖模式
        OV_BOX["Box (fillMaxSize)"]
        OV_BOX --> OV_CHAT["ChatArea (fillMaxSize)&lt;br/&gt;topPadding = headerHeight"]
        OV_BOX --> OV_HEADER["ChatScreenHeader&lt;br/&gt;(浮动在ChatArea之上)"]
    end

    subgraph 普通模式
        NM_COL["Column (fillMaxSize)"]
        NM_COL --> NM_HEADER["ChatScreenHeader"]
        NM_COL --> NM_CHAT["ChatArea (fillMaxSize)"]
    end
      </div>

      <div class="mode-compare">
        <div class="mode-card">
          <div class="mc-title"><span style="color:var(--cyan)">📌</span> 覆盖模式 <span style="font-size:11px;color:var(--text-dimmer);font-weight:400">chatHeaderOverlayMode && chatHeaderTransparent</span></div>
          <div class="mc-tree">
<span style="color:var(--text)">Box</span> (fillMaxSize)
  ├─ <span style="color:var(--green)">ChatArea</span> (fillMaxSize)
  │   topPadding = headerHeight
  └─ <span style="color:var(--blue)">ChatScreenHeader</span>
      <span style="color:var(--text-dimmer)">浮动在 ChatArea 之上</span>
          </div>
        </div>
        <div class="mode-card">
          <div class="mc-title"><span style="color:var(--green)">📋</span> 普通模式 <span style="font-size:11px;color:var(--text-dimmer);font-weight:400">默认</span></div>
          <div class="mc-tree">
<span style="color:var(--text)">Column</span> (fillMaxSize)
  ├─ <span style="color:var(--blue)">ChatScreenHeader</span>
  └─ <span style="color:var(--green)">ChatArea</span> (fillMaxSize)
      <span style="color:var(--text-dimmer)">Header 与 ChatArea 顺序排列</span>
          </div>
        </div>
      </div>

      <!-- ChatScreenHeader -->
      <div class="arch-box" style="margin-top:16px;">
        <div class="arch-title">ChatScreenHeader 结构</div>
        <div class="arch-tree">
          <div class="arch-tree-body">
            <div class="arch-tree-root">
              <strong style="color:var(--text)">Row</strong> <span style="color:var(--text-dimmer)">(fillMaxWidth · padding 16dp/6dp)</span>
            </div>
            <div class="arch-tree-indent">
              <div class="arch-tree-row">├─ <strong style="color:var(--blue)">ChatHeader</strong> <span style="color:var(--text-dimmer)">(weight=1f)</span></div>
              <div class="arch-tree-sub">├─ 历史按钮 — runningTaskCount≥2 时显示带计数药丸</div>
              <div class="arch-tree-sub">├─ PiP 悬浮窗按钮 — PictureInPicture 图标</div>
              <div class="arch-tree-sub">└─ 角色切换 Chip — 24dp 圆形头像 + 角色名 (最长12字符)</div>
              <div>└─ <strong style="color:var(--purple)">统计信息</strong></div>
              <div class="arch-tree-sub">└─ CircularProgressIndicator (上下文使用率) + DropdownMenu (Token 详情)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ChatArea -->
      <div class="arch-box" style="margin-top:16px;">
        <div class="arch-title">ChatArea 消息列表结构</div>
        <div class="arch-tree">
          <div class="arch-tree-body">
            <div class="arch-tree-root">
              <strong style="color:var(--text)">Box</strong> <span style="color:var(--text-dimmer)">(透明背景)</span>
            </div>
            <div class="arch-tree-indent">
              <div>└─ <strong style="color:var(--text)">Column</strong> <span style="color:var(--text-dimmer)">(verticalScroll · horizontalPadding)</span></div>
              <div class="arch-tree-sub">├─ [hasOlderPages] 「加载更早的历史」按钮</div>
              <div class="arch-tree-sub">├─ forEach 消息 → <code style="color:var(--cyan)">MessageItem</code> + Spacer(8dp)</div>
              <div class="arch-tree-sub">├─ [hasNewerPages] 「加载更新的历史」按钮</div>
              <div class="arch-tree-sub">└─ [isLoading] <code style="color:var(--cyan)">LoadingDotsIndicator</code></div>
            </div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-dim);margin-top:10px;padding:0 4px;">
          <strong style="color:var(--text-dimmer)">分页机制：</strong>最多显示 MAX_VISIBLE_CHAT_PAGES = 2 页，上下翻页按钮可滑动窗口。
        </div>
      </div>

      <!-- Message rendering styles -->
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📝</div>
          <div class="kn-title blue">Cursor 风格</div>
          <div class="kn-body">类 Cursor 编辑器风格，消息条式布局</div>
          <div class="kn-code">CursorStyleChatMessage
├─ UserMessageComposable   (右侧卡片)
├─ AiMessageComposable     (左侧平铺)
└─ SummaryMessageComposable (总结)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">💬</div>
          <div class="kn-title purple">Bubble 风格</div>
          <div class="kn-body">传统气泡聊天风格，支持图片背景</div>
          <div class="kn-code">BubbleStyleChatMessage
├─ BubbleUserMessageComposable
│   └─ BubbleImageBackgroundSurface
└─ BubbleAiMessageComposable
    └─ BubbleImageBackgroundSurface</div>
        </div>
      </div>
    </div>

    <!-- ===== 输入栏 ===== -->
    <div class="section">
      <div class="section-head green">⌨️ ChatInputBottomBar 输入栏 <span class="count">Agent vs Classic 两种风格</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🤖</div>
          <div class="kn-title green">Agent 风格</div>
          <div class="kn-body"><code style="color:var(--cyan);font-size:11px">AgentChatInputSection</code></div>
          <div class="kn-code">设置面板: 内联弹出式 Popup
功能开关: 输入框内 / 弹出菜单
视觉风格: 现代紧凑
额外功能: Model Selector / Thinking 设置
         Memory / Permission 等开关</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title purple">Classic 风格</div>
          <div class="kn-body"><code style="color:var(--cyan);font-size:11px">ClassicChatInputSection</code> + <code style="color:var(--cyan);font-size:11px">ClassicChatSettingsBar</code></div>
          <div class="kn-code">设置面板: 独立浮动设置栏 (右侧)
功能开关: 右侧独立设置栏
视觉风格: 经典分离布局
设置栏位置: 聊天区 BottomEnd</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📬</div>
          <div class="kn-title orange">消息发送队列</div>
          <div class="kn-body">AI 处理中时，用户可将新消息加入待发队列：</div>
          <div class="kn-code">输入 → isQueueBlocked?
├─ 否 → 直接发送
└─ 是 → 加入 pendingQueueMessages
        → AI 完成 → 自动发送队首 (FIFO)

队列操作: 删除 / 编辑 / 立即发送</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⌨️</div>
          <div class="kn-title cyan">IME 处理策略</div>
          <div class="kn-body">根据当前视图动态切换 SoftInputMode：</div>
          <div class="kn-code">Agent + 非工作区:
  ADJUST_NOTHING → Compose translationY

Web工作区 / AI电脑:
  ADJUST_RESIZE → 系统 resize

其他:
  ADJUST_PAN → 系统 pan (默认)</div>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">输入框外观变体</div>
        <table class="act-table">
          <thead><tr><th>偏好</th><th>效果</th></tr></thead>
          <tbody>
            <tr><td class="mono">chatInputTransparent</td><td>背景 alpha = 0</td></tr>
            <tr><td class="mono">chatInputFloating</td><td>悬浮样式（与底部分离）</td></tr>
            <tr><td class="mono">chatInputLiquidGlass</td><td>液态玻璃材质</td></tr>
            <tr><td class="mono">chatInputWaterGlass</td><td>水玻璃材质（优先级高于液态玻璃）</td></tr>
            <tr><td class="mono">hasBackgroundImage</td><td>非透明时背景 alpha = 0.85</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== 侧边面板 ===== -->
    <div class="section">
      <div class="section-head cyan">📑 侧边面板与浮层</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📜</div>
          <div class="kn-title blue">ChatHistorySelectorPanel</div>
          <div class="kn-body">从左侧滑入的聊天历史面板 (280dp)</div>
          <div class="kn-code">Box (280dp · fillMaxHeight · 圆角右侧)
└─ ChatHistorySelector
   ├─ 搜索框
   ├─ 新建对话按钮
   ├─ 显示模式 (全部 / 仅当前角色)
   └─ LazyList (历史列表)
      ├─ 按文件夹分组 / 平铺
      ├─ 长按: 重命名/删除/移动
      └─ HistoryQuickScroller</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">👤</div>
          <div class="kn-title purple">CharacterSelectorPanel</div>
          <div class="kn-body">角色切换面板</div>
          <div class="kn-code">CharacterSelectorPanel
├─ CharacterItem (单个角色卡)
│  ├─ 头像 · 角色名 · 选中指示器
└─ CharacterGroupItem (角色组)
   ├─ 组头像 · 组名 · 成员数量</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📁</div>
          <div class="kn-title green">WorkspaceFileSelectorOverlay</div>
          <div class="kn-body">输入框 @ 触发，从底部滑入的文件选择器</div>
          <div class="kn-code">AnimatedVisibility (fadeIn/fadeOut)
└─ Box (fillMaxSize)
   ├─ 遮罩层 (点击关闭)
   └─ WorkspaceFileSelector (slideIn)
      ├─ 文件树列表
      └─ 选择 → 插入相对路径到输入框</div>
        </div>
      </div>
    </div>

    <!-- ===== 覆盖层与对话框 ===== -->
    <div class="section">
      <div class="section-head orange">🫧 覆盖层组件</div>
      <table class="act-table">
        <thead><tr><th>组件</th><th>位置</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">多选操作栏</td><td>BottomCenter</td><td>isMultiSelectMode</td><td>全选 / 分享 / 删除已选消息</td></tr>
          <tr><td class="mono">停止朗读按钮</td><td>可拖拽</td><td>isPlaying || isAutoReadEnabled</td><td>SmallFAB，可拖拽定位</td></tr>
          <tr><td class="mono">ScrollToBottomButton</td><td>BottomCenter</td><td>非底部时显示</td><td>滚动到底部</td></tr>
          <tr><td class="mono">MessageEditor</td><td>Dialog</td><td>editingMessageIndex != null</td><td>编辑消息内容，可重发</td></tr>
          <tr><td class="mono">WorkspaceChangeConfirmDialog</td><td>Dialog</td><td>pendingRollbackIndex != null</td><td>预览文件变更后确认</td></tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-head purple">📋 对话框清单 <span class="count">12+</span></div>
      <table class="act-table">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">ErrorDialog</td><td>errorMessage != null</td><td>显示错误信息</td></tr>
          <tr><td class="mono">AlertDialog (模型建议)</td><td>模型名含 deepseek-r1-0528-qwen3-8b:free</td><td>建议更换模型</td></tr>
          <tr><td class="mono">AlertDialog (弹窗消息)</td><td>popupMessage != null</td><td>显示通知消息</td></tr>
          <tr><td class="mono">MemoryFolderSelectionDialog</td><td>附件菜单 → 记忆</td><td>选择记忆文件夹</td></tr>
          <tr><td class="mono">ExportPlatformDialog</td><td>工作区导出按钮</td><td>选择导出平台</td></tr>
          <tr><td class="mono">AndroidExportDialog</td><td>选择 Android 平台</td><td>配置包名/应用名/图标/版本</td></tr>
          <tr><td class="mono">WindowsExportDialog</td><td>选择 Windows 平台</td><td>配置应用名/图标</td></tr>
          <tr><td class="mono">ExportProgressDialog</td><td>导出进行中</td><td>显示进度条和状态</td></tr>
          <tr><td class="mono">ExportCompleteDialog</td><td>导出完成</td><td>显示结果，可打开文件</td></tr>
          <tr><td class="mono">SharedFileTargetDialog</td><td>外部分享文件到应用</td><td>选择处理方式</td></tr>
          <tr><td class="mono">MessageEditor</td><td>长按消息 → 编辑</td><td>编辑消息内容，可重发</td></tr>
          <tr><td class="mono">WorkspaceChangeConfirmDialog</td><td>回滚/编辑重发有工作区</td><td>预览文件变更后确认</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 偏好配置 ===== -->
    <div class="section">
      <div class="section-head gray">🎨 关键偏好配置项 <span class="count">影响外观与行为</span></div>
      <table class="act-table">
        <thead><tr><th>偏好</th><th>类型</th><th>影响</th></tr></thead>
        <tbody>
          <tr><td class="mono">chatStyle</td><td>CURSOR / BUBBLE</td><td>消息渲染风格</td></tr>
          <tr><td class="mono">inputStyle</td><td>AGENT / CLASSIC</td><td>输入栏风格</td></tr>
          <tr><td class="mono">useBackgroundImage</td><td>Boolean</td><td>聊天背景图</td></tr>
          <tr><td class="mono">chatHeaderTransparent</td><td>Boolean</td><td>Header 是否透明</td></tr>
          <tr><td class="mono">chatHeaderOverlayMode</td><td>Boolean</td><td>Header 覆盖模式 vs 顺序排列</td></tr>
          <tr><td class="mono">chatAreaHorizontalPadding</td><td>Float (dp)</td><td>聊天区水平内边距</td></tr>
          <tr><td class="mono">cursorUserBubbleFollowTheme</td><td>Boolean</td><td>Cursor 风格用户气泡跟随主题</td></tr>
          <tr><td class="mono">bubbleUser/AiBubbleColor</td><td>Color?</td><td>Bubble 风格用户/AI 气泡颜色</td></tr>
          <tr><td class="mono">bubbleUser/AiUseImage</td><td>Boolean</td><td>气泡图片背景</td></tr>
          <tr><td class="mono">bubbleImageRenderMode</td><td>String</td><td>图片渲染模式 (九宫格平铺等)</td></tr>
          <tr><td class="mono">enableEnterToSend</td><td>Boolean</td><td>回车键发送</td></tr>
          <tr><td class="mono">showInputProcessingStatus</td><td>Boolean</td><td>显示输入处理状态</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">16 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径 (相对 ui/features/chat/)</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>AIChatScreen</strong></td><td class="mono">screens/AIChatScreen.kt</td><td>页面入口，状态收集，视图编排</td></tr>
          <tr><td><strong>ChatScreenContent</strong></td><td class="mono">components/ChatScreenContent.kt</td><td>聊天内容区 (Header + 消息列表)</td></tr>
          <tr><td><strong>ChatScreenHeader</strong></td><td class="mono">components/ChatScreenHeader.kt</td><td>顶部栏 (角色/历史/统计)</td></tr>
          <tr><td><strong>ChatHeader</strong></td><td class="mono">components/ChatHeader.kt</td><td>Header 内部 (按钮 + 角色 Chip)</td></tr>
          <tr><td><strong>ChatArea</strong></td><td class="mono">components/ChatArea.kt</td><td>消息列表 (分页/滚动/渲染)</td></tr>
          <tr><td><strong>ChatHistorySelector</strong></td><td class="mono">components/ChatHistorySelector.kt</td><td>聊天历史选择器</td></tr>
          <tr><td><strong>CharacterSelectorPanel</strong></td><td class="mono">components/CharacterSelectorPanel.kt</td><td>角色切换面板</td></tr>
          <tr><td><strong>AgentChatInputSection</strong></td><td class="mono">components/style/input/agent/AgentChatInputSection.kt</td><td>Agent 风格输入栏</td></tr>
          <tr><td><strong>ClassicChatInputSection</strong></td><td class="mono">components/style/input/classic/ClassicChatInputSection.kt</td><td>Classic 风格输入栏</td></tr>
          <tr><td><strong>ClassicChatSettingsBar</strong></td><td class="mono">components/style/input/classic/ClassicChatSettingsBar.kt</td><td>Classic 风格设置栏</td></tr>
          <tr><td><strong>CursorStyleChatMessage</strong></td><td class="mono">components/style/cursor/CursorStyleChatMessage.kt</td><td>Cursor 风格消息渲染</td></tr>
          <tr><td><strong>BubbleStyleChatMessage</strong></td><td class="mono">components/style/bubble/BubbleStyleChatMessage.kt</td><td>Bubble 风格消息渲染</td></tr>
          <tr><td><strong>ChatViewModel</strong></td><td class="mono">viewmodel/ChatViewModel.kt</td><td>聊天业务逻辑 ViewModel</td></tr>
          <tr><td><strong>WorkspaceScreen</strong></td><td class="mono">webview/workspace/WorkspaceScreen.kt</td><td>Web 工作区</td></tr>
          <tr><td><strong>ComputerScreen</strong></td><td class="mono">webview/computer/ComputerScreen.kt</td><td>AI 电脑终端</td></tr>
          <tr><td><strong>ConfigurationScreen</strong></td><td class="mono">components/ConfigurationScreen.kt</td><td>API 配置界面</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/03_Screen.AiChat页面结构.md · AIChatScreen 组件结构
    </div>`);
