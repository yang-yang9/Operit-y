registerDetail('memorybase', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">🧠 Screen.MemoryBase 页面结构</h1>
      <p class="sub">MemoryScreen · 力导向图可视化 · 记忆 CRUD · 三种交互模式</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">3</div><div class="label">交互模式</div></div>
      <div class="stat-card"><div class="num">8</div><div class="label">力模型</div></div>
      <div class="stat-card"><div class="num">13</div><div class="label">对话框</div></div>
      <div class="stat-card"><div class="num">5</div><div class="label">FAB 按钮</div></div>
      <div class="stat-card"><div class="num">4</div><div class="label">实体模型</div></div>
      <div class="stat-card"><div class="num">10</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">从 Activity 到 MemoryScreen</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">NavItem.MemoryBase</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">OperitApp</div><div class="step-cond">导航状态管理</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">AppContent</div><div class="step-cond">TopAppBar + Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">MemoryScreen</div><div class="step-cond">Screen.MemoryBase.Content()</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">导航属性</div>
          <div class="kn-code">路由: "memory_base"
图标: Icons.Default.History
导航组: AI Features
叶子节点: 是（无子页面跳转）
Crossfade: 参与 (默认 true)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">Profile 隔离架构</div>
          <div class="kn-body">ViewModel 以 <code style="color:var(--cyan)">selectedProfileId</code> 为 key 构建，切换 Profile 时整个 ViewModel 重建，每个 Profile 有独立的记忆图。</div>
        </div>
      </div>
    </div>

    <!-- ===== 组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 组件树 <span class="count">FAB 列 + 主内容 + 文件夹导航 + 对话框层</span></div>

      <div class="mermaid">
graph TD
    ROOT["MemoryScreen&lt;br/&gt;(CustomScaffold)"]

    ROOT --> FAB_COL["FAB Column (右下角)"]
    ROOT --> CONTENT_BOX["Box (fillMaxSize)"]
    ROOT --> FOLDER_NAV["AnimatedVisibility&lt;br/&gt;FolderNavigator (左侧滑入)"]
    ROOT --> DIALOGS["Dialog Layer (互斥条件)"]

    FAB_COL --> FAB_DEL["FAB: Delete Selected&lt;br/&gt;(仅框选模式, 红色)"]
    FAB_COL --> FAB_BOX["FAB: Toggle Box Selection"]
    FAB_COL --> FAB_LINK["FAB: Toggle Linking Mode"]
    FAB_COL --> FAB_UPLOAD["FAB: Upload/Import File"]
    FAB_COL --> FAB_ADD["FAB: Add Memory (+)"]

    CONTENT_BOX --> MAIN_COL["Column (fillMaxSize)"]
    MAIN_COL --> SEARCH_BAR["MemorySearchBar&lt;br/&gt;Row: 文件夹按钮 + 搜索框 + 设置按钮"]
    MAIN_COL --> GRAPH_BOX["Box (weight=1f)"]
    GRAPH_BOX --> GRAPH["GraphVisualizer&lt;br/&gt;(Canvas 力导向图)"]
    GRAPH_BOX --> LOADING["CircularProgressIndicator&lt;br/&gt;(isLoading时显示)"]

    FOLDER_NAV --> FOLDER_SURFACE["Surface (250dp, fillMaxHeight)"]
    FOLDER_SURFACE --> FOLDER_HEADER["Row: 标题 + 关闭按钮"]
    FOLDER_SURFACE --> PROFILE_SEL["ProfileSelector (下拉选择)"]
    FOLDER_SURFACE --> FOLDER_ACTIONS["Row: Refresh + CreateFolder"]
    FOLDER_SURFACE --> FOLDER_ALL["FolderItem: All (根目录)"]
    FOLDER_SURFACE --> FOLDER_LIST["LazyColumn: FolderItem (递归)"]

    DIALOGS --> DLG_SEARCH_SETTINGS["MemorySearchSettingsDialog"]
    DIALOGS --> DLG_SEARCH_SIM["MemorySearchSimulationDialog"]
    DIALOGS --> DLG_DOC_VIEW["DocumentViewDialog"]
    DIALOGS --> DLG_MEM_INFO["MemoryInfoDialog"]
    DIALOGS --> DLG_EDGE_INFO["EdgeInfoDialog"]
    DIALOGS --> DLG_LINK["LinkMemoryDialog"]
    DIALOGS --> DLG_EDIT_MEM["EditMemoryDialog"]
    DIALOGS --> DLG_EDIT_EDGE["EditEdgeDialog"]
    DIALOGS --> DLG_BATCH_DEL["BatchDeleteConfirmDialog"]
      </div>

      <details style="margin-top:12px;">
        <summary style="font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;">📝 文本版组件树</summary>
        <div class="comp-tree" style="margin-top:8px;">
<span class="ct-root">MemoryScreen (CustomScaffold)</span>
<div class="ct-indent">
├─ <span class="ct-branch">FAB Column (右下角)</span>
│   ├─ <span class="ct-dim">FAB: Delete Selected (仅框选模式, 红色)</span>
│   ├─ <span class="ct-dim">FAB: Toggle Box Selection</span>
│   ├─ <span class="ct-dim">FAB: Toggle Linking Mode</span>
│   ├─ <span class="ct-dim">FAB: Upload/Import File</span>
│   └─ <span class="ct-dim">FAB: Add Memory (+)</span>
├─ <span class="ct-branch">Box (fillMaxSize)</span>
│   └─ <span class="ct-branch">Column</span>
│       ├─ <span class="ct-branch">MemorySearchBar</span> <span class="ct-dim">(文件夹按钮 + 搜索框 + 设置按钮)</span>
│       └─ <span class="ct-branch">Box (weight=1f)</span>
│           ├─ <span class="ct-branch">GraphVisualizer</span> <span class="ct-dim">(Canvas 力导向图)</span>
│           └─ <span class="ct-dim">CircularProgressIndicator (isLoading)</span>
├─ <span class="ct-overlay">AnimatedVisibility → FolderNavigator</span> <span class="ct-dim">(左侧滑入 250dp)</span>
└─ <span class="ct-dialog">Dialog Layer</span>
    ├─ <span class="ct-dialog">MemorySearchSettingsDialog</span>
    ├─ <span class="ct-dialog">MemorySearchSimulationDialog</span>
    ├─ <span class="ct-dialog">DocumentViewDialog</span>
    ├─ <span class="ct-dialog">MemoryInfoDialog / EdgeInfoDialog</span>
    ├─ <span class="ct-dialog">LinkMemoryDialog / EditMemoryDialog / EditEdgeDialog</span>
    └─ <span class="ct-dialog">BatchDeleteConfirmDialog</span>
</div>
        </div>
      </details>
    </div>

    <!-- ===== 状态管理 ===== -->
    <div class="section">
      <div class="section-head orange">🔀 状态管理 <span class="count">MemoryViewModel (Profile 隔离) + Local Remember</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🧠</div>
          <div class="kn-title orange">MemoryUiState 核心字段</div>
          <div class="kn-code">memories          — 平铺记忆列表
graph             — 当前节点+边图数据
selectedMemory    — 选中的记忆
selectedNodeId    — 选中节点 UUID
isLoading         — 加载指示器
searchQuery       — 搜索栏文本
error             — 错误消息
editingMemory     — 正在编辑的记忆
isEditing         — 编辑弹窗可见
isLinkingMode     — 连接模式
linkingNodeIds    — 待连接节点 (最多2个)
selectedEdge      — 选中的边
isBoxSelectionMode — 框选模式
boxSelectedNodeIds — 框选中的节点集合
folderPaths       — 所有文件夹路径
selectedFolderPath — 当前文件夹过滤
searchConfig      — 搜索权重配置
cloudEmbeddingConfig — 云端嵌入配置
isEmbeddingRebuildRunning — 索引重建中
message           — Toast 消息</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📌</div>
          <div class="kn-title purple">本地 Remember 状态</div>
          <div class="kn-code">profileList (StateFlow)
  — 所有 Profile ID
activeProfileId (StateFlow)
  — 当前活跃 Profile
profileNameMap (SnapshotStateMap)
  — id → 名称映射
selectedProfileId
  — 本地选中 Profile（同步活跃）
showFolderNavigator
  — 文件夹导航侧栏可见性

FolderExpandedState
  — rememberLocal 序列化持久化
  — 记录展开的文件夹路径集合</div>
        </div>
      </div>
    </div>

    <!-- ===== GraphVisualizer 详解 ===== -->
    <div class="section">
      <div class="section-head purple">🕸 GraphVisualizer 详解 <span class="count">力导向图可视化引擎</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🎨</div>
          <div class="kn-title blue">渲染机制</div>
          <div class="kn-code">BoxWithConstraints → Canvas (fillMaxSize)
├── 节点 (Node)
│   ├── 圆角矩形卡片 + 阴影
│   ├── 标签文字 (居中)
│   └── 状态高亮
│       ├── 选中: secondary 边框
│       ├── 连接候选: error 边框 + 额外描边
│       └── 框选中: tertiary 外圈高亮
├── 边 (Edge)
│   ├── 同文件夹: 实线 (粗细按 weight)
│   ├── 跨文件夹: 虚线 (isCrossFolderLink)
│   ├── 选中: error 颜色
│   └── 标签: 中点绘制，随缩放
└── 框选矩形 (半透明, 仅框选模式)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚙️</div>
          <div class="kn-title green">布局算法</div>
          <div class="kn-body">力导向布局运行在 <code style="color:var(--cyan)">Dispatchers.Default</code>，16ms 迭代间隔：</div>
          <div class="kn-code">1. 斥力（节点间）
2. 弹簧引力（边连接的节点间）
3. 聚类内聚力
4. 聚类间斥力
5. 重力（向中心）
6. 节点-边避让
7. 空间网格分区 (O(n) 邻居查找)
8. 温度冷却策略
+ 增量更新检测（变化分数阈值）</div>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">手势交互矩阵</div>
        <table class="act-table">
          <thead><tr><th>手势</th><th>正常模式</th><th>连接模式</th><th>框选模式</th></tr></thead>
          <tbody>
            <tr><td>捏合/双指拖拽</td><td>缩放 (0.2x~5x) + 平移</td><td>缩放 + 平移</td><td>缩放 + 平移</td></tr>
            <tr><td>点击节点</td><td>打开 MemoryInfo/DocumentView</td><td>加入 linkingNodeIds</td><td>切换节点选中状态</td></tr>
            <tr><td>点击边</td><td>打开 EdgeInfoDialog</td><td>—</td><td>—</td></tr>
            <tr><td>拖拽</td><td>—</td><td>—</td><td>绘制选择矩形 → 批量选中</td></tr>
          </tbody>
        </table>
      </div>

      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title cyan">性能优化</div>
          <div class="kn-code">视锥剔除
  — 仅渲染屏幕可见范围内的节点和边

增量布局
  — 检测图变化分数，小变化不重置布局

不卸载组件
  — isLoading 时 GraphVisualizer 不卸载
  — 避免布局状态丢失</div>
        </div>
      </div>
    </div>

    <!-- ===== 交互模式状态机 ===== -->
    <div class="section">
      <div class="section-head cyan">🔄 交互模式状态机 <span class="count">三种互斥交互模式</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">👆</div>
          <div class="kn-title blue">正常模式 (默认)</div>
          <div class="kn-code">点击节点 → MemoryInfoDialog / DocumentViewDialog
点击边   → EdgeInfoDialog

开启连接模式 → 清空 linkingNodeIds + boxSelectedNodeIds
开启框选模式 → 清空 linkingNodeIds</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔗</div>
          <div class="kn-title green">连接模式 (isLinkingMode)</div>
          <div class="kn-code">点击节点1 → linkingNodeIds = [node1]
点击节点2 → linkingNodeIds = [node1, node2]
          → 弹出 LinkMemoryDialog

创建连接后 → 自动回到正常模式
关闭连接模式 → 正常模式</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⬜</div>
          <div class="kn-title orange">框选模式 (isBoxSelectionMode)</div>
          <div class="kn-code">拖拽   → 绘制选择矩形
释放   → 添加相交节点到 boxSelectedNodeIds
点击   → 切换单个节点选中

FAB 删除 → BatchDeleteConfirmDialog
确认删除 → 正常模式 (清空选中)
关闭框选 → 正常模式 (清空选中)</div>
        </div>
      </div>
    </div>

    <!-- ===== FolderNavigator ===== -->
    <div class="section">
      <div class="section-head green">📂 FolderNavigator 详解 <span class="count">左侧滑入文件夹管理面板</span></div>

      <div class="key-nodes-grid" style="margin-bottom:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📁</div>
          <div class="kn-title blue">面板结构</div>
          <div class="kn-code">AnimatedVisibility (slideIn/slideOut)
└─ Surface (250dp, fillMaxHeight)
   ├─ Row [文件夹图标 + "Folders" + 关闭按钮]
   ├─ HorizontalDivider
   ├─ ProfileSelector (OutlinedButton + Dropdown)
   ├─ Row [Refresh + CreateFolder]
   ├─ FolderItem ["All" 根目录项]
   └─ LazyColumn
       └─ FolderItem (递归渲染)
           ├─ 展开箭头(动画旋转90°)
           ├─ 文件夹图标 + 名称
           ├─ 点击 → selectFolder(path)
           └─ 长按 → FolderContextMenu</div>
        </div>
      </div>

      <table class="act-table">
        <thead><tr><th>操作</th><th>触发</th><th>动作</th></tr></thead>
        <tbody>
          <tr><td>创建</td><td>CreateFolder 按钮</td><td class="mono">viewModel.createFolder(path)</td></tr>
          <tr><td>重命名</td><td>长按 → 上下文菜单</td><td class="mono">viewModel.renameFolder(old, new)</td></tr>
          <tr><td>删除</td><td>长按 → 上下文菜单</td><td class="mono">viewModel.deleteFolder(path)</td></tr>
          <tr><td>选择</td><td>点击文件夹项</td><td class="mono">viewModel.selectFolder(path) → 按文件夹过滤图</td></tr>
          <tr><td>刷新</td><td>Refresh 按钮</td><td class="mono">viewModel.refreshFolderList()</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 对话框清单 ===== -->
    <div class="section">
      <div class="section-head purple">📋 对话框清单 <span class="count">13</span></div>
      <table class="act-table">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">MemorySearchSettingsDialog</td><td>搜索栏设置图标</td><td>搜索权重滑块 + 云嵌入配置 + 嵌入统计 + 重建索引</td></tr>
          <tr><td class="mono">MemorySearchSimulationDialog</td><td>搜索设置内"模拟"按钮</td><td>搜索调试：输入查询 → 显示评分详情</td></tr>
          <tr><td class="mono">DocumentViewDialog</td><td>点击文档类型节点</td><td>文档标题 + 分块编辑 + 文档内搜索</td></tr>
          <tr><td class="mono">MemoryInfoDialog</td><td>点击普通记忆节点</td><td>只读记忆详情 + 编辑/删除按钮</td></tr>
          <tr><td class="mono">EdgeInfoDialog</td><td>点击边</td><td>边的源/目标/类型/权重 + 编辑/删除</td></tr>
          <tr><td class="mono">LinkMemoryDialog</td><td>连接模式选中2个节点</td><td>输入类型/权重/描述 → 创建关系</td></tr>
          <tr><td class="mono">EditMemoryDialog</td><td>FAB "+" 或 Info 内"编辑"</td><td>全屏弹窗：标题/内容/文件夹/标签/滑块</td></tr>
          <tr><td class="mono">EditEdgeDialog</td><td>EdgeInfo 内"编辑"</td><td>编辑边的类型/权重/描述</td></tr>
          <tr><td class="mono">BatchDeleteConfirmDialog</td><td>框选模式 FAB 删除</td><td>确认删除 N 个记忆节点</td></tr>
          <tr><td class="mono">FolderCreateDialog</td><td>导航栏创建按钮</td><td>输入新文件夹路径</td></tr>
          <tr><td class="mono">FolderRenameDialog</td><td>文件夹长按菜单</td><td>输入新名称</td></tr>
          <tr><td class="mono">FolderDeleteDialog</td><td>文件夹长按菜单</td><td>确认删除文件夹</td></tr>
          <tr><td class="mono">FolderContextMenu</td><td>文件夹项长按</td><td>重命名/删除选项</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== CRUD 操作流程 ===== -->
    <div class="section">
      <div class="section-head orange">⚡ CRUD 操作流程</div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📥</div>
          <div class="kn-title blue">加载</div>
          <div class="kn-code">isCurrentScreen && selectedProfileId 变化
→ viewModel.loadMemoryGraph()
  → selectedFolderPath == "" ?
    repository.getMemoryGraph() :
    repository.getGraphForFolder(path)
  → 更新 uiState.graph
→ viewModel.loadFolderPaths()</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔍</div>
          <div class="kn-title green">搜索</div>
          <div class="kn-code">用户输入 + IME Search
→ viewModel.searchMemories()
  → repository.searchMemories(
      query, scoreMode,
      keywordWeight, vectorWeight, edgeWeight)
  → repository.getGraphForMemories(results)
  → 更新 graph (空查询加载全量)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">➕</div>
          <div class="kn-title orange">创建记忆</div>
          <div class="kn-code">FAB "+" → viewModel.startEditing(null)
→ EditMemoryDialog
→ Save → viewModel.createMemory(
    title, content, contentType)
  → repository.createMemory(
      ..., folderPath=currentFolder)
  → 刷新图+文件夹</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📄</div>
          <div class="kn-title cyan">文档导入</div>
          <div class="kn-body">双通道：文本直读 vs 二进制走 AI 工具</div>
          <div class="kn-code">FAB Upload → OpenDocument(text/*, pdf, doc, docx)
→ 文本: BufferedReader.readText()
→ 二进制: cacheDir → AIToolHandler
          read_file_full → 清理临时文件
→ viewModel.importDocument() → 刷新</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔗</div>
          <div class="kn-title purple">连接记忆</div>
          <div class="kn-code">连接模式 → 选节点1 → 选节点2
→ LinkMemoryDialog(type, weight, desc)
→ viewModel.linkMemories(
    sourceUuid, targetUuid,
    type, weight, desc)
  → repository.linkMemories(...)
  → 退出连接模式 → 刷新</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🗑️</div>
          <div class="kn-title red" style="color:var(--red)">批量删除</div>
          <div class="kn-code">框选模式 → 拖拽/点击选中节点
→ FAB Delete → BatchDeleteConfirmDialog
→ viewModel.deleteSelectedNodes()
  → repository.deleteMemoriesByUuids(Set)
  → 退出框选 → 刷新</div>
        </div>
      </div>
    </div>

    <!-- ===== 数据模型 ===== -->
    <div class="section">
      <div class="section-head gray">📦 数据模型</div>

      <div class="key-nodes-grid" style="margin-bottom:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🕸</div>
          <div class="kn-title blue">图模型 (UI 层)</div>
          <div class="kn-code">Graph(nodes: List&lt;Node&gt;, edges: List&lt;Edge&gt;)

Node(id, label, color, metadata)

Edge(id, sourceId, targetId, label,
     weight, metadata, isCrossFolderLink)</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔍</div>
          <div class="kn-title green">搜索配置</div>
          <div class="kn-code">MemorySearchConfig
  scoreMode: BALANCED / KEYWORD_FIRST / SEMANTIC_FIRST
  keywordWeight / vectorWeight / edgeWeight

CloudEmbeddingConfig
  enabled, endpoint, apiKey, model

EmbeddingDimensionUsage — 嵌入维度统计
EmbeddingRebuildProgress — 重建进度</div>
        </div>
      </div>

      <table class="act-table">
        <thead><tr><th>实体 (ObjectBox)</th><th>关键字段</th></tr></thead>
        <tbody>
          <tr><td class="mono">Memory</td><td>id, uuid, title, content, contentType, source, credibility, importance, documentPath, isDocumentNode, folderPath, embedding, tags, properties, links</td></tr>
          <tr><td class="mono">DocumentChunk</td><td>id, content, chunkIndex, embedding, memory(ToOne)</td></tr>
          <tr><td class="mono">MemoryTag</td><td>id, name, parent(ToOne), memories(ToMany)</td></tr>
          <tr><td class="mono">MemoryLink</td><td>id, type, weight, description, source(ToOne), target(ToOne)</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 架构要点 ===== -->
    <div class="section">
      <div class="section-head blue">🏗 架构要点</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">👤</div>
          <div class="kn-title orange">Profile 隔离</div>
          <div class="kn-body">ViewModel 以 <code style="color:var(--cyan)">selectedProfileId</code> 为 key 构建，切换 Profile 时整个 ViewModel 重建，每个 Profile 有独立的记忆图。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🕸️</div>
          <div class="kn-title blue">力导向图引擎</div>
          <div class="kn-body">自实现力导向布局，运行在 <code style="color:var(--cyan)">Dispatchers.Default</code>，空间网格分区加速 + 增量更新检测 + 温度冷却策略，16ms 迭代实现平滑动画。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📂</div>
          <div class="kn-title green">文件夹展开持久化</div>
          <div class="kn-body">通过 <code style="color:var(--cyan)">rememberLocal</code> + 序列化持久化 <code style="color:var(--cyan)">FolderExpandedState</code>，记录展开的文件夹路径集合。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📄</div>
          <div class="kn-title purple">文档导入双通道</div>
          <div class="kn-body">文本文件直接 <code style="color:var(--cyan)">BufferedReader.readText()</code>；二进制文件（PDF/Word）通过 AI 工具 <code style="color:var(--cyan)">read_file_full</code> 提取内容。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔍</div>
          <div class="kn-title cyan">搜索系统</div>
          <div class="kn-body">支持关键词搜索、向量语义搜索、边关系传播三种模式的加权组合，可选云端嵌入服务。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title yellow" style="color:var(--yellow)">性能三板斧</div>
          <div class="kn-body">视锥剔除（仅渲染可见区域）+ 增量布局（小变化不重置）+ GraphVisualizer loading 时不卸载（避免布局重置）。</div>
        </div>
      </div>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">10 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径 (相对 ui/features/memory/)</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>MemoryScreen</strong></td><td class="mono">screens/MemoryScreen.kt</td><td>页面入口，FAB 编排，状态收集</td></tr>
          <tr><td><strong>GraphVisualizer</strong></td><td class="mono">graph/GraphVisualizer.kt</td><td>力导向图 Canvas 渲染引擎</td></tr>
          <tr><td><strong>FolderNavigator</strong></td><td class="mono">components/FolderNavigator.kt</td><td>文件夹侧栏导航</td></tr>
          <tr><td><strong>EditMemoryDialog</strong></td><td class="mono">components/EditMemoryDialog.kt</td><td>记忆创建/编辑全屏弹窗</td></tr>
          <tr><td><strong>DocumentViewDialog</strong></td><td class="mono">components/DocumentViewDialog.kt</td><td>文档查看/编辑弹窗</td></tr>
          <tr><td><strong>MemorySearchSettingsDialog</strong></td><td class="mono">components/MemorySearchSettingsDialog.kt</td><td>搜索设置弹窗</td></tr>
          <tr><td><strong>MemorySearchSimulationDialog</strong></td><td class="mono">components/MemorySearchSimulationDialog.kt</td><td>搜索调试弹窗</td></tr>
          <tr><td><strong>MemoryDialogs</strong></td><td class="mono">components/MemoryDialogs.kt</td><td>Info/Edge/Link/EditEdge/BatchDelete 弹窗</td></tr>
          <tr><td><strong>MemoryViewModel</strong></td><td class="mono">viewmodel/MemoryViewModel.kt</td><td>业务逻辑 ViewModel</td></tr>
          <tr><td><strong>GraphModels</strong></td><td class="mono">graph/model/GraphModels.kt</td><td>Graph/Node/Edge UI 模型</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/05_Screen.MemoryBase页面结构.md · MemoryScreen 组件结构
    </div>`);
