registerDetail('workflow', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">🔄 Screen.Workflow 页面结构</h1>
      <p class="sub">WorkflowListScreen + WorkflowDetailScreen · 列表-详情双页面 · 可视化网格画布</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">2</div><div class="label">页面</div></div>
      <div class="stat-card"><div class="num">5</div><div class="label">节点类型</div></div>
      <div class="stat-card"><div class="num">8</div><div class="label">预置模板</div></div>
      <div class="stat-card"><div class="num">12</div><div class="label">对话框</div></div>
      <div class="stat-card"><div class="num">4</div><div class="label">执行状态</div></div>
      <div class="stat-card"><div class="num">10</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">列表页 → 详情页 双级结构</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">NavItem.Workflow</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">AppContent</div><div class="step-cond">Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">WorkflowListScreen</div><div class="step-cond">列表页</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">WorkflowDetailScreen</div><div class="step-cond">详情页 (workflowId)</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">导航属性</div>
          <div class="kn-code">Screen.Workflow:
  路由: NavItem.Workflow
  图标: Icons.Default.AccountTree
  导航组: Tools · 主导航

Screen.WorkflowDetail:
  parentScreen: Workflow
  参数: workflowId: String</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">共享 ViewModel</div>
          <div class="kn-body">列表页和详情页<strong>共享同一 WorkflowViewModel 实例</strong>，currentWorkflow、nodeExecutionStates 在两个页面间可见。ViewModel init 订阅 <code style="color:var(--cyan)">WorkflowRepository.workflowUpdateEvents</code> (SharedFlow) 实现实时更新。</div>
        </div>
      </div>
    </div>

    <!-- ===== 数据模型 ===== -->
    <div class="section">
      <div class="section-head gray">📦 数据模型 <span class="count">后续章节依赖，先交代</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">📄</div>
          <div class="kn-title blue">Workflow</div>
          <div class="kn-code">id, name, description, enabled
nodes: List&lt;WorkflowNode&gt;
connections: List&lt;WorkflowNodeConnection&gt;
createdAt, updatedAt
lastExecutionTime, lastExecutionStatus
totalExecutions, successfulExecutions, failedExecutions</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔗</div>
          <div class="kn-title green">WorkflowNodeConnection</div>
          <div class="kn-body">连接条件语义：</div>
          <div class="kn-code">id, sourceNodeId, targetNodeId, condition

condition 值:
  null/空     — 无条件 (或 true 分支)
  "false"     — false 分支
  "on_success" — 成功分支
  "on_error"   — 失败分支
  其他字符串   — 正则匹配源节点结果</div>
        </div>
      </div>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin:16px 0 8px;">WorkflowNode (sealed class) — 5 种节点类型</div>
      <table class="act-table">
        <thead><tr><th>子类型</th><th>type</th><th>关键字段</th><th>颜色</th></tr></thead>
        <tbody>
          <tr><td class="mono">TriggerNode</td><td>trigger</td><td>triggerType, triggerConfig</td><td><span style="color:#4CAF50;font-weight:700">绿色 #4CAF50</span></td></tr>
          <tr><td class="mono">ExecuteNode</td><td>execute</td><td>actionType, actionConfig, jsCode?</td><td><span style="color:#2196F3;font-weight:700">蓝色 #2196F3</span></td></tr>
          <tr><td class="mono">ConditionNode</td><td>condition</td><td>left, operator, right</td><td><span style="color:#FF9800;font-weight:700">橙色 #FF9800</span></td></tr>
          <tr><td class="mono">LogicNode</td><td>logic</td><td>operator (AND/OR)</td><td><span style="color:#7E57C2;font-weight:700">紫色 #7E57C2</span></td></tr>
          <tr><td class="mono">ExtractNode</td><td>extract</td><td>source, mode, expression, ...</td><td><span style="color:#009688;font-weight:700">青色 #009688</span></td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 列表页组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 WorkflowListScreen 组件树 <span class="count">列表页</span></div>

      <div class="mermaid">
graph TD
    LIST_ROOT["WorkflowListScreen&lt;br/&gt;(CustomScaffold)"]

    LIST_ROOT --> LIST_FAB["FAB (旋转45°动画)"]
    LIST_ROOT --> LIST_CONTENT["Box (fillMaxSize)"]
    LIST_ROOT --> LIST_DIALOGS["Dialog Layer"]

    LIST_FAB --> FAB_MENU["AnimatedVisibility SpeedDial"]
    FAB_MENU --> FAB_SEL{"isSelectionMode?"}
    FAB_SEL -->|是| FAB_DEL_SEL["SpeedDialAction: 删除N个"]
    FAB_SEL -->|是| FAB_EXIT_SEL["SpeedDialAction: 退出多选"]
    FAB_SEL -->|否| FAB_CREATE["SpeedDialAction: 新建空白"]
    FAB_SEL -->|否| FAB_TEMPLATE["SpeedDialAction: 从模板"]
    FAB_SEL -->|否| FAB_MULTI["SpeedDialAction: 多选"]

    LIST_CONTENT --> LOADING["CircularProgressIndicator"]
    LIST_CONTENT --> EMPTY["Empty State&lt;br/&gt;(闪电emoji + 创建按钮)"]
    LIST_CONTENT --> LIST["LazyColumn"]
    LIST --> SEL_BAR["WorkflowSelectionBar&lt;br/&gt;(多选模式)"]
    LIST --> CARDS["WorkflowCard (per item)"]

    CARDS --> CARD_TITLE["Row: 名称 + Disabled标签 + Switch/Checkbox"]
    CARDS --> CARD_DESC["Text: 描述 (2行)"]
    CARDS --> CARD_STATUS["ExecutionStatusBar&lt;br/&gt;(状态色 + 成功率)"]
    CARDS --> CARD_FOOTER["Row: 节点数 + 执行次数 + 更新时间"]

    LIST_DIALOGS --> DLG_CREATE["CreateWorkflowDialog"]
    LIST_DIALOGS --> DLG_TEMPLATE["TemplateTypeDialog (8种模板)"]
    LIST_DIALOGS --> DLG_DEL_BATCH["批量删除确认"]
      </div>

      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🃏</div>
          <div class="kn-title blue">WorkflowCard</div>
          <div class="kn-code">Card (outline, 选中态 primaryContainer 30%)
└─ Column (18dp padding)
    ├─ Row: 名称 + [!enabled]"Disabled" + Switch/Checkbox
    ├─ [有描述] Text (bodySmall, 2行, 70% alpha)
    ├─ [有执行记录] ExecutionStatusBar
    │   └─ Row: 图标 + 状态文本 + 相对时间 + 成功率
    │       ≥80% tertiary / ≥50% primary / &lt;50% error
    └─ Row: 节点数 + 执行次数 + 更新日期</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📑</div>
          <div class="kn-title green">模板选择弹窗</div>
          <div class="kn-code">8 种预置模板:
1. Intent 聊天广播 (8 节点)
2. 聊天模板 (6 节点)
3. 条件模板 (6 节点)
4. 逻辑 AND 模板 (8 节点)
5. 逻辑 OR 模板 (8 节点)
6. 提取模板 (9 节点)
7. 错误分支模板 (4 节点)
8. 语音触发模板 (2 节点)

布局: templateNodePosition(index)
每列 5 个，列距 720dp，行距 420dp</div>
        </div>
      </div>
    </div>

    <!-- ===== 详情页组件树 ===== -->
    <div class="section">
      <div class="section-head purple">🌲 WorkflowDetailScreen 组件树 <span class="count">详情页 + 画布</span></div>

      <div class="mermaid">
graph TD
    DETAIL_ROOT["WorkflowDetailScreen&lt;br/&gt;(CustomScaffold)"]

    DETAIL_ROOT --> DETAIL_FAB["FAB + SpeedDial"]
    DETAIL_ROOT --> DETAIL_CONTENT["Box (fillMaxSize)"]
    DETAIL_ROOT --> DETAIL_DIALOGS["Dialog Layer (10+ 弹窗)"]

    DETAIL_FAB --> SD_TRIGGER["SpeedDialAction: 触发/取消"]
    DETAIL_FAB --> SD_LOGS["SpeedDialAction: 查看日志"]
    DETAIL_FAB --> SD_ADD["SpeedDialAction: 添加节点"]
    DETAIL_FAB --> SD_EDIT["SpeedDialAction: 编辑工作流"]
    DETAIL_FAB --> SD_DEL["SpeedDialAction: 删除"]

    DETAIL_CONTENT --> EMPTY_NODE["EmptyNodeCard&lt;br/&gt;(无节点时)"]
    DETAIL_CONTENT --> CANVAS["GridWorkflowCanvas&lt;br/&gt;(4000x3000dp 虚拟画布)"]

    CANVAS --> GRID_BG["点阵网格背景"]
    CANVAS --> REF_EDGES["参考边 (橙色虚线贝塞尔)&lt;br/&gt;节点参数引用关系"]
    CANVAS --> CONN_LINES["连接线 (彩色贝塞尔 + 箭头)&lt;br/&gt;执行流程"]
    CANVAS --> NODE_CARDS["DraggableNodeCard (per node)&lt;br/&gt;可拖拽节点卡片"]
    CANVAS --> SCALE_IND["缩放指示器 (右上角)"]
      </div>
    </div>

    <!-- ===== GridWorkflowCanvas ===== -->
    <div class="section">
      <div class="section-head cyan">🎨 GridWorkflowCanvas 详解 <span class="count">4000x3000 虚拟画布</span></div>

      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>参数</th><th>值</th></tr></thead>
        <tbody>
          <tr><td>虚拟画布尺寸</td><td class="mono">4000dp × 3000dp</td></tr>
          <tr><td>网格单元大小</td><td class="mono">40dp</td></tr>
          <tr><td>节点尺寸</td><td class="mono">120dp × 80dp</td></tr>
          <tr><td>缩放范围</td><td class="mono">0.25x ~ 3.0x</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">渲染层次 (从底到顶)</div>
      <div class="key-nodes-grid">
        <div class="key-node-card" style="border-left:3px solid var(--text-dimmer);">
          <div class="kn-title" style="font-size:13px;">1. 点阵网格</div>
          <div class="kn-body" style="font-size:12px;">灰色圆点，按 cellSizePx 间隔绘制</div>
        </div>
        <div class="key-node-card" style="border-left:3px solid var(--orange);">
          <div class="kn-title orange" style="font-size:13px;">2. 参考边</div>
          <div class="kn-body" style="font-size:12px;">橙色虚线贝塞尔曲线，表示节点间参数引用关系 (NodeReference)</div>
        </div>
        <div class="key-node-card" style="border-left:3px solid var(--blue);">
          <div class="kn-title blue" style="font-size:13px;">3. 连接线</div>
          <div class="kn-body" style="font-size:12px;">彩色贝塞尔曲线 + 箭头，表示执行流程</div>
          <div class="kn-code">蓝色 = 默认/运行中
绿色 = 成功
红色 = 失败
灰色虚线 = 未激活/跳过
条件标签: 中点绘制 "T"/"F"/正则前缀</div>
        </div>
        <div class="key-node-card" style="border-left:3px solid var(--green);">
          <div class="kn-title green" style="font-size:13px;">4. 节点卡片</div>
          <div class="kn-body" style="font-size:12px;"><code style="color:var(--cyan)">DraggableNodeCard</code> 通过 <code style="color:var(--cyan)">Modifier.offset</code> 定位</div>
        </div>
        <div class="key-node-card" style="border-left:3px solid var(--purple);">
          <div class="kn-title purple" style="font-size:13px;">5. 缩放指示器</div>
          <div class="kn-body" style="font-size:12px;">右上角 Card，scale ≠ 1f 或已平移时显示</div>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">画布手势交互</div>
        <table class="act-table">
          <thead><tr><th>手势</th><th>效果</th></tr></thead>
          <tbody>
            <tr><td>捏合/双指拖拽</td><td>缩放 (0.25x~3.0x) + 平移</td></tr>
            <tr><td>双击</td><td>自动适配所有节点到视口 (fitViewportToNodes)</td></tr>
            <tr><td>拖拽节点</td><td>移动节点，释放时吸附到 40dp 网格</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== DraggableNodeCard ===== -->
    <div class="section">
      <div class="section-head green">🃏 DraggableNodeCard 详解 <span class="count">节点样式 + 执行状态 + 手势逻辑</span></div>

      <div class="key-nodes-grid" style="margin-bottom:16px;">
        <div class="key-node-card">
          <div class="kn-icon">🎨</div>
          <div class="kn-title blue">节点类型样式</div>
          <div class="kn-code"><span style="color:#4CAF50">■</span> Trigger   — #4CAF50 / #E8F5E9
<span style="color:#2196F3">■</span> Execute   — #2196F3 / #E3F2FD
<span style="color:#FF9800">■</span> Condition — #FF9800 / #FFF3E0
<span style="color:#7E57C2">■</span> Logic     — #7E57C2 / #F3E5F5
<span style="color:#009688">■</span> Extract   — #009688 / #E0F2F1</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title orange">执行状态视觉反馈</div>
          <div class="kn-code">Running — 蓝色 3dp 边框 + spinner + "Running"
Success — 绿色 3dp 边框 + ✓ + "Success"
Skipped — 灰色 3dp 边框 + ✗ + "Skipped"
Failed  — 红色 3dp 边框 + ✗ + "Failed"</div>
        </div>
      </div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">👆</div>
          <div class="kn-title purple">手势互斥逻辑</div>
          <div class="kn-body">两个 <code style="color:var(--cyan)">pointerInput</code> 协同工作：</div>
          <div class="kn-code">长按检测: 500ms delay → onLongPress()
  → 打开 NodeActionMenu

拖拽检测: 标记 hasDragged=true
  → onDrag(amount)
  → 释放时 100ms 重置

互斥: 拖拽或长按后不触发 onClick</div>
        </div>
      </div>
    </div>

    <!-- ===== NodeDialog ===== -->
    <div class="section">
      <div class="section-head orange">📝 NodeDialog 详解 <span class="count">按节点类型动态切换编辑表单</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">Execute 节点编辑</div>
          <div class="kn-code">actionType (工具名, 带自动补全)
→ LaunchedEffect: 从 AIToolHandler/PackageManager
  查询工具参数 Schema → 合并到 actionConfigPairs

[forEach 参数]
Row: 参数名 + 值输入框 + 🔗节点引用 + 删除
[有 Schema] Text: 类型 + required + 描述 + 默认值

"Add parameter" 按钮</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🎯</div>
          <div class="kn-title green">Trigger 节点编辑</div>
          <div class="kn-code">触发类型 → 配置:
manual   — 无额外配置
schedule — ScheduleConfigDialog
           (interval/specific_time/cron)
tasker   — {"variable_name": "%evtprm()"}
intent   — {"action": "com.example.MY_ACTION"}
speech   — {"pattern": "...", "ignore_case": ...}</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">❓</div>
          <div class="kn-title orange">Condition 节点编辑</div>
          <div class="kn-code">左值: OutlinedTextField + 🔗节点引用
运算符: ExposedDropdownMenu
  EQ / NE / GT / GTE / LT / LTE
  CONTAINS / NOT_CONTAINS / IN / NOT_IN
右值: OutlinedTextField + 🔗节点引用</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔍</div>
          <div class="kn-title cyan">Extract 节点编辑</div>
          <div class="kn-code">6 种提取模式:
REGEX      — 表达式 + 组索引 + 默认值
JSON       — JSON 路径 + 默认值
SUB        — 起始索引 + 长度
CONCAT     — 多项拼接列表 (静态/引用)
RANDOM_INT — useFixed + 固定值/最小最大
RANDOM_STRING — useFixed + 固定值/长度/字符集</div>
        </div>
      </div>
    </div>

    <!-- ===== 对话框清单 ===== -->
    <div class="section">
      <div class="section-head purple">📋 对话框清单 <span class="count">12 (按页面分组)</span></div>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">WorkflowListScreen (3 个)</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>对话框</th><th>触发</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">CreateWorkflowDialog</td><td>FAB "新建空白"</td><td>名称 + 描述输入</td></tr>
          <tr><td class="mono">TemplateTypeDialog</td><td>FAB "从模板"</td><td>8 种模板选择卡片</td></tr>
          <tr><td class="mono">批量删除确认</td><td>多选模式 FAB "删除"</td><td>确认删除 N 个工作流</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">WorkflowDetailScreen (9 个)</div>
      <table class="act-table">
        <thead><tr><th>对话框</th><th>触发</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">EditWorkflowDialog</td><td>FAB "编辑工作流"</td><td>名称 + 描述 + enabled 开关</td></tr>
          <tr><td class="mono">删除工作流确认</td><td>FAB "删除"</td><td>确认后返回列表</td></tr>
          <tr><td class="mono">执行结果</td><td>触发/取消完成后</td><td>显示结果消息</td></tr>
          <tr><td class="mono">WorkflowExecutionLogDialog</td><td>FAB "查看日志" 或节点日志</td><td>时间戳日志列表，可按节点过滤</td></tr>
          <tr><td class="mono">NodeDialog (创建/编辑)</td><td>FAB "添加节点" / 长按→编辑</td><td>5 种节点类型动态编辑表单</td></tr>
          <tr><td class="mono">删除节点确认</td><td>节点长按 → "删除"</td><td>确认删除节点及其连接</td></tr>
          <tr><td class="mono">NodeActionMenuDialog</td><td>节点长按</td><td>编辑/查看日志/创建连接/删除</td></tr>
          <tr><td class="mono">ConnectionMenuDialog</td><td>长按→"创建连接"</td><td>现有连接管理 + 可连接目标列表</td></tr>
          <tr><td class="mono">ConnectionConditionDialog</td><td>连接编辑图标</td><td>条件设置：默认/false/自定义正则</td></tr>
          <tr><td class="mono">ScheduleConfigDialog</td><td>Trigger 选 schedule</td><td>interval/specific_time/cron 配置</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 交互映射 ===== -->
    <div class="section">
      <div class="section-head orange">⚡ 用户交互 → 动作映射 <span class="count">按页面分组</span></div>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">列表页</div>
      <table class="act-table" style="margin-bottom:16px;">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>工作流卡片点击</td><td class="mono">导航到 Screen.WorkflowDetail(id)</td></tr>
          <tr><td>Switch 切换</td><td class="mono">viewModel.setWorkflowEnabled(id, enabled) 乐观更新</td></tr>
          <tr><td>FAB 新建 → 确认</td><td class="mono">viewModel.createWorkflow(name, desc) → 导航到详情</td></tr>
          <tr><td>FAB 模板 → 选择</td><td class="mono">viewModel.createXxxTemplateWorkflow() → 导航到详情</td></tr>
          <tr><td>多选 → 删除</td><td class="mono">viewModel.deleteWorkflows(ids)</td></tr>
        </tbody>
      </table>

      <div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:8px;">详情页</div>
      <table class="act-table">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>FAB 触发</td><td class="mono">viewModel.triggerWorkflow(id) → 实时状态更新</td></tr>
          <tr><td>FAB 取消</td><td class="mono">viewModel.cancelWorkflow(id)</td></tr>
          <tr><td>节点拖拽释放</td><td class="mono">viewModel.updateNodePosition(wf, nodeId, x, y) 吸附网格</td></tr>
          <tr><td>节点点击</td><td class="mono">打开 NodeDialog 编辑</td></tr>
          <tr><td>节点长按</td><td class="mono">打开 NodeActionMenuDialog</td></tr>
          <tr><td>添加节点确认</td><td class="mono">viewModel.addNode(workflowId, node)</td></tr>
          <tr><td>创建连接</td><td class="mono">viewModel.createConnection(wf, src, tgt)</td></tr>
          <tr><td>编辑连接条件</td><td class="mono">viewModel.updateConnectionCondition(wf, connId, cond)</td></tr>
          <tr><td>双击画布</td><td class="mono">自动适配视口 fitViewportToNodes()</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 架构要点 ===== -->
    <div class="section">
      <div class="section-head blue">🏗 架构要点</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🔄</div>
          <div class="kn-title orange">共享 ViewModel</div>
          <div class="kn-body">列表页和详情页共享同一实例，<code style="color:var(--cyan)">currentWorkflow</code>、<code style="color:var(--cyan)">nodeExecutionStates</code> 在两个页面间可见。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title blue">实时执行可视化</div>
          <div class="kn-body"><code style="color:var(--cyan)">triggerWorkflow</code> 通过回调流式更新 nodeExecutionStates，画布连接线和节点卡片边框实时变色反映执行状态。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔗</div>
          <div class="kn-title green">双类型边渲染</div>
          <div class="kn-body">画布同时渲染两种边——蓝色连接线表示执行流程，橙色虚线表示参数引用关系 (NodeReference)。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📐</div>
          <div class="kn-title purple">网格吸附</div>
          <div class="kn-body">节点拖拽释放时自动吸附到 40dp 网格，保持视觉整齐。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔍</div>
          <div class="kn-title cyan">工具 Schema 自动补全</div>
          <div class="kn-body">Execute 节点编辑时从 <code style="color:var(--cyan)">AIToolHandler</code> + <code style="color:var(--cyan)">PackageManager</code> 实时查询工具参数 Schema，自动合并到参数列表。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⚡</div>
          <div class="kn-title yellow" style="color:var(--yellow)">乐观更新</div>
          <div class="kn-body">列表页 enabled Switch 采用乐观更新策略，失败时回滚。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📏</div>
          <div class="kn-title" style="color:var(--text-dim)">模板布局算法</div>
          <div class="kn-body"><code style="color:var(--cyan)">templateNodePosition(index)</code> 按 5 行 × N 列自动排列，列距 720dp、行距 420dp。</div>
        </div>
      </div>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">10 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径 (相对 ui/features/workflow/)</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>WorkflowListScreen</strong></td><td class="mono">screens/WorkflowListScreen.kt</td><td>列表页入口 + 卡片 + 多选</td></tr>
          <tr><td><strong>WorkflowDetailScreen</strong></td><td class="mono">screens/WorkflowDetailScreen.kt</td><td>详情页 + NodeDialog</td></tr>
          <tr><td><strong>WorkflowViewModel</strong></td><td class="mono">viewmodel/WorkflowViewModel.kt</td><td>共享 ViewModel + CRUD + 执行 + 模板</td></tr>
          <tr><td><strong>GridWorkflowCanvas</strong></td><td class="mono">components/GridWorkflowCanvas.kt</td><td>网格画布 + 节点/连接渲染</td></tr>
          <tr><td><strong>DraggableNodeCard</strong></td><td class="mono">components/DraggableNodeCard.kt</td><td>可拖拽节点卡片</td></tr>
          <tr><td><strong>NodeActionMenu</strong></td><td class="mono">components/NodeActionMenu.kt</td><td>节点长按上下文菜单</td></tr>
          <tr><td><strong>ConnectionMenu</strong></td><td class="mono">components/ConnectionMenu.kt</td><td>连接管理弹窗</td></tr>
          <tr><td><strong>ScheduleConfigDialog</strong></td><td class="mono">components/ScheduleConfigDialog.kt</td><td>定时触发配置</td></tr>
          <tr><td><strong>Workflow</strong></td><td class="mono">data/model/Workflow.kt</td><td>数据模型 (节点/连接/参数)</td></tr>
          <tr><td><strong>WorkflowExecutionLog</strong></td><td class="mono">data/model/WorkflowExecutionLog.kt</td><td>执行记录模型</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/08_Screen.Workflow页面结构.md · WorkflowListScreen + WorkflowDetailScreen 组件结构
    </div>`);
