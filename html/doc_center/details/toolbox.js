registerDetail('toolbox', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">🧰 Screen.Toolbox 页面结构</h1>
      <p class="sub">ToolboxScreen · 工具网格入口 · 18 静态工具 + 动态 ToolPkg 插件</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">18</div><div class="label">静态工具</div></div>
      <div class="stat-card"><div class="num">N</div><div class="label">动态工具</div></div>
      <div class="stat-card"><div class="num">4</div><div class="label">工具类别</div></div>
      <div class="stat-card"><div class="num">19</div><div class="label">子页面</div></div>
      <div class="stat-card"><div class="num">50+</div><div class="label">DSL 组件</div></div>
      <div class="stat-card"><div class="num">6</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">从 Activity 到 ToolboxScreen</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">NavItem.Toolbox</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">OperitApp</div><div class="step-cond">导航状态管理</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">AppContent</div><div class="step-cond">TopAppBar + Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">ToolboxScreen</div><div class="step-cond">19 个 onXxxSelected 回调</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">导航属性</div>
          <div class="kn-code">路由: NavItem.Toolbox
图标: Icons.Default.Build
导航组: Tools
叶子节点: 否（18+ 个子页面）
Crossfade: 参与 (默认)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">架构特点</div>
          <div class="kn-body"><strong>无 ViewModel</strong>，所有状态为局部 <code style="color:var(--cyan)">remember</code>。通过 19 个回调 lambda 导航，不依赖 Screen 或路由系统。</div>
        </div>
      </div>
    </div>

    <!-- ===== 组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 组件树 <span class="count">类别筛选 + 自适应网格</span></div>

      <div class="mermaid">
graph TD
    ROOT["ToolboxScreen&lt;br/&gt;(Box fillMaxSize)"]

    ROOT --> MAIN_COL["Column (fillMaxSize)"]

    MAIN_COL --> TOP["TopAppSection&lt;br/&gt;Column (渐变背景)"]
    TOP --> TITLE["Text: '工具箱' (headlineMedium)"]
    TOP --> DESC["Text: 描述 (70% opacity)"]

    MAIN_COL --> CAT_SEL["CategorySelector&lt;br/&gt;Row (horizontalScroll)"]
    CAT_SEL --> CAT_ALL["Surface: 全部工具"]
    CAT_SEL --> CAT_FILE["Surface: 文件管理"]
    CAT_SEL --> CAT_DEV["Surface: 开发工具"]
    CAT_SEL --> CAT_SYS["Surface: 系统工具"]

    MAIN_COL --> GRID["LazyVerticalGrid&lt;br/&gt;(Adaptive 156dp, padding 12dp)"]
    GRID --> CARD["ToolCard (per tool)&lt;br/&gt;Card (156dp height, 按压缩放动画)"]
    CARD --> ICON_BOX["Box (48dp 圆形, 类别色背景)"]
    ICON_BOX --> ICON["Icon (24dp, 类别色)"]
    CARD --> NAME["Text (名称, 最多2行)"]
    CARD --> CARD_DESC["Text (描述, 最多2行)"]
      </div>

      <details style="margin-top:12px;">
        <summary style="font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;">📝 文本版组件树</summary>
        <div class="comp-tree" style="margin-top:8px;">
<span class="ct-root">ToolboxScreen (Box fillMaxSize)</span>
<div class="ct-indent">
└─ <span class="ct-branch">Column (fillMaxSize)</span>
    ├─ <span class="ct-branch">TopAppSection</span> <span class="ct-dim">(渐变背景)</span>
    │   ├─ <span class="ct-dim">Text: '工具箱' (headlineMedium)</span>
    │   └─ <span class="ct-dim">Text: 描述 (70% opacity)</span>
    ├─ <span class="ct-branch">CategorySelector</span> <span class="ct-dim">(horizontalScroll)</span>
    │   ├─ Surface: 全部工具
    │   ├─ Surface: 文件管理
    │   ├─ Surface: 开发工具
    │   └─ Surface: 系统工具
    └─ <span class="ct-branch">LazyVerticalGrid (Adaptive 156dp)</span>
        └─ <span class="ct-dim">ToolCard (per tool)</span>
            ├─ Box (48dp 圆形, 类别色背景) → Icon
            ├─ Text (名称, 最多2行)
            └─ Text (描述, 最多2行)
</div>
        </div>
      </details>
    </div>

    <!-- ===== 工具类别 ===== -->
    <div class="section">
      <div class="section-head orange">🏷 工具类别 <span class="count">4 个筛选类别</span></div>
      <table class="act-table">
        <thead><tr><th>枚举值</th><th>显示名</th><th>背景色</th><th>着色</th></tr></thead>
        <tbody>
          <tr><td class="mono">ALL</td><td>全部工具</td><td>primaryContainer</td><td>primary</td></tr>
          <tr><td class="mono">FILE_MANAGEMENT</td><td>文件管理</td><td>primaryContainer</td><td>primary</td></tr>
          <tr><td class="mono">DEVELOPMENT</td><td>开发工具</td><td>tertiaryContainer</td><td>tertiary</td></tr>
          <tr><td class="mono">SYSTEM</td><td>系统工具</td><td>secondaryContainer</td><td>secondary</td></tr>
        </tbody>
      </table>
      <div style="font-size:12px;color:var(--text-dim);margin-top:8px;">
        CategorySelector：水平可滚动药丸形 Chip，选中态 primaryContainer 背景 + 阴影，未选中态 surface 背景 + 70% opacity。
      </div>
    </div>

    <!-- ===== 完整工具列表 ===== -->
    <div class="section">
      <div class="section-head purple">📋 完整工具列表 <span class="count">18 个静态工具</span></div>
      <table class="act-table">
        <thead><tr><th>#</th><th>名称</th><th>图标</th><th>类别</th><th>目标页面</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>工具测试中心</td><td class="mono">BuildCircle</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.ToolTester</td></tr>
          <tr><td>2</td><td>文件管理器</td><td class="mono">Folder</td><td><span class="tag t-sys">FILE</span></td><td class="mono">Screen.FileManager</td></tr>
          <tr><td>3</td><td>文本转语音</td><td class="mono">RecordVoiceOver</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.TextToSpeech</td></tr>
          <tr><td>4</td><td>语音识别</td><td class="mono">Mic</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.SpeechToText</td></tr>
          <tr><td>5</td><td>应用权限管理</td><td class="mono">Security</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.AppPermissions</td></tr>
          <tr><td>6</td><td>用户协议</td><td class="mono">Policy</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.Agreement</td></tr>
          <tr><td>7</td><td>默认助手设置</td><td class="mono">Assistant</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.DefaultAssistantGuide</td></tr>
          <tr><td>8</td><td>命令终端</td><td class="mono">Terminal</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.Terminal</td></tr>
          <tr><td>9</td><td>UI调试工具</td><td class="mono">DeviceHub</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.UIDebugger</td></tr>
          <tr><td>10</td><td>FFmpeg工具箱</td><td class="mono">VideoSettings</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.FFmpegToolbox</td></tr>
          <tr><td>11</td><td>命令执行器</td><td class="mono">Code</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.ShellExecutor</td></tr>
          <tr><td>12</td><td>日志查看器</td><td class="mono">DataObject</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.Logcat</td></tr>
          <tr><td>13</td><td>SQL查看器</td><td class="mono">TableView</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.SqlViewer</td></tr>
          <tr><td>14</td><td>获取密钥</td><td class="mono">Token</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.TokenConfig</td></tr>
          <tr><td>15</td><td>解除幻象进程限制</td><td class="mono">LockOpen</td><td><span class="tag t-trans">SYS</span></td><td class="mono">Screen.ProcessLimitRemover</td></tr>
          <tr><td>16</td><td>HTML打包器</td><td class="mono">Html</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.HtmlPackager</td></tr>
          <tr><td>17</td><td>AutoGLM 一键配置</td><td class="mono">AutoMode</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.AutoGlmOneClick</td></tr>
          <tr><td>18</td><td>AutoGLM 执行</td><td class="mono">AutoMode</td><td><span class="tag t-plugin">DEV</span></td><td class="mono">Screen.AutoGlmTool</td></tr>
        </tbody>
      </table>

      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🔌</div>
          <div class="kn-title cyan">动态 ToolPkg 工具</div>
          <div class="kn-body">通过 <code style="color:var(--cyan)">ToolboxScriptPluginRegistry</code> 插件系统动态加载：</div>
          <div class="kn-code">LaunchedEffect(configuration) → IO 线程
→ ToolboxScriptPluginRegistry.createDefinitions()
  → ToolPkgToolboxScriptPlugin.createDefinitions()
    → PackageManager.getToolPkgToolboxUiModules(
        runtime = COMPOSE_DSL)
    → 去重 (containerPackageName:uiModuleId:runtime)
    → 按 title → containerPackageName → uiModuleId 排序

统一属性:
  图标: Icons.Default.Extension
  类别: DEVELOPMENT
  导航: Screen.ToolPkgComposeDsl(...)</div>
        </div>
      </div>
    </div>

    <!-- ===== ToolCard 交互 ===== -->
    <div class="section">
      <div class="section-head green">👆 ToolCard 交互 <span class="count">按压缩放动画</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">✨</div>
          <div class="kn-title green">按压动画流程</div>
          <div class="kn-code">点击 ToolCard
→ isPressed = true  (scale: 1f → 0.95f, 100ms tween)
→ delay(100ms) 等待动画
→ tool.onClick()   (执行导航回调)
→ isPressed = false (scale: 0.95f → 1f, 200ms tween)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🃏</div>
          <div class="kn-title blue">卡片结构</div>
          <div class="kn-code">Card (fillMaxWidth, 156dp, graphicsLayer scale)
└─ Column (12dp padding, 居中, 8dp spacing)
    ├─ Box (48dp 圆形, 类别色背景, 8dp padding)
    │   └─ Icon (24dp, 类别色着色)
    ├─ Text (名称, bodyMedium/Bold, 最多2行)
    └─ Text (描述, bodySmall, onSurfaceVariant, 最多2行)</div>
        </div>
      </div>
    </div>

    <!-- ===== 子页面导航关系 ===== -->
    <div class="section">
      <div class="section-head orange">🗺 子页面导航关系 <span class="count">19 个子页面</span></div>

      <div class="mermaid">
graph TD
    TOOLBOX["Screen.Toolbox&lt;br/&gt;(ToolboxScreen)"]

    TOOLBOX --> FM["Screen.FileManager&lt;br/&gt;文件管理器"]
    TOOLBOX --> TERM["Screen.Terminal&lt;br/&gt;命令终端"]
    TOOLBOX --> SHELL["Screen.ShellExecutor&lt;br/&gt;命令执行器"]
    TOOLBOX --> UID["Screen.UIDebugger&lt;br/&gt;UI调试工具"]
    TOOLBOX --> LOG["Screen.Logcat&lt;br/&gt;日志查看器"]
    TOOLBOX --> SQL["Screen.SqlViewer&lt;br/&gt;SQL查看器"]
    TOOLBOX --> FF["Screen.FFmpegToolbox&lt;br/&gt;FFmpeg工具箱"]
    TOOLBOX --> TTS["Screen.TextToSpeech&lt;br/&gt;文本转语音"]
    TOOLBOX --> STT["Screen.SpeechToText&lt;br/&gt;语音识别"]
    TOOLBOX --> TEST["Screen.ToolTester&lt;br/&gt;工具测试中心"]
    TOOLBOX --> GUIDE["Screen.DefaultAssistantGuide&lt;br/&gt;默认助手设置"]
    TOOLBOX --> PROC["Screen.ProcessLimitRemover&lt;br/&gt;进程限制解除"]
    TOOLBOX --> HTML["Screen.HtmlPackager&lt;br/&gt;HTML打包器"]
    TOOLBOX --> AUTOGLM1["Screen.AutoGlmOneClick&lt;br/&gt;AutoGLM一键配置"]
    TOOLBOX --> AUTOGLM2["Screen.AutoGlmTool&lt;br/&gt;AutoGLM执行"]
    TOOLBOX --> PERM["Screen.AppPermissions&lt;br/&gt;应用权限管理"]
    TOOLBOX --> TOKEN["Screen.TokenConfig&lt;br/&gt;获取密钥"]
    TOOLBOX --> AGREE["Screen.Agreement&lt;br/&gt;用户协议"]
    TOOLBOX --> DSL["Screen.ToolPkgComposeDsl&lt;br/&gt;(动态 ToolPkg 工具)"]
      </div>

      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">⚠️</div>
          <div class="kn-title orange">特殊导航情况</div>
          <div class="kn-code">Screen.TokenConfig
  parentScreen = AiChat (非 Toolbox)
  从 Toolbox 进入后返回会到 AiChat

Screen.TerminalSetup / TerminalAutoConfig
  不在工具网格中
  仅可通过程序化导航访问

Screen.MarkdownDemo
  仅定义了 Screen 对象
  无对应工具卡片</div>
        </div>
      </div>
    </div>

    <!-- ===== ToolPkgComposeDsl 动态渲染 ===== -->
    <div class="section">
      <div class="section-head cyan">🎨 ToolPkgComposeDsl 动态渲染 <span class="count">JS → DSL → Compose 节点树</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🔄</div>
          <div class="kn-title blue">渲染流程</div>
          <div class="kn-code">ToolPkgComposeDslToolScreen
→ LaunchedEffect(containerPackageName, uiModuleId)
  → render() [获取 renderMutex]
    → PackageManager 加载脚本 (IO 线程)
    → jsEngine.executeComposeDslScript()
    → ToolPkgComposeDslParser.parseRenderResult()
    → [根节点有 onLoad action]
      → dispatchAction() 自动触发</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📊</div>
          <div class="kn-title green">UI 状态机</div>
          <div class="kn-code"><strong>Loading</strong>
  居中 CircularProgressIndicator

<strong>Error</strong>
  居中错误文字 + "Retry" 按钮

<strong>Success</strong>
  渲染 DSL 节点树 (renderComposeDslNode)

<strong>Dispatching</strong>
  顶部 LinearProgressIndicator 叠加层</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🧩</div>
          <div class="kn-title purple">节点渲染</div>
          <div class="kn-code">类型标记规范化
→ 查找 composeDslGeneratedNodeRendererRegistry

"canvas" 类型 → renderCanvasNode() 特殊处理
未知类型 → Text("Unsupported node: ...")

非 LazyColumn 根节点 → 外层添加 verticalScroll

支持 50+ 种 Material3 组件:
Column, Row, Box, Spacer, LazyColumn, LazyRow,
Text, TextField, Switch, Checkbox, Button,
IconButton, Card, Surface, Icon, Divider,
FloatingActionButton, Scaffold, Canvas ...</div>
        </div>
      </div>
    </div>

    <!-- ===== 对话框 ===== -->
    <div class="section">
      <div class="section-head gray">📋 对话框清单</div>
      <div style="font-size:13px;color:var(--text-dim);padding:16px;">
        ToolboxScreen 本身<strong>无对话框</strong>。所有对话框均在各子页面内部实现。
      </div>
    </div>

    <!-- ===== 架构要点 ===== -->
    <div class="section">
      <div class="section-head blue">🏗 架构要点</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🚫</div>
          <div class="kn-title orange">无 ViewModel</div>
          <div class="kn-body">所有状态为局部 <code style="color:var(--cyan)">remember</code>，工具列表在每次重组时内联构建。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔗</div>
          <div class="kn-title blue">导航解耦</div>
          <div class="kn-body"><code style="color:var(--cyan)">ToolboxScreen</code> 通过 19 个回调 lambda 导航，不依赖 Screen 或路由系统。导航知识集中在 <code style="color:var(--cyan)">Screen.Toolbox.Content()</code> 中。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔌</div>
          <div class="kn-title green">插件式动态工具</div>
          <div class="kn-body"><code style="color:var(--cyan)">ToolboxScriptPluginRegistry</code> 支持注册任意插件注入工具定义，内置 <code style="color:var(--cyan)">ToolPkgToolboxScriptPlugin</code> 查询已安装 ToolPkg 的 Compose DSL UI 模块。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🎨</div>
          <div class="kn-title cyan">DSL 渲染引擎</div>
          <div class="kn-body">ToolPkg 动态工具通过 JS 引擎执行 DSL 脚本，解析为节点树后用自动生成的渲染注册表映射到 Compose 组件。支持 50+ 种 Material3 组件类型。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">✨</div>
          <div class="kn-title purple">按压动画</div>
          <div class="kn-body">ToolCard 使用 <code style="color:var(--cyan)">animateFloatAsState</code> + 协程 delay 实现 0.95x 缩放按压反馈，而非 Indication。</div>
        </div>
      </div>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">6 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>ToolboxScreen</strong></td><td class="mono">ui/features/toolbox/screens/ToolboxScreen.kt</td><td>页面入口 + 工具网格 + 子页面包装器</td></tr>
          <tr><td><strong>OperitScreens</strong></td><td class="mono">ui/main/screens/OperitScreens.kt</td><td>Screen 定义 + 导航回调绑定</td></tr>
          <tr><td><strong>ToolboxScriptPluginRegistry</strong></td><td class="mono">plugins/toolbox/ToolboxScriptPluginRegistry.kt</td><td>动态工具插件注册表</td></tr>
          <tr><td><strong>ToolboxPlugin</strong></td><td class="mono">plugins/toolbox/ToolboxPlugin.kt</td><td>内置 ToolPkg 插件注册</td></tr>
          <tr><td><strong>ToolPkgComposeDslScreen</strong></td><td class="mono">ui/common/composedsl/ToolPkgComposeDslScreen.kt</td><td>DSL 动态渲染引擎</td></tr>
          <tr><td><strong>ToolPkgComposeDslGeneratedRegistry</strong></td><td class="mono">ui/common/composedsl/ToolPkgComposeDslGeneratedRegistry.kt</td><td>自动生成的节点渲染注册表</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/07_Screen.Toolbox页面结构.md · ToolboxScreen 组件结构
    </div>`);
