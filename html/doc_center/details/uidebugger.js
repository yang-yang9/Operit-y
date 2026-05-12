registerDetail('uidebugger', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">源码文件</span></div>
      <div class="stat-item"><span class="stat-num">~2100</span><span class="stat-label">总行数</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">浮窗模式</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">应用内对话框</span></div>
      <div class="stat-item"><span class="stat-num">100</span><span class="stat-label">事件缓冲上限</span></div>
    </div>

    <!-- 架构分层 -->
    <div class="section-head blue">架构分层</div>
    <div class="kn-code" style="margin:0 0 16px 0;">应用内 (Compose Navigation)
  Screen.UIDebugger → UIDebuggerScreen (启动入口)

浮动窗口 (WindowManager, 独立于 Navigation)
  UIDebuggerService (前台服务)
    → UIDebuggerWindowManager (窗口管理)
      → UIDebuggerFloatingContent
        ├── [收起] DraggableFloatingBall (56dp 蓝色圆球)
        └── [展开] UIDebuggerOverlay (全屏调试界面)

共享状态
  UIDebuggerViewModel (手动单例, companion object INSTANCE)</div>

    <!-- 导航属性 -->
    <table class="act-table">
      <tr><th>属性</th><th>值</th></tr>
      <tr><td>parentScreen</td><td>Toolbox</td></tr>
      <tr><td>navItem</td><td>NavItem.Toolbox</td></tr>
      <tr><td>子页面</td><td>无（调试界面通过浮动窗口）</td></tr>
    </table>

    <!-- 应用内入口 -->
    <div class="section-head green">UIDebuggerScreen（应用内入口）</div>
    <div class="kn-code" style="margin:0 0 12px 0;">CustomScaffold
├── FAB: OpenInNew 图标
│   ├── [有悬浮窗权限] → 启动 UIDebuggerService
│   └── [无权限] → 跳转系统悬浮窗权限设置
└── Column (居中)
    ├── Icon (OpenInNew, 64dp)
    ├── Text (标题)
    └── Text (描述)</div>

    <!-- 浮动窗口双模式 -->
    <div class="section-head purple">浮动窗口双模式</div>
    <div class="section-head" style="background:rgba(139,92,246,0.08);border-left-color:#A78BFA;font-size:13px;">收起模式 (DraggableFloatingBall)</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">Surface(56dp 圆形, 蓝色 0.8 alpha) + Icon(Build, 白色)。可拖拽（更新 WindowManager.LayoutParams.x/y），点击展开为全屏调试界面。</p>

    <div class="section-head" style="background:rgba(139,92,246,0.08);border-left-color:#A78BFA;font-size:13px;">展开模式 (UIDebuggerOverlay)</div>
    <div class="mermaid">
graph TD
    OVERLAY["UIDebuggerOverlay&lt;br/&gt;(Box fillMaxSize)"]

    OVERLAY --> HIGHLIGHT["ElementHighlightOverlay&lt;br/&gt;(Canvas, 全屏)"]
    HIGHLIGHT --> RECTS["红色 2dp 描边矩形&lt;br/&gt;(每个 UIElement.bounds)"]

    OVERLAY --> INFO_PANEL["ElementInfoPanel&lt;br/&gt;(左上角, ≤300×400dp)"]
    INFO_PANEL --> ELEM_TYPE["元素类型 Chip"]
    INFO_PANEL --> ACTIVITY_CARD["Activity 名称 + 复制按钮"]
    INFO_PANEL --> DETAILS["属性详情 (可滚动)"]

    OVERLAY --> MONITOR["[showActivityMonitor]&lt;br/&gt;ActivityMonitorPanel"]

    OVERLAY --> CONTROL_BAR["Card (右下角, 圆角20dp)"]
    CONTROL_BAR --> FAB_ANALYSIS["FAB: UI分析开关"]
    CONTROL_BAR --> FAB_MONITOR["FAB: Activity监控开关"]
    CONTROL_BAR --> FAB_MINIMIZE["FAB: 最小化 → 收起"]
    CONTROL_BAR --> FAB_CLOSE["FAB: 关闭 (error色)"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head green">状态管理 (UIDebuggerViewModel)</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">通过 companion object { var INSTANCE } 实现单例，确保应用内页面和浮动窗口服务共享同一状态。</p>
    <table class="act-table">
      <tr><th>字段</th><th>类型</th><th>说明</th></tr>
      <tr><td>elements</td><td>List&lt;UIElement&gt;</td><td>无障碍树解析的 UI 元素列表</td></tr>
      <tr><td>selectedElementId</td><td>String?</td><td>高亮选中的元素 ID</td></tr>
      <tr><td>showActionFeedback</td><td>Boolean</td><td>操作反馈 Toast (3秒自动消失)</td></tr>
      <tr><td>errorMessage</td><td>String?</td><td>错误消息</td></tr>
      <tr><td>currentAnalyzedActivityName</td><td>String?</td><td>扫描时的 Activity 名</td></tr>
      <tr><td>isActivityListening</td><td>Boolean</td><td>Activity 监控是否运行</td></tr>
      <tr><td>activityEvents</td><td>List&lt;ActionEvent&gt;</td><td>事件缓冲区 (≤100 条)</td></tr>
      <tr><td>showActivityMonitor</td><td>Boolean</td><td>监控面板显示</td></tr>
    </table>

    <!-- UI 分析功能 -->
    <div class="section-head orange">UI 分析功能</div>
    <div class="flow" style="margin-bottom:8px;">
      <span class="flow-step">UI 分析 FAB</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">viewModel.refreshUI()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AI 工具 get_page_info</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">解析无障碍树</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Canvas 高亮绘制</span>
    </div>
    <p style="margin:8px 0 4px 4px;font-size:12px;color:var(--text-dim);"><strong>元素选择：</strong>detectTapGestures 检测点击位置，选中包含该点的最小边界框元素 → 打开 ElementInfoPanel (class/resourceId/contentDesc/text/bounds/clickable)</p>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>元素操作</th><th>效果</th></tr>
      <tr><td>CLICK</td><td>AI 工具 click_element（按 resourceId 或 text 选择器）</td></tr>
      <tr><td>HIGHLIGHT</td><td>选中元素 + 反馈 Toast</td></tr>
      <tr><td>INSPECT</td><td>同 HIGHLIGHT</td></tr>
    </table>

    <!-- Activity 监控 -->
    <div class="section-head blue">Activity 监控</div>
    <div class="flow" style="margin-bottom:8px;">
      <span class="flow-step">Start Monitoring</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">ActionListenerFactory</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">listener.startListening</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">过滤自身包名</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">activityEvents (≤100条)</span>
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);"><strong>ActivityMonitorPanel：</strong>Surface(300-400dp宽, ≤500dp高) → 标题栏 + 状态卡(监听中/已停止) + 控制行(开始/停止/清除) + 当前Activity名 + LazyColumn(事件列表, 颜色按 ActionType 区分)</p>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🖥</div>
        <div class="kn-title blue">应用外调试</div>
        <div class="kn-body">实际调试 UI 通过 UIDebuggerService 前台服务 + WindowManager 浮动窗口渲染，独立于 Compose Navigation。可以在任何应用上叠加调试界面。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔗</div>
        <div class="kn-title green">ViewModel 手动单例</div>
        <div class="kn-body">companion object { var INSTANCE } 而非 Hilt/ViewModelProvider，确保应用内入口页面和浮动窗口服务共享完全相同的状态实例。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔵</div>
        <div class="kn-title orange">双模式浮动窗口</div>
        <div class="kn-body">收起为可拖拽 56dp 蓝色圆球，展开为全屏透明叠加层 + 控制栏。isExpanded 切换 WindowManager.LayoutParams 的尺寸。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📊</div>
        <div class="kn-title purple">事件缓冲区限制</div>
        <div class="kn-body">Activity 监控事件最多 100 条，超出后旧事件被丢弃。面板关闭不停止监听。CreatePackageDialog 为残留死代码。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>UIDebuggerScreen.kt</td><td>102</td><td>应用内启动入口</td></tr>
      <tr><td>UIDebuggerComponents.kt</td><td>690</td><td>浮动窗口全部 UI 组件</td></tr>
      <tr><td>UIDebuggerViewModel.kt</td><td>448</td><td>单例 ViewModel</td></tr>
      <tr><td>UIDebuggerState.kt</td><td>88</td><td>状态数据类 + UIElement</td></tr>
      <tr><td>ActivityMonitorPanel.kt</td><td>439</td><td>Activity 监控面板</td></tr>
      <tr><td>UIDebuggerService.kt</td><td>138</td><td>前台服务</td></tr>
      <tr><td>UIDebuggerWindowManager.kt</td><td>195</td><td>浮动窗口管理</td></tr>
    </table>
`);
