registerDetail('mcpmanage', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">424</span><span class="stat-label">MCPManage 行数</span></div>
      <div class="stat-item"><span class="stat-num">347</span><span class="stat-label">MCPPublish 行数</span></div>
      <div class="stat-item"><span class="stat-num">1904</span><span class="stat-label">MCPConfig 行数</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">导入模式</span></div>
      <div class="stat-item"><span class="stat-num">9</span><span class="stat-label">对话框</span></div>
    </div>

    <!-- 页面关系 -->
    <div class="section-head blue">页面关系总览</div>
    <div class="mermaid">
graph LR
    PKG["Screen.Packages&lt;br/&gt;(MCP Tab)"]
    PKG --> CONFIG["MCPConfigScreen&lt;br/&gt;(本地已安装管理)"]
    PKG --> MARKET["Screen.MCPMarket&lt;br/&gt;(市场)"]
    MARKET --> MANAGE["MCPManageScreen&lt;br/&gt;(管理我的发布)"]
    MANAGE --> PUBLISH["MCPPublishScreen&lt;br/&gt;(发布新/编辑)"]
    MARKET --> PUBLISH2["MCPPublishScreen&lt;br/&gt;(发布新)"]
    </div>
    <table class="act-table" style="margin-top:12px;">
      <tr><th>页面</th><th>主要关注点</th><th>数据源</th></tr>
      <tr><td>MCPConfigScreen</td><td>本地已安装/已配置的 MCP 服务器</td><td>MCPLocalServer + MCPRepository</td></tr>
      <tr><td>MCPManageScreen</td><td>自己发布在 GitHub 的 MCP 插件</td><td>MCPMarketViewModel.userPublishedPlugins</td></tr>
      <tr><td>MCPPublishScreen</td><td>提交/更新 GitHub Issue</td><td>MCPMarketViewModel.publishMCP/updatePublishedPlugin</td></tr>
    </table>

    <!-- MCPManageScreen -->
    <div class="section-head green" style="margin-top:24px;">MCPManageScreen — 管理已发布插件</div>

    <div class="mermaid">
graph TD
    ROOT["MCPManageScreen&lt;br/&gt;(CustomScaffold)"]
    ROOT --> FAB["[已登录] FAB: Add → onNavigateToPublish"]
    ROOT --> BODY["Column (fillMaxSize, padding 16dp)"]
    BODY --> NOT_LOGIN["[未登录] Card errorContainer&lt;br/&gt;图标 + 提示 + 登录按钮"]
    BODY --> ERROR["errorMessage Card"]
    BODY --> LOADING["[加载中] CircularProgressIndicator + Text"]
    BODY --> EMPTY["[空列表] Card 暂无插件提示"]
    BODY --> LIST["LazyColumn → PluginManageCard × N"]
    ROOT --> DELETE_DLG["AlertDialog: 删除确认"]
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">PluginManageCard 结构</div>
    <div class="tree" style="margin:12px 0;">
      <div class="tree-node">Card (背景: open→surface / closed→surfaceVariant 50%)</div>
      <div class="tree-children">
        <div class="tree-node">Column (padding 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Row (SpaceBetween)</div>
          <div class="tree-children">
            <div class="tree-node">Column (weight=1f) → title (bold, 2行) + Row[Icon + 状态文字]</div>
            <div class="tree-node">Surface (secondaryContainer) → #${issue.number}</div>
          </div>
          <div class="tree-node">[描述非空] Text (前150字符)</div>
          <div class="tree-node">[有标签] LazyRow (取前3个 label Surface)</div>
          <div class="tree-node">Row 按钮区</div>
          <div class="tree-children">
            <div class="tree-node">OutlinedButton "编辑" → onEdit</div>
            <div class="tree-node">[isOpen] OutlinedButton "移除"(error色) → showDeleteDialog</div>
            <div class="tree-node">[closed] Button "重新发布" → reopenPublishedPlugin</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">交互流程</div>
    <div class="flow" style="margin:8px 0;">
      <span class="flow-step">LaunchedEffect</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">isLoggedIn?</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">loadUserPublishedPlugins()</span>
    </div>
    <table class="act-table">
      <tr><th>操作</th><th>行为</th></tr>
      <tr><td>FAB 点击</td><td>onNavigateToPublish() → MCPPublishScreen(editingIssue=null)</td></tr>
      <tr><td>卡片"编辑"</td><td>onNavigateToEdit(plugin) → MCPPublishScreen(editingIssue=plugin)</td></tr>
      <tr><td>卡片"移除"确认</td><td>deletePublishedPlugin(number, title) (关闭 Issue)</td></tr>
      <tr><td>卡片"重新发布"</td><td>reopenPublishedPlugin(number, title) (重开 Issue)</td></tr>
    </table>

    <!-- MCPPublishScreen -->
    <div class="section-head orange" style="margin-top:24px;">MCPPublishScreen — 发布/编辑插件</div>

    <p style="margin:8px 0;font-size:13px;">双模式：<code>editingIssue != null</code> 为编辑模式，否则为新建模式。影响表单初始值、草稿自动保存、按钮文字和成功后行为（编辑不清草稿）。</p>

    <table class="act-table" style="margin:12px 0;">
      <tr><th>字段</th><th>类型</th><th>验证</th></tr>
      <tr><td>title（插件名称）</td><td>singleLine TextField</td><td>仅字母/数字/下划线（实时过滤），不能为空</td></tr>
      <tr><td>description（描述）</td><td>minLines=3 TextField</td><td>不能为空</td></tr>
      <tr><td>repositoryUrl</td><td>singleLine TextField</td><td>不能为空</td></tr>
      <tr><td>installConfig（安装配置）</td><td>minLines=3 + Terminal 图标</td><td>选填，MCP JSON 安装命令</td></tr>
    </table>

    <div class="mermaid">
graph TD
    ROOT["MCPPublishScreen&lt;br/&gt;(Column + verticalScroll)"]
    ROOT --> INFO_CARD["信息提示 Card (primaryContainer 30%)&lt;br/&gt;图标 + 标题 + 说明"]
    ROOT --> FIELDS["表单字段 × 4 OutlinedTextField"]
    ROOT --> ERROR_CARD["[errorMessage] Card errorContainer"]
    ROOT --> SUBMIT_BTN["Button: 发布到市场 / 更新插件"]
    ROOT --> CANCEL_BTN["OutlinedButton: 取消"]
    ROOT --> CONFIRM_DLG["AlertDialog: 确认发布/更新&lt;br/&gt;含字段预览 + 红色警告文字"]
    ROOT --> SUCCESS_DLG["AlertDialog: 成功 → onNavigateBack"]
    </div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">提交流程</div>
    <div class="flow" style="margin:8px 0;flex-wrap:wrap;gap:4px;">
      <span class="flow-step">Button.onClick</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">字段非空校验</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">showConfirmationDialog</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">confirm</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">[编辑] updatePublishedPlugin / [新建] publishMCP</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">showSuccessDialog</span>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">版本固定为 v1，tags/category 已移除（代码中保留空字符串兼容）</p>

    <!-- MCPConfigScreen -->
    <div class="section-head purple" style="margin-top:24px;">MCPConfigScreen — 本地 MCP 插件配置管理</div>

    <p style="margin:8px 0;font-size:13px;">Packages MCP Tab 的主管理界面，负责本地已安装/已配置 MCP 服务器的查看、启用/禁用、部署、导入和删除。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">关键依赖</div>
    <table class="act-table">
      <tr><th>组件</th><th>职责</th></tr>
      <tr><td>MCPLocalServer</td><td>MCP 配置读写（mcpConfig Flow）、服务器启停状态</td></tr>
      <tr><td>MCPRepository</td><td>已安装插件列表（installedPluginIds）、插件元数据</td></tr>
      <tr><td>MCPViewModel</td><td>安装/卸载/添加远程服务</td></tr>
      <tr><td>MCPDeployViewModel</td><td>部署命令生成与执行</td></tr>
      <tr><td>MCPBridgeClient</td><td>运行时查询每个插件已加载的工具列表</td></tr>
      <tr><td>LocalPluginLoadingState</td><td>全局插件加载进度（Composition Local）</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">插件可见集合逻辑</div>
    <div class="code-block" style="margin:8px 0;">
configuredPluginIds  = mcpConfig.mcpServers.keys
remotePluginIds      = mcpConfig.pluginMetadata where type=="remote"
discoveredInstalledPluginIds  = MCPRepository.installedPluginIds

visiblePluginIds = configuredPluginIds ∪ remotePluginIds ∪ discoveredInstalledPluginIds
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["MCPConfigScreen&lt;br/&gt;(CustomScaffold)"]
    ROOT --> FAB_COL["Column FAB × 3"]
    FAB_COL --> FAB_START["FAB PlayArrow&lt;br/&gt;secondaryContainer&lt;br/&gt;批量启动插件"]
    FAB_COL --> FAB_MARKET["FAB Store&lt;br/&gt;tertiaryContainer&lt;br/&gt;跳转市场"]
    FAB_COL --> FAB_IMPORT["FAB Add&lt;br/&gt;primaryContainer&lt;br/&gt;打开导入对话框"]
    ROOT --> CONTENT["Box (fillMaxSize)"]
    CONTENT --> LOADING_BOX["[isEmptyLoading] CircularProgressIndicator"]
    CONTENT --> MAIN["LazyColumn (bottom padding 200dp)"]
    MAIN --> STATUS_CARD["状态卡片&lt;br/&gt;MCP管理 + 运行统计圆点"]
    MAIN --> PLUGIN_ITEMS["PluginListItem × N"]
    MAIN --> EMPTY_STATE["[无插件] 空状态 Card"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">PluginListItem 结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (clickable → MCPServerDetailsDialog)</div>
      <div class="tree-children">
        <div class="tree-node">Column (padding 12dp)</div>
        <div class="tree-children">
          <div class="tree-node">Row 主信息行</div>
          <div class="tree-children">
            <div class="tree-node">Box 28dp 圆角6dp (Extension 图标 + [isRunning] 绿点)</div>
            <div class="tree-node">Column (weight=1f): 名称 + 状态标签 [official/remote/deployed/config_invalid]</div>
            <div class="tree-node">Switch (0.8f scale) — 启用/禁用</div>
          </div>
          <div class="tree-node">[toolNames非空] Box (LazyRow 工具芯片 最多5个 + "+N" + ArrowForward)</div>
          <div class="tree-node">Row 操作按钮</div>
          <div class="tree-children">
            <div class="tree-node">[非远程] OutlinedButton "部署"/"重新部署"</div>
            <div class="tree-node">OutlinedButton "编辑"</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">导入对话框（4 Tab）</div>
    <div class="mermaid">
graph TD
    DLG["AlertDialog: 导入/连接 MCP 服务"]
    DLG --> TABS["ScrollableTabRow (4个Tab)"]
    TABS --> T0["Tab 0: 从仓库导入&lt;br/&gt;仓库URL + 插件名称"]
    TABS --> T1["Tab 1: 从压缩包导入&lt;br/&gt;文件选择 + 插件名称"]
    TABS --> T2["Tab 2: 连接远程服务&lt;br/&gt;Host + 连接类型(httpStream/sse)&lt;br/&gt;Bearer Token + Headers编辑器"]
    TABS --> T3["Tab 3: MCP配置导入&lt;br/&gt;粘贴JSON (height=180dp)&lt;br/&gt;打开配置文件按钮"]
    </div>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>Tab</th><th>后端操作</th></tr>
      <tr><td>0 仓库导入</td><td>viewModel.installServerWithObject(server)</td></tr>
      <tr><td>1 压缩包导入</td><td>viewModel.installServerFromZip(server, zipPath)</td></tr>
      <tr><td>2 远程服务</td><td>viewModel.addRemoteServer(server)</td></tr>
      <tr><td>3 配置 JSON</td><td>mcpLocalServer.mergeConfigFromJson(json)</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">导入后调用 awaitPluginVisible(importId) 等待插件出现（超时 20s）</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">对话框汇总</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发条件</th><th>组件</th></tr>
      <tr><td>插件详情（含配置编辑）</td><td>点击插件卡片</td><td>MCPServerDetailsDialog</td></tr>
      <tr><td>工具详情</td><td>点击工具标签区域</td><td>MCPPackageDetailsDialog</td></tr>
      <tr><td>部署确认</td><td>点击"部署"按钮</td><td>MCPDeployConfirmDialog</td></tr>
      <tr><td>命令编辑</td><td>选择"自定义"</td><td>MCPCommandsEditDialog</td></tr>
      <tr><td>部署进度</td><td>部署执行中</td><td>MCPDeployProgressDialog</td></tr>
      <tr><td>安装进度</td><td>安装/卸载中</td><td>MCPInstallProgressDialog</td></tr>
      <tr><td>导入插件</td><td>FAB Import</td><td>AlertDialog (4 Tab 内联)</td></tr>
      <tr><td>文件选择</td><td>Tab1 Folder 按钮</td><td>AlertDialog + 系统文件选择器</td></tr>
      <tr><td>远程服务编辑</td><td>列表项"编辑"按钮</td><td>RemoteServerEditDialog</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">运行状态指示（状态卡片圆点颜色）</div>
    <table class="act-table">
      <tr><th>颜色</th><th>条件</th></tr>
      <tr><td>灰色</td><td>totalEnabledPlugins == 0</td></tr>
      <tr><td>绿色</td><td>successfulToolRequests == totalEnabledPlugins</td></tr>
      <tr><td>橙色</td><td>successfulToolRequests &gt; 0（部分成功）</td></tr>
      <tr><td>红色</td><td>其他（已启用但无工具响应）</td></tr>
    </table>
`);
