registerDetail('packages', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">📦 Screen.Packages 页面结构</h1>
      <p class="sub">PackageManagerScreen · 三 Tab 入口 · 工具包 / 技能 / MCP 插件管理</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">3</div><div class="label">Tab 页面</div></div>
      <div class="stat-card"><div class="num">10+</div><div class="label">子页面</div></div>
      <div class="stat-card"><div class="num">20</div><div class="label">对话框</div></div>
      <div class="stat-card"><div class="num">3</div><div class="label">ViewModel</div></div>
      <div class="stat-card"><div class="num">4</div><div class="label">数据体系</div></div>
      <div class="stat-card"><div class="num">17</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">从 Activity 到 PackageManagerScreen</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">NavItem.Packages</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">OperitApp</div><div class="step-cond">导航状态管理</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">AppContent</div><div class="step-cond">TopAppBar + Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">PackageManagerScreen</div><div class="step-cond">Screen.Packages.Content()</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">导航属性</div>
          <div class="kn-code">路由: NavItem.Packages
图标: Icons.Default.Extension
导航组: AI Features
叶子节点: 否（有多个子页面）
Crossfade: 参与 (默认)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">架构特点</div>
          <div class="kn-body">入口页 <strong>无 ViewModel</strong>，直接使用 <code style="color:var(--cyan)">PackageManager</code> 单例操作数据。SKILLS 和 MCP Tab 各自内嵌独立子屏幕，拥有独立的状态管理。</div>
        </div>
      </div>
    </div>

    <!-- ===== 页面导航关系 ===== -->
    <div class="section">
      <div class="section-head orange">🗺 页面导航关系 <span class="count">Skill + MCP 两条子页面链路</span></div>

      <div class="mermaid">
graph TD
    PKG["Screen.Packages&lt;br/&gt;(PackageManagerScreen)"]

    PKG -->|SKILLS Tab → 市场| SK_MKT["Screen.SkillMarket&lt;br/&gt;(SkillMarketScreen)"]
    PKG -->|MCP Tab → 市场| MCP_MKT["Screen.MCPMarket&lt;br/&gt;(MCPMarketScreen)"]
    PKG -->|ToolPkg UI 模块| TOOLPKG["Screen.ToolPkgPluginConfig&lt;br/&gt;(ToolPkgComposeDslToolScreen)"]

    SK_MKT --> SK_PUB["Screen.SkillPublish&lt;br/&gt;(SkillPublishScreen)"]
    SK_MKT --> SK_MGR["Screen.SkillManage&lt;br/&gt;(SkillManageScreen)"]
    SK_MKT --> SK_DTL["Screen.SkillDetail(issue)&lt;br/&gt;(SkillDetailScreen)"]
    SK_MGR --> SK_EDT["Screen.SkillEdit(issue)&lt;br/&gt;(SkillPublishScreen 复用)"]

    MCP_MKT --> MCP_PUB["Screen.MCPPublish&lt;br/&gt;(MCPPublishScreen)"]
    MCP_MKT --> MCP_MGR["Screen.MCPManage&lt;br/&gt;(MCPManageScreen)"]
    MCP_MKT --> MCP_DTL["Screen.MCPPluginDetail(issue)&lt;br/&gt;(MCPPluginDetailScreen)"]
    MCP_MGR --> MCP_EDT["Screen.MCPEditPlugin(issue)&lt;br/&gt;(MCPPublishScreen 复用)"]
      </div>

      <div style="font-size:12px;color:var(--text-dim);margin-top:12px;text-align:center;">
        所有子页面通过 <code style="color:var(--cyan)">parentScreen</code> 指定返回目标，<code style="color:var(--cyan)">navItem</code> 统一为 NavItem.Packages 保持侧栏高亮
      </div>
    </div>

    <!-- ===== 组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 组件树 <span class="count">三 Tab 切换 + 内嵌子屏幕</span></div>

      <div class="mermaid">
graph TD
    ROOT["PackageManagerScreen&lt;br/&gt;(CustomScaffold + SnackbarHost)"]

    ROOT --> FAB["FAB Column (仅PACKAGES Tab)"]
    ROOT --> CONTENT["Column (fillMaxSize)"]
    ROOT --> PKG_DIALOGS["对话框层"]

    FAB --> FAB_ERR["SmallFAB: 错误指示器 (红色)"]
    FAB --> FAB_ENV["SmallFAB: 环境变量设置"]
    FAB --> FAB_ADD["FAB: 导入包 (+)"]

    CONTENT --> TAB_ROW["TabRow (3 个 Tab)"]
    TAB_ROW --> TAB_PKG["Tab: PACKAGES (Extension)"]
    TAB_ROW --> TAB_SKILL["Tab: SKILLS (Build)"]
    TAB_ROW --> TAB_MCP["Tab: MCP (Cloud)"]

    CONTENT --> TAB_CONTENT{"selectedTab"}
    TAB_CONTENT -->|PACKAGES| PKG_LIST["Box → Surface → LazyColumn&lt;br/&gt;(按类别分组)"]
    TAB_CONTENT -->|SKILLS| SKILL_CFG["SkillConfigScreen&lt;br/&gt;(内嵌子屏幕)"]
    TAB_CONTENT -->|MCP| MCP_CFG["MCPConfigScreen&lt;br/&gt;(内嵌子屏幕)"]

    PKG_LIST --> PKG_ITEM["PackageListItemWithTag&lt;br/&gt;(类别标签 + 图标 + 名称 + Switch)"]

    SKILL_CFG --> SKILL_HEADER["Card: 标题 + 刷新 + 目录"]
    SKILL_CFG --> SKILL_LIST["LazyColumn → SkillListItem"]
    SKILL_CFG --> SKILL_FABS["FAB Column: 错误 + 市场 + 添加"]

    MCP_CFG --> MCP_STATUS["Card: 状态头 (标题 + 状态点 + 计数)"]
    MCP_CFG --> MCP_LIST["LazyColumn → PluginListItem"]
    MCP_CFG --> MCP_FABS["FAB Column: 启动 + 市场 + 导入"]

    PKG_DIALOGS --> DLG_DETAIL["PackageDetailsDialog"]
    PKG_DIALOGS --> DLG_SCRIPT["ScriptExecutionDialog"]
    PKG_DIALOGS --> DLG_ENV["PackageEnvironmentVariablesDialog"]
    PKG_DIALOGS --> DLG_ERRORS["PackageLoadErrorsDialog"]
      </div>

      <details style="margin-top:12px;">
        <summary style="font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;">📝 文本版组件树</summary>
        <div class="comp-tree" style="margin-top:8px;">
<span class="ct-root">PackageManagerScreen (CustomScaffold + SnackbarHost)</span>
<div class="ct-indent">
├─ <span class="ct-branch">FAB Column (仅 PACKAGES Tab)</span>
│   ├─ <span class="ct-dim">SmallFAB: 错误指示器 (红色)</span>
│   ├─ <span class="ct-dim">SmallFAB: 环境变量设置</span>
│   └─ <span class="ct-dim">FAB: 导入包 (+)</span>
├─ <span class="ct-branch">Column (fillMaxSize)</span>
│   ├─ <span class="ct-branch">TabRow (3 个 Tab)</span>
│   │   ├─ Tab: PACKAGES (Extension)
│   │   ├─ Tab: SKILLS (Build)
│   │   └─ Tab: MCP (Cloud)
│   └─ <span class="ct-cond">selectedTab ?</span>
│       ├─ <span class="ct-cond">PACKAGES →</span> <span class="ct-branch">LazyColumn (按类别分组)</span>
│       │   └─ <span class="ct-dim">PackageListItemWithTag (标签 + 图标 + 名称 + Switch)</span>
│       ├─ <span class="ct-cond">SKILLS →</span> <span class="ct-branch">SkillConfigScreen (内嵌子屏幕)</span>
│       │   ├─ <span class="ct-dim">Card: 标题 + 刷新 + 目录</span>
│       │   ├─ <span class="ct-dim">LazyColumn → SkillListItem</span>
│       │   └─ <span class="ct-dim">FAB Column: 错误 + 市场 + 添加</span>
│       └─ <span class="ct-cond">MCP →</span> <span class="ct-branch">MCPConfigScreen (内嵌子屏幕)</span>
│           ├─ <span class="ct-dim">Card: 状态头 (标题 + 状态点 + 计数)</span>
│           ├─ <span class="ct-dim">LazyColumn → PluginListItem</span>
│           └─ <span class="ct-dim">FAB Column: 启动 + 市场 + 导入</span>
└─ <span class="ct-dialog">对话框层</span>
    ├─ <span class="ct-dialog">PackageDetailsDialog</span>
    ├─ <span class="ct-dialog">ScriptExecutionDialog</span>
    ├─ <span class="ct-dialog">PackageEnvironmentVariablesDialog</span>
    └─ <span class="ct-dialog">PackageLoadErrorsDialog</span>
</div>
        </div>
      </details>
    </div>

    <!-- ===== 状态管理 ===== -->
    <div class="section">
      <div class="section-head orange">🔀 状态管理 <span class="count">入口无 ViewModel + 子屏幕独立管理</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📦</div>
          <div class="kn-title orange">PackageManagerScreen (无 ViewModel)</div>
          <div class="kn-body">直接使用 <code style="color:var(--cyan)">PackageManager</code> 单例，所有状态为局部 <code style="color:var(--cyan)">remember</code>。</div>
          <div class="kn-code">availablePackages      — 所有可用工具包
importedPackages       — 已导入包名 (后端真实值)
visibleImportedPackages — 乐观更新的导入状态
isLoading / selectedPackage / showDetails
selectedTab (rememberSaveable)
  — PACKAGES / SKILLS / MCP
showEnvDialog / envVariables
packageLoadErrors / showScriptExecution</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔌</div>
          <div class="kn-title cyan">MCPConfigScreen (双 ViewModel)</div>
          <div class="kn-body"><strong>MCPViewModel</strong>: 安装/卸载进度、服务器操作<br><strong>MCPDeployViewModel</strong>: 部署生命周期</div>
          <div class="kn-code">serverStatusMap — 服务器状态映射
installProgress — 安装进度
mcpConfigSnapshot — 配置快照
deploymentStatus — 部署状态
pluginToolsMap — 插件工具映射

排序策略: 启用+已加载 → 名称
首次加载后锁定排序 (lockedPluginOrder)
防止列表跳动</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title purple">SkillConfigScreen (纯局部状态)</div>
          <div class="kn-code">skills: Map&lt;String, SkillPackage&gt;
isLoading / isImporting

导入弹窗状态:
showImportDialog / importTabIndex
repoUrlInput / zipUri
manualSkillId / Description / Content</div>
        </div>
      </div>
    </div>

    <!-- ===== PACKAGES Tab ===== -->
    <div class="section">
      <div class="section-head blue">📦 PACKAGES Tab 详解 <span class="count">按类别分组 + 乐观更新</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title blue">列表结构</div>
          <div class="kn-code">Surface (surfaceVariant) → LazyColumn
└─ [forEach package, 按 category 排序]
   PackageListItemWithTag
   ├─ [首个该类别项] 类别标签
   │   ├─ ToolPkg: 药丸形 Surface
   │   └─ 其他: 竖线 + 文本标签
   └─ Surface (clickable) → Row
       ├─ Icon (20dp, 按类别)
       │   Automatic→AutoMode / Experimental→Science
       │   Draw→Palette / ToolPkg→Apps
       │   Widget→Widgets / Other→Extension
       ├─ Column: displayName + description
       └─ Switch (scale=0.8f)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title green">乐观更新机制</div>
          <div class="kn-body">Switch 切换时先更新 <code style="color:var(--cyan)">visibleImportedPackages</code> 显示即时反馈，后台异步调用实际操作，失败时回滚 UI 状态。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📄</div>
          <div class="kn-title orange">PackageDetailsDialog</div>
          <div class="kn-code">Dialog → Surface (maxHeight=600dp)
├─ Header: 图标 + 名称 + ID + 标签
├─ 描述文本
├─ [ToolPkg 包]
│   ├─ Card: 版本/资源数/UI模块数
│   ├─ ToolPkgPluginConfigCard
│   └─ LazyColumn: 子包列表
├─ [有 States] ScrollableTabRow + ToolCard
├─ [普通包] LazyColumn: ToolCard
└─ ToolCard
    ├─ 工具名 + 描述 + "Run" 按钮
    └─ FlowRow: 参数 Chip (最多3个 + "+N")</div>
        </div>
      </div>
    </div>

    <!-- ===== SKILLS Tab ===== -->
    <div class="section">
      <div class="section-head green">⚡ SKILLS Tab 详解 <span class="count">技能管理 + 3-Tab 导入</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🛠</div>
          <div class="kn-title green">SkillConfigScreen 结构</div>
          <div class="kn-code">Box
├─ Column
│   ├─ Card: "Skills" 标题 + Refresh + 目录路径
│   └─ LazyColumn → SkillListItem
│       └─ Surface (圆角14dp) → Row
│           ├─ 竖线 (primary 色)
│           ├─ Build 图标 (28dp)
│           ├─ Column: 名称 + 描述
│           └─ Switch (AI 可见性)
└─ Column (BottomEnd)
    ├─ SmallFAB: 错误指示器
    ├─ FAB: Store → SkillMarket
    └─ FAB: Add → 导入弹窗</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📥</div>
          <div class="kn-title cyan">导入弹窗 (3 个 Tab)</div>
          <div class="kn-code"><strong>Repo Tab:</strong>
URL 输入框 + 跳转市场链接
→ skillRepository.importSkillFromGitHubRepo(url)

<strong>ZIP Tab:</strong>
路径框 + 文件选择按钮
→ 拷贝 cache → importSkillFromZip(file)

<strong>Direct Tab:</strong>
ID + 描述 + 内容输入 + 附件
→ importSkillFromDirectInput(...)</div>
        </div>
      </div>
    </div>

    <!-- ===== MCP Tab ===== -->
    <div class="section">
      <div class="section-head purple">🔌 MCP Tab 详解 <span class="count">插件管理 + 部署流程 + 4-Tab 导入</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🔌</div>
          <div class="kn-title purple">MCPConfigScreen 结构</div>
          <div class="kn-code">CustomScaffold
├─ FAB Column
│   ├─ FAB: 启动插件服务
│   ├─ FAB: MCP 市场 → MCPMarket
│   └─ FAB: 导入/连接
└─ LazyColumn
    ├─ Card (状态头)
    │   ├─ "MCP Plugins" 标题
    │   └─ 状态点 (颜色) + 计数 "N/M"
    │       全部成功=Green / 部分=Orange
    │       全部失败=Red / 无启用=Gray
    └─ PluginListItem
        ├─ Card: 图标 + 名称 + 状态标签 + Switch
        │   标签: Official/Remote/Deployed/Invalid
        ├─ LazyRow: 工具名 Chip (最多5个 + "+N")
        └─ Row: Deploy/Redeploy + Edit 按钮</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📥</div>
          <div class="kn-title cyan">导入弹窗 (4 个 Tab)</div>
          <div class="kn-code"><strong>Repo Tab:</strong>
GitHub URL 输入
→ viewModel.installServerWithObject(server)

<strong>ZIP Tab:</strong>
路径 + 文件选择
→ viewModel.installServerFromZip(server, zip)

<strong>Remote Tab:</strong>
Endpoint + 连接类型 + Bearer Token + Headers
→ viewModel.addRemoteServer(server)

<strong>Config Tab:</strong>
JSON 多行输入 + 打开文件
→ mcpLocalServer.mergeConfigFromJson(json)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🚀</div>
          <div class="kn-title orange">部署流程</div>
          <div class="kn-code">Deploy 按钮
→ MCPDeployConfirmDialog
  ├─ "Confirm"
  │   → deployViewModel.deployPlugin(pluginId)
  │   → MCPDeployProgressDialog
  └─ "Customize"
      → MCPCommandsEditDialog (编辑启动命令)
      → deployViewModel.deployPluginWithCommands()
      → MCPDeployProgressDialog</div>
        </div>
      </div>
    </div>

    <!-- ===== 对话框清单 ===== -->
    <div class="section">
      <div class="section-head purple">📋 对话框清单 <span class="count">20 (按层分组)</span></div>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">PackageManagerScreen 层</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">PackageDetailsDialog</td><td>点击包列表项</td><td>包详情 + 工具列表 + 运行 + 子包管理</td></tr>
          <tr><td class="mono">ScriptExecutionDialog</td><td>详情内 "Run" 按钮</td><td>工具脚本执行</td></tr>
          <tr><td class="mono">PackageEnvironmentVariablesDialog</td><td>FAB 设置按钮</td><td>环境变量编辑 (按包分组, stickyHeader)</td></tr>
          <tr><td class="mono">PackageLoadErrorsDialog</td><td>FAB 错误指示器</td><td>包加载错误列表</td></tr>
          <tr><td class="mono">ErrorDialog</td><td>导入失败</td><td>通用错误提示</td></tr>
          <tr><td class="mono">SubpackageToolsDialog</td><td>详情内点击子包</td><td>嵌套弹窗：子包工具列表</td></tr>
          <tr><td class="mono">删除确认 AlertDialog</td><td>详情内删除按钮</td><td>确认删除包</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">SkillConfigScreen 层</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">导入弹窗 (3-Tab)</td><td>FAB Add</td><td>Repo / ZIP / Direct 导入表单</td></tr>
          <tr><td class="mono">SkillDetailDialog</td><td>点击技能项</td><td>技能详情 + 目录预览 + Markdown 内容</td></tr>
          <tr><td class="mono">SkillLoadErrorsDialog</td><td>错误 FAB</td><td>技能加载错误列表</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">MCPConfigScreen 层</div>
      <table class="act-table">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">导入弹窗 (4-Tab)</td><td>FAB Import</td><td>Repo / ZIP / Remote / Config 导入</td></tr>
          <tr><td class="mono">MCPServerDetailsDialog</td><td>点击插件项</td><td>插件元数据详情</td></tr>
          <tr><td class="mono">MCPPackageDetailsDialog</td><td>点击工具行</td><td>工具列表详情</td></tr>
          <tr><td class="mono">MCPDeployConfirmDialog</td><td>Deploy 按钮</td><td>部署确认 (Confirm / Customize)</td></tr>
          <tr><td class="mono">MCPCommandsEditDialog</td><td>Customize 按钮</td><td>编辑部署启动命令</td></tr>
          <tr><td class="mono">RemoteServerEditDialog</td><td>Edit 按钮 (远程)</td><td>编辑远程服务器配置</td></tr>
          <tr><td class="mono">MCPDeployProgressDialog</td><td>部署进行中</td><td>部署进度 + 输出日志</td></tr>
          <tr><td class="mono">MCPInstallProgressDialog</td><td>安装进行中</td><td>安装进度</td></tr>
          <tr><td class="mono">FilePickerDialog</td><td>ZIP Tab 文件选择</td><td>文件路径选择</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 交互映射 ===== -->
    <div class="section">
      <div class="section-head orange">⚡ 用户交互 → 动作映射 <span class="count">按 Tab 分组</span></div>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">PACKAGES Tab</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>包项点击</td><td class="mono">打开 PackageDetailsDialog</td></tr>
          <tr><td>Switch 切换</td><td class="mono">乐观更新 → packageManager.importPackage/removePackage</td></tr>
          <tr><td>FAB Add</td><td class="mono">系统文件选择器 → packageManager.importPackageFromExternalStorage</td></tr>
          <tr><td>FAB Settings</td><td class="mono">打开环境变量弹窗</td></tr>
          <tr><td>详情内 Run</td><td class="mono">打开 ScriptExecutionDialog</td></tr>
          <tr><td>详情内 ToolPkg UI</td><td class="mono">跳转 Screen.ToolPkgPluginConfig</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">SKILLS Tab</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>技能项点击</td><td class="mono">加载详情 → 打开 SkillDetailDialog</td></tr>
          <tr><td>Switch 切换</td><td class="mono">skillVisibilityPreferences.setSkillVisibleToAi(name, checked)</td></tr>
          <tr><td>Store FAB</td><td class="mono">跳转 Screen.SkillMarket</td></tr>
          <tr><td>Add FAB</td><td class="mono">打开 3-Tab 导入弹窗</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">MCP Tab</div>
      <table class="act-table">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>插件项点击</td><td class="mono">打开 MCPServerDetailsDialog</td></tr>
          <tr><td>工具行点击</td><td class="mono">打开 MCPPackageDetailsDialog</td></tr>
          <tr><td>Switch 切换</td><td class="mono">mcpLocalServer.setServerEnabled(pluginId, checked)</td></tr>
          <tr><td>Deploy 按钮</td><td class="mono">打开部署确认 → 部署/自定义命令</td></tr>
          <tr><td>Edit 按钮 (远程)</td><td class="mono">打开 RemoteServerEditDialog</td></tr>
          <tr><td>启动 FAB</td><td class="mono">pluginLoadingState.initializeMCPServer(context)</td></tr>
          <tr><td>Market FAB</td><td class="mono">跳转 Screen.MCPMarket</td></tr>
          <tr><td>Import FAB</td><td class="mono">打开 4-Tab 导入弹窗</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 数据模型 ===== -->
    <div class="section">
      <div class="section-head gray">📦 数据模型 <span class="count">工具包 / 技能 / MCP / 市场 四大体系</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📦</div>
          <div class="kn-title blue">工具包系统</div>
          <div class="kn-code">ToolPackage
  name, displayName, description
  category, tools, states, env, isBuiltIn

PackageTool — name, description, script, parameters
EnvVar — name, description, required, defaultValue
ToolResult — 脚本执行结果
ToolPkgContainerDetails — 版本/资源/UI模块/子包</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title green">技能系统</div>
          <div class="kn-code">SkillPackage
  name, description, directory, skillFile

SkillDetailDialogData
  skillContent, directoryPath
  fileCount, directoryPreview</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔌</div>
          <div class="kn-title purple">MCP 系统</div>
          <div class="kn-code">PluginMetadata
  id, name, description, type(local/remote)
  endpoint, connectionType, bearerToken

MCPConfig — mcpServers, pluginMetadata
InstallProgress — sealed: Preparing → Finished
InstallResult — sealed: Success / Error
DeploymentStatus — sealed: NotStarted → Error</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🏪</div>
          <div class="kn-title orange">市场系统 (GitHub Issues)</div>
          <div class="kn-code">GitHubIssue
  id, number, title, body, state, labels, user

GitHubComment — 评论内容
GitHubReaction — content (如 "+1"), user

ViewModel: 350ms 防抖搜索 + 分页 + 缓存</div>
        </div>
      </div>
    </div>

    <!-- ===== 架构要点 ===== -->
    <div class="section">
      <div class="section-head blue">🏗 架构要点</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🚫</div>
          <div class="kn-title orange">无 ViewModel 入口</div>
          <div class="kn-body">PackageManagerScreen 直接使用 <code style="color:var(--cyan)">PackageManager</code> 单例，所有状态为局部 <code style="color:var(--cyan)">remember</code>。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📑</div>
          <div class="kn-title blue">三 Tab 内嵌子屏幕</div>
          <div class="kn-body">SKILLS 和 MCP Tab 各内嵌独立 Composable 子屏幕，拥有各自的状态管理和 ViewModel。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title green">乐观更新</div>
          <div class="kn-body">PACKAGES Tab Switch 先更新 <code style="color:var(--cyan)">visibleImportedPackages</code> 显示即时反馈，后台异步执行，失败时回滚。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔒</div>
          <div class="kn-title purple">插件排序锁定</div>
          <div class="kn-body">MCP Tab 首次工具加载成功后锁定排序 (<code style="color:var(--cyan)">lockedPluginOrder</code>)，防止异步状态更新导致列表跳动。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🏪</div>
          <div class="kn-title cyan">市场 ViewModel 共享</div>
          <div class="kn-body">Skill/MCP 市场 ViewModel 结构一致：GitHub Issues 数据源 + 350ms 防抖搜索 + 分页加载 + 评论/反应缓存。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">♻️</div>
          <div class="kn-title yellow" style="color:var(--yellow)">发布/编辑复用</div>
          <div class="kn-body">SkillPublishScreen 和 MCPPublishScreen 各自通过传入 <code style="color:var(--cyan)">editingIssue</code> 参数复用为编辑页面。</div>
        </div>
      </div>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">17 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径 (相对 ui/features/packages/)</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>PackageManagerScreen</strong></td><td class="mono">screens/PackageManagerScreen.kt</td><td>页面入口，三 Tab 编排</td></tr>
          <tr><td><strong>SkillConfigScreen</strong></td><td class="mono">screens/skill/SkillConfigScreen.kt</td><td>SKILLS Tab 子屏幕</td></tr>
          <tr><td><strong>MCPConfigScreen</strong></td><td class="mono">screens/mcp/MCPConfigScreen.kt</td><td>MCP Tab 子屏幕</td></tr>
          <tr><td><strong>SkillMarketScreen</strong></td><td class="mono">screens/SkillMarketScreen.kt</td><td>技能市场</td></tr>
          <tr><td><strong>MCPMarketScreen</strong></td><td class="mono">screens/MCPMarketScreen.kt</td><td>MCP 市场</td></tr>
          <tr><td><strong>SkillPublishScreen</strong></td><td class="mono">screens/SkillPublishScreen.kt</td><td>技能发布/编辑</td></tr>
          <tr><td><strong>MCPPublishScreen</strong></td><td class="mono">screens/MCPPublishScreen.kt</td><td>MCP 发布/编辑</td></tr>
          <tr><td><strong>SkillManageScreen</strong></td><td class="mono">screens/SkillManageScreen.kt</td><td>技能管理</td></tr>
          <tr><td><strong>MCPManageScreen</strong></td><td class="mono">screens/MCPManageScreen.kt</td><td>MCP 管理</td></tr>
          <tr><td><strong>SkillDetailScreen</strong></td><td class="mono">screens/SkillDetailScreen.kt</td><td>技能详情</td></tr>
          <tr><td><strong>MCPPluginDetailScreen</strong></td><td class="mono">screens/MCPPluginDetailScreen.kt</td><td>MCP 插件详情</td></tr>
          <tr><td><strong>PackageDetailsDialog</strong></td><td class="mono">dialogs/PackageDetailsDialog.kt</td><td>包详情弹窗</td></tr>
          <tr><td><strong>MCPDeployConfirmDialog</strong></td><td class="mono">dialogs/MCPDeployConfirmDialog.kt</td><td>部署确认弹窗</td></tr>
          <tr><td><strong>MCPViewModel</strong></td><td class="mono">screens/mcp/viewmodel/MCPViewModel.kt</td><td>MCP 安装/卸载 ViewModel</td></tr>
          <tr><td><strong>MCPDeployViewModel</strong></td><td class="mono">screens/mcp/viewmodel/MCPDeployViewModel.kt</td><td>MCP 部署 ViewModel</td></tr>
          <tr><td><strong>SkillMarketViewModel</strong></td><td class="mono">screens/skill/viewmodel/SkillMarketViewModel.kt</td><td>技能市场 ViewModel</td></tr>
          <tr><td><strong>MCPMarketViewModel</strong></td><td class="mono">screens/mcp/viewmodel/MCPMarketViewModel.kt</td><td>MCP 市场 ViewModel</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/06_Screen.Packages页面结构.md · PackageManagerScreen 组件结构
    </div>`);
