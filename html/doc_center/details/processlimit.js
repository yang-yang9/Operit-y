registerDetail('processlimit', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">684</span><span class="stat-label">源码行数</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">操作（解除/恢复）</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">Shell 命令</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">对话框</span></div>
    </div>

    <p style="margin:0 0 16px 4px;font-size:13px;color:var(--text-dim);">Android 12+ 幻象进程上限工具，通过 device_config 命令设置 max_phantom_processes=2147483647 解除后台子进程杀死限制。需要 Shizuku/ADB 权限。</p>

    <!-- 组件树 -->
    <div class="section-head blue">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["Column (fillMaxSize)"]
    ROOT --> HEADER["Surface Header (tonalElevation 2dp)"]
    HEADER --> TITLE_ROW["Row: headlineMedium标题 + Info按钮"]
    HEADER --> STATUS_CARD["Card (primaryContainer 50%)&lt;br/&gt;Icon.Settings + 当前状态 + Refresh按钮"]
    HEADER --> BTN_ROW["Row spacedBy 12dp"]
    BTN_ROW --> BTN_REMOVE["Button '解除限制' 56dp&lt;br/&gt;[executing] CircularProgressIndicator"]
    BTN_ROW --> BTN_RESTORE["OutlinedButton '恢复限制' secondary色"]
    HEADER --> ERROR_SURFACE["[errorMessage] Surface errorContainer"]
    ROOT --> HISTORY_BOX["Box (weight=1f)"]
    HISTORY_BOX --> EMPTY["[空] Icon.History(72dp) + 提示"]
    HISTORY_BOX --> HISTORY_LIST["LazyColumn → OperationRecordCard × N"]
    </div>

    <!-- Shell 命令 -->
    <div class="section-head green" style="margin-top:16px;">Shell 命令</div>
    <table class="act-table">
      <tr><th>操作</th><th>命令 1</th><th>命令 2</th></tr>
      <tr><td>解除限制</td><td>device_config put activity_manager max_phantom_processes 2147483647</td><td>device_config set_sync_disabled_for_tests persistent</td></tr>
      <tr><td>恢复限制</td><td>device_config delete activity_manager max_phantom_processes</td><td>device_config set_sync_disabled_for_tests none</td></tr>
      <tr><td>查询状态</td><td colspan="2">device_config get activity_manager max_phantom_processes</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">两命令串行执行，结果合并（success = result1.success &amp;&amp; result2.success）</p>

    <!-- 状态解析 -->
    <div class="section-head orange" style="margin-top:16px;">状态解析逻辑</div>
    <table class="act-table">
      <tr><th>stdout 值</th><th>显示状态</th></tr>
      <tr><td>"2147483647"</td><td>已解除限制 (2147483647)</td></tr>
      <tr><td>整数 &gt; 100</td><td>已解除限制 (N)</td></tr>
      <tr><td>"null" 或 空</td><td>系统默认</td></tr>
      <tr><td>整数 ≤ 100</td><td>受限 (N 个)</td></tr>
      <tr><td>其他</td><td>未知状态</td></tr>
    </table>

    <!-- OperationRecordCard -->
    <div class="section-head purple" style="margin-top:16px;">OperationRecordCard 结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (RoundedCornerShape 12dp, elevation 2dp)</div>
      <div class="tree-children">
        <div class="tree-node">Row (padding 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Box 40dp CircleShape: [REMOVE] primary 20% + LockOpen / [RESTORE] secondary 20% + Lock</div>
          <div class="tree-node">Column (weight=1f): 操作名称(bold) + yyyy-MM-dd HH:mm:ss</div>
          <div class="tree-node">Box 10dp CircleShape: [success] 绿 #4CAF50 / [fail] 红 #FF5252</div>
        </div>
      </div>
    </div>

    <!-- 对话框 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">对话框</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发</th><th>内容</th></tr>
      <tr><td>帮助信息</td><td>Info 按钮</td><td>滚动内容：什么是幻象进程 / 优点 / 警告（error 色）</td></tr>
      <tr><td>操作结果</td><td>操作执行成功后 showResultDialog=true</td><td>CheckCircle/Error + 操作名称 + [失败] stderr</td></tr>
    </table>
`);
