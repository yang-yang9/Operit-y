registerDetail('mcpmarket', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">832+724</span><span class="stat-label">页面行数</span></div>
      <div class="stat-item"><span class="stat-num">1574</span><span class="stat-label">ViewModel</span></div>
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">安装路径</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">部署组件</span></div>
    </div>

    <!-- 导航关系 -->
    <div class="section-head blue">导航关系</div>
    <div class="mermaid">
graph TD
    PKG["Screen.Packages&lt;br/&gt;(MCP Tab)"]
    PKG --> MARKET["Screen.MCPMarket&lt;br/&gt;(市场入口)"]
    MARKET --> PUBLISH["Screen.MCPPublish&lt;br/&gt;(发布)"]
    MARKET --> MANAGE["Screen.MCPManage&lt;br/&gt;(管理)"]
    MANAGE --> EDIT["Screen.MCPEditPlugin(issue)&lt;br/&gt;(编辑)"]
    MARKET --> DETAIL["Screen.MCPPluginDetail(issue)&lt;br/&gt;(详情, parentScreen=Packages)"]
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">注：MCPPluginDetail 的 parentScreen = Packages（非 MCPMarket），返回键直接回 Packages。数据源：GitHub Issues (仓库 AAswordman/OperitMCPMarket，标签 mcp-plugin)</p>

    <!-- 与 SkillMarket 对比 -->
    <div class="section-head green">与 SkillMarketViewModel 对比</div>
    <table class="act-table">
      <tr><th>维度</th><th>MCPMarketViewModel</th><th>SkillMarketViewModel</th></tr>
      <tr><td>行数</td><td>1574</td><td>922</td></tr>
      <tr><td>安装进度</td><td>Map&lt;String, InstallProgress&gt;</td><td>无（仅 installing Set）</td></tr>
      <tr><td>安装路径</td><td>双路径（配置合并 / 物理安装）</td><td>单路径</td></tr>
      <tr><td>头像持久化</td><td>SharedPreferences (上限500条)</td><td>仅内存</td></tr>
      <tr><td>草稿字段</td><td>6 个（含 installConfig, tags, category）</td><td>3 个</td></tr>
    </table>

    <!-- 双路径安装 -->
    <div class="section-head orange">双路径安装流程</div>
    <div class="flow" style="margin-bottom:8px;">
      <span class="flow-step">installMCPFromIssue(issue)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">解析 InstallationInfo</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">checkConfigNeedsPhysicalInstallation()</span>
    </div>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>路径</th><th>条件</th><th>流程</th></tr>
      <tr><td>配置合并</td><td>npx/uvx 等无需物理安装</td><td>MCPLocalServer.mergeConfigFromJson() → 直接合并配置</td></tr>
      <tr><td>物理安装</td><td>需下载代码</td><td>mcpRepository.installMCPServerWithObject() → 实时更新 installProgress (Downloading X% / Extracting / ...)</td></tr>
    </table>

    <!-- MCPMarketScreen -->
    <div class="section-head purple">MCPMarketScreen（浏览 + 我的）</div>
    <div class="mermaid">
graph TD
    ROOT["MCPMarketScreen&lt;br/&gt;(Column)"]

    ROOT --> HEADER["Surface (header, 4dp shadow)"]
    HEADER --> BANNER["[!isLoggedIn] 登录提示横幅"]
    HEADER --> TABS["TabRow: Browse / My"]

    ROOT --> CONTENT["Box (weight=1f)"]
    CONTENT --> BROWSE["MCPBrowseTab"]
    CONTENT --> MY["MCPMyTab"]

    BROWSE --> SEARCH["OutlinedTextField (搜索栏)"]
    BROWSE --> LIST["LazyColumn"]
    LIST --> CARDS["MCPIssueCard (per issue)"]
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);"><strong>MCPIssueCard 与 SkillIssueCard 差异：</strong>安装中状态区分 Downloading(确定进度) / Extracting / 其他（SkillIssueCard 只有不确定进度条）。安装按钮颜色：已安装=secondaryContainer，安装中=primaryContainer，可用=primary，关闭=surfaceVariant。</p>

    <!-- MCPPluginDetailScreen -->
    <div class="section-head blue">MCPPluginDetailScreen（插件详情）</div>
    <div class="mermaid">
graph TD
    DETAIL["MCPPluginDetailScreen&lt;br/&gt;(CustomScaffold)"]

    DETAIL --> FAB["[已登录] FAB: AddComment"]
    DETAIL --> LIST["LazyColumn (16dp/24dp padding, 20dp spacing)"]

    LIST --> HEADER["PluginHeader&lt;br/&gt;标题 + 仓库作者 + 分享者"]
    LIST --> ACTIONS["PluginActions&lt;br/&gt;安装按钮 + 仓库链接"]
    LIST --> DESC["PluginDescription&lt;br/&gt;完整描述"]
    LIST --> META["PluginMetadata&lt;br/&gt;FlowRow: 状态/已安装/Stars/日期"]
    LIST --> REACTIONS["PluginReactions&lt;br/&gt;👍 + ❤️ ReactionButton"]
    LIST --> DIVIDER["HorizontalDivider"]
    LIST --> COMMENTS_H["CommentsHeader&lt;br/&gt;评论数 + 刷新"]
    LIST --> COMMENTS["CommentCard (per comment)"]
    </div>

    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);"><strong>PluginActions 安装状态：</strong>[已安装] Button(disabled, Check) | [Downloading] Button("Downloading X%") | [Extracting] Button("Extracting...") | [安装中] Button("Installing...") | [可安装] Button(Download, "Install")</p>

    <!-- 部署相关组件 -->
    <div class="section-head green">部署相关组件（MCPManageScreen 使用）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">由 MCPDeployViewModel (255行) 驱动。双插件类型处理：virtual:// 路径 → 直接部署（空命令），常规路径 → MCPDeployer.getDeployCommands() → deployPluginWithCommands()</p>
    <table class="act-table">
      <tr><th>组件</th><th>行数</th><th>功能</th></tr>
      <tr><td>MCPDeployConfirmDialog</td><td>115</td><td>三按钮 Dialog：Cancel / Custom Command / Direct Deploy</td></tr>
      <tr><td>MCPDeployProgressDialog</td><td>290</td><td>不可中途关闭的进度对话框 + 日志区域 + 内嵌环境变量编辑</td></tr>
      <tr><td>MCPCommandsEditDialog</td><td>246</td><td>可编辑命令对话框（Monospace 13sp）</td></tr>
      <tr><td>MCPEnvironmentVariablesDialog</td><td>144</td><td>环境变量管理（现有列表+新增输入）</td></tr>
    </table>

    <!-- 对话框清单 -->
    <div class="section-head orange">对话框清单 (6个)</div>
    <table class="act-table">
      <tr><th>对话框</th><th>所在组件</th><th>触发</th></tr>
      <tr><td>GitHubLoginDialog</td><td>MCPMarketScreen</td><td>登录横幅/按钮</td></tr>
      <tr><td>CommentInputDialog</td><td>MCPPluginDetailScreen</td><td>FAB 点击</td></tr>
      <tr><td>MCPDeployConfirmDialog</td><td>MCPManageScreen</td><td>部署按钮</td></tr>
      <tr><td>MCPDeployProgressDialog</td><td>MCPManageScreen</td><td>确认部署后</td></tr>
      <tr><td>MCPCommandsEditDialog</td><td>MCPManageScreen</td><td>"Custom Command"按钮</td></tr>
      <tr><td>MCPEnvironmentVariablesDialog</td><td>MCPDeployProgressDialog</td><td>设置图标</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title blue">双路径安装</div>
        <div class="kn-body">npx/uvx 类插件只需合并 JSON 配置（mergeConfigFromJson），无需下载文件；其他插件走物理安装流程，有确定性进度追踪。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📊</div>
        <div class="kn-title green">InstallProgress 精细追踪</div>
        <div class="kn-body">相比 Skill 市场的二态，MCP 市场追踪下载百分比、解压状态等，卡片和详情页实时显示不同阶段文案。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🖼</div>
        <div class="kn-title orange">头像持久化缓存</div>
        <div class="kn-body">SharedPreferences("github_avatar_cache") 持久化头像 URL，超过 500 条自动清理一半（LRU 策略缺失，直接删半）。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🚀</div>
        <div class="kn-title purple">部署流程分离</div>
        <div class="kn-body">MCPDeployViewModel 独立于 MCPMarketViewModel，专门处理已安装插件的部署命令生成和执行，支持自定义命令和环境变量。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>MCPMarketScreen.kt</td><td>832</td><td>市场入口 (Browse + My)</td></tr>
      <tr><td>MCPPluginDetailScreen.kt</td><td>724</td><td>插件详情 + 反应 + 评论</td></tr>
      <tr><td>MCPMarketViewModel.kt</td><td>1574</td><td>市场 ViewModel</td></tr>
      <tr><td>MCPDeployViewModel.kt</td><td>255</td><td>部署流程 ViewModel</td></tr>
      <tr><td>MCPPluginParser.kt</td><td>196</td><td>Issue body 解析</td></tr>
      <tr><td>MCPDeployConfirmDialog.kt</td><td>115</td><td>部署确认</td></tr>
      <tr><td>MCPDeployProgressDialog.kt</td><td>290</td><td>部署进度 + 日志</td></tr>
      <tr><td>MCPCommandsEditDialog.kt</td><td>246</td><td>命令编辑</td></tr>
      <tr><td>MCPEnvironmentVariablesDialog.kt</td><td>144</td><td>环境变量管理</td></tr>
    </table>
`);
