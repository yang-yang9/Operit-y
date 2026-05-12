registerDetail('filemanager', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">13</span><span class="stat-label">源码文件</span></div>
      <div class="stat-item"><span class="stat-num">~3533</span><span class="stat-label">总行数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">文件环境</span></div>
      <div class="stat-item"><span class="stat-num">9</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">11</span><span class="stat-label">AI 工具</span></div>
    </div>

    <!-- 入口链路 -->
    <div class="section-head blue">入口链路</div>
    <div class="flow">
      <span class="flow-step">NavItem.Toolbox</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.Toolbox</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">onFileManagerSelected</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.FileManager</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">FileManagerToolScreen</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">FileManagerScreen()</span>
    </div>

    <!-- 导航属性 -->
    <table class="act-table" style="margin-top:16px;">
      <tr><th>属性</th><th>值</th></tr>
      <tr><td>parentScreen</td><td>Toolbox</td></tr>
      <tr><td>navItem</td><td>NavItem.Toolbox</td></tr>
      <tr><td>参数</td><td>无</td></tr>
      <tr><td>子页面</td><td>无</td></tr>
    </table>

    <!-- 组件树 Mermaid -->
    <div class="section-head purple">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["FileManagerScreen&lt;br/&gt;(Box fillMaxSize)"]

    ROOT --> MAIN["Column (fillMaxSize)"]
    ROOT --> OVERLAY["LoadingOverlay (z-layer)"]
    ROOT --> DIALOGS["Dialog Layer"]

    MAIN --> TOOLBAR["FileManagerToolbar&lt;br/&gt;(水平滚动图标行)"]
    MAIN --> TABS["FileManagerTabRow&lt;br/&gt;(ScrollableTabRow + 新增Tab)"]
    MAIN --> PATH["PathNavigationBar&lt;br/&gt;(可编辑路径栏)"]
    MAIN --> QUICK["LazyRow (快速访问)"]
    QUICK --> Q_LINUX["QuickAccessChip: Linux"]
    QUICK --> Q_SD["QuickAccessChip: SDCard"]
    QUICK --> Q_WS["QuickAccessChip: Workspace"]
    QUICK --> Q_SAF["QuickAccessChipWithLongPress&lt;br/&gt;(SAF 书签, 长按删除)"]
    QUICK --> Q_ADD["QuickAccessChip: + (添加 SAF 仓库)"]
    MAIN --> CONTENT["Surface (weight=1f)&lt;br/&gt;FileListContent"]
    MAIN --> STATUS["StatusBar"]

    DIALOGS --> DLG_SEARCH["SearchDialog"]
    DIALOGS --> DLG_RESULTS["SearchResultsDialog"]
    DIALOGS --> DLG_FOLDER["NewFolderDialog"]
    DIALOGS --> DLG_BOOKMARK["AlertDialog (SAF 书签命名)"]
    DIALOGS --> BOTTOM_SHEET["FileContextMenu&lt;br/&gt;(ModalBottomSheet)"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head green">状态管理 (FileManagerViewModel)</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">手动 remember { FileManagerViewModel(context) } 创建，非 Hilt/ViewModelProvider 注入。生命周期绑定到 Composable 的 remembered 状态。</p>

    <table class="act-table">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>currentPath</td><td>String (mutableStateOf)</td><td>当前浏览路径，默认 /sdcard</td></tr>
      <tr><td>currentEnvironment</td><td>String?</td><td>执行环境：null=Android FS, "linux"=Linux, "repo:&lt;name&gt;"=SAF</td></tr>
      <tr><td>files</td><td>mutableStateListOf&lt;FileItem&gt;</td><td>当前目录文件列表（含 .. 返回项）</td></tr>
      <tr><td>isLoading</td><td>Boolean</td><td>加载指示器</td></tr>
      <tr><td>selectedFile / selectedFiles</td><td>FileItem? / List</td><td>单选/多选模式选中文件</td></tr>
      <tr><td>isMultiSelectMode</td><td>Boolean</td><td>是否多选模式</td></tr>
      <tr><td>clipboardFiles</td><td>mutableStateListOf</td><td>剪贴板文件列表</td></tr>
      <tr><td>isCutOperation</td><td>Boolean</td><td>剪贴板是剪切还是复制</td></tr>
      <tr><td>itemSize</td><td>Float (0.5f~1.3f)</td><td>列表项缩放因子</td></tr>
      <tr><td>displayMode</td><td>DisplayMode</td><td>单列/双列/三列</td></tr>
      <tr><td>tabs / activeTabIndex</td><td>List&lt;TabItem&gt; / Int</td><td>浏览器标签页</td></tr>
      <tr><td>searchQuery / searchResults</td><td>String / List</td><td>搜索关键词与结果</td></tr>
    </table>

    <!-- 多环境系统 -->
    <div class="section-head orange">多环境系统</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">通过 currentEnvironment 字符串路由到不同的文件系统后端，所有 AI 工具调用自动追加 environment 参数。</p>
    <table class="act-table">
      <tr><th>环境</th><th>currentEnvironment 值</th><th>说明</th></tr>
      <tr><td>Android FS</td><td>null</td><td>标准 Android 文件系统访问</td></tr>
      <tr><td>Linux Shell</td><td>"linux"</td><td>通过 Linux Shell 环境执行文件操作</td></tr>
      <tr><td>SAF 仓库</td><td>"repo:&lt;name&gt;"</td><td>Storage Access Framework 提供的外部存储</td></tr>
    </table>

    <!-- 工具栏 -->
    <div class="section-head blue">工具栏与导航</div>
    <div class="section-head" style="background:rgba(31,111,235,0.08);border-left-color:#58A6FF;font-size:13px;">FileManagerToolbar（水平可滚动 IconButton 行）</div>
    <table class="act-table">
      <tr><th>按钮</th><th>图标</th><th>动作</th></tr>
      <tr><td>返回</td><td>ArrowBack</td><td>navigateUp()</td></tr>
      <tr><td>前进</td><td>ArrowForward</td><td>无操作（预留）</td></tr>
      <tr><td>上级</td><td>ArrowUpward</td><td>navigateUp()</td></tr>
      <tr><td>刷新</td><td>Refresh</td><td>loadCurrentDirectory()</td></tr>
      <tr><td>缩小/放大</td><td>ZoomOut/ZoomIn</td><td>itemSize ± 0.1f (范围 0.5f~1.3f)</td></tr>
      <tr><td>多选</td><td>CheckBox</td><td>切换 isMultiSelectMode</td></tr>
      <tr><td>粘贴</td><td>ContentPaste</td><td>pasteFiles() (剪贴板空时禁用)</td></tr>
      <tr><td>显示模式</td><td>ViewModule/Column/Grid</td><td>循环 SINGLE → TWO → THREE</td></tr>
      <tr><td>搜索</td><td>Search</td><td>打开 SearchDialog</td></tr>
      <tr><td>新建文件夹</td><td>CreateNewFolder</td><td>打开 NewFolderDialog</td></tr>
    </table>

    <p style="margin:12px 0 4px 4px;font-size:13px;color:var(--text-dim);"><strong>PathNavigationBar：</strong>双模式路径栏 — 显示模式点击切换为编辑模式，TextField + IME Done 键提交导航</p>
    <p style="margin:4px 0 4px 4px;font-size:13px;color:var(--text-dim);"><strong>FileManagerTabRow：</strong>ScrollableTabRow + 右侧新增 Tab 按钮，Tab > 1 时显示关闭按钮</p>

    <!-- 文件列表 -->
    <div class="section-head green">文件列表</div>
    <table class="act-table">
      <tr><th>显示模式</th><th>布局</th></tr>
      <tr><td>SINGLE_COLUMN</td><td>LazyColumn 每行一个 FileListItem</td></tr>
      <tr><td>TWO_COLUMNS</td><td>每行 Row { Box(weight=1f) × 2 }</td></tr>
      <tr><td>THREE_COLUMNS</td><td>每行 Row { Box(weight=1f) × 3 }</td></tr>
    </table>
    <p style="margin:8px 0 4px 4px;font-size:12px;color:var(--text-dim);">FileListItem：Row(combinedClickable) → Surface(图标容器) + Column(文件名+大小+日期)。所有尺寸基于 displayMode 计算后再乘以 itemSize 缩放因子。</p>

    <!-- 文件操作菜单 -->
    <div class="section-head orange">文件操作菜单 (FileContextMenu · 814行)</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">最复杂的组件，ModalBottomSheet 包含所有文件操作逻辑。</p>
    <table class="act-table">
      <tr><th>操作</th><th>单选</th><th>多选</th><th>AI 工具</th></tr>
      <tr><td>打开</td><td>✓</td><td>—</td><td>open_file</td></tr>
      <tr><td>复制</td><td>✓</td><td>✓</td><td>— (写入剪贴板)</td></tr>
      <tr><td>剪切</td><td>✓</td><td>✓</td><td>— (写入剪贴板)</td></tr>
      <tr><td>粘贴</td><td>✓</td><td>✓</td><td>copy_file + delete_file(剪切)</td></tr>
      <tr><td>分享</td><td>✓</td><td>—</td><td>share_file</td></tr>
      <tr><td>重命名</td><td>✓</td><td>—</td><td>move_file</td></tr>
      <tr><td>批量重命名</td><td>—</td><td>✓</td><td>move_file × N</td></tr>
      <tr><td>压缩</td><td>—</td><td>✓</td><td>zip_files</td></tr>
      <tr><td>解压</td><td>✓(.zip)</td><td>—</td><td>unzip_files</td></tr>
      <tr><td>删除</td><td>✓</td><td>✓</td><td>delete_file</td></tr>
    </table>

    <!-- 搜索功能 -->
    <div class="section-head blue">搜索功能</div>
    <div class="flow" style="margin-bottom:12px;">
      <span class="flow-step">SearchDialog</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">searchFiles(query)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AITool "find_files"</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">forEach: "file_info"</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">SearchResultsDialog</span>
    </div>
    <p style="margin:0 0 4px 4px;font-size:12px;color:var(--text-dim);">SearchDialog 字段：搜索关键词(OutlinedTextField) + 区分大小写(Checkbox) + 通配符模式(Checkbox, 默认开启自动包裹 *query*)</p>

    <!-- SAF 书签系统 -->
    <div class="section-head purple">SAF 书签系统</div>
    <div class="flow" style="margin-bottom:8px;">
      <span class="flow-step">点击 "+" Chip</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">OpenDocumentTree</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">获取持久化权限</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">书签命名对话框</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">保存到 DataStore</span>
    </div>
    <p style="margin:0 0 4px 4px;font-size:12px;color:var(--text-dim);">书签 Chip 交互：点击 → navigateToPath("/", "repo:&lt;name&gt;")，长按 → DropdownMenu 删除书签</p>

    <!-- AI 工具接口 -->
    <div class="section-head green">AI 工具接口</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">FileManager 通过 AIToolHandler.executeTool() 执行所有文件系统操作：</p>
    <table class="act-table">
      <tr><th>工具名</th><th>触发</th><th>参数</th></tr>
      <tr><td>list_files</td><td>加载目录</td><td>path, environment?</td></tr>
      <tr><td>find_files</td><td>搜索文件</td><td>path, pattern, case_sensitive, environment?</td></tr>
      <tr><td>file_info</td><td>搜索结果类型判断</td><td>path, environment?</td></tr>
      <tr><td>make_directory</td><td>新建文件夹</td><td>path, environment?</td></tr>
      <tr><td>copy_file</td><td>粘贴(复制)</td><td>source, destination, environment?</td></tr>
      <tr><td>delete_file</td><td>删除</td><td>path, recursive?, environment?</td></tr>
      <tr><td>move_file</td><td>重命名/批量重命名</td><td>source, destination, environment?</td></tr>
      <tr><td>open_file</td><td>打开文件</td><td>path, environment?</td></tr>
      <tr><td>share_file</td><td>分享文件</td><td>path, environment?</td></tr>
      <tr><td>zip_files</td><td>压缩</td><td>source(逗号分隔), destination, environment?</td></tr>
      <tr><td>unzip_files</td><td>解压</td><td>source, destination, environment?</td></tr>
    </table>

    <!-- 对话框清单 -->
    <div class="section-head orange">对话框清单 (9个)</div>
    <table class="act-table">
      <tr><th>对话框</th><th>来源组件</th><th>触发</th></tr>
      <tr><td>SearchDialog</td><td>SearchDialogs.kt</td><td>工具栏搜索按钮</td></tr>
      <tr><td>SearchResultsDialog</td><td>SearchDialogs.kt</td><td>搜索完成</td></tr>
      <tr><td>NewFolderDialog</td><td>NewFolderDialog.kt</td><td>工具栏新建文件夹</td></tr>
      <tr><td>SAF 书签命名</td><td>FileManagerScreen</td><td>SAF 目录选择完成</td></tr>
      <tr><td>重命名</td><td>FileContextMenu</td><td>单选 → Rename</td></tr>
      <tr><td>批量重命名</td><td>FileContextMenu</td><td>多选 → Rename</td></tr>
      <tr><td>压缩</td><td>FileContextMenu</td><td>多选 → Compress</td></tr>
      <tr><td>删除确认</td><td>FileContextMenu</td><td>Delete</td></tr>
      <tr><td>解压确认</td><td>FileContextMenu</td><td>单选(.zip) → Extract</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🏗</div>
        <div class="kn-title orange">手动 ViewModel</div>
        <div class="kn-body">remember { FileManagerViewModel(context) } 而非 viewModel() 或 Hilt 注入，生命周期绑定 Composable。离开 Composition 后回收。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title blue">多环境路由</div>
        <div class="kn-body">currentEnvironment 字符串作为路由键，null / "linux" / "repo:&lt;name&gt;" 三种值对应不同后端。withEnvParams() 自动附加环境参数。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📦</div>
        <div class="kn-title green">FileContextMenu 自包含</div>
        <div class="kn-body">文件操作的业务逻辑在 FileContextMenu 内以 local 函数形式实现（814行），不在 ViewModel 中。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔧</div>
        <div class="kn-title purple">AI 工具统一接口</div>
        <div class="kn-body">所有文件操作通过 AIToolHandler.executeTool(AITool(...)) 执行，不直接访问 java.io.File。工具层自动处理环境路由。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>FileManagerScreen.kt</td><td>609</td><td>页面入口，SAF 集成，滚动管理</td></tr>
      <tr><td>FileManagerViewModel.kt</td><td>491</td><td>状态管理，目录加载，搜索，剪贴板</td></tr>
      <tr><td>FileContextMenu.kt</td><td>814</td><td>ModalBottomSheet + 全部文件操作 + 5 个对话框</td></tr>
      <tr><td>ToolbarComponents.kt</td><td>526</td><td>工具栏 + 路径栏 + Tab 栏 + 状态栏</td></tr>
      <tr><td>FileListItem.kt</td><td>254</td><td>文件列表项 + DisplayMode 枚举</td></tr>
      <tr><td>FileListContent.kt</td><td>155</td><td>文件列表容器（单列/双列/三列）</td></tr>
      <tr><td>SearchDialogs.kt</td><td>179</td><td>搜索对话框 + 结果对话框</td></tr>
      <tr><td>FileUtils.kt</td><td>134</td><td>文件图标/类型/格式化工具</td></tr>
    </table>
`);
